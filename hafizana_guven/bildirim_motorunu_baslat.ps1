Write-Host "Bildirim Motoru Baslatiliyor..." -ForegroundColor Green
try {
    node bildirim_motoru.js
} catch {
    Write-Host "Hata olustu. Node.js tam yuklenmemis olabilir. Pencereyi kapatip tekrar deneyin." -ForegroundColor Red
}
pause