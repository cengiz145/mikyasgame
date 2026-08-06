$content = [System.IO.File]::ReadAllText(".\index.html", [System.Text.Encoding]::UTF8)
$content = $content.Replace("0.97.4.5", "0.97.4.6")
[System.IO.File]::WriteAllText(".\index.html", $content, [System.Text.Encoding]::UTF8)

$changelog = [System.IO.File]::ReadAllText(".\changelog.txt", [System.Text.Encoding]::UTF8)
$newEntry = "[v0.97.4.6] - 2026-04-27`n`nErişilebilirlik ve NVDA İyileştirmeleri:`n- Ana menüdeki anlık durum güncellemeleri (Etkinlik ve Güncelleme kontrolleri) artık ekran okuyucular tarafından %100 okunacak şekilde teknik altyapısı yenilendi.`n- Sosyal menüsünde ok tuşlarıyla dolaşırken kendinizi listenin en başında görebilmeniz sağlandı. Geri dön butonu ve istatistik menüsü maddeleri ok tuşlarıyla dolaşılırken NVDA tarafından atlanmaması için onarıldı.`n- Kayıp Notalar modunda, diyalogları geçerken Enter tuşuna hızlı basıldığında ortaya çıkan seslerin üst üste binme sorunu tamamen çözüldü.`n`n"
[System.IO.File]::WriteAllText(".\changelog.txt", $newEntry + $changelog, [System.Text.Encoding]::UTF8)
