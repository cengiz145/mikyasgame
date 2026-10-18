$ErrorActionPreference = "Stop"

$downloads = [System.Environment]::GetFolderPath("UserProfile") + "\Downloads"
$websiteDir = "$downloads\wep sitem"

# Hafizana Guven kaynak klasorunu guvenli bul (Turkce karakter uyumlulugu)
$hafizanaGuvenSource = $null
$possibleHafizana = @(
    (Get-Item -Path "$downloads\*haf*z*n*g*ven*\hafizana_guven" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty FullName -First 1),
    (Get-Item -Path "$downloads\*haf*z*n*g*ven*" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty FullName -First 1),
    "$downloads\hafizana_guven"
)
foreach ($p in $possibleHafizana) {
    if ($p -and (Test-Path $p)) {
        $hafizanaGuvenSource = $p
        break
    }
}

# Otobus Simulasyonu kaynak klasorunu guvenli bul
$otobusSource = $null
$possibleOtobus = @(
    (Get-Item -Path "$downloads\*otob*s*sim*lasyonu*" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty FullName -First 1),
    "$downloads\benim_dunyam\otobus"
)
foreach ($p in $possibleOtobus) {
    if ($p -and (Test-Path $p)) {
        $otobusSource = $p
        break
    }
}

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "   TUM OYUNLARI VE SITEYI GITHUB'A YUKLEME ARACI   " -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Hafizana Guven dosyalari wep sitem klasorune kopyalaniyor..." -ForegroundColor Yellow
if ($hafizanaGuvenSource -and (Test-Path $hafizanaGuvenSource)) {
    Copy-Item -Path "$hafizanaGuvenSource\*" -Destination "$websiteDir\hafizana_guven" -Recurse -Force
    if (Test-Path "$websiteDir\hafizana_guven\.git") {
        Remove-Item "$websiteDir\hafizana_guven\.git" -Recurse -Force -ErrorAction SilentlyContinue
    }
    Write-Host "   Basarili! ($hafizanaGuvenSource)" -ForegroundColor Green
} else {
    Write-Host "   Hafizana Guven kaynak klasoru atlandi." -ForegroundColor Gray
}

Write-Host "2. Otobus Simulasyonu dosyalari wep sitem klasorune kopyalaniyor..." -ForegroundColor Yellow
if ($otobusSource -and (Test-Path $otobusSource)) {
    Copy-Item -Path "$otobusSource\*" -Destination "$websiteDir\otobus" -Recurse -Force
    if (Test-Path "$websiteDir\otobus\.git") {
        Remove-Item "$websiteDir\otobus\.git" -Recurse -Force -ErrorAction SilentlyContinue
    }
    Write-Host "   Basarili! ($otobusSource)" -ForegroundColor Green
} else {
    Write-Host "   Otobus Simulasyonu kaynak klasoru atlandi." -ForegroundColor Gray
}

Write-Host "3. Dosyalar GitHub'a gonderiliyor..." -ForegroundColor Yellow
Set-Location -Path $websiteDir

# Git komutlari oncesi otomatik surum atlat
if (Test-Path "$websiteDir\hafizana_guven\sync_versions.ps1") {
    Write-Host "Hafizana Guven surumu otomatik artiriliyor..." -ForegroundColor Yellow
    Set-Location -Path "$websiteDir\hafizana_guven"
    powershell -ExecutionPolicy Bypass -File .\sync_versions.ps1
    Set-Location -Path $websiteDir
}

# Git guncelleme ve push islemleri
git add .
$status = git status --porcelain
if ($status) {
    $commitMsg = "Otomatik Guncelleme: " + (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
    git commit -m $commitMsg
}
git pull --rebase origin main
git push origin main

Write-Host ""
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "ISLEM TAMAMLANDI! TUM SITENIZ VE OYUNLARINIZ GUNCELLENDI." -ForegroundColor Green
Write-Host "Artik GitHub Pages adresinde siteniz ve oyunlariniz canli yayinda." -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Cikmak icin bir tusa basin..."
$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null
