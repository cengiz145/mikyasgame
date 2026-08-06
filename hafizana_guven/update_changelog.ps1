$ErrorActionPreference = "Stop"

$Path = ".\changelog.txt"
$oldContent = Get-Content $Path -Raw -Encoding UTF8
$date = Get-Date -Format "dd.MM.yyyy"
$newLog = @"
[v0.97.4.48] - $date

Yeni Özellikler:
- Yeni Oyun Modu: "Ritim Avcısı". Bilgisayarın 60 BPM (ve giderek hızlanan) metronom eşliğinde çaldığı ürettiği notaları tekrarlamanızı isteyen, çağrı-cevap tabanlı yepyeni bir ritim diktesi modu eklendi.
- NVDA Ekran Okuyucu İyileştirmesi: Uygulamanın okuma modları arasında yaşanan anlamsız "Belge / Uygulama" geçişleri, HTML odak rollerinin onarılmasıyla düzeltildi.

"@

$newContent = $oldContent -replace '(?s)(# Haf.*?\r?\n\r?\n)', "`$1$newLog"
Set-Content -Path $Path -Value $newContent -Encoding UTF8
Write-Host "Changelog updated."
