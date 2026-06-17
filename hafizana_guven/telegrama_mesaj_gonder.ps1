param (
    [Parameter(Mandatory=$true, HelpMessage="Kanala gÃ¶ndermek istediÄŸiniz mesajÄ± yazÄ±n")]
    [string]$Mesaj
)

# Konsolun TÃ¼rkÃ§e karakterleri desteklemesi iÃ§in
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$token = "8797867195:AAHG65mgOhmeWh9Z-xVwCsdRVJ0bDQD86iA"
$chat_id = "@hafizanaguven2559"

$url = "https://api.telegram.org/bot$token/sendMessage"
$body = @{
    chat_id = $chat_id
    text = $Mesaj
} | ConvertTo-Json -Depth 3

try {
    $jsonBytes = [System.Text.Encoding]::UTF8.GetBytes($body)
    Invoke-RestMethod -Uri $url -Method Post -Body $jsonBytes -ContentType "application/json; charset=utf-8" | Out-Null
    Write-Host "Telegram mesajÄ± baÅŸarÄ±yla gÃ¶nderildi!" -ForegroundColor Green
} catch {
    Write-Host "Mesaj gÃ¶nderilirken hata oluÅŸtu: $_" -ForegroundColor Red
}

Write-Host "Ã‡Ä±kmak iÃ§in bir tuÅŸa basÄ±n..."
$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null
