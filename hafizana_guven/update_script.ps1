$content = [System.IO.File]::ReadAllText(".\index.html", [System.Text.Encoding]::UTF8)
$content = $content.Replace("0.97.4.5", "0.97.4.6")
[System.IO.File]::WriteAllText(".\index.html", $content, [System.Text.Encoding]::UTF8)

$changelog = [System.IO.File]::ReadAllText(".\changelog.txt", [System.Text.Encoding]::UTF8)
$newEntry = "[v0.97.4.6] - 2026-04-27`n`nEriÅŸilebilirlik ve NVDA Ä°yileÅŸtirmeleri:`n- Ana menÃ¼deki anlÄ±k durum gÃ¼ncellemeleri (Etkinlik ve GÃ¼ncelleme kontrolleri) artÄ±k ekran okuyucular tarafÄ±ndan %100 okunacak ÅŸekilde teknik altyapÄ±sÄ± yenilendi.`n- Sosyal menÃ¼sÃ¼nde ok tuÅŸlarÄ±yla dolaÅŸÄ±rken kendinizi listenin en baÅŸÄ±nda gÃ¶rebilmeniz saÄŸlandÄ±. Geri dÃ¶n butonu ve istatistik menÃ¼sÃ¼ maddeleri ok tuÅŸlarÄ±yla dolaÅŸÄ±lÄ±rken NVDA tarafÄ±ndan atlanmamasÄ± iÃ§in onarÄ±ldÄ±.`n- KayÄ±p Notalar modunda, diyaloglarÄ± geÃ§erken Enter tuÅŸuna hÄ±zlÄ± basÄ±ldÄ±ÄŸÄ±nda ortaya Ã§Ä±kan seslerin Ã¼st Ã¼ste binme sorunu tamamen Ã§Ã¶zÃ¼ldÃ¼.`n`n"
[System.IO.File]::WriteAllText(".\changelog.txt", $newEntry + $changelog, [System.Text.Encoding]::UTF8)
