$ErrorActionPreference = "Stop"

$downloads = [System.Environment]::GetFolderPath("UserProfile") + "\Downloads"
$websiteDir = "$downloads\wep sitem"

try {
    $hafizanaGuvenSource = (Resolve-Path "$downloads\haf*zana g*ven\hafizana_guven").Path
} catch {
    $hafizanaGuvenSource = $null
}

try {
    $otobusSource = (Resolve-Path "$downloads\otob*s sim*lasyonu").Path
} catch {
    $otobusSource = $null
}

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "   TUM OYUNLARI VE SITEYI GITHUB'A YUKLEME ARACI   " -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Hafizana Guven dosyalari wep sitem klasorune kopyalaniyor..." -ForegroundColor Yellow
if ($hafizanaGuvenSource -and (Test-Path $hafizanaGuvenSource)) {
    Copy-Item -Path "$hafizanaGuvenSource\*" -Destination "$websiteDir\hafizana_guven" -Recurse -Force
    # Alt repo olusmasini onlemek icin git klasorunu sil
    if (Test-Path "$websiteDir\hafizana_guven\.git") {
        Remove-Item "$websiteDir\hafizana_guven\.git" -Recurse -Force -ErrorAction SilentlyContinue
    }
    Write-Host "   Basarili!" -ForegroundColor Green
} else {
    Write-Host "   Hata: Hafizana Guven kaynak klasoru bulunamadi!" -ForegroundColor Red
}

Write-Host "2. Otobus Simulasyonu dosyalari wep sitem klasorune kopyalaniyor..." -ForegroundColor Yellow
if ($otobusSource -and (Test-Path $otobusSource)) {
    Copy-Item -Path "$otobusSource\*" -Destination "$websiteDir\otobus" -Recurse -Force
    # Alt repo olusmasini onlemek icin git klasorunu sil
    if (Test-Path "$websiteDir\otobus\.git") {
        Remove-Item "$websiteDir\otobus\.git" -Recurse -Force -ErrorAction SilentlyContinue
    }
    Write-Host "   Basarili!" -ForegroundColor Green
} else {
    Write-Host "   Hata: Otobus Simulasyonu kaynak klasoru bulunamadi!" -ForegroundColor Red
}

Write-Host "3. Dosyalar GitHub'a (Internete) gonderiliyor..." -ForegroundColor Yellow
Set-Location -Path $websiteDir

# Git komutlari
git add .
$commitMsg = "Otomatik Guncelleme: " + (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
git commit -m $commitMsg
git push origin main

Write-Host ""
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "ISLEM TAMAMLANDI! TUM SITENIZ VE OYUNLARINIZ GUNCELLENDI." -ForegroundColor Green
Write-Host "Artik arkadasinizin verdigi GitHub adresinde tum projeleriniz yayinda." -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Cikmak icin bir tusa basin..."
$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null
