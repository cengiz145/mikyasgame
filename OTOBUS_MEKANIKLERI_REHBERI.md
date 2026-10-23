# 🚌 OTOBÜS MEKANİKLERİ VE AĞIR VASITA FİZİĞİ BAŞUCU KILAVUZU
**Mikyas Simülasyon Dünyası - Profesyonel Kaptan Şoförler ve Ağır Vasıta Mekaniği Rehberi**

Bu kılavuz; simülasyonda yer alan tüm ağır vasıta fizik kurallarını, hidrolik/pnömatik fren sistemlerini, Türkiye topoğrafyası eğim dinamiklerini, şanzıman ve motor yönetimini eksiksiz olarak açıklar.

---

## 📑 İÇİNDEKİLER
1. [Retarder (Hidrolik Şanzıman Freni - Voith & ZF)](#1-retarder-hidrolik-şanzıman-freni---voith--zf)
2. [Balata Isınması & Fren Şişmesi (Brake Fade)](#2-balata-ısınması--fren-şişmesi-brake-fade)
3. [Eğim Yerçekimi ve Dağ Rampaları (a = g · sin θ)](#3-eğim-yerçekimi-ve-dağ-rampaları-a--g--sin-θ)
4. [Pnömatik Havalı Fren Sistemi (Bar & PSI Yönetimi)](#4-pnömatik-havalı-fren-sistemi-bar--psi-yönetimi)
5. [Kapı Fren İnterlok Güvenlik Sistemi](#5-kapı-fren-interlok-güvenlik-sistemi)
6. [Kneeling (Yana Yatma) & Havalı Körük Süspansiyonu](#6-kneeling-yana-yatma--havalı-körük-süspansiyonu)
7. [Çift Kademeli Engelli Rampası & Erişilebilirlik](#7-çift-kademeli-engelli-rampası--erişilebilirlik)
8. [Viraj Geometrisi, Merkezkaç Kuvveti ve Gövde Salınımı (Body Roll)](#8-viraj-geometrisi-merkezkaç-kuvveti-ve-gövde-salınımı-body-roll)
9. [Viyadük & Asma Köprü Yan Rüzgarları ve Çelik Genleşme Derzleri](#9-viyadük--asma-köprü-yan-rüzgarları-ve-çelik-genleşme-derzleri)
10. [KGM Resmî Tünel Envanteri ve Yankı Akustiği](#10-kgm-resmî-tünel-envanteri-ve-yankı-akustiği)
11. [Devir Saati (RPM), Şanzıman ve Yakıt Tasarrufu](#11-devir-saati-rpm-şanzıman-ve-yakıt-tasarrufu)
12. [Eksiksiz Kaptan Klavye ve Tuş Referans Tablosu](#12-eksiksiz-kaptan-klavye-ve-tuş-referans-tablosu)

---

## 1. Retarder (Hidrolik Şanzıman Freni - Voith & ZF)

### Retarder Nedir?
15 ila 18 ton ağırlığındaki bir otobüs, yokuş aşağı inerken yalnızca geleneksel disk/kampana servis frenleriyle durdurulamaz. Sürekli sürtünme balataları aşırı ısıtır ve frenleri işlevsiz kılar. **Retarder (hidrodinamik şanzıman freni)**, tekerlek balatalarına hiç dokunmadan, şanzımanın çıkış milini (kardan milini) hidrolik yağ viskozitesi direnciyle frenleyen **aşınmasız** bir yardımcı fren sistemidir.

### Çalışma Prensibi
Retarder gövdesinde dönen bir çark (*rotor*) ve sabit bir çark (*stator*) bulunur. Kaptan retarder kolunu çektiğinde, iki çarkın arasındaki hazneye basınçlı hidrolik yağ pompalanır. Rotorun fırlattığı yağ, sabit stator kanatlarına çarparak ters direnç oluşturur ve şanzıman milini güçlü bir şekilde yavaşlatır. Sürtünen hiçbir katı parça olmadığı için balata aşınması **sıfırdır**.

### Oyunda Kullanım
* **`B` Tuşu:** 5 Kademeli Retarder Kolu (`0 ➔ 1 ➔ 2 ➔ 3 ➔ 4 ➔ 5 ➔ 0`).
  * **Kademe 1:** Hafif tutuş (Düzlükte veya hafif eğimde süzülme kontrolü).
  * **Kademe 2-3:** Orta tutuş (%4 - %7 eğimli dağ inişleri, Bolu Dağı inişi).
  * **Kademe 4-5:** Ağır tutuş (%8 - %11 eğimli dik geçitler, Güzeldere inişi).
* **`Shift + B`:** Retarder kolunu anında boşa alır (Sıfırlar).
* **Akustik Fiziği:** Retarder çekildiğinde kabinde Voith türbininin hıza bağlı frekans kaymasıyla ürettiği karakteristik **türbin ıslığı ve hidrolik uğultusu** duyulur. Devreden çıkarıldığında ise pnömatik hava tahliyesi (*'tısss'*) yankılanır.

---

## 2. Balata Isınması & Fren Şişmesi (Brake Fade)

### Fiziksel Mekanizma
Ayak frenine (`S` tuşu) basıldığında, balata diske sürtünerek kinetik enerjiyi ısı enerjisine çevirir. Normal çalışma sıcaklığı 50°C ile 150°C arasındadır.

### 260°C Tehlike Sınırı ve Fren Şişmesi
Eğer sürücü dik bir dağ inişinde retarder kullanmayıp sürekli ayak frenine basarsa:
1. Disk sıcaklığı hızla yükselir ve **260°C** kritik eşiğini aşar.
2. Balatanın bağlayıcı reçineleri yüksek ısıda gaz çıkarmaya başlar ve balata ile disk arasında mikroskobik bir gaz yastığı oluşur.
3. Sürtünme katsayısı %65 oranında çöker; fren pedalı sertleşir fakat araç durmaz. Bu duruma şoförler arasında **"Fren Şişmesi (Brake Fade)"** denir.
4. Sesli asistan sesli ikaz verir: *"⚠️ Dikkat! Balatalar aşırı ısındı ve şişti! Retarder kullanınız!"*

### Balataları Soğutma Protokolü
* Ayak freninden ayak çekilir.
* Hız 30 km/s üzerindeyken araç hava akımına bırakılır ve frenleme **`B` tuşuyla Retarder kolu** çekilerek yapılır.
* Balata sıcaklığı hızla 60°C güvenli seviyesine düşer ve fren tutuşu normale döner.

---

## 3. Eğim Yerçekimi ve Dağ Rampaları (a = g · sin θ)

### Türkiye Topoğrafyası Entegrasyonu
Oyundaki tüm 81 il merkezi, Harita Genel Müdürlüğü (HGM) resmî deniz seviyesi rakım verileriyle donatılmıştır (Örn: Tekirdağ 10 m, İstanbul 30 m, Ankara 938 m, Sivas 1275 m, Erzurum 1890 m).

### Dağ Rampalarında Tırmanış ve İniş Fiziği
* **Tırmanış (+ Eğim):** Newton yerçekimi ivmesi ($a = -g \cdot \sin\theta$) 15 tonluk aracı geri doğru çeker.
  * Bolu Dağı (%7.5), Sabuncubeli (%9.0), Güzeldere (%11.0) rampalarında araç hız keser.
  * Motor yükü artar; her %1 eğim motor yakıt tüketimini %12 artırır.
  * Kaptanın vites küçültüp devri 1.800 - 2.200 RPM tork bandında tutması gerekir.
* **İniş (- Eğim):** Otobüs kendi ağırlığıyla yerçekimi doğrultusunda serbest ivmelenir. Retarder kullanılmazsa araç kontrolsüz hızlanır.
* **Kokpit Rakım Paneli:** Kokpitteki dağ simgeli gösterge anlık rakımı, eğim açısını ve tescilli geçit adını canlı olarak verir:
  `🏔️ Rakım: 1577 m (+ %7.5 Tırmanış • Bolu Dağı Geçidi)`

---

## 4. Pnömatik Havalı Fren Sistemi (Bar & PSI Yönetimi)

### Neden Hidrolik Değil, Havalı Fren?
Otomobillerde fren pedalına basıldığında hidrolik yağ basıncı kullanılır. Ancak 15 tonluk ağır vasıtalarda insan kas gücü hidrolikle yetersiz kalır. Bu nedenle ağır vasıtalarda motordan tahrik alan bir **hava kompresörü** ve **8-12 Bar** basınca sahip çelik hava tankları kullanılır.

### Hava Basıncı Kuralları
* **Hava Tüketimi:** Frene basılı tutmak havayı tüketmez; ancak frene art arda basıp bırakmak (pompalama) tanktaki sıkıştırılmış havayı hızla tahliye eder.
* **Düşük Hava Alarmı (60 PSI Altı):** Basınç 60 PSI altına düştüğünde sesli buzzer alarmı devreye girer.
* **İmdat Freni (Maxi Körükler):** Hava basıncı sıfıra yaklaşırsa, yaylı emniyet körükleri mekanik olarak devreye girer ve aracı güvenli durdurmak için tekerlekleri kilitler.
* **El Freni / İmdat:** `Boşluk (Space)` tuşuyla çekilen park freni, hava basıncıyla değil yay tansiyonuyla tekerlekleri kilitler.

---

## 5. Kapı Fren İnterlok Güvenlik Sistemi

Uluslararası otobüs emniyet regülasyonu gereği, araç kapıları (`E` ön kapı, `Q` arka kapı) veya engelli rampası açıkken gaz kelebeği kilitlenir (**Door-Brake Interlock**).
* Yolcu binerken veya inerken sürücü istese dahi araca gaz veremez (`canAccelerate = false`).
* Kapılar tamamen kapanıp pnömatik sızdırmazlık contaları kilitlendiğinde interlok devreden çıkar ve araç ivmelenir.

---

## 6. Kneeling (Yana Yatma) & Havalı Körük Süspansiyonu

Şehir içi alçak tabanlı belediye otobüslerinde durakta yolcu alırken sağ taraftaki hava körüklerinin havası tahliye edilir:
* Otobüsün sağ gövdesi kaldırıma doğru yaklaşık **7 santimetre** eğilir (**Kneeling**).
* Yaşlı, çocuklu ve hareket kısıtlı yolcular basamaksız olarak rahatça biner.
* Kapılar kapandıktan sonra kompresör sağ körüklere hava basarak otobüsü normal seyir yüksekliğine getirir.

---

## 7. Çift Kademeli Engelli Rampası & Erişilebilirlik

Orta kapı zemininde yer alan katlanır erişilebilirlik rampası:
* Durakta tekerlekli sandalyeli yolcu beklediğinde devreye alınır.
* Rampa açıldığında sesli akustik uyarı ve HUD bildirimi verilir.
* Yolcu binişini tamamlayıp rampa kapandıktan sonra sefere devam edilir. Bu işlem sürücüye yüksek konfor ve tecrübe puanı kazandırır.

---

## 8. Viraj Geometrisi, Merkezkaç Kuvveti ve Gövde Salınımı (Body Roll)

### Ağır Vasıta Ağırlık Merkezi
Otobüsler yaklaşık 3.8 metre yüksekliğe ve yüksek bir ağırlık merkezine sahiptir. Bir viraja girildiğinde merkezkaç ivmesi ($a_c = v^2 / R$) otobüs şasisini virajın dışına doğru yatırır:
* **Gövde Salınımı (Body Roll):** Otobüs görsel olarak yana yatar (`rotate(deg)`), yol 3D perspektifle eğrilir (`skewX(deg)`).
* **Lastik Çığlığı (Tire Screech) & Savrulma:** Eğer hız limiti (örneğin 40 km/s olan bir viraja 80 km/s ile girilirse) aşılırsa, lastik sürtünme katsayısı aşılır, lastikler acı bir çığlıkla öter ve araç şeridin dışına savrulur.
* **Yolcu Konfor Endeksi:** Savrulma yaşandığında yolcular panikler ve konfor endeksi hızla düşer. Usta kaptanlar viraja girmeden önce retarder ile hızını düşürür.

---

## 9. Viyadük & Asma Köprü Yan Rüzgarları ve Çelik Genleşme Derzleri

### Yan Rüzgar ve Kontra Sürüş
1915 Çanakkale Köprüsü, Osmangazi Köprüsü veya 165 metre ayak yüksekliğiyle Türkiye'nin en yüksek viyadüğü olan Botan Çayı Beğendik Köprüsü'nden geçerken şiddetli yan rüzgarlar otobüsün geniş yan cephesine çarpar:
* Rüzgar aracı şeritten çıkarmaya çalışır.
* Sürücünün şeritte kalabilmek için direksiyonla rüzgara karşı hafif **kontra direksiyon** vermesi gerekir.

### Çelik Genleşme Derz Vuruntusu
Asma köprülerde ve uzun viyadüklerde yaz-kış genleşmesini tolere eden çelik derz açıklıkları bulunur. Her 35 metrede bir tekerlekler bu çelik derzlerin üzerinden geçerken tok bir ses çıkarır: **tak-tak, tak-tak!**

---

## 10. KGM Resmî Tünel Envanteri ve Yankı Akustiği

Oyunda uydurma tünel bulunmaz; sadece aracın güzergahında tescilli bir tünel varsa devreye girer:
* **Yeni Zigana Tüneli (D-885 Trabzon-Gümüşhane):** 14.476 m (Avrupa'nın ve Türkiye'nin en uzun çift tüplü karayolu tüneli).
* **Ovit Dağı Tüneli (D-925 Rize-Erzurum):** 14.346 m.
* **Ilgaz 15 Temmuz İstiklal Tüneli (D-765 Kastamonu-Çankırı):** 5.488 m.
* **Avrasya Tüneli (İstanbul Boğaz Altı):** 5.400 m.
* **Sabuncubeli Tüneli (D-565 İzmir-Manisa):** 4.070 m.
* **Bolu Dağı Tüneli (O-4 / E80 Bolu-Düzce):** 3.125 m.

### Tünel Akustiği ve Far Rejimi
Tünele girildiğinde ses mikseri **Reverb (Yankı)** moduna geçer. Motor, egzoz ve korna sesleri beton çeperlere çarpıp yankılanır. Tünel karanlık olduğu için `F` tuşuna basılarak farlar yakılmalıdır.

---

## 11. Devir Saati (RPM), Şanzıman ve Yakıt Tasarrufu

Ağır vasıta dizel motorları düşük devirde yüksek tork üretir:
* **Yeşil Bant (1.000 - 1.600 RPM):** Maksimum tork ve en düşük yakıt tüketiminin gerçekleştiği ideal seyir devridir.
* **Tırmanış Devri (1.800 - 2.200 RPM):** Yokuş tırmanırken vites küçültülerek motor bu bantta tutulmalı, bayılma önlenmelidir.
* **Aşırı Devir (2.400+ RPM):** Yakıt tüketimini fırlatır ve motor hararetini artırır.
* **Retarder Enjeksiyon Kesme:** Retarder devredeyken motora yakıt enjeksiyonu tamamen kesilir (Sıfır yakıtla frenleme).

---

## 12. Eksiksiz Kaptan Klavye ve Tuş Referans Tablosu

| Tuş | Kısayol Adı | İşlevi ve Ağır Vasıta Kullanım Taktikleri |
|---|---|---|
| **W / ↑** | Gaz (İvmelenme) | Aracı hızlandırır. Kapılar veya rampa açıkken interlok kilidi devrededir. |
| **S / ↓** | Servis Freni (Ayak Freni) | Disk frenleridir. Dik inişlerde sürekli basılırsa balatalar şişer (260°C+). |
| **A / ←** | Direksiyon (Sol) | Aracı sola yönlendirir; virajda merkezkaç kuvveti uygular. |
| **D / →** | Direksiyon (Sağ) | Aracı sağa yönlendirir. |
| **B** | Kademeli Retarder Kolu | 5 kademeli şanzıman freni (1-2-3-4-5). Balataları ısıtmadan hız keser. |
| **Shift + B** | Retarder Sıfırla | Retarder kolunu anında boşa alır ve hava tahliye sesiyle devreden çıkar. |
| **Space / M**| Motoru Aç / Kapat | Kontağı açar veya kapatır (Dizel motoru çalıştırır / durdurur). |
| **G** | Sefer & Görev Durumu | Sıradaki durak, kalan mesafe, kalan durak ve varış hedefini sesli okur. |
| **F** | Farlar | Gece ve tünel geçişlerinde aydınlatma sağlar. |
| **L** | Havalı Korna | Ağır vasıta çift borulu havalı kornayı çalar. |
| **E** | Ön Kapı & Kneeling | Ön kapıyı açar, aracı kaldırıma yatırır (Kneeling) ve yolcu binişini başlatır. |
| **Q** | Arka Kapı | İnen yolcular için arka kapıyı açar. |
| **K** | Klima (A/C) | Kabin sıcaklığını 22°C konfor standardına ayarlar. |
| **Y** | Pusula İstikameti | Anlık manyetik pusula yönünü ve derece açısını sesli anons eder. |
| **Shift + Oklar** | Yön Değişimi | Güzergah ayrımında pusula istikametini manuel değiştirir. |
| **V** | Telsiz (Push-to-Talk) | Çevrimiçi kaptanlarla canlı sesli telsiz görüşmesi başlatır. |
| **T / Shift+T** | Telsiz & Hava Raporu | Saat, dış hava sıcaklığı ve telsiz kanal durumunu bildirir. |
| **H** | Yakıt & Hasar Raporu | Depodaki net mazot litresini ve parça sağlık durumunu okur. |
| **C / Shift+C** | Konfor & Çay Saati | Yolcu konfor endeksini okur; Shift+C ile demli çay yudumlayarak konforu artırır. |
| **R** | Hız Okuma | Anlık kilometre/saat hızını seslendirir. |
| **N** | Sonraki Durak Anonsu | Sıradaki durağın adını kabin içine anons eder. |
| **Ctrl/Shift+N**| Son Durak Navigasyonu| Seferin nihai varış terminalini ve güzergah özetini okur. |
| **Z** | Zamanlama & Rötar | Sefer çizelgesindeki dakiklik ve rötar durumunu bildirir. |
| **P** | Dörtlü Flaşör | Acil durum veya duraklama flaşörlerini yakar. |
| **1 - 6** | Manuel Vites | Şanzıman kademelerini manuel seçmeye izin verir. |
| **F1** | Akademi & Yardım Menüsü| Bu kılavuzu, interaktif laboratuvarı ve şirket rehberini açar. |

---
*T.C. Ulaştırma ve Altyapı Bakanlığı, Karayolları Genel Müdürlüğü (KGM) ve Harita Genel Müdürlüğü (HGM) teknik standartları esas alınarak hazırlanmıştır.*
