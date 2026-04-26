[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "Changelog dosyasindan son guncelleme okunuyor..." -ForegroundColor Yellow

$changelogPath = "changelog.txt"
$content = Get-Content -Path $changelogPath -Encoding UTF8

$latestEntry = @()
$foundFirst = $false
$versionLine = ""

foreach ($line in $content) {
    if ($line -match "^\[v.*\]") {
        if ($foundFirst) {
            break
        }
        $foundFirst = $true
        $versionLine = $line
        $latestEntry += $line
    } elseif ($foundFirst) {
        $latestEntry += $line
    }
}

$mesaj = $latestEntry -join "`n"
$mesaj = $mesaj.Trim()

Write-Host "`n--- GONDERILECEK MESAJ ---" -ForegroundColor Cyan
Write-Host $mesaj
Write-Host "--------------------------`n"

$commitMsg = "Guncelleme: $versionLine"

Write-Host "Github'a yukleniyor..." -ForegroundColor Cyan
git add .
git commit -m $commitMsg
git push
Write-Host "Github'a yuklendi!" -ForegroundColor Green

Write-Host "Telegram kanalina bildirim gonderiliyor..." -ForegroundColor Cyan
$token = "8797867195:AAHG65mgOhmeWh9Z-xVwCsdRVJ0bDQD86iA"
$chat_id = "@hafizanaguven2559"

$telegramMesaji = "🚀 *Yeni Güncelleme*`n`n" + $mesaj

$url = "https://api.telegram.org/bot$token/sendMessage"

try {
    $payload = @{
        chat_id = $chat_id
        text = $telegramMesaji
        parse_mode = "Markdown"
    } | ConvertTo-Json -Depth 3
    $jsonBytes = [System.Text.Encoding]::UTF8.GetBytes($payload)
    Invoke-RestMethod -Uri $url -Method Post -Body $jsonBytes -ContentType "application/json; charset=utf-8" | Out-Null
    Write-Host "Telegram bildirimi basariyla gonderildi!" -ForegroundColor Green
} catch {
    Write-Host "Markdown bicimlendirmesiyle gonderilemedi, duz metin olarak deneniyor..." -ForegroundColor Yellow
    try {
        $payloadPlain = @{
            chat_id = $chat_id
            text = $telegramMesaji
        } | ConvertTo-Json -Depth 3
        $jsonBytesPlain = [System.Text.Encoding]::UTF8.GetBytes($payloadPlain)
        Invoke-RestMethod -Uri $url -Method Post -Body $jsonBytesPlain -ContentType "application/json; charset=utf-8" | Out-Null
        Write-Host "Telegram bildirimi duz metin olarak basariyla gonderildi!" -ForegroundColor Green
    } catch {
        Write-Host "Telegram bildirimi gonderilirken bir hata olustu: $_" -ForegroundColor Red
    }
}

Write-Host "Islem tamamlandi! Cikmak icin bir tusa basin..."
$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null
