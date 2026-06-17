$ErrorActionPreference = "Stop"

$Path = ".\changelog.txt"
$oldContent = Get-Content $Path -Raw -Encoding UTF8
$date = Get-Date -Format "dd.MM.yyyy"
$newLog = @"
[v0.97.4.48] - $date

Yeni Ã–zellikler:
- Yeni Oyun Modu: "Ritim AvcÄ±sÄ±". BilgisayarÄ±n 60 BPM (ve giderek hÄ±zlanan) metronom eÅŸliÄŸinde Ã§aldÄ±ÄŸÄ± Ã¼rettiÄŸi notalarÄ± tekrarlamanÄ±zÄ± isteyen, Ã§aÄŸrÄ±-cevap tabanlÄ± yepyeni bir ritim diktesi modu eklendi.
- NVDA Ekran Okuyucu Ä°yileÅŸtirmesi: UygulamanÄ±n okuma modlarÄ± arasÄ±nda yaÅŸanan anlamsÄ±z "Belge / Uygulama" geÃ§iÅŸleri, HTML odak rollerinin onarÄ±lmasÄ±yla dÃ¼zeltildi.

"@

$newContent = $oldContent -replace '(?s)(# Haf.*?\r?\n\r?\n)', "`$1$newLog"
Set-Content -Path $Path -Value $newContent -Encoding UTF8
Write-Host "Changelog updated."
