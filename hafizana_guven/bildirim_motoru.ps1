$ErrorActionPreference = "Continue"

$botToken = "8797867195:AAHG65mgOhmeWh9Z-xVwCsdRVJ0bDQD86iA"
$firebaseUrl = "https://hgfz-5a1ca-default-rtdb.firebaseio.com"

$logFile = "$PSScriptRoot\bildirim_motoru.log"
function Write-Log($Message) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMsg = "[$timestamp] $Message"
    Write-Host $logMsg
    Add-Content -Path $logFile -Value $logMsg -Encoding UTF8
}

Write-Log "---------------------------------------------"
Write-Log "TELEGRAM BILDIRIM MOTORU BASLATILDI"
Write-Log "---------------------------------------------"

$messagesPath = "$PSScriptRoot\bildirim_mesajlari.json"
if (-Not (Test-Path $messagesPath)) {
    Write-Log "HATA: bildirim_mesajlari.json bulunamadi!"
    exit
}
$mesajHavuzu = Get-Content $messagesPath -Encoding UTF8 | ConvertFrom-Json

$lastUpdateId = 0

while ($true) {
    try {
        # 1. TELEGRAM UPDATE'LERINI (YENI ABONELERI) KONTROL ET
        $updatesUrl = "https://api.telegram.org/bot$botToken/getUpdates?offset=$lastUpdateId&timeout=10"
        $updatesResp = Invoke-RestMethod -Uri $updatesUrl -Method Get -ErrorAction Stop
        
        if ($updatesResp.ok -and $updatesResp.result) {
            foreach ($update in $updatesResp.result) {
                $lastUpdateId = $update.update_id + 1
                
                if ($update.message.text -match "^/start (.+)$") {
                    $username = $matches[1]
                    $chatId = $update.message.chat.id
                    $encodedUsername = [uri]::EscapeDataString($username)
                    
                    # Firebase'e kaydet
                    $putUrl = "$firebaseUrl/telegram_subs/$encodedUsername.json"
                    $body = @{ chat_id = $chatId } | ConvertTo-Json
                    $utf8Bytes = [System.Text.Encoding]::UTF8.GetBytes($body)
                    Invoke-RestMethod -Uri $putUrl -Method Put -Body $utf8Bytes -ContentType "application/json; charset=utf-8" | Out-Null
                    
                    Write-Log "YENI ABONE: $username ($chatId)"
                    
                    # Hos geldin mesaji
                    $welcomeText = "Hafızana Güven bildirimleri aktif edildi! Oyuna 24 saat girmediğinizde size iştahlandırıcı bir mesaj göndereceğim."
                    $msgBody = @{ chat_id = $chatId; text = $welcomeText } | ConvertTo-Json
                    $utf8BytesMsg = [System.Text.Encoding]::UTF8.GetBytes($msgBody)
                    Invoke-RestMethod -Uri "https://api.telegram.org/bot$botToken/sendMessage" -Method Post -Body $utf8BytesMsg -ContentType "application/json; charset=utf-8" | Out-Null
                }
            }
        }

        # 2. FIREBASE PRESENCE KONTROLU (24 SAATTIR GIRMEYENLERI BUL)
        $presenceUrl = "$firebaseUrl/presence.json"
        $presenceData = Invoke-RestMethod -Uri $presenceUrl -Method Get -ErrorAction Stop

        $subsUrl = "$firebaseUrl/telegram_subs.json"
        $subsData = Invoke-RestMethod -Uri $subsUrl -Method Get -ErrorAction Stop
        
        if ($presenceData -and $subsData) {
            $nowMs = [math]::Floor((Get-Date).ToUniversalTime().Subtract((New-Object DateTime 1970,1,1,0,0,0, [DateTimeKind]::Utc)).TotalMilliseconds)
            
            foreach ($key in $presenceData.psobject.properties.name) {
                $p = $presenceData.$key
                
                # state offline/disconnected ve uzerinden 24 saat (86400000 ms) gecmis mi?
                # Test icin süreyi 1 saat (3600000) de yapabiliriz ama 24 saat istenmis: 86400000
                $diffMs = $nowMs - $p.last_changed
                if ($p.state -ne 'online' -and $diffMs -gt 86400000) {
                    
                    $username = $p.name
                    $encodedUsername = [uri]::EscapeDataString($username)
                    
                    # Abonesi var mi?
                    if ($subsData.$encodedUsername) {
                        $chatId = $subsData.$encodedUsername.chat_id
                        
                        # Zaten bildirim gönderilmiş mi?
                        $notifStateUrl = "$firebaseUrl/telegram_notifs/$encodedUsername.json"
                        $notifState = Invoke-RestMethod -Uri $notifStateUrl -Method Get
                        
                        $shouldSend = $false
                        if ($null -eq $notifState) {
                            $shouldSend = $true
                        } else {
                            if ($notifState.last_notified -lt $p.last_changed) {
                                # Oyuncu bildirim aldiktan SONRA oyuna hic girmemis
                                $shouldSend = $true
                            }
                        }
                        
                        if ($shouldSend) {
                            $rastgeleIndex = Get-Random -Maximum $mesajHavuzu.Count
                            $secilenMesaj = $mesajHavuzu[$rastgeleIndex]
                            
                            Write-Log "BILDIRIM GONDERILIYOR -> $username: $secilenMesaj"
                            
                            $msgBody = @{ chat_id = $chatId; text = "🎮 Hey $username,`n$secilenMesaj" } | ConvertTo-Json
                            $utf8BytesMsg = [System.Text.Encoding]::UTF8.GetBytes($msgBody)
                            Invoke-RestMethod -Uri "https://api.telegram.org/bot$botToken/sendMessage" -Method Post -Body $utf8BytesMsg -ContentType "application/json; charset=utf-8" | Out-Null
                            
                            # Son bildirim zamanini guncelle (spam atmamak icin)
                            $body = @{ last_notified = $nowMs } | ConvertTo-Json
                            $utf8Bytes = [System.Text.Encoding]::UTF8.GetBytes($body)
                            Invoke-RestMethod -Uri $notifStateUrl -Method Put -Body $utf8Bytes -ContentType "application/json; charset=utf-8" | Out-Null
                        }
                    }
                }
            }
        }
        
        Start-Sleep -Seconds 15
    } catch {
        Write-Log "DONGU HATASI: $_"
        Start-Sleep -Seconds 30
    }
}
