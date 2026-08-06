param (
    [Parameter(Mandatory=$true, HelpMessage="Kanala göndermek istediğiniz mesajı yazın")]
    [string]$Mesaj
)

# Konsolun Türkçe karakterleri desteklemesi için
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
    Write-Host "Telegram mesajı başarıyla gönderildi!" -ForegroundColor Green
} catch {
    Write-Host "Mesaj gönderilirken hata oluştu: $_" -ForegroundColor Red
}

Write-Host "Çıkmak için bir tuşa basın..."
$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null
