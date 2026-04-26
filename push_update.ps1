[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "Changelog dosyasından son güncelleme okunuyor..." -ForegroundColor Yellow

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

Write-Host "`n--- GÖNDERİLECEK MESAJ ---" -ForegroundColor Cyan
Write-Host $mesaj
Write-Host "--------------------------`n"

$commitMsg = "Güncelleme: $versionLine"

Write-Host "Github'a yükleniyor..." -ForegroundColor Cyan
git add .
git commit -m $commitMsg
git push
Write-Host "Github'a yüklendi!" -ForegroundColor Green

Write-Host "Telegram kanalına bildirim gönderiliyor..." -ForegroundColor Cyan
$token = "8797867195:AAHG65mgOhmeWh9Z-xVwCsdRVJ0bDQD86iA"
$chat_id = "@hafizanaguven2559"

$telegramMesaji = "🚀 *Yeni Güncelleme*`n`n" + $mesaj + "`n`n🎮 Oyunu Oynamak İçin Tıklayın: https://cengiz145.github.io/mikyasgame/"

$url = "https://api.telegram.org/bot$token/sendMessage"

try {
    # İlk deneme Markdown ile (eğer changelog'daki yıldızlar vb. sorun yaratmazsa daha şık durur)
    $body = @{
        chat_id = $chat_id
        text = $telegramMesaji
        parse_mode = "Markdown"
    } | ConvertTo-Json -Depth 3
    Invoke-RestMethod -Uri $url -Method Post -Body $body -ContentType "application/json; charset=utf-8" | Out-Null
    Write-Host "Telegram bildirimi başarıyla gönderildi!" -ForegroundColor Green
} catch {
    Write-Host "Markdown biçimlendirmesiyle gönderilemedi, düz metin olarak deneniyor..." -ForegroundColor Yellow
    try {
        # Eğer Markdown çakışması olursa düz metin at
        $bodyPlain = @{
            chat_id = $chat_id
            text = $telegramMesaji
        } | ConvertTo-Json -Depth 3
        Invoke-RestMethod -Uri $url -Method Post -Body $bodyPlain -ContentType "application/json; charset=utf-8" | Out-Null
        Write-Host "Telegram bildirimi düz metin olarak başarıyla gönderildi!" -ForegroundColor Green
    } catch {
        Write-Host "Telegram bildirimi gönderilirken bir hata oluştu: $_" -ForegroundColor Red
    }
}

Write-Host "İşlem tamamlandı! Çıkmak için bir tuşa basın..."
$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null
