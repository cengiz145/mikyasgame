[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "Changelog dosyasÄ±ndan son gÃ¼ncelleme okunuyor..." -ForegroundColor Yellow

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

$commitMsg = "GÃ¼ncelleme: $versionLine"

Write-Host "Github'a yÃ¼kleniyor..." -ForegroundColor Cyan
git add .
git commit -m $commitMsg
git push
Write-Host "Github'a yÃ¼klendi!" -ForegroundColor Green

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
    Write-Host "Telegram bildirimleri sessize alÄ±nmÄ±ÅŸtÄ±r. BitiÅŸ: 2 MayÄ±s 2026 12:00. (Bildirim gÃ¶nderilmedi)" -ForegroundColor Yellow
    Set-Content -Path $lastSentFile -Value $currentVer
} elseif ($currentVer -eq $lastSentVer) {
    Write-Host "Bu sÃ¼rÃ¼m ($currentVer) daha Ã¶nce Telegram'a gÃ¶nderilmiÅŸ. Yeniden bildirim gÃ¶nderilmiyor." -ForegroundColor Yellow
} else {
    Write-Host "Telegram kanalÄ±na bildirim gÃ¶nderiliyor..." -ForegroundColor Cyan
    $token = "8797867195:AAHG65mgOhmeWh9Z-xVwCsdRVJ0bDQD86iA"
    $chat_id = "@hafizanaguven2559"

    $telegramMesaji = "[Yeni GÃ¼ncelleme]`n`n" + $mesaj

    $url = "https://api.telegram.org/bot$token/sendMessage"

    try {
        $payload = @{
            chat_id = $chat_id
            text = $telegramMesaji
        } | ConvertTo-Json -Depth 3
        $jsonBytes = [System.Text.Encoding]::UTF8.GetBytes($payload)
        Invoke-RestMethod -Uri $url -Method Post -Body $jsonBytes -ContentType "application/json; charset=utf-8" | Out-Null
        Write-Host "Telegram bildirimi baÅŸarÄ±yla gÃ¶nderildi!" -ForegroundColor Green
        Set-Content -Path $lastSentFile -Value $currentVer
    } catch {
        Write-Host "Markdown biÃ§imlendirmesiyle gÃ¶nderilemedi, dÃ¼z metin olarak deneniyor..." -ForegroundColor Yellow
        try {
            $payloadPlain = @{
                chat_id = $chat_id
                text = $telegramMesaji
            } | ConvertTo-Json -Depth 3
            $jsonBytesPlain = [System.Text.Encoding]::UTF8.GetBytes($payloadPlain)
            Invoke-RestMethod -Uri $url -Method Post -Body $jsonBytesPlain -ContentType "application/json; charset=utf-8" | Out-Null
            Write-Host "Telegram bildirimi dÃ¼z metin olarak baÅŸarÄ±yla gÃ¶nderildi!" -ForegroundColor Green
            Set-Content -Path $lastSentFile -Value $currentVer
        } catch {
            Write-Host "Telegram bildirimi gÃ¶nderilirken bir hata oluÅŸtu: $_" -ForegroundColor Red
        }
    }
}

Write-Host "Ä°ÅŸlem tamamlandÄ±!"
