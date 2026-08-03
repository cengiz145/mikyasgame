[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$token = "8797867195:AAHG65mgOhmeWh9Z-xVwCsdRVJ0bDQD86iA"
$chat_id = "@hafizanaguven2559"
$url = "https://api.telegram.org/bot$token/deleteMessage"

$body = @{
    chat_id = $chat_id
    message_id = 46
} | ConvertTo-Json

Invoke-RestMethod -Uri $url -Method Post -Body $body -ContentType "application/json"
