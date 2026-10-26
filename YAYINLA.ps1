$ErrorActionPreference = "Stop"

$downloads = [System.Environment]::GetFolderPath("UserProfile") + "\Downloads"
$benimDunyam = "$downloads\benim_dunyam"
$websiteDir = "$downloads\wep sitem"
$otobusStandaloneDir = "$downloads\otobüs simülasyonu"

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "   TUM OYUNLARI VE SITEYI GITHUB'A YUKLEME ARACI   " -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Kaynak: En guncel ana calisma merkezi her zaman benim_dunyam klasorudur
$hafizanaGuvenSource = "$benimDunyam\hafizana_guven"
$otobusSource = "$benimDunyam\otobus"

# 2. Dosyalari wep sitem klasorune guvenle esitle
Write-Host "1. Oyunlar ve site dosyalari 'wep sitem' klasorune esitleniyor..." -ForegroundColor Yellow

# Hafizana Guven
if (Test-Path $hafizanaGuvenSource) {
    Copy-Item -Path "$hafizanaGuvenSource\*" -Destination "$websiteDir\hafizana_guven" -Recurse -Force
    if (Test-Path "$websiteDir\hafizana_guven\.git") {
        Remove-Item "$websiteDir\hafizana_guven\.git" -Recurse -Force -ErrorAction SilentlyContinue
    }
    Write-Host "   [OK] Hafizana Guven esitlendi." -ForegroundColor Green
}

# Otobus Simulasyonu
if (Test-Path $otobusSource) {
    Copy-Item -Path "$otobusSource\*" -Destination "$websiteDir\otobus" -Recurse -Force
    if (Test-Path "$websiteDir\otobus\.git") {
        Remove-Item "$websiteDir\otobus\.git" -Recurse -Force -ErrorAction SilentlyContinue
    }
    Write-Host "   [OK] Otobus Simulasyonu esitlendi." -ForegroundColor Green
}

# Diger oyunlar ve ana site dosyalari
$digerKlasorler = @("futbol", "kelime_hazinesi", "video_asistan")
foreach ($klasor in $digerKlasorler) {
    $srcK = "$benimDunyam\$klasor"
    if (Test-Path $srcK) {
        Copy-Item -Path "$srcK\*" -Destination "$websiteDir\$klasor" -Recurse -Force
        if (Test-Path "$websiteDir\$klasor\.git") {
            Remove-Item "$websiteDir\$klasor\.git" -Recurse -Force -ErrorAction SilentlyContinue
        }
        Write-Host "   [OK] $klasor esitlendi." -ForegroundColor Green
    }
}

# Ana portal dosyalari (index.html, benim_dunyam.exe vb.)
$anaDosyalar = @("index.html", "benim_dunyam.exe", "server_ip.txt", "palavras.txt")
foreach ($dosya in $anaDosyalar) {
    $srcF = "$benimDunyam\$dosya"
    if (Test-Path $srcF) {
        Copy-Item -Path $srcF -Destination "$websiteDir\$dosya" -Force
    }
}

# 3. Bagimsiz otobüs simülasyonu klasorunu de senkronize et
if (Test-Path $otobusStandaloneDir) {
    Write-Host "2. Bagimsiz 'otobus simulasyonu' klasoru guncelleniyor..." -ForegroundColor Yellow
    Get-ChildItem -Path $otobusSource | ForEach-Object {
        Copy-Item -Path $_.FullName -Destination $otobusStandaloneDir -Recurse -Force
    }
    Write-Host "   [OK] Bagimsiz otobus klasoru en son surumle esitlendi." -ForegroundColor Green
}

# 4. Hafizana Guven surum atlatma (varsa)
if (Test-Path "$websiteDir\hafizana_guven\sync_versions.ps1") {
    Write-Host "3. Hafizana Guven surumu otomatik artiriliyor..." -ForegroundColor Yellow
    Set-Location -Path "$websiteDir\hafizana_guven"
    powershell -ExecutionPolicy Bypass -File .\sync_versions.ps1
    Set-Location -Path $websiteDir
}

# 5. Ana Siteyi GitHub (main dali) uzerine yukle
Write-Host "4. Ana Web Sitesi (main dali) GitHub'a gonderiliyor..." -ForegroundColor Yellow
Set-Location -Path $websiteDir
git add .
$statusMain = git status --porcelain
if ($statusMain) {
    $commitMsg = "Otomatik Guncelleme: " + (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
    git commit -m $commitMsg
}
git pull --rebase origin main
git push origin main
Write-Host "   [OK] Ana site ve tum oyunlar (main) yayinda!" -ForegroundColor Green

# 6. Bagimsiz otobus dalini da GitHub'a yukle
if (Test-Path "$otobusStandaloneDir\.git") {
    Write-Host "5. Bagimsiz 'otobus-simulasyonu' dali GitHub'a gonderiliyor..." -ForegroundColor Yellow
    Set-Location -Path $otobusStandaloneDir
    git add .
    $statusOtobus = git status --porcelain
    if ($statusOtobus) {
        $commitMsg = "Otomatik Guncelleme (Otobus): " + (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
        git commit -m $commitMsg
    }
    git pull --rebase origin otobus-simulasyonu
    git push origin otobus-simulasyonu
    Write-Host "   [OK] Bagimsiz otobus-simulasyonu dali GitHub'ta guncellendi!" -ForegroundColor Green
}

# 7. benim_dunyam klasorunu de commit ve pull ile senkronize tut
if (Test-Path "$benimDunyam\.git") {
    Set-Location -Path $benimDunyam
    git add .
    $statusBenim = git status --porcelain
    if ($statusBenim) {
        $commitMsg = "Otomatik Guncelleme (Benim Dunyam): " + (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
        git commit -m $commitMsg
    }
    git pull --rebase origin main
    git push origin main
}

Write-Host ""
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "ISLEM TAMAMLANDI! TUM DALLAR VE OYUNLAR GUNCELLENDI." -ForegroundColor Green
Write-Host "Artik GitHub Pages adresinde siteniz ve oyunlariniz canli yayinda." -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Cikmak icin bir tusa basin..."
try {
    $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null
} catch {
    Start-Sleep -Seconds 1
}
