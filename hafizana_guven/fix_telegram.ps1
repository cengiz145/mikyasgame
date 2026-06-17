$ErrorActionPreference = "Continue"
$token = "8797867195:AAHG65mgOhmeWh9Z-xVwCsdRVJ0bDQD86iA"
$chat_id = "@hafizanaguven2559"
$url = "https://api.telegram.org/bot$token/sendMessage"

# Send a dummy message to get the current message_id
$body = @{ chat_id = $chat_id; text = "..." } | ConvertTo-Json
$jsonBytes = [System.Text.Encoding]::UTF8.GetBytes($body)
$res = Invoke-RestMethod -Uri $url -Method Post -Body $jsonBytes -ContentType "application/json; charset=utf-8"

$lastMsgId = $res.result.message_id
Write-Host "Current Message ID: $lastMsgId"

# Delete the dummy message and the last 5 messages (which include the broken Turkish ones)
for ($i = 0; $i -le 5; $i++) {
    $delId = $lastMsgId - $i
    $delUrl = "https://api.telegram.org/bot$token/deleteMessage"
    $delBody = @{ chat_id = $chat_id; message_id = $delId } | ConvertTo-Json
    $delBytes = [System.Text.Encoding]::UTF8.GetBytes($delBody)
    try {
        Invoke-RestMethod -Uri $delUrl -Method Post -Body $delBytes -ContentType "application/json; charset=utf-8" | Out-Null
        Write-Host "Deleted message $delId"
    } catch {
        # Ignore errors if message doesn't exist
    }
}

# Now send the actual proper Turkish message by reading from a UTF-8 file
$mesaj = Get-Content -Path "mesaj.txt" -Encoding UTF8
$mesaj = $mesaj -join "`n"

$bodyFinal = @{ chat_id = $chat_id; text = $mesaj } | ConvertTo-Json -Depth 3
$jsonBytesFinal = [System.Text.Encoding]::UTF8.GetBytes($bodyFinal)
Invoke-RestMethod -Uri $url -Method Post -Body $jsonBytesFinal -ContentType "application/json; charset=utf-8" | Out-Null
Write-Host "Yeni Turkce mesaj gonderildi!"
