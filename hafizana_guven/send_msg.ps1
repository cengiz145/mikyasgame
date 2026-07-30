[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$token = "8797867195:AAHG65mgOhmeWh9Z-xVwCsdRVJ0bDQD86iA"
$chat_id = "@hafizanaguven2559"

$Mesaj = Get-Content "msg.txt" -Raw

$url = "https://api.telegram.org/bot$token/sendMessage"
$body = @{
    chat_id = $chat_id
    text = $Mesaj
} | ConvertTo-Json -Depth 3

$jsonBytes = [System.Text.Encoding]::UTF8.GetBytes($body)
Invoke-RestMethod -Uri $url -Method Post -Body $jsonBytes -ContentType "application/json; charset=utf-8" | Out-Null
Write-Host "Telegram mesaji basariyla gonderildi!" -ForegroundColor Green
