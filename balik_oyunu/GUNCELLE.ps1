# GUNCELLE.ps1 - Balık Tutma Oyunu Otomatik Güncelleme Aracı
$ErrorActionPreference = "Continue"

Add-Type -AssemblyName System.Speech -ErrorAction SilentlyContinue
$synth = $null
try {
    $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
} catch {}

function Speak-Text($msg) {
    Write-Host $msg -ForegroundColor Cyan
    if ($synth) {
        try { $synth.Speak($msg) } catch {}
    }
}

$gameDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (!$gameDir) { $gameDir = (Get-Location).Path }

Write-Host "===================================================" -ForegroundColor Green
Write-Host "   BALIK TUTMA OYUNU - OTOMATIK GUNCELLEME SISTEMI " -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green
Write-Host ""

Speak-Text "Guncellemeler kontrol ediliyor, lutfen bekleyin..."

$localVersion = "1.0.0"
$versionFile = "$gameDir\version.txt"
if (Test-Path $versionFile) {
    $localVersion = (Get-Content -Path $versionFile -Raw).Trim()
}

$firebaseUrl = "https://hgfz-5a1ca-default-rtdb.firebaseio.com/balik_oyunu/guncelleme.json"

try {
    $updateInfo = Invoke-RestMethod -Uri $firebaseUrl -Method Get -TimeoutSec 10
} catch {
    Speak-Text "Internet baglantisi kurulamadi veya sunucuya ulasilamadi. Lutfen internetinizi kontrol edin."
    Start-Sleep -Seconds 3
    exit
}

if (!$updateInfo -or !$updateInfo.surum) {
    Speak-Text "Sunucuda guncelleme bilgisi bulunamadi."
    Start-Sleep -Seconds 2
    exit
}

$remoteVersion = $updateInfo.surum.Trim()

Write-Host "Mevcut Surum : $localVersion" -ForegroundColor Yellow
Write-Host "Sunucu Surumu: $remoteVersion" -ForegroundColor Yellow

function Compare-Versions($v1, $v2) {
    try {
        $ver1 = [System.Version]$v1
        $ver2 = [System.Version]$v2
        return $ver2.CompareTo($ver1)
    } catch {
        if ($v1 -eq $v2) { return 0 }
        return 1
    }
}

$cmp = Compare-Versions $localVersion $remoteVersion

if ($cmp -le 0) {
    Speak-Text "Oyununuz zaten en guncel surumde! Surum: $localVersion."
    Start-Sleep -Seconds 2
    exit
}

Speak-Text "Yeni bir guncelleme bulundu! Surum: $remoteVersion. Indiriliyor, lutfen bekleyin..."

# Acik oyun varsa kapat
Stop-Process -Name "balik_oyunu", "main", "ag_motoru" -Force -ErrorAction SilentlyContinue
Start-Sleep -Milliseconds 500

# Yedek olustur
$backupDir = "$gameDir\backup_onceki_surum"
if (!(Test-Path $backupDir)) { New-Item -ItemType Directory -Path $backupDir -Force | Out-Null }
if (Test-Path "$gameDir\main.exe") { Copy-Item "$gameDir\main.exe" "$backupDir\main.exe" -Force }
if (Test-Path "$gameDir\ag_motoru.exe") { Copy-Item "$gameDir\ag_motoru.exe" "$backupDir\ag_motoru.exe" -Force }

$success = $true

# main.exe indir
if ($updateInfo.ana_exe_url) {
    try {
        Write-Host "Yeni oyun motoru indiriliyor..." -ForegroundColor Yellow
        Invoke-WebRequest -Uri $updateInfo.ana_exe_url -OutFile "$gameDir\main.exe.yeni" -TimeoutSec 30
        if (Test-Path "$gameDir\main.exe.yeni" -and (Get-Item "$gameDir\main.exe.yeni").Length -gt 1000000) {
            Move-Item "$gameDir\main.exe.yeni" "$gameDir\main.exe" -Force
            Write-Host "   [TAMAM] main.exe guncellendi." -ForegroundColor Green
        }
    } catch {
        Write-Host "   [HATA] main.exe indirilemedi: $_" -ForegroundColor Red
        $success = $false
    }
}

# ag_motoru.exe indir
if ($updateInfo.ag_motoru_url) {
    try {
        Write-Host "Yeni ag motoru indiriliyor..." -ForegroundColor Yellow
        Invoke-WebRequest -Uri $updateInfo.ag_motoru_url -OutFile "$gameDir\ag_motoru.exe.yeni" -TimeoutSec 30
        if (Test-Path "$gameDir\ag_motoru.exe.yeni" -and (Get-Item "$gameDir\ag_motoru.exe.yeni").Length -gt 1000000) {
            Move-Item "$gameDir\ag_motoru.exe.yeni" "$gameDir\ag_motoru.exe" -Force
            Write-Host "   [TAMAM] ag_motoru.exe guncellendi." -ForegroundColor Green
        }
    } catch {
        Write-Host "   [UYARI] ag_motoru.exe guncellenemedi: $_" -ForegroundColor DarkYellow
    }
}

if ($success) {
    Set-Content -Path $versionFile -Value $remoteVersion -Encoding utf8
    Speak-Text "Tebrikler! Oyununuz basariyla Surum $remoteVersion olarak guncellendi!"
} else {
    Speak-Text "Bazi dosyalar guncellenemedi, onceki surume geri donuluyor."
    if (Test-Path "$backupDir\main.exe") { Copy-Item "$backupDir\main.exe" "$gameDir\main.exe" -Force }
}

Start-Sleep -Seconds 3
