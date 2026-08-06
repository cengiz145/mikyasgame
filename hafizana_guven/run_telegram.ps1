$ErrorActionPreference = "Stop"

$mesaj = "Artık kazanılmış bir başarınız varsa, profil sekmesinden bunu görebileceksiniz. Aksi takdirde başarınızın olmadığına dair bir uyarı alacaksınız. Bizi takip etmeye devam edin."

$token = "8797867195:AAHG65mgOhmeWh9Z-xVwCsdRVJ0bDQD86iA"
$chat_id = "@hafizanaguven2559"

$url = "https://api.telegram.org/bot$token/sendMessage"
$body = @{
    chat_id = $chat_id
    text = $mesaj
} | ConvertTo-Json -Depth 3

try {
    $jsonBytes = [System.Text.Encoding]::UTF8.GetBytes($body)
    Invoke-RestMethod -Uri $url -Method Post -Body $jsonBytes -ContentType "application/json; charset=utf-8" | Out-Null
    Write-Host "Telegram mesajı başarıyla gönderildi!" -ForegroundColor Green
} catch {
    Write-Host "Mesaj gönderilirken hata oluştu: $_" -ForegroundColor Red
}
