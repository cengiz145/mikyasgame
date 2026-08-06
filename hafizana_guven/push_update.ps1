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

Write-Host "`n--- GONDERILECEK MESAJ ---" -ForegroundColor Cyan
Write-Host $mesaj
Write-Host "--------------------------`n"

$commitMsg = "Güncelleme: $versionLine"

Write-Host "Github'a yükleniyor..." -ForegroundColor Cyan
git add .
git commit -m $commitMsg
git push
Write-Host "Github'a yüklendi!" -ForegroundColor Green

$lastSentFile = ".last_sent_version.txt"
$lastSentVer = ""
if (Test-Path $lastSentFile) {
    $lastSentVer = Get-Content $lastSentFile
}

$currentVerMatches = [regex]::Match($versionLine, "\[(.*?)\]")
if ($currentVerMatches.Success) {
    $currentVer = $currentVerMatches.Groups[1].Value
} else {
    $currentVer = $versionLine
}

$muteUntil = Get-Date "2026-05-02 12:00:00"
$now = Get-Date

if ($now -lt $muteUntil) {
    Write-Host "Telegram bildirimleri sessize alınmıştır. Bitiş: 2 Mayıs 2026 12:00. (Bildirim gönderilmedi)" -ForegroundColor Yellow
    Set-Content -Path $lastSentFile -Value $currentVer
} elseif ($currentVer -eq $lastSentVer) {
    Write-Host "Bu sürüm ($currentVer) daha önce Telegram'a gönderilmiş. Yeniden bildirim gönderilmiyor." -ForegroundColor Yellow
} else {
    Write-Host "Telegram kanalına bildirim gönderiliyor..." -ForegroundColor Cyan
    $token = "8797867195:AAHG65mgOhmeWh9Z-xVwCsdRVJ0bDQD86iA"
    $chat_id = "@hafizanaguven2559"

    $telegramMesaji = "[Yeni Güncelleme]`n`n" + $mesaj

    $url = "https://api.telegram.org/bot$token/sendMessage"

    try {
        $payload = @{
            chat_id = $chat_id
            text = $telegramMesaji
        } | ConvertTo-Json -Depth 3
        $jsonBytes = [System.Text.Encoding]::UTF8.GetBytes($payload)
        Invoke-RestMethod -Uri $url -Method Post -Body $jsonBytes -ContentType "application/json; charset=utf-8" | Out-Null
        Write-Host "Telegram bildirimi başarıyla gönderildi!" -ForegroundColor Green
        Set-Content -Path $lastSentFile -Value $currentVer
    } catch {
        Write-Host "Markdown biçimlendirmesiyle gönderilemedi, düz metin olarak deneniyor..." -ForegroundColor Yellow
        try {
            $payloadPlain = @{
                chat_id = $chat_id
                text = $telegramMesaji
            } | ConvertTo-Json -Depth 3
            $jsonBytesPlain = [System.Text.Encoding]::UTF8.GetBytes($payloadPlain)
            Invoke-RestMethod -Uri $url -Method Post -Body $jsonBytesPlain -ContentType "application/json; charset=utf-8" | Out-Null
            Write-Host "Telegram bildirimi düz metin olarak başarıyla gönderildi!" -ForegroundColor Green
            Set-Content -Path $lastSentFile -Value $currentVer
        } catch {
            Write-Host "Telegram bildirimi gönderilirken bir hata oluştu: $_" -ForegroundColor Red
        }
    }
}

Write-Host "İşlem tamamlandı!"
