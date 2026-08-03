$content = Get-Content 'js\game.js' -Raw
$oldMsgs = "            let msgs = [
                  { t: 0, text: "Ekranlar baYndaki futbolseverler, herkese iyi akYamlar! Futbolun sadece futbol olmadY o bOyOk gecelerden birindeyiz...", ui: "MA -NCES SEREMONS" },
                  { t: 10000, text: "Kalede gOven veren elleriyle " + gk.name + " var. Defans hattnda " + def1.name + " ve " + def2.name + " grev yapacak.", ui: "LK 11'LER OKUNUYOR" },
                  { t: 20000, text: "leri uta ise takmn en bOyOk gol umudu, " + striker.name + " aYlar havalandrmak iin sahada!", ui: "LK 11'LER OKUNUYOR" },
                  { t: 30000, text: "Hocann bugOn dengeli bir taktikle sahaya ktYn grOyoruz. Rakip takm ise kudurmuY bir yapyla oynayacak.", ui: "TAKTK ANALZ" }
            ];
              
            let tOffset = 40000;"
$newMsgs = "            let msgs = [
                  { t: 0, text: "Ekranlarý baþýndaki futbolseverler, herkese iyi akþamlar! Futbolun sadece futbol olmadýðý o büyük gecelerden birindeyiz...", ui: "MAÇ ÖNCESÝ SEREMONÝSÝ" },
                  { t: 4000, text: "Kalede güven veren elleriyle " + gk.name + " var. Defans hattýnda " + def1.name + " ve " + def2.name + " görev yapacak.", ui: "ÝLK 11'LER OKUNUYOR" },
                  { t: 8000, text: "Ýleri uçta ise takýmýn en büyük gol umudu, " + striker.name + " aðlarý havalandýrmak için sahada!", ui: "ÝLK 11'LER OKUNUYOR" },
                  { t: 12000, text: "Hocanýn bugün dengeli bir taktikle sahaya çýktýðýný görüyoruz. Rakip takým ise kudurmuþ bir yapýyla oynayacak.", ui: "TAKTÝK ANALÝZ" }
            ];
              
            let tOffset = 16000;"
$content = $content.Replace($oldMsgs, $newMsgs)
Set-Content 'js\game.js' $content
