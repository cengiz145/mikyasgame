$ErrorActionPreference = "Stop"

$websiteDir = "c:\Users\Umit Ekrem Mikyas\Downloads\wep sitem"
$hafizanaGuvenSource = "c:\Users\Umit Ekrem Mikyas\Downloads\hafızana güven\hafizana_guven"
$otobusSource = "c:\Users\Umit Ekrem Mikyas\Downloads\otobüs simülasyonu"

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "   TÜM OYUNLARI VE SİTEYİ GITHUB'A YÜKLEME ARACI   " -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Hafızana Güven dosyaları wep sitem klasörüne kopyalanıyor..." -ForegroundColor Yellow
if (Test-Path $hafizanaGuvenSource) {
    Copy-Item -Path "$hafizanaGuvenSource\*" -Destination "$websiteDir\hafizana_guven" -Recurse -Force
    Write-Host "   Başarılı!" -ForegroundColor Green
} else {
    Write-Host "   Hata: Hafızana Güven kaynak klasörü bulunamadı!" -ForegroundColor Red
}

Write-Host "2. Otobüs Simülasyonu dosyaları wep sitem klasörüne kopyalanıyor..." -ForegroundColor Yellow
if (Test-Path $otobusSource) {
    Copy-Item -Path "$otobusSource\*" -Destination "$websiteDir\otobus" -Recurse -Force
    Write-Host "   Başarılı!" -ForegroundColor Green
} else {
    Write-Host "   Hata: Otobüs Simülasyonu kaynak klasörü bulunamadı!" -ForegroundColor Red
}

Write-Host "3. Dosyalar GitHub'a (İnternete) gönderiliyor..." -ForegroundColor Yellow
Set-Location -Path $websiteDir

# Git komutları
git add .
$commitMsg = "Otomatik Güncelleme: " + (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
git commit -m $commitMsg
git push

Write-Host ""
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "İŞLEM TAMAMLANDI! TÜM SİTENİZ VE OYUNLARINIZ GÜNCELLENDİ." -ForegroundColor Green
Write-Host "Artık arkadaşınızın verdiği GitHub adresinde tüm projeleriniz yayında." -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Çıkmak için bir tuşa basın..."
$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null
