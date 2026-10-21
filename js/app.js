/* ==========================================================================
   TÜRKİYE TURNESİ - OTOBÜS SİMÜLASYONU BAÅLATICI (APP.JS)
   ========================================================================== */

const sehirlerarasiMesafeler = {
                    "Tekirdağ-Kırıkkale": 525, "Kırıkkale-Tekirdağ": 525,
                    "İstanbul-Kırıkkale": 400, "Kırıkkale-İstanbul": 400,
                    "Ankara-Kırıkkale": 75, "Kırıkkale-Ankara": 75,
                    "Çankırı-Kırıkkale": 110, "Kırıkkale-Çankırı": 110,
                    "Çorum-Kırıkkale": 165, "Kırıkkale-Çorum": 165,
                    "Yozgat-Kırıkkale": 140, "Kırıkkale-Yozgat": 140,
                    "Kırşehir-Kırıkkale": 110, "Kırıkkale-Kırşehir": 110,
                    "Aksaray-Kırıkkale": 155, "Kırıkkale-Aksaray": 155,
                    "Kayseri-Kırıkkale": 240, "Kırıkkale-Kayseri": 240,

                    "Tekirdağ-Batman": 1530, "Batman-Tekirdağ": 1530,
                    "İstanbul-Batman": 1405, "Batman-İstanbul": 1405,
                    "Ankara-Batman": 975, "Batman-Ankara": 975,
                    "Diyarbakır-Batman": 100, "Batman-Diyarbakır": 100,
                    "Siirt-Batman": 85, "Batman-Siirt": 85,
                    "Muş-Batman": 135, "Batman-Muş": 135,
                    "Bitlis-Batman": 135, "Batman-Bitlis": 135,
                    "Mardin-Batman": 140, "Batman-Mardin": 140,
                    "Şırnak-Batman": 170, "Batman-Şırnak": 170,
                    "Şanlıurfa-Batman": 280, "Batman-Şanlıurfa": 280,

                    "Tekirdağ-Şırnak": 1680, "Şırnak-Tekirdağ": 1680,
                    "İstanbul-Şırnak": 1555, "Şırnak-İstanbul": 1555,
                    "Ankara-Şırnak": 1125, "Şırnak-Ankara": 1125,
                    "Mardin-Şırnak": 190, "Şırnak-Mardin": 190,
                    "Siirt-Şırnak": 95, "Şırnak-Siirt": 95,
                    "Hakkâri-Şırnak": 190, "Şırnak-Hakkâri": 190,
                    "Van-Şırnak": 210, "Şırnak-Van": 210,
                    "Diyarbakır-Şırnak": 285, "Şırnak-Diyarbakır": 285,

                    "Tekirdağ-Bartın": 565, "Bartın-Tekirdağ": 565,
                    "İstanbul-Bartın": 440, "Bartın-İstanbul": 440,
                    "Ankara-Bartın": 280, "Bartın-Ankara": 280,
                    "Zonguldak-Bartın": 85, "Bartın-Zonguldak": 85,
                    "Karabük-Bartın": 85, "Bartın-Karabük": 85,
                    "Kastamonu-Bartın": 185, "Bartın-Kastamonu": 185,
                    "Bolu-Bartın": 225, "Bartın-Bolu": 225,
                    "Düzce-Bartın": 175, "Bartın-Düzce": 175,

                    "Tekirdağ-Ardahan": 1520, "Ardahan-Tekirdağ": 1520,
                    "İstanbul-Ardahan": 1395, "Ardahan-İstanbul": 1395,
                    "Ankara-Ardahan": 1060, "Ardahan-Ankara": 1060,
                    "Kars-Ardahan": 90, "Ardahan-Kars": 90,
                    "Artvin-Ardahan": 115, "Ardahan-Artvin": 115,
                    "Erzurum-Ardahan": 200, "Ardahan-Erzurum": 200,
                    "Iğdır-Ardahan": 230, "Ardahan-Iğdır": 230,
                    "Trabzon-Ardahan": 280, "Ardahan-Trabzon": 280,
                    "Rize-Ardahan": 210, "Ardahan-Rize": 210,

                    "Tekirdağ-Iğdır": 1600, "Iğdır-Tekirdağ": 1600,
                    "İstanbul-Iğdır": 1475, "Iğdır-İstanbul": 1475,
                    "Ankara-Iğdır": 1140, "Iğdır-Ankara": 1140,
                    "Kars-Iğdır": 140, "Iğdır-Kars": 140,
                    "Ağrı-Iğdır": 140, "Iğdır-Ağrı": 140,
                    "Erzurum-Iğdır": 320, "Iğdır-Erzurum": 320,
                    "Van-Iğdır": 240, "Iğdır-Van": 240,

                    "Tekirdağ-Karabük": 530, "Karabük-Tekirdağ": 530,
                    "İstanbul-Karabük": 405, "Karabük-İstanbul": 405,
                    "Ankara-Karabük": 215, "Karabük-Ankara": 215,
                    "Zonguldak-Karabük": 95, "Karabük-Zonguldak": 95,
                    "Bolu-Karabük": 140, "Karabük-Bolu": 140,
                    "Çankırı-Karabük": 120, "Karabük-Çankırı": 120,
                    "Kastamonu-Karabük": 110, "Karabük-Kastamonu": 110,

                    "Tekirdağ-Kilis": 1240, "Kilis-Tekirdağ": 1240,
                    "İstanbul-Kilis": 1115, "Kilis-İstanbul": 1115,
                    "Ankara-Kilis": 700, "Kilis-Ankara": 700,
                    "Gaziantep-Kilis": 65, "Kilis-Gaziantep": 65,
                    "Hatay-Kilis": 120, "Kilis-Hatay": 120,
                    "Osmaniye-Kilis": 160, "Kilis-Osmaniye": 160,
                    "Kahramanmaraş-Kilis": 145, "Kilis-Kahramanmaraş": 145,
                    "Şanlıurfa-Kilis": 205, "Kilis-Şanlıurfa": 205,

                    "Tekirdağ-Osmaniye": 1100, "Osmaniye-Tekirdağ": 1100,
                    "İstanbul-Osmaniye": 975, "Osmaniye-İstanbul": 975,
                    "Ankara-Osmaniye": 560, "Osmaniye-Ankara": 560,
                    "Adana-Osmaniye": 90, "Osmaniye-Adana": 90,
                    "Hatay-Osmaniye": 130, "Osmaniye-Hatay": 130,
                    "Gaziantep-Osmaniye": 130, "Osmaniye-Gaziantep": 130,
                    "Kahramanmaraş-Osmaniye": 95, "Osmaniye-Kahramanmaraş": 95,
                    "Mersin-Osmaniye": 160, "Osmaniye-Mersin": 160,

                    "Tekirdağ-Düzce": 365, "Düzce-Tekirdağ": 365,
                    "İstanbul-Düzce": 215, "Düzce-İstanbul": 215,
                    "Ankara-Düzce": 235, "Düzce-Ankara": 235,
                    "Bolu-Düzce": 45, "Düzce-Bolu": 45,
                    "Sakarya-Düzce": 70, "Düzce-Sakarya": 70,
                    "Zonguldak-Düzce": 120, "Düzce-Zonguldak": 120,
                    "Kocaeli-Düzce": 115, "Düzce-Kocaeli": 115,
                    "Bursa-Düzce": 195, "Düzce-Bursa": 195,

                    "Tekirdağ-Trabzon": 1150, "Trabzon-Tekirdağ": 1150,
                    "İstanbul-Trabzon": 1025, "Trabzon-İstanbul": 1025,
                    "Ankara-Trabzon": 740, "Trabzon-Ankara": 740,
                    "Rize-Trabzon": 75, "Trabzon-Rize": 75,
                    "Giresun-Trabzon": 135, "Trabzon-Giresun": 135,
                    "Gümüşhane-Trabzon": 100, "Trabzon-Gümüşhane": 100,
                    "Bayburt-Trabzon": 140, "Trabzon-Bayburt": 140,
                    "Erzurum-Trabzon": 265, "Trabzon-Erzurum": 265,

                    "Tekirdağ-Tunceli": 1340, "Tunceli-Tekirdağ": 1340,
                    "İstanbul-Tunceli": 1210, "Tunceli-İstanbul": 1210,
                    "Ankara-Tunceli": 820, "Tunceli-Ankara": 820,
                    "Elazığ-Tunceli": 135, "Tunceli-Elazığ": 135,
                    "Erzincan-Tunceli": 135, "Tunceli-Erzincan": 135,
                    "Bingöl-Tunceli": 145, "Tunceli-Bingöl": 145,

                    "Tekirdağ-Şanlıurfa": 1380, "Şanlıurfa-Tekirdağ": 1380,
                    "İstanbul-Şanlıurfa": 1250, "Şanlıurfa-İstanbul": 1250,
                    "Ankara-Şanlıurfa": 820, "Şanlıurfa-Ankara": 820,
                    "Gaziantep-Şanlıurfa": 140, "Şanlıurfa-Gaziantep": 140,
                    "Diyarbakır-Şanlıurfa": 180, "Şanlıurfa-Diyarbakır": 180,
                    "Mardin-Şanlıurfa": 190, "Şanlıurfa-Mardin": 190,
                    "Adıyaman-Şanlıurfa": 110, "Şanlıurfa-Adıyaman": 110,

                    "Tekirdağ-Uşak": 500, "Uşak-Tekirdağ": 500,
                    "İstanbul-Uşak": 370, "Uşak-İstanbul": 370,
                    "Ankara-Uşak": 370, "Uşak-Ankara": 370,
                    "İzmir-Uşak": 210, "Uşak-İzmir": 210,
                    "Afyonkarahisar-Uşak": 115, "Uşak-Afyonkarahisar": 115,
                    "Kütahya-Uşak": 140, "Uşak-Kütahya": 140,
                    "Denizli-Uşak": 150, "Uşak-Denizli": 150,
                    "Manisa-Uşak": 195, "Uşak-Manisa": 195,

                    "Tekirdağ-Van": 1690, "Van-Tekirdağ": 1690,
                    "İstanbul-Van": 1560, "Van-İstanbul": 1560,
                    "Ankara-Van": 1180, "Van-Ankara": 1180,
                    "Bitlis-Van": 160, "Van-Bitlis": 160,
                    "Ağrı-Van": 230, "Van-Ağrı": 230,
                    "Hakkâri-Van": 200, "Van-Hakkâri": 200,
                    "Siirt-Van": 250, "Van-Siirt": 250,

                    "Tekirdağ-Yozgat": 770, "Yozgat-Tekirdağ": 770,
                    "İstanbul-Yozgat": 640, "Yozgat-İstanbul": 640,
                    "Ankara-Yozgat": 215, "Yozgat-Ankara": 215,
                    "Sivas-Yozgat": 220, "Yozgat-Sivas": 220,
                    "Kayseri-Yozgat": 175, "Yozgat-Kayseri": 175,
                    "Çorum-Yozgat": 108, "Yozgat-Çorum": 108,
                    "Kırşehir-Yozgat": 110, "Yozgat-Kırşehir": 110,
                    "Kırıkkale-Yozgat": 140, "Yozgat-Kırıkkale": 140,

                    "Tekirdağ-Zonguldak": 440, "Zonguldak-Tekirdağ": 440,
                    "İstanbul-Zonguldak": 320, "Zonguldak-İstanbul": 320,
                    "Ankara-Zonguldak": 270, "Zonguldak-Ankara": 270,
                    "Bolu-Zonguldak": 150, "Zonguldak-Bolu": 150,
                    "Düzce-Zonguldak": 120, "Zonguldak-Düzce": 120,
                    "Bartın-Zonguldak": 85, "Zonguldak-Bartın": 85,
                    "Karabük-Zonguldak": 95, "Zonguldak-Karabük": 95,

                    "Tekirdağ-Aksaray": 790, "Aksaray-Tekirdağ": 790,
                    "İstanbul-Aksaray": 660, "Aksaray-İstanbul": 660,
                    "Ankara-Aksaray": 225, "Aksaray-Ankara": 225,
                    "Konya-Aksaray": 145, "Aksaray-Konya": 145,
                    "Nevşehir-Aksaray": 75, "Aksaray-Nevşehir": 75,
                    "Niğde-Aksaray": 110, "Aksaray-Niğde": 110,
                    "Kırşehir-Aksaray": 110, "Aksaray-Kırşehir": 110,
                    "Kayseri-Aksaray": 150, "Aksaray-Kayseri": 150,

                    "Tekirdağ-Karaman": 820, "Karaman-Tekirdağ": 820,
                    "İstanbul-Karaman": 685, "Karaman-İstanbul": 685,
                    "Ankara-Karaman": 370, "Karaman-Ankara": 370,
                    "Konya-Karaman": 120, "Karaman-Konya": 120,
                    "Mersin-Karaman": 230, "Karaman-Mersin": 230,
                    "Antalya-Karaman": 330, "Karaman-Antalya": 330,
                    "Ereğli-Karaman": 90, "Karaman-Ereğli": 90,

                    "Tekirdağ-Niğde": 880, "Niğde-Tekirdağ": 880,
                    "İstanbul-Niğde": 750, "Niğde-İstanbul": 750,
                    "Ankara-Niğde": 350, "Niğde-Ankara": 350,
                    "Adana-Niğde": 170, "Niğde-Adana": 170,
                    "Kayseri-Niğde": 130, "Niğde-Kayseri": 130,
                    "Nevşehir-Niğde": 85, "Niğde-Nevşehir": 85,
                    "Mersin-Niğde": 180, "Niğde-Mersin": 180,
                    "Aksaray-Niğde": 110, "Niğde-Aksaray": 110,

                    "Tekirdağ-Ordu": 1010, "Ordu-Tekirdağ": 1010,
                    "İstanbul-Ordu": 880, "Ordu-İstanbul": 880,
                    "Ankara-Ordu": 560, "Ordu-Ankara": 560,
                    "Samsun-Ordu": 150, "Ordu-Samsun": 150,
                    "Giresun-Ordu": 45, "Ordu-Giresun": 45,
                    "Trabzon-Ordu": 180, "Ordu-Trabzon": 180,

                    "Tekirdağ-Rize": 1230, "Rize-Tekirdağ": 1230,
                    "İstanbul-Rize": 1100, "Rize-İstanbul": 1100,
                    "Ankara-Rize": 780, "Rize-Ankara": 780,
                    "Trabzon-Rize": 75, "Rize-Trabzon": 75,
                    "Artvin-Rize": 95, "Rize-Artvin": 95,
                    "Erzurum-Rize": 210, "Rize-Erzurum": 210,

                    "Tekirdağ-Sakarya": 285, "Sakarya-Tekirdağ": 285,
                    "İstanbul-Sakarya": 135, "Sakarya-İstanbul": 135,
                    "Ankara-Sakarya": 310, "Sakarya-Ankara": 310,
                    "Kocaeli-Sakarya": 35, "Sakarya-Kocaeli": 35,
                    "Bolu-Sakarya": 115, "Sakarya-Bolu": 115,
                    "Düzce-Sakarya": 70, "Sakarya-Düzce": 70,
                    "Bilecik-Sakarya": 100, "Sakarya-Bilecik": 100,

                    "Tekirdağ-Samsun": 860, "Samsun-Tekirdağ": 860,
                    "İstanbul-Samsun": 735, "Samsun-İstanbul": 735,
                    "Ankara-Samsun": 410, "Samsun-Ankara": 410,
                    "Sinop-Samsun": 155, "Samsun-Sinop": 155,
                    "Çorum-Samsun": 172, "Samsun-Çorum": 172,
                    "Amasya-Samsun": 130, "Samsun-Amasya": 130,
                    "Ordu-Samsun": 150, "Samsun-Ordu": 150,

                    "Tekirdağ-Siirt": 1680, "Siirt-Tekirdağ": 1680,
                    "İstanbul-Siirt": 1550, "Siirt-İstanbul": 1550,
                    "Ankara-Siirt": 1150, "Siirt-Ankara": 1150,
                    "Batman-Siirt": 85, "Siirt-Batman": 85,
                    "Bitlis-Siirt": 95, "Siirt-Bitlis": 95,
                    "Şırnak-Siirt": 100, "Siirt-Şırnak": 100,
                    "Diyarbakır-Siirt": 180, "Siirt-Diyarbakır": 180,

                    "Tekirdağ-Sivas": 975, "Sivas-Tekirdağ": 975,
                    "İstanbul-Sivas": 845, "Sivas-İstanbul": 845,
                    "Ankara-Sivas": 440, "Sivas-Ankara": 440,
                    "Kayseri-Sivas": 195, "Sivas-Kayseri": 195,
                    "Malatya-Sivas": 245, "Sivas-Malatya": 245,
                    "Erzincan-Sivas": 250, "Sivas-Erzincan": 250,
                    "Tokat-Sivas": 105, "Sivas-Tokat": 105,
                    "Yozgat-Sivas": 220, "Sivas-Yozgat": 220,

                    "Tekirdağ-Tokat": 910, "Tokat-Tekirdağ": 910,
                    "İstanbul-Tokat": 780, "Tokat-İstanbul": 780,
                    "Ankara-Tokat": 380, "Tokat-Ankara": 380,
                    "Amasya-Tokat": 115, "Tokat-Amasya": 115,
                    "Sivas-Tokat": 105, "Tokat-Sivas": 105,
                    "Samsun-Tokat": 220, "Tokat-Samsun": 220,
                    "Ordu-Tokat": 210, "Tokat-Ordu": 210,

                    "Tekirdağ-Kocaeli": 250, "Kocaeli-Tekirdağ": 250,
                    "İstanbul-Kocaeli": 95, "Kocaeli-İstanbul": 95,
                    "Ankara-Kocaeli": 350, "Kocaeli-Ankara": 350,
                    "Sakarya-Kocaeli": 35, "Kocaeli-Sakarya": 35,
                    "Yalova-Kocaeli": 45, "Kocaeli-Yalova": 45,
                    "Bursa-Kocaeli": 135, "Kocaeli-Bursa": 135,

                    "Tekirdağ-Kütahya": 380, "Kütahya-Tekirdağ": 380,
                    "İstanbul-Kütahya": 250, "Kütahya-İstanbul": 250,
                    "Ankara-Kütahya": 310, "Kütahya-Ankara": 310,
                    "Eskişehir-Kütahya": 75, "Kütahya-Eskişehir": 75,
                    "Afyonkarahisar-Kütahya": 100, "Kütahya-Afyonkarahisar": 100,
                    "Bilecik-Kütahya": 110, "Kütahya-Bilecik": 110,
                    "Bursa-Kütahya": 175, "Kütahya-Bursa": 175,

                    "Tekirdağ-Malatya": 1250, "Malatya-Tekirdağ": 1250,
                    "İstanbul-Malatya": 1120, "Malatya-İstanbul": 1120,
                    "Ankara-Malatya": 670, "Malatya-Ankara": 670,
                    "Elazığ-Malatya": 100, "Malatya-Elazığ": 100,
                    "Sivas-Malatya": 245, "Malatya-Sivas": 245,
                    "Adıyaman-Malatya": 120, "Malatya-Adıyaman": 120,
                    "Kahramanmaraş-Malatya": 220, "Malatya-Kahramanmaraş": 220,

                    "Tekirdağ-Manisa": 490, "Manisa-Tekirdağ": 490,
                    "İstanbul-Manisa": 440, "Manisa-İstanbul": 440,
                    "Ankara-Manisa": 560, "Manisa-Ankara": 560,
                    "İzmir-Manisa": 35, "Manisa-İzmir": 35,
                    "Balıkesir-Manisa": 140, "Manisa-Balıkesir": 140,
                    "Aydın-Manisa": 145, "Manisa-Aydın": 145,

                    "Tekirdağ-Kahramanmaraş": 1200, "Kahramanmaraş-Tekirdağ": 1200,
                    "İstanbul-Kahramanmaraş": 1070, "Kahramanmaraş-İstanbul": 1070,
                    "Ankara-Kahramanmaraş": 600, "Kahramanmaraş-Ankara": 600,
                    "Gaziantep-Kahramanmaraş": 78, "Kahramanmaraş-Gaziantep": 78,
                    "Adana-Kahramanmaraş": 190, "Kahramanmaraş-Adana": 190,
                    "Osmaniye-Kahramanmaraş": 110, "Kahramanmaraş-Osmaniye": 110,
                    "Kayseri-Kahramanmaraş": 260, "Kahramanmaraş-Kayseri": 260,

                    "Tekirdağ-Mardin": 1610, "Mardin-Tekirdağ": 1610,
                    "İstanbul-Mardin": 1480, "Mardin-İstanbul": 1480,
                    "Ankara-Mardin": 1050, "Mardin-Ankara": 1050,
                    "Diyarbakır-Mardin": 95, "Mardin-Diyarbakır": 95,
                    "Şanlıurfa-Mardin": 190, "Mardin-Şanlıurfa": 190,
                    "Batman-Mardin": 140, "Mardin-Batman": 140,

                    "Tekirdağ-Muğla": 730, "Muğla-Tekirdağ": 730,
                    "İstanbul-Muğla": 680, "Muğla-İstanbul": 680,
                    "Ankara-Muğla": 620, "Muğla-Ankara": 620,
                    "Aydın-Muğla": 100, "Muğla-Aydın": 100,
                    "Denizli-Muğla": 145, "Muğla-Denizli": 145,
                    "Antalya-Muğla": 310, "Muğla-Antalya": 310,
                    "İzmir-Muğla": 210, "Muğla-İzmir": 210,

                    "Tekirdağ-Muş": 1460, "Muş-Tekirdağ": 1460,
                    "İstanbul-Muş": 1330, "Muş-İstanbul": 1330,
                    "Ankara-Muş": 940, "Muş-Ankara": 940,
                    "Bitlis-Muş": 85, "Muş-Bitlis": 85,
                    "Bingöl-Muş": 115, "Muş-Bingöl": 115,
                    "Erzurum-Muş": 220, "Muş-Erzurum": 220,
                    "Ağrı-Muş": 165, "Muş-Ağrı": 165,

                    "Tekirdağ-Nevşehir": 770, "Nevşehir-Tekirdağ": 770,
                    "İstanbul-Nevşehir": 640, "Nevşehir-İstanbul": 640,
                    "Ankara-Nevşehir": 280, "Nevşehir-Ankara": 280,
                    "Kayseri-Nevşehir": 80, "Nevşehir-Kayseri": 80,
                    "Kırşehir-Nevşehir": 90, "Nevşehir-Kırşehir": 90,
                    "Aksaray-Nevşehir": 75, "Nevşehir-Aksaray": 75,
                    "Niğde-Nevşehir": 85, "Nevşehir-Niğde": 85,

                    "Tekirdağ-Hakkâri": 1850, "Hakkâri-Tekirdağ": 1850,
                    "İstanbul-Hakkâri": 1720, "Hakkâri-İstanbul": 1720,
                    "Ankara-Hakkâri": 1320, "Hakkâri-Ankara": 1320,
                    "Van-Hakkâri": 200, "Hakkâri-Van": 200,
                    "Şırnak-Hakkâri": 190, "Hakkâri-Şırnak": 190,

                    "Tekirdağ-Hatay": 1180, "Hatay-Tekirdağ": 1180,
                    "İstanbul-Hatay": 1050, "Hatay-İstanbul": 1050,
                    "Ankara-Hatay": 640, "Hatay-Ankara": 640,
                    "Adana-Hatay": 190, "Hatay-Adana": 190,
                    "Osmaniye-Hatay": 130, "Hatay-Osmaniye": 130,
                    "Gaziantep-Hatay": 190, "Hatay-Gaziantep": 190,

                    "Tekirdağ-Isparta": 690, "Isparta-Tekirdağ": 690,
                    "İstanbul-Isparta": 560, "Isparta-İstanbul": 560,
                    "Ankara-Isparta": 390, "Isparta-Ankara": 390,
                    "Burdur-Isparta": 30, "Isparta-Burdur": 30,
                    "Antalya-Isparta": 130, "Isparta-Antalya": 130,
                    "Konya-Isparta": 240, "Isparta-Konya": 240,
                    "Afyonkarahisar-Isparta": 165, "Isparta-Afyonkarahisar": 165,

                    "Tekirdağ-Mersin": 1010, "Mersin-Tekirdağ": 1010,
                    "İstanbul-Mersin": 880, "Mersin-İstanbul": 880,
                    "Ankara-Mersin": 480, "Mersin-Ankara": 480,
                    "Adana-Mersin": 70, "Mersin-Adana": 70,
                    "Konya-Mersin": 350, "Mersin-Konya": 350,
                    "Niğde-Mersin": 180, "Mersin-Niğde": 180,
                    "Antalya-Mersin": 470, "Mersin-Antalya": 470,

                    "Tekirdağ-İzmir": 520, "İzmir-Tekirdağ": 520,
                    "İstanbul-İzmir": 475, "İzmir-İstanbul": 475,
                    "Ankara-İzmir": 580, "İzmir-Ankara": 580,
                    "Balıkesir-İzmir": 175, "İzmir-Balıkesir": 175,
                    "Manisa-İzmir": 35, "İzmir-Manisa": 35,
                    "Aydın-İzmir": 110, "İzmir-Aydın": 110,
                    "Çanakkale-İzmir": 320, "İzmir-Çanakkale": 320,
                    "Bursa-İzmir": 330, "İzmir-Bursa": 330,

                    "Tekirdağ-Kars": 1530, "Kars-Tekirdağ": 1530,
                    "İstanbul-Kars": 1400, "Kars-İstanbul": 1400,
                    "Ankara-Kars": 1070, "Kars-Ankara": 1070,
                    "Erzurum-Kars": 200, "Kars-Erzurum": 200,
                    "Ağrı-Kars": 140, "Kars-Ağrı": 140,
                    "Ardahan-Kars": 90, "Kars-Ardahan": 90,
                    "Iğdır-Kars": 140, "Kars-Iğdır": 140,

                    "Tekirdağ-Kastamonu": 620, "Kastamonu-Tekirdağ": 620,
                    "İstanbul-Kastamonu": 490, "Kastamonu-İstanbul": 490,
                    "Ankara-Kastamonu": 240, "Kastamonu-Ankara": 240,
                    "Sinop-Kastamonu": 180, "Kastamonu-Sinop": 180,
                    "Çankırı-Kastamonu": 105, "Kastamonu-Çankırı": 105,
                    "Çorum-Kastamonu": 195, "Kastamonu-Çorum": 195,
                    "Karabük-Kastamonu": 110, "Kastamonu-Karabük": 110,

                    "Tekirdağ-Kayseri": 890, "Kayseri-Tekirdağ": 890,
                    "İstanbul-Kayseri": 760, "Kayseri-İstanbul": 760,
                    "Ankara-Kayseri": 315, "Kayseri-Ankara": 315,
                    "Sivas-Kayseri": 195, "Kayseri-Sivas": 195,
                    "Nevşehir-Kayseri": 80, "Kayseri-Nevşehir": 80,
                    "Niğde-Kayseri": 130, "Kayseri-Niğde": 130,
                    "Yozgat-Kayseri": 175, "Kayseri-Yozgat": 175,
                    "Adana-Kayseri": 330, "Kayseri-Adana": 330,
                    "Kahramanmaraş-Kayseri": 260, "Kayseri-Kahramanmaraş": 260,

                    "Tekirdağ-Kırşehir": 730, "Kırşehir-Tekirdağ": 730,
                    "İstanbul-Kırşehir": 600, "Kırşehir-İstanbul": 600,
                    "Ankara-Kırşehir": 185, "Kırşehir-Ankara": 185,
                    "Nevşehir-Kırşehir": 90, "Kırşehir-Nevşehir": 90,
                    "Yozgat-Kırşehir": 110, "Kırşehir-Yozgat": 110,
                    "Kırıkkale-Kırşehir": 110, "Kırşehir-Kırıkkale": 110,
                    "Aksaray-Kırşehir": 110, "Kırşehir-Aksaray": 110,
                    "Kayseri-Kırşehir": 135, "Kırşehir-Kayseri": 135,

                    "Tekirdağ-Denizli": 670, "Denizli-Tekirdağ": 670,
                    "İstanbul-Denizli": 560, "Denizli-İstanbul": 560,
                    "Ankara-Denizli": 480, "Denizli-Ankara": 480,
                    "İzmir-Denizli": 225, "Denizli-İzmir": 225,
                    "Aydın-Denizli": 125, "Denizli-Aydın": 125,
                    "Muğla-Denizli": 145, "Denizli-Muğla": 145,
                    "Burdur-Denizli": 150, "Denizli-Burdur": 150,
                    "Uşak-Denizli": 150, "Denizli-Uşak": 150,
                    "Afyonkarahisar-Denizli": 220, "Denizli-Afyonkarahisar": 220,
                    "Antalya-Denizli": 220, "Denizli-Antalya": 220,

                    "Tekirdağ-Antalya": 830, "Antalya-Tekirdağ": 830,
                    "İstanbul-Antalya": 700, "Antalya-İstanbul": 700,
                    "Ankara-Antalya": 480, "Antalya-Ankara": 480,
                    "Burdur-Antalya": 122, "Antalya-Burdur": 122,
                    "Isparta-Antalya": 130, "Antalya-Isparta": 130,
                    "Muğla-Antalya": 310, "Antalya-Muğla": 310,
                    "Konya-Antalya": 305, "Antalya-Konya": 305,

                    "Bolu-Ankara": 190, "Ankara-Bolu": 190,
                    "Eskişehir-Ankara": 235, "Ankara-Eskişehir": 235,
                    "Konya-Ankara": 260, "Ankara-Konya": 260,
                    "Kırıkkale-Ankara": 75, "Ankara-Kırıkkale": 75,
                    "Aksaray-Ankara": 225, "Ankara-Aksaray": 225,

                    "Tekirdağ-Amasya": 810, "Amasya-Tekirdağ": 810,
                    "İstanbul-Amasya": 680, "Amasya-İstanbul": 680,
                    "Ankara-Amasya": 335, "Amasya-Ankara": 335,
                    "Samsun-Amasya": 130, "Amasya-Samsun": 130,
                    "Tokat-Amasya": 115, "Amasya-Tokat": 115,
                    "Çorum-Amasya": 92, "Amasya-Çorum": 92,

                    "Tekirdağ-Ağrı": 1510, "Ağrı-Tekirdağ": 1510,
                    "İstanbul-Ağrı": 1380, "Ağrı-İstanbul": 1380,
                    "Ankara-Ağrı": 1060, "Ağrı-Ankara": 1060,
                    "Erzurum-Ağrı": 180, "Ağrı-Erzurum": 180,
                    "Van-Ağrı": 230, "Ağrı-Van": 230,
                    "Kars-Ağrı": 140, "Ağrı-Kars": 140,
                    "Iğdır-Ağrı": 140, "Ağrı-Iğdır": 140,

                    "Tekirdağ-Afyonkarahisar": 540, "Afyonkarahisar-Tekirdağ": 540,
                    "İstanbul-Afyonkarahisar": 410, "Afyonkarahisar-İstanbul": 410,
                    "Ankara-Afyonkarahisar": 260, "Afyonkarahisar-Ankara": 260,
                    "Adana-Afyonkarahisar": 510, "Afyonkarahisar-Adana": 510,
                    "Eskişehir-Afyonkarahisar": 130, "Afyonkarahisar-Eskişehir": 130,
                    "Kütahya-Afyonkarahisar": 100, "Afyonkarahisar-Kütahya": 100,
                    "Konya-Afyonkarahisar": 225, "Afyonkarahisar-Konya": 225,
                    "Isparta-Afyonkarahisar": 165, "Afyonkarahisar-Isparta": 165,

                    "Tekirdağ-Adıyaman": 1250, "Adıyaman-Tekirdağ": 1250,
                    "İstanbul-Adıyaman": 1130, "Adıyaman-İstanbul": 1130,
                    "Ankara-Adıyaman": 690, "Adıyaman-Ankara": 690,
                    "Adana-Adıyaman": 340, "Adıyaman-Adana": 340,

                                                                                                                                                                                                        "Tekirdağ-Sinop": 810, "Sinop-Tekirdağ": 810,
                    "İstanbul-Sinop": 680, "Sinop-İstanbul": 680,
                    "Ankara-Sinop": 415, "Sinop-Ankara": 415,
                    "Samsun-Sinop": 155, "Sinop-Samsun": 155,
                    "Kastamonu-Sinop": 180, "Sinop-Kastamonu": 180,
                    "Çorum-Sinop": 210, "Sinop-Çorum": 210,
                                                                                                                                                                                                        "Tekirdağ-Yalova": 220, "Yalova-Tekirdağ": 220,
                    "İstanbul-Yalova": 95, "Yalova-İstanbul": 95,
                    "Kocaeli-Yalova": 45, "Yalova-Kocaeli": 45,
                    "Bursa-Yalova": 70, "Yalova-Bursa": 70,
                    "Sakarya-Yalova": 85, "Yalova-Sakarya": 85,
                    "Bilecik-Yalova": 110, "Yalova-Bilecik": 110,
                    "Ankara-Yalova": 410, "Yalova-Ankara": 410,
                    "Balıkesir-Yalova": 200, "Yalova-Balıkesir": 200,
                                        "Tekirdağ-Erzurum": 1360, "Erzurum-Tekirdağ": 1360,
                    "İstanbul-Erzurum": 1225, "Erzurum-İstanbul": 1225,
                    "Ankara-Erzurum": 875, "Erzurum-Ankara": 875,
                    "Erzincan-Erzurum": 190, "Erzurum-Erzincan": 190,
                    "Kars-Erzurum": 200, "Erzurum-Kars": 200,
                    "Ağrı-Erzurum": 185, "Erzurum-Ağrı": 185,
                    "Muş-Erzurum": 220, "Erzurum-Muş": 220,
                    "Bingöl-Erzurum": 180, "Erzurum-Bingöl": 180,
                    "Bayburt-Erzurum": 125, "Erzurum-Bayburt": 125,
                    "Artvin-Erzurum": 200, "Erzurum-Artvin": 200,
                    "Trabzon-Erzurum": 265, "Erzurum-Trabzon": 265,
                    "Tekirdağ-Konya": 700, "Konya-Tekirdağ": 700,
                    "İstanbul-Konya": 565, "Konya-İstanbul": 565,
                    "Ankara-Konya": 260, "Konya-Ankara": 260,
                    "Afyonkarahisar-Konya": 225, "Konya-Afyonkarahisar": 225,
                    "Antalya-Konya": 305, "Konya-Antalya": 305,
                    "Aksaray-Konya": 145, "Konya-Aksaray": 145,
                    "Karaman-Konya": 120, "Konya-Karaman": 120,
                    "Eskişehir-Konya": 330, "Konya-Eskişehir": 330,
                    "Isparta-Konya": 240, "Konya-Isparta": 240,
                    "Burdur-Konya": 270, "Konya-Burdur": 270,
                    "Bursa-Konya": 485, "Konya-Bursa": 485,
                    "Tekirdağ-Erzincan": 1170, "Erzincan-Tekirdağ": 1170,
                    "İstanbul-Erzincan": 1035, "Erzincan-İstanbul": 1035,
                    "Ankara-Erzincan": 685, "Erzincan-Ankara": 685,
                    "Erzurum-Erzincan": 190, "Erzincan-Erzurum": 190,
                    "Sivas-Erzincan": 250, "Erzincan-Sivas": 250,
                    "Elazığ-Erzincan": 260, "Erzincan-Elazığ": 260,
                    "Tunceli-Erzincan": 135, "Erzincan-Tunceli": 135,
                    "Gümüşhane-Erzincan": 135, "Erzincan-Gümüşhane": 135,
                    "Bayburt-Erzincan": 145, "Erzincan-Bayburt": 145,
                    "Malatya-Erzincan": 250, "Erzincan-Malatya": 250,
                    "Tekirdağ-Elazığ": 1350, "Elazığ-Tekirdağ": 1350,
                    "İstanbul-Elazığ": 1215, "Elazığ-İstanbul": 1215,
                    "Ankara-Elazığ": 765, "Elazığ-Ankara": 765,
                    "Malatya-Elazığ": 100, "Elazığ-Malatya": 100,
                    "Bingöl-Elazığ": 145, "Elazığ-Bingöl": 145,
                    "Diyarbakır-Elazığ": 155, "Elazığ-Diyarbakır": 155,
                    "Tunceli-Elazığ": 135, "Elazığ-Tunceli": 135,
                    "Erzincan-Elazığ": 260, "Elazığ-Erzincan": 260,
                    "Adıyaman-Elazığ": 240, "Elazığ-Adıyaman": 240,
                    "Tekirdağ-Bayburt": 1265, "Bayburt-Tekirdağ": 1265,
                    "İstanbul-Bayburt": 1130, "Bayburt-İstanbul": 1130,
                    "Ankara-Bayburt": 775, "Bayburt-Ankara": 775,
                    "Erzurum-Bayburt": 125, "Bayburt-Erzurum": 125,
                    "Trabzon-Bayburt": 140, "Bayburt-Trabzon": 140,
                    "Gümüşhane-Bayburt": 78, "Bayburt-Gümüşhane": 78,
                    "Erzincan-Bayburt": 145, "Bayburt-Erzincan": 145,
                    "Rize-Bayburt": 180, "Bayburt-Rize": 180,
                    "Tekirdağ-Diyarbakır": 1560, "Diyarbakır-Tekirdağ": 1560,
                    "İstanbul-Diyarbakır": 1425, "Diyarbakır-İstanbul": 1425,
                    "Ankara-Diyarbakır": 1000, "Diyarbakır-Ankara": 1000,
                    "Adana-Diyarbakır": 535, "Diyarbakır-Adana": 535,
                    "Şanlıurfa-Diyarbakır": 180, "Diyarbakır-Şanlıurfa": 180,
                    "Mardin-Diyarbakır": 95, "Diyarbakır-Mardin": 95,
                    "Batman-Diyarbakır": 100, "Diyarbakır-Batman": 100,
                    "Elazığ-Diyarbakır": 155, "Diyarbakır-Elazığ": 155,
                    "Bingöl-Diyarbakır": 140, "Diyarbakır-Bingöl": 140,
                    "Adıyaman-Diyarbakır": 205, "Diyarbakır-Adıyaman": 205,
                    "Tekirdağ-Çorum": 745, "Çorum-Tekirdağ": 745,
                    "İstanbul-Çorum": 610, "Çorum-İstanbul": 610,
                    "Ankara-Çorum": 245, "Çorum-Ankara": 245,
                    "Amasya-Çorum": 92, "Çorum-Amasya": 92,
                    "Samsun-Çorum": 172, "Çorum-Samsun": 172,
                    "Sinop-Çorum": 270, "Çorum-Sinop": 270,
                    "Kastamonu-Çorum": 195, "Çorum-Kastamonu": 195,
                    "Çankırı-Çorum": 155, "Çorum-Çankırı": 155,
                    "Kırıkkale-Çorum": 165, "Çorum-Kırıkkale": 165,
                    "Yozgat-Çorum": 108, "Çorum-Yozgat": 108,
                    "Tekirdağ-Çankırı": 550, "Çankırı-Tekirdağ": 550,
                    "İstanbul-Çankırı": 415, "Çankırı-İstanbul": 415,
                    "Ankara-Çankırı": 130, "Çankırı-Ankara": 130,
                    "Bolu-Çankırı": 190, "Çankırı-Bolu": 190,
                    "Kastamonu-Çankırı": 105, "Çankırı-Kastamonu": 105,
                    "Karabük-Çankırı": 120, "Çankırı-Karabük": 120,
                    "Çorum-Çankırı": 155, "Çankırı-Çorum": 155,
                    "Kırıkkale-Çankırı": 110, "Çankırı-Kırıkkale": 110,
                    "Tekirdağ-Bursa": 275, "Bursa-Tekirdağ": 275,
                    "İstanbul-Bursa": 155, "Bursa-İstanbul": 155,
                    "Ankara-Bursa": 385, "Bursa-Ankara": 385,
                    "Yalova-Bursa": 70, "Bursa-Yalova": 70,
                    "Bilecik-Bursa": 95, "Bursa-Bilecik": 95,
                    "Balıkesir-Bursa": 150, "Bursa-Balıkesir": 150,
                    "Kütahya-Bursa": 175, "Bursa-Kütahya": 175,
                    "Eskişehir-Bursa": 150, "Bursa-Eskişehir": 150,
                    "Tekirdağ-Burdur": 710, "Burdur-Tekirdağ": 710,
                    "İstanbul-Burdur": 580, "Burdur-İstanbul": 580,
                    "Ankara-Burdur": 420, "Burdur-Ankara": 420,
                    "Isparta-Burdur": 30, "Burdur-Isparta": 30,
                    "Antalya-Burdur": 122, "Burdur-Antalya": 122,
                    "Denizli-Burdur": 150, "Burdur-Denizli": 150,
                    "Afyonkarahisar-Burdur": 170, "Burdur-Afyonkarahisar": 170,
                    "Tekirdağ-Bolu": 395, "Bolu-Tekirdağ": 395,
                    "İstanbul-Bolu": 260, "Bolu-İstanbul": 260,
                    "Ankara-Bolu": 190, "Bolu-Ankara": 190,
                    "Düzce-Bolu": 45, "Bolu-Düzce": 45,
                    "Sakarya-Bolu": 115, "Bolu-Sakarya": 115,
                    "Zonguldak-Bolu": 150, "Bolu-Zonguldak": 150,
                    "Karabük-Bolu": 140, "Bolu-Karabük": 140,
                    "Tekirdağ-Bitlis": 1520, "Bitlis-Tekirdağ": 1520,
                    "İstanbul-Bitlis": 1390, "Bitlis-İstanbul": 1390,
                    "Ankara-Bitlis": 995, "Bitlis-Ankara": 995,
                    "Van-Bitlis": 160, "Bitlis-Van": 160,
                    "Muş-Bitlis": 85, "Bitlis-Muş": 85,
                    "Siirt-Bitlis": 95, "Bitlis-Siirt": 95,
                    "Ağrı-Bitlis": 145, "Bitlis-Ağrı": 145,
                    "Batman-Bitlis": 135, "Bitlis-Batman": 135,
                    "Tekirdağ-Bingöl": 1425, "Bingöl-Tekirdağ": 1425,
                    "İstanbul-Bingöl": 1295, "Bingöl-İstanbul": 1295,
                    "Ankara-Bingöl": 900, "Bingöl-Ankara": 900,
                    "Elazığ-Bingöl": 140, "Bingöl-Elazığ": 140,
                    "Muş-Bingöl": 115, "Bingöl-Muş": 115,
                    "Erzurum-Bingöl": 180, "Bingöl-Erzurum": 180,
                    "Diyarbakır-Bingöl": 145, "Bingöl-Diyarbakır": 145,
                    "Tekirdağ-Bilecik": 380, "Bilecik-Tekirdağ": 380,
                    "İstanbul-Bilecik": 245, "Bilecik-İstanbul": 245,
                    "Ankara-Bilecik": 315, "Bilecik-Ankara": 315,
                    "Sakarya-Bilecik": 100, "Bilecik-Sakarya": 100,
                    "Bursa-Bilecik": 95, "Bilecik-Bursa": 95,
                    "Eskişehir-Bilecik": 80, "Bilecik-Eskişehir": 80,
                    "Kütahya-Bilecik": 110, "Bilecik-Kütahya": 110,
                    "Tekirdağ-Balıkesir": 295, "Balıkesir-Tekirdağ": 295,
                    "İstanbul-Balıkesir": 280, "Balıkesir-İstanbul": 280,
                    "Ankara-Balıkesir": 535, "Balıkesir-Ankara": 535,
                    "Bursa-Balıkesir": 150, "Balıkesir-Bursa": 150,
                    "İzmir-Balıkesir": 175, "Balıkesir-İzmir": 175,
                    "Manisa-Balıkesir": 140, "Balıkesir-Manisa": 140,
                    "Kütahya-Balıkesir": 230, "Balıkesir-Kütahya": 230,
                    "Tekirdağ-Aydın": 630, "Aydın-Tekirdağ": 630,
                    "İstanbul-Aydın": 520, "Aydın-İstanbul": 520,
                    "Ankara-Aydın": 590, "Aydın-Ankara": 590,
                    "İzmir-Aydın": 110, "Aydın-İzmir": 110,
                    "Denizli-Aydın": 125, "Aydın-Denizli": 125,
                    "Muğla-Aydın": 100, "Aydın-Muğla": 100,
                    "Manisa-Aydın": 145, "Aydın-Manisa": 145,
                    "Tekirdağ-Artvin": 1440, "Artvin-Tekirdağ": 1440,
                    "İstanbul-Artvin": 1310, "Artvin-İstanbul": 1310,
                    "Ankara-Artvin": 980, "Artvin-Ankara": 980,
                    "Rize-Artvin": 95, "Artvin-Rize": 95,
                    "Erzurum-Artvin": 200, "Artvin-Erzurum": 200,
                    "Ardahan-Artvin": 115, "Artvin-Ardahan": 115,
                    "Tekirdağ-Adana": 1050, "Adana-Tekirdağ": 1050,
                    "İstanbul-Adana": 930, "Adana-İstanbul": 930,
                    "Ankara-Adana": 490, "Adana-Ankara": 490,

                    "Tekirdağ-İstanbul": 135, "İstanbul-Tekirdağ": 135,
                    "Tekirdağ-Edirne": 140, "Edirne-Tekirdağ": 140,
                    "Tekirdağ-Kırklareli": 115, "Kırklareli-Tekirdağ": 115,
                    "Tekirdağ-Çanakkale": 170, "Çanakkale-Tekirdağ": 170,
                    "Edirne-Kırklareli": 65, "Kırklareli-Edirne": 65,
                    "Edirne-Çanakkale": 210, "Çanakkale-Edirne": 210,
                    "Kırklareli-Çanakkale": 240, "Çanakkale-Kırklareli": 240,
                    "İstanbul-Edirne": 240, "Edirne-İstanbul": 240,
                    "İstanbul-Kırklareli": 215, "Kırklareli-İstanbul": 215,
                    "İstanbul-Çanakkale": 310, "Çanakkale-İstanbul": 310,
                    "İstanbul-Ankara": 450, "Ankara-İstanbul": 450,
                    "Tekirdağ-Ankara": 585,
                    "Tekirdağ-Eskişehir": 430,
                    "Tekirdağ-Gaziantep": 1260,
                    "Tekirdağ-Giresun": 1050,
                    "Tekirdağ-Gümüşhane": 1140, "Gümüşhane-Tekirdağ": 1140,
                    "İstanbul-Gümüşhane": 1020, "Gümüşhane-İstanbul": 1020,
                    "Ankara-Gümüşhane": 760, "Gümüşhane-Ankara": 760,
                    "Bayburt-Gümüşhane": 75, "Gümüşhane-Bayburt": 75,
                    "Erzincan-Gümüşhane": 135, "Gümüşhane-Erzincan": 135,
                    "Giresun-Gümüşhane": 145, "Gümüşhane-Giresun": 145,
                    "Erzurum-Gümüşhane": 200, "Gümüşhane-Erzurum": 200,
 "Giresun-Tekirdağ": 1050,
                    "İstanbul-Giresun": 930, "Giresun-İstanbul": 930,
                    "Ankara-Giresun": 610, "Giresun-Ankara": 610,
                    "Erzincan-Giresun": 225, "Giresun-Erzincan": 225,
                    "Erzurum-Giresun": 335, "Giresun-Erzurum": 335,
                    "Amasya-Giresun": 280, "Giresun-Amasya": 280,
                    "Çorum-Giresun": 370, "Giresun-Çorum": 370,
 "Gaziantep-Tekirdağ": 1260,
                    "İstanbul-Gaziantep": 1145, "Gaziantep-İstanbul": 1145,
                    "Ankara-Gaziantep": 700, "Gaziantep-Ankara": 700,
                    "Adana-Gaziantep": 220, "Gaziantep-Adana": 220,
                    "Adıyaman-Gaziantep": 150, "Gaziantep-Adıyaman": 150,
                    "Diyarbakır-Gaziantep": 315, "Gaziantep-Diyarbakır": 315,
                    "Konya-Gaziantep": 550, "Gaziantep-Konya": 550,
 "Eskişehir-Tekirdağ": 430,
                    "İstanbul-Eskişehir": 300, "Eskişehir-İstanbul": 300,
                    "Ankara-Eskişehir": 235, "Eskişehir-Ankara": 235,
                    "Bursa-Eskişehir": 150, "Eskişehir-Bursa": 150,
                    "Bilecik-Eskişehir": 80, "Eskişehir-Bilecik": 80,
                    "Konya-Eskişehir": 330, "Eskişehir-Konya": 330,
                    "Afyonkarahisar-Eskişehir": 130, "Eskişehir-Afyonkarahisar": 130,
                    "Bolu-Eskişehir": 200, "Eskişehir-Bolu": 200,
 "Ankara-Tekirdağ": 585,
                    "Çanakkale-Balıkesir": 195, "Balıkesir-Çanakkale": 195,
                    "Çanakkale-Bursa": 270, "Bursa-Çanakkale": 270,
                    "Çanakkale-İzmir": 320, "İzmir-Çanakkale": 320
                };
        if (typeof window !== 'undefined') window.sehirlerarasiMesafeler = sehirlerarasiMesafeler;

document.addEventListener('DOMContentLoaded', () => {
    // === HATA AYIKLAMA (DEBUG) MODU ===
    window.addEventListener('error', (e) => {
        console.error("Global JS Error:", e.message, "at", e.filename, ":", e.lineno);
        if (window.UI && typeof window.UI.showToast === 'function') {
            window.UI.showToast(`SİSTEM HATASI: ${e.message} (Satır: ${e.lineno})`, 'danger');
        }
        if (typeof audio !== 'undefined' && typeof audio.speak === 'function') {
            audio.speak(`Kritik sistem hatası: ${e.message}. Lütfen bu hatayı bana bildirin.`);
        }
    });
    
    window.addEventListener('unhandledrejection', (e) => {
        console.warn("Unhandled Promise Rejection:", e.reason);
        let msg = e.reason ? (e.reason.message || String(e.reason)) : "";
        const ignoredPatterns = ['Firebase', 'offline', 'AudioContext', 'user gesture', 'play()', 'abort', 'fetch', 'NetworkError', 'not allowed'];
        const isIgnored = ignoredPatterns.some(p => msg.toLowerCase().includes(p.toLowerCase()));
        if (!isIgnored && msg.length > 0) {
            if (window.UI && typeof window.UI.showToast === 'function') {
                window.UI.showToast(`SİSTEM HATASI (Promise): ${msg}`, 'danger');
            }
        }
    });
    // ===================================
    
    // Initialize Keyboard Navigation on load
    KeyboardNav.initForScreen();

    // === GÜNCELLEME: Eski hatalı rotaları otomatik temizle ===
    if (!localStorage.getItem('routeFixApplied_v1')) {
        localStorage.removeItem('routesData');
        localStorage.removeItem('activeRoute');
        localStorage.setItem('routeFixApplied_v1', 'true');
        console.log("Eski hatalı rotalar başarıyla temizlendi, yeni sistem aktif.");
    }
    // ==========================================================

    // === HERKESİ SEVİYE 1'DEN BAŞLAT GÜNCELLEMESİ ===
    if (localStorage.getItem('sim_season_level1') !== 'true') {
        localStorage.setItem('sim_season_level1', 'true');
        localStorage.setItem('licenseLevel', '1');
        localStorage.setItem('completedTasks', '0');
        localStorage.setItem('unlockedCities', JSON.stringify(["Tekirdağ"]));
        localStorage.setItem('merkezUs', 'Tekirdağ');
        if (typeof Game !== 'undefined') {
            Game.licenseLevel = 1;
            Game.completedTasks = 0;
            Game.unlockedCities = ["Tekirdağ"];
            Game.currentCity = "Tekirdağ";
        }
        console.log("Herkes Seviye 1'den başlatıldı.");
    }
    // =================================================

        // === ROTALARI VE TEKULAŞ GÖREVLERİNİ AÇILIŞTA ANINDA YEREL VERİDEN YÜKLE ===
    const initAllRoutesInstantly = () => {
        try {
            if (typeof generateRoutesFromAPI === 'function') {
                const defaultStops = (typeof varsayilanSehirDuraklari !== 'undefined' && varsayilanSehirDuraklari["Tekirdağ"]) 
                    ? varsayilanSehirDuraklari["Tekirdağ"] : [];
                generateRoutesFromAPI(defaultStops, "Tekirdağ");
                console.log("Tekirdağ rotaları ve TEKULAŞ veritabanı anında yüklendi:", Object.keys(routesData).length);

                if (typeof varsayilanSehirDuraklari !== 'undefined') {
                    ["Yalova", "Bayburt", "Edirne", "Kırklareli", "İstanbul"].forEach(city => {
                        if (varsayilanSehirDuraklari[city]) {
                            generateRoutesFromAPI(varsayilanSehirDuraklari[city], city);
                        }
                    });
                }
            }
        } catch (preloadErr) {
            console.warn("Açılışta rota ön yükleme uyarısı:", preloadErr);
        }
    };
    initAllRoutesInstantly();
    // =========================================================================

    // 0. Splash Screen
    const splashScreen = document.getElementById('splash-screen');
    const loginScreen = document.getElementById('login-screen');
    const titleScreen = document.getElementById('title-screen');
    
        const dismissSplash = async () => {
        if (!splashScreen.classList.contains('hidden')) {
            if (typeof audio !== 'undefined' && audio.playSelect) audio.playSelect();
            splashScreen.classList.add('hidden');
            
            let savedUser = localStorage.getItem('otobusUsername');
            if (savedUser) {
                if (typeof UI !== 'undefined' && UI.showToast) UI.showToast('Kullanıcı bilgileri yükleniyor...', 'info');
                try {
                    if (typeof Game !== 'undefined' && Game.loadFromFirebase) {
                        await Game.loadFromFirebase(savedUser);
                    }
                } catch (err) {
                    console.warn("Firebase splash error:", err);
                }
                
                if (typeof UI !== 'undefined' && UI.switchScreen) {
                    UI.switchScreen('title-screen');
                } else {
                    titleScreen.classList.remove('hidden');
                }
                if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(`Tekrar hoş geldin, ${savedUser}!`, 'success');
                if (typeof audio !== 'undefined' && audio.speak) audio.speak(`Tekrar hoş geldin, ${savedUser}!`);
                if (typeof UI !== 'undefined' && UI.updatePlayerStats && typeof Game !== 'undefined') {
                    const licenseTitle = (typeof Game.getLicenseTitle === 'function') ? Game.getLicenseTitle() : 'Stajyer';
                    UI.updatePlayerStats(Game.licenseLevel || 1, Game.completedTasks || 0, Game.playerBudget || 0, licenseTitle);
                }
                if (typeof UI !== 'undefined' && UI.updateTitleScreenButtons) {
                    UI.updateTitleScreenButtons();
                }
            } else {
                loginScreen.classList.remove('hidden');
                const userInput = document.getElementById('username-input');
                if (userInput) userInput.focus();
            }
            if (typeof KeyboardNav !== 'undefined' && KeyboardNav.initForScreen) {
                KeyboardNav.initForScreen();
            }
        }
    };

    splashScreen.addEventListener('click', dismissSplash);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            dismissSplash();
        }
    });

                // 0.5. Login Screen & Bölge / İlçe Listesi Sistemi (Yüksek Erişilebilirlik)
    const DISTRICT_OPTIONS = [
        { id: "Süleymanpaşa", icon: "🏙️", name: "Süleymanpaşa (Tekirdağ Merkez)", desc: "Eski merkez ilçe Süleymanpaşa adını aldı. Sahil, çarşı ve üniversite hatları (0 km)" },
        { id: "Muratlı", icon: "🚆", name: "Muratlı (Tren Garı & Çarşı)", desc: "Tren istasyonu aksı ve ilçe merkez seferleri (Merkeze 24 km)" },
        { id: "Çorlu", icon: "🏭", name: "Çorlu (Sanayi & Şehir Merkezi)", desc: "Büyük sanayi metropolü ve en kalabalık ilçe (Merkeze 36 km)" },
        { id: "Marmaraereğlisi", icon: "🏖️", name: "Marmaraereğlisi (Sahil & Antik Kent)", desc: "Perinthos antik kenti, Yeniçiftlik, Sultanköy ve Marmara sahil hatları (Merkeze 38 km)" },
        { id: "Ergene", icon: "⚙️", name: "Ergene / Velimeşe (Sanayi & TOKİ)", desc: "Çorlu'ya bağlı beldelerin birleşmesiyle Ergene yeni bir ilçe oldu. OSB ve TOKİ hatları (Merkeze 45 km)" },
        { id: "Hayrabolu", icon: "🌻", name: "Hayrabolu (Trakya Ovası)", desc: "Ayçiçeği tarlaları ve ova çarşı hatları (Merkeze 52 km)" },
        { id: "Malkara", icon: "🌾", name: "Malkara (Merkez & Köy Yolları)", desc: "Geniş ova, tepe mahalleler ve köy yolları (Merkeze 58 km)" },
        { id: "Çerkezköy", icon: "🏭", name: "Çerkezköy (Sanayi & OSB Merkezi)", desc: "Çerkezköy OSB, Tepe, İstasyon ve Veliköy hatları (Merkeze 62 km)" },
        { id: "Kapaklı", icon: "🏢", name: "Kapaklı (Müstakil İlçe & Yıldızkent)", desc: "Çerkezköy'e bağlı bir belde olan Kapaklı müstakil bir ilçeye dönüştürüldü. Yıldızkent ve Pınarça hatları (Merkeze 67 km)" },
        { id: "Saray", icon: "🌳", name: "Saray (İlçe Merkezi & Mahalleleri)", desc: "Kuzey Trakya ormanları ve ilçe hatları (Merkeze 78 km)" },
        { id: "Şarköy", icon: "🍇", name: "Şarköy (Sahil & Bağ Yolları)", desc: "Marmara denizi kıyısı ve bağ hatları (Merkeze 84 km)" }
    ];

    let chosenDistrict = (typeof Game !== 'undefined' && Game.activeDistrict) ? Game.activeDistrict : (localStorage.getItem('activeDistrict') || "Süleymanpaşa");

    const renderLoginDistrictList = () => {
        const listEl = document.getElementById('login-district-list');
        const statusEl = document.getElementById('lbl-current-chosen-district');
        if (!listEl) return;
        listEl.innerHTML = '';
        listEl.setAttribute('role', 'radiogroup');
        listEl.setAttribute('aria-label', 'Başlangıç bölgesi ve ilçe listesi. 11 ilçe mevcuttur.');

        DISTRICT_OPTIONS.forEach((opt, idx) => {
            const isSelected = (opt.id === chosenDistrict);
            const li = document.createElement('li');
            li.style.marginBottom = '6px';

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `menu-btn nav-item login-dist-btn ${isSelected ? 'primary-btn' : ''}`;
            btn.style.width = '100%';
            btn.style.textAlign = 'left';
            btn.style.padding = '10px 14px';
            btn.style.fontSize = '0.98rem';
            btn.style.display = 'flex';
            btn.style.alignItems = 'center';
            btn.style.justifyContent = 'space-between';
            btn.style.border = isSelected ? '2px solid #22c55e' : '1px solid rgba(56,189,248,0.3)';
            btn.style.background = isSelected ? 'rgba(34, 197, 94, 0.22)' : 'rgba(15,23,42,0.7)';
            btn.style.cursor = 'pointer';
            btn.setAttribute('role', 'radio');
            btn.setAttribute('aria-checked', isSelected ? 'true' : 'false');
            btn.setAttribute('data-dist-id', opt.id);
            btn.setAttribute('aria-label', `${idx + 1}. İlçe: ${opt.name}. ${isSelected ? 'Seçili bölge.' : 'Seçmek için Enter tuşuna basın.'}`);

            btn.innerHTML = `
                <span><strong>${opt.icon} ${opt.name}</strong></span>
                <span class="sel-badge" style="font-weight:bold; font-size:0.9rem; color:${isSelected ? '#4ade80' : '#94a3b8'}">
                    ${isSelected ? '✓ SEÇİLİ' : 'Seç'}
                </span>
            `;

            btn.onclick = () => {
                chosenDistrict = opt.id;
                if (typeof audio !== 'undefined' && audio.playSelect) audio.playSelect();
                if (statusEl) statusEl.innerText = `${opt.icon} ${opt.name}`;
                
                // DOM'u yıkmadan sadece durum ve stilleri güncelle (NVDA odağını kaybetmez)
                const allButtons = listEl.querySelectorAll('.login-dist-btn');
                allButtons.forEach((b, bIdx) => {
                    const bId = b.getAttribute('data-dist-id');
                    const isSel = (bId === chosenDistrict);
                    b.setAttribute('aria-checked', isSel ? 'true' : 'false');
                    b.classList.toggle('primary-btn', isSel);
                    b.style.border = isSel ? '2px solid #22c55e' : '1px solid rgba(56,189,248,0.3)';
                    b.style.background = isSel ? 'rgba(34, 197, 94, 0.22)' : 'rgba(15,23,42,0.7)';
                    const badge = b.querySelector('.sel-badge');
                    if (badge) {
                        badge.innerText = isSel ? '✓ SEÇİLİ' : 'Seç';
                        badge.style.color = isSel ? '#4ade80' : '#94a3b8';
                    }
                    const o = DISTRICT_OPTIONS.find(x => x.id === bId);
                    if (o) {
                        b.setAttribute('aria-label', `${bIdx + 1}. İlçe: ${o.name}. ${isSel ? 'Seçili bölge.' : 'Seçmek için Enter tuşuna basın.'}`);
                    }
                });

                const announceText = `${opt.name} başlangıç bölgesi seçildi. Oyuna girmek için Aşağı okla Oyuna Gir butonuna ilerleyebilirsiniz.`;
                if (typeof audio !== 'undefined' && audio.speak) audio.speak(announceText);
                if (typeof audio !== 'undefined' && audio.updateNvdaLiveRegion) audio.updateNvdaLiveRegion(announceText);
            };

            li.appendChild(btn);
            listEl.appendChild(li);
        });

        if (statusEl) {
            const cur = DISTRICT_OPTIONS.find(o => o.id === chosenDistrict) || DISTRICT_OPTIONS[0];
            statusEl.innerText = `${cur.icon} ${cur.name}`;
        }
    };

    // Açılışta login listesini hazırla
    renderLoginDistrictList();

    const usernameInput = document.getElementById('username-input');
    const btnLogin = document.getElementById('btn-login');

    const handleLoginAction = async () => {
        let username = (usernameInput && usernameInput.value) ? usernameInput.value.trim() : '';
        username = username.replace(/[.#$\[\]]/g, '');
        
        // Asla kullanıcıyı engelleme, boşsa Kaptan yap
        if (!username) {
            username = "Kaptan";
        }

        if (typeof audio !== 'undefined' && audio.playSelect) audio.playSelect();
        if (typeof UI !== 'undefined' && UI.showToast) UI.showToast('Giriş yapılıyor, lütfen bekleyin...', 'info');
        if (typeof audio !== 'undefined' && audio.speak) audio.speak(`Giriş yapılıyor. Hoş geldin, ${username}!`);

        try {
            if (typeof Game !== 'undefined' && Game.loadFromFirebase) {
                await Game.loadFromFirebase(username);
            }
        } catch (error) {
            console.warn("Firebase bağlantı hatası, yerel modla devam ediliyor:", error);
        }

        if (typeof Game !== 'undefined' && Game.setActiveDistrict) {
            Game.setActiveDistrict(chosenDistrict);
        } else {
            localStorage.setItem('activeDistrict', chosenDistrict);
        }
        localStorage.setItem('otobusUsername', username);
        if (typeof Multiplayer !== 'undefined' && Multiplayer.profile) { Multiplayer.profile.name = username; Multiplayer.syncMyState(); }
        
        if (typeof UI !== 'undefined' && UI.switchScreen) {
            UI.switchScreen('title-screen');
        } else {
            document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
            if (titleScreen) titleScreen.classList.remove('hidden');
        }

        if (typeof KeyboardNav !== 'undefined' && KeyboardNav.initForScreen) {
            KeyboardNav.initForScreen();
        }
        
        if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(`Hoş geldin, ${username}!`, 'success');
        if (typeof audio !== 'undefined' && audio.speak) audio.speak(`Hoş geldin, ${username}! Ana menü açıldı. Çalışma bölgeniz ${chosenDistrict}.`);
        if (typeof UI !== 'undefined' && UI.updatePlayerStats && typeof Game !== 'undefined') {
            const licenseTitle = (typeof Game.getLicenseTitle === 'function') ? Game.getLicenseTitle() : 'Stajyer';
            UI.updatePlayerStats(Game.licenseLevel || 1, Game.completedTasks || 0, Game.playerBudget || 0, licenseTitle);
        }
        if (typeof UI !== 'undefined' && UI.updateTitleScreenButtons) {
            UI.updateTitleScreenButtons();
        }
    };

    if (usernameInput) {
        usernameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleLoginAction();
            }
        });
    }

    if (btnLogin) {
        btnLogin.addEventListener('click', handleLoginAction);
    }

    // Title Screen - Bölge & İlçe Seçim Modalı (Listeden Oklarla Gezinme)
    const openDistrictPickerModal = () => {
        const modal = document.getElementById('district-picker-modal');
        const listEl = document.getElementById('district-picker-list');
        if (!modal || !listEl) return;

        const curDist = (typeof Game !== 'undefined' && Game.activeDistrict) ? Game.activeDistrict : (localStorage.getItem('activeDistrict') || 'Süleymanpaşa');
        listEl.innerHTML = '';
        listEl.setAttribute('role', 'radiogroup');
        listEl.setAttribute('aria-label', 'Bölge ve ilçe seçim listesi. 11 ilçe mevcuttur.');

        DISTRICT_OPTIONS.forEach((opt, idx) => {
            const isSelected = (opt.id === curDist);
            const li = document.createElement('li');
            li.style.marginBottom = '8px';

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `menu-btn nav-item ${isSelected ? 'primary-btn' : ''}`;
            btn.style.width = '100%';
            btn.style.textAlign = 'left';
            btn.style.padding = '12px 16px';
            btn.style.fontSize = '1.02rem';
            btn.style.display = 'flex';
            btn.style.alignItems = 'center';
            btn.style.justifyContent = 'space-between';
            btn.style.border = isSelected ? '2px solid #22c55e' : '1.5px solid rgba(56,189,248,0.3)';
            btn.style.background = isSelected ? 'rgba(34, 197, 94, 0.22)' : 'rgba(15,23,42,0.85)';
            btn.style.cursor = 'pointer';
            btn.setAttribute('role', 'radio');
            btn.setAttribute('aria-checked', isSelected ? 'true' : 'false');
            btn.setAttribute('data-dist-id', opt.id);
            btn.setAttribute('aria-label', `${idx + 1}. İlçe: ${opt.name}. ${opt.desc}. ${isSelected ? 'Şu anki aktif çalışma bölgeniz.' : 'Seçmek için Enter tuşuna basın.'}`);

            btn.innerHTML = `
                <span class="btn-text">
                    <strong>${opt.icon} ${opt.name}</strong>
                    <small style="display:block; color:#94a3b8; font-size:0.85rem; margin-top:2px;">${opt.desc}</small>
                </span>
                <span style="font-weight:bold; font-size:0.95rem; color:${isSelected ? '#4ade80' : '#38bdf8'};">
                    ${isSelected ? '✓ SEÇİLİ' : 'Seç (Enter)'}
                </span>
            `;

            btn.onclick = () => {
                if (typeof audio !== 'undefined' && audio.playSelect) audio.playSelect();
                if (typeof Game !== 'undefined' && Game.setActiveDistrict) {
                    Game.setActiveDistrict(opt.id);
                } else {
                    localStorage.setItem('activeDistrict', opt.id);
                }
                closeDistrictPickerModal();
                if (typeof UI !== 'undefined' && UI.updateTitleScreenButtons) {
                    UI.updateTitleScreenButtons();
                }
                const announceMsg = `${opt.name} ana çalışma bölgeniz olarak seçildi. 1. Seviye seferleriniz 4 duraktan başlayarak hazırlandı.`;
                if (typeof audio !== 'undefined' && audio.speak) audio.speak(announceMsg);
                if (typeof audio !== 'undefined' && audio.updateNvdaLiveRegion) audio.updateNvdaLiveRegion(announceMsg);
                if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(`📍 Aktif Bölge: ${opt.name}`, 'success');
            };

            li.appendChild(btn);
            listEl.appendChild(li);
        });

        modal.classList.remove('hidden');
        if (typeof KeyboardNav !== 'undefined' && KeyboardNav.initForScreen) {
            KeyboardNav.initForScreen();
        }

        // Seçili ilçeye veya ilk öğeye odaklan
        setTimeout(() => {
            const activeBtn = listEl.querySelector(`[data-dist-id="${curDist}"]`) || listEl.querySelector('button');
            if (activeBtn) activeBtn.focus();
        }, 120);

        const welcomeVoice = "Bölge ve ilçe seçim penceresi açıldı. 11 ilçe arasında yukarı ve aşağı oklarla gezinebilir, Enter ile seçebilirsiniz. Kapatmak için Escape tuşuna basabilirsiniz.";
        if (typeof audio !== 'undefined' && audio.speak) audio.speak(welcomeVoice);
        if (typeof audio !== 'undefined' && audio.updateNvdaLiveRegion) audio.updateNvdaLiveRegion(welcomeVoice);
    };

    const closeDistrictPickerModal = () => {
        const modal = document.getElementById('district-picker-modal');
        if (modal) modal.classList.add('hidden');
        if (typeof KeyboardNav !== 'undefined' && KeyboardNav.initForScreen) {
            KeyboardNav.initForScreen();
        }
        const btnChange = document.getElementById('btn-change-active-district');
        if (btnChange) btnChange.focus();
    };

    const btnClosePicker = document.getElementById('btn-close-district-picker');
    if (btnClosePicker) {
        btnClosePicker.addEventListener('click', closeDistrictPickerModal);
    }

    const btnChangeDist = document.getElementById('btn-change-active-district');
    if (btnChangeDist) {
        btnChangeDist.addEventListener('click', openDistrictPickerModal);
    }

    // 1. Title Screen - Şehir İçi ve Şehirlerarası Ayrımı
    const openCitySelection = () => {
        /* TEKULAŞ_CATEGORIZED_MENU_SYSTEM */
        Game.gameMode = 'city';
        Game.busType = 'belediye';

        // 10 seviye geçilmeden ilçeler, şehirler, ülkeler ve harita kesinlikle gözükmesin! Doğrudan aktif ilçe görev ekranına yönlendir
        if (!Game.hasPassedLevel10()) {
            const activeDist = (typeof Game !== 'undefined' && Game.activeDistrict) ? Game.activeDistrict : (localStorage.getItem('activeDistrict') || "Süleymanpaşa");
            audio.speak(`${activeDist} şehir içi belediye seferleri seçildi. Sefer görevleri listeleniyor.`);
            UI.showToast(`${activeDist} Şehir İçi Seferleri (10 Seviye Kuralı)`, "info");
            document.dispatchEvent(new CustomEvent('go-to-route-screen', { detail: { city: "Tekirdağ", district: activeDist } }));
            return;
        }

        audio.speak("Şehir içi ve ilçe belediye seferleri seçildi. Lütfen gitmek istediğiniz bölgeyi veya hattı seçin.");
        UI.showToast("Belediye Seferleri (TEKULAŞ) Modu Aktif", "info");

        // TEKULAŞ KATEGORİLİ HAT SEÇİM MENÜSÜ
        const listEl = document.getElementById('district-dest-list');
        const descEl = document.getElementById('district-modal-desc');
        const tekulasDb = (typeof window !== 'undefined' && window.tekulasHatVeritabani) ? window.tekulasHatVeritabani : (typeof ilceRotalari !== 'undefined' ? ilceRotalari["Tekirdağ"] : []);

        const renderCategories = () => {
            if (!listEl) return;
            listEl.innerHTML = '';
            if (descEl) descEl.innerText = "Lütfen gitmek istediğiniz ilçe veya hat kategorisini seçin:";

            const cats = [
                { id: "Süleymanpaşa", icon: "🏙️", title: "Süleymanpaşa Hatları (Merkez)", filter: r => r.district === 'Süleymanpaşa' || r.originDistrict === 'Süleymanpaşa' || r.destDistrict === 'Süleymanpaşa' },
                { id: "Muratlı", icon: "🚆", title: "Muratlı Hatları (24 km)", filter: r => r.district === 'Muratlı' || r.originDistrict === 'Muratlı' || r.destDistrict === 'Muratlı' },
                { id: "Çorlu", icon: "🏭", title: "Çorlu Hatları (36 km)", filter: r => r.district === 'Çorlu' || r.originDistrict === 'Çorlu' || r.destDistrict === 'Çorlu' },
                { id: "Marmaraereğlisi", icon: "🏖️", title: "Marmaraereğlisi Sahil Hatları (38 km)", filter: r => r.district === 'Marmaraereğlisi' || r.originDistrict === 'Marmaraereğlisi' || r.destDistrict === 'Marmaraereğlisi' || (r.name && r.name.toLowerCase().includes('ereğli')) },
                { id: "Ergene", icon: "⚙️", title: "Ergene & Velimeşe Hatları (45 km)", filter: r => r.district === 'Ergene' || r.district === 'Velimeşe' || r.originDistrict === 'Ergene' || r.destDistrict === 'Ergene' || (r.name && (r.name.toLowerCase().includes('ergene') || r.name.toLowerCase().includes('marmaracık') || r.name.toLowerCase().includes('velimeşe'))) },
                { id: "Hayrabolu", icon: "🌻", title: "Hayrabolu Hatları (52 km)", filter: r => r.district === 'Hayrabolu' || r.originDistrict === 'Hayrabolu' || r.destDistrict === 'Hayrabolu' },
                { id: "Malkara", icon: "🌾", title: "Malkara Hatları (58 km)", filter: r => r.district === 'Malkara' || r.originDistrict === 'Malkara' || r.destDistrict === 'Malkara' },
                { id: "Çerkezköy", icon: "🏭", title: "Çerkezköy Hatları (62 km)", filter: r => r.district === 'Çerkezköy' || r.originDistrict === 'Çerkezköy' || r.destDistrict === 'Çerkezköy' },
                { id: "Kapaklı", icon: "🏢", title: "Kapaklı Hatları (67 km)", filter: r => r.district === 'Kapaklı' || r.originDistrict === 'Kapaklı' || r.destDistrict === 'Kapaklı' },
                { id: "Saray", icon: "🌳", title: "Saray Hatları (78 km)", filter: r => r.district === 'Saray' || r.originDistrict === 'Saray' || r.destDistrict === 'Saray' },
                { id: "Şarköy", icon: "🍇", title: "Şarköy Sahil Hatları (84 km)", filter: r => r.district === 'Şarköy' || r.originDistrict === 'Şarköy' || r.destDistrict === 'Şarköy' },
                { id: "İlçeler Arası", icon: "🚌", title: "İlçeler Arası Ekspres Hatlar (11 İlçe Ağı)", filter: r => r.isDistrict || r.district === 'İlçeler Arası' || (r.originDistrict && r.destDistrict && r.originDistrict !== r.destDistrict) },
                { id: "TÜMÜ", icon: "📋", title: "Tüm TEKULAŞ Hatları (11 İlçe Ağı)", filter: () => true }
            ];

            cats.forEach(c => {
                const count = tekulasDb.filter(c.filter).length;
                const li = document.createElement('li');
                li.style.marginBottom = "10px";
                const btn = document.createElement('button');
                btn.className = 'menu-btn nav-item';
                btn.style.width = '100%';
                btn.style.justifyContent = 'space-between';
                btn.style.padding = '14px 16px';
                btn.innerHTML = '<span><strong>' + c.icon + ' ' + c.title + '</strong></span><span style="color: var(--secondary); font-weight: bold;">' + count + ' Hat</span>';
                btn.setAttribute('aria-label', c.title + ', ' + count + ' hat mevcut.');
                btn.onclick = () => {
                    audio.playSelect();
                    renderCategoryLines(c);
                };
                li.appendChild(btn);
                listEl.appendChild(li);
            });

            KeyboardNav.initForScreen();
        };

        const renderCategoryLines = (cat) => {
            if (!listEl) return;
            listEl.innerHTML = '';
            if (descEl) descEl.innerText = cat.title + " listeleniyor. Bir hat seçin:";
            audio.speak(cat.title + " listelendi. Toplam hat sayısı: " + tekulasDb.filter(cat.filter).length);

            // Geri dön butonu
            const backLi = document.createElement('li');
            backLi.style.marginBottom = "12px";
            const backBtn = document.createElement('button');
            backBtn.className = 'menu-btn nav-item';
            backBtn.style.width = '100%';
            backBtn.style.padding = '12px';
            backBtn.style.background = 'rgba(255,255,255,0.1)';
            backBtn.style.color = '#f87171';
            backBtn.innerHTML = '<span>⬅️ <strong>Kategorilere Dön</strong></span>';
            backBtn.setAttribute('aria-label', 'Kategorilere geri dön');
            backBtn.onclick = () => {
                audio.playSelect();
                audio.speak("Kategorilere dönüldü.");
                renderCategories();
            };
            backLi.appendChild(backBtn);
            listEl.appendChild(backLi);

            const filteredLines = tekulasDb.filter(cat.filter);
            filteredLines.forEach(route => {
                const li = document.createElement('li');
                li.style.marginBottom = "8px";
                const btn = document.createElement('button');
                btn.className = 'menu-btn nav-item';
                btn.style.width = '100%';
                btn.style.flexDirection = 'column';
                btn.style.alignItems = 'stretch';
                btn.style.textAlign = 'left';
                btn.style.padding = '12px 14px';

                const totalKm = route.totalKm || (route.stops ? route.stops.reduce((sum, s) => sum + (s.gercekMesafeSonraki || 0), 0) : 10);
                const stopCount = route.stops ? route.stops.length : (route.allUniqueStops ? route.allUniqueStops.length : 0);
                const sName = route.startStop || (route.stops && route.stops[0] ? route.stops[0].name : "");
                const eName = route.endStop || (route.stops && route.stops.length > 0 ? route.stops[route.stops.length - 1].name : "");

                let ariaTxt = "Hat " + route.hatNo + ": " + route.name + ". Toplam " + stopCount + " durak, " + totalKm.toFixed(1) + " kilometre. Kalkış: " + sName + ", Varış: " + eName;
                btn.setAttribute('aria-label', ariaTxt);

                let badgeSpan = '';
                if (route.isBorderRoute) {
                    badgeSpan = ' <span style="background: rgba(239, 68, 68, 0.25); color: #f87171; border: 1px solid #ef4444; padding: 2px 7px; border-radius: 4px; font-size: 0.78rem; margin-left: 6px; font-weight: bold;">[Komşu İl Sınırı]</span>';
                } else if (route.isKomsuRoute || (route.originDistrict && route.destDistrict && route.originDistrict !== route.destDistrict)) {
                    badgeSpan = ' <span style="background: rgba(56, 189, 248, 0.2); color: #38bdf8; border: 1px solid #0284c7; padding: 2px 7px; border-radius: 4px; font-size: 0.78rem; margin-left: 6px; font-weight: bold;">[Komşu İlçe]</span>';
                } else {
                    badgeSpan = ' <span style="background: rgba(34, 197, 94, 0.2); color: #4ade80; border: 1px solid #22c55e; padding: 2px 7px; border-radius: 4px; font-size: 0.78rem; margin-left: 6px; font-weight: bold;">[İlçe İçi]</span>';
                }

                btn.innerHTML = [
                    '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">',
                    '   <span style="font-weight: bold; color: ' + (route.color || '#38bdf8') + '; font-size: 1.05rem;">[Hat ' + route.hatNo + '] ' + route.name + badgeSpan + '</span>',
                    '   <span style="color: var(--secondary); font-size: 0.85rem; font-weight: bold;">' + stopCount + ' Durak | ' + totalKm.toFixed(1) + ' KM</span>',
                    '</div>',
                    '<div style="font-size: 0.85rem; color: #94a3b8;">',
                    '   📍 ' + sName + ' ➔ 🏁 ' + eName,
                    '</div>'
                ].join('');

                const access = (typeof Game !== 'undefined' && typeof Game.isRouteAccessible === 'function')
                    ? Game.isRouteAccessible(route.id)
                    : { allowed: true };

                if (!access.allowed) {
                    btn.classList.add('locked-route');
                    btn.style.opacity = '0.65';
                    btn.style.border = '1px dashed rgba(239, 68, 68, 0.5)';
                    btn.setAttribute('aria-disabled', 'true');
                }

                btn.onclick = () => {
                    if (!access.allowed) {
                        if (typeof audio !== 'undefined' && audio.playWarning) {
                            try { audio.playWarning(); } catch(e) {}
                        }
                        if (typeof audio !== 'undefined' && audio.speak) audio.speak(access.reason);
                        if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(access.reason, "warning");
                        return;
                    }
                    audio.playSelect();
                    document.getElementById('district-dest-modal').classList.add('hidden');
                    routesData[route.id] = route;
                    audio.speak("TEKULAŞ " + route.name + " devreye alındı. İyi yolculuklar kaptan.");
                    UI.showToast(route.name + " Devreye Alındı (" + totalKm.toFixed(1) + " KM)", "success");
                    Game.startRoute(route.id);
                };

                li.appendChild(btn);
                listEl.appendChild(li);
            });

            KeyboardNav.initForScreen();
        };

        renderCategories();
        document.getElementById('district-dest-modal').classList.remove('hidden');
        KeyboardNav.initForScreen();
    };

    const openIntercitySelection = () => {
        if (!Game.hasPassedLevel10()) {
            audio.playSelect();
            const msg = "Mikyas Kaptanlık Akademisi Kuralı: Bir seviye tamamlanmadan diğer seviyelere başlanamaz! Şehirlerarası seyahat için önce 1. Seviye Şehir İçi Seferlerini (10 Görevi) tamamlamalısınız. Mevcut tamamlanan: " + (Game.completedTasks || 0) + " / 10.";
            audio.speak(msg);
            UI.showToast("Mikyas Akademisi: 1. Seviye (10 Görev) Tamamlanmadan Şehirlerarası Sefer Açılamaz", "warning");
            return;
        }
        Game.gameMode = 'intercity';
        Game.busType = 'seyahat';
        
        audio.playSelect();
        audio.speak("Şehirlerarası seyahat modu seçildi. Lütfen hareket edeceğiniz şehri ve sefer güzergâhınızı seçin.");
        UI.showToast("Şehirler Arası Seyahat (Türkiye Turnesi) Modu Aktif", "info");

        UI.renderCityMap(Game.licenseLevel, Game.unlockedCities);
        UI.updatePlayerStats(Game.licenseLevel, Game.completedTasks, Game.playerBudget, Game.getLicenseTitle());
        UI.switchScreen('base-selection-menu');
    };

    const btnOpenComp = document.getElementById('btn-open-company');
    if (btnOpenComp) {
        btnOpenComp.addEventListener('click', () => {
            if (typeof CompanySystem !== 'undefined' && CompanySystem.openCompanyModal) {
                CompanySystem.openCompanyModal();
            }
        });
    }

    const btnOpenMp = document.getElementById('btn-open-multiplayer');
    if (btnOpenMp) {
        btnOpenMp.addEventListener('click', () => {
            if (typeof Multiplayer !== 'undefined' && Multiplayer.openRadarModal) {
                Multiplayer.openRadarModal();
            }
        });
    }
    const hudMpPanel = document.getElementById('hud-multiplayer-panel');
    if (hudMpPanel) {
        hudMpPanel.addEventListener('click', () => {
            if (typeof Multiplayer !== 'undefined' && Multiplayer.openRadarModal) {
                Multiplayer.openRadarModal();
            }
        });
    }

    if (document.getElementById('btn-start-city')) {
        document.getElementById('btn-start-city').addEventListener('click', openCitySelection);
    }
    if (document.getElementById('btn-start-intercity')) {
        document.getElementById('btn-start-intercity').addEventListener('click', openIntercitySelection);
    }

    document.getElementById('btn-start-game').addEventListener('click', () => {
        audio.playSelect();
        
        if (Game.savedState) {
            audio.speak("Kaldığınız yerden yola devam ediyorsunuz.");
            Game.resumeFromSave();
            return;
        }

        UI.renderCityMap(Game.licenseLevel, Game.unlockedCities);
        UI.updatePlayerStats(Game.licenseLevel, Game.completedTasks, Game.playerBudget, Game.getLicenseTitle());
        
        // Eğer daha önce merkez üs seçilmişse, direkt o şehrin görev ekranına (oyuna başla menüsüne) at!
        if (!Game.hasPassedLevel10()) {
            document.dispatchEvent(new CustomEvent('go-to-route-screen', { detail: { city: "Tekirdağ", district: Game.activeDistrict } }));
        } else if (Game.unlockedCities.length > 0 && Game.currentCity) {
            document.dispatchEvent(new CustomEvent('go-to-route-screen', { detail: { city: Game.currentCity || "Tekirdağ", district: Game.activeDistrict } }));
        } else {
            UI.switchScreen('base-selection-menu');
        }
    });

    document.getElementById('btn-exit-game').addEventListener('click', () => {
        audio.playSelect();
        document.getElementById('exit-screen').classList.remove('hidden');
    });

    document.getElementById('btn-clear-cache').addEventListener('click', () => {
        audio.playSelect();
        
        // Sadece tutulması gerekenleri ayır
        const safeKeys = [
            'otobusUsername',
            'licenseLevel',
            'completedTasks',
            'para',
            'playerXP',
            'clockMinutes',
            'unlockedCities',
            'merkezUs',
            'activeDistrict',
            'selectedBusId',
            'tekulas_owned_buses_v1',
            'driver_lifetime_stats_v1',
            'driver_badges_v1',
            'tekulas_discovered_stops_v1',
            'copilot_enabled'
        ];
        const savedData = {};
        
        safeKeys.forEach(key => {
            savedData[key] = localStorage.getItem(key);
        });
        
        // Tümünü temizle (Gereksiz/bozuk veriler gider)
        localStorage.clear();
        
        // Gerekli olanları geri yükle
        safeKeys.forEach(key => {
            if (savedData[key] !== null) {
                localStorage.setItem(key, savedData[key]);
            }
        });
        
        UI.showToast("Önbellek temizlendi, oyun yeniden başlatılıyor...", "success");
        if (typeof audio !== 'undefined' && typeof audio.speak === 'function') {
            audio.speak("Gereksiz veriler temizlendi, oyun yeniden başlatılıyor.");
        }
        
        setTimeout(() => {
            window.location.reload(true);
        }, 2000);
    });

    // 2. City Selection (Map) Screen
    const btnBaseBack = document.getElementById('btn-base-back');
    if (btnBaseBack) {
        btnBaseBack.addEventListener('click', () => {
            if (typeof audio !== 'undefined' && audio.playSelect) audio.playSelect();
            if (typeof audio !== 'undefined' && audio.speak) audio.speak("Ana ekrana dönüldü.");
            if (typeof UI !== 'undefined' && UI.switchScreen) {
                UI.switchScreen('title-screen');
            }
            const btnStart = document.getElementById('btn-start-city');
            if (btnStart) btnStart.focus();
        });
    }

    // Harita ekranından rota ekranına geçiş eventi (ui.js fırlatıyor)
    // 2.5 Mode Selection Modals
    document.getElementById('btn-mode-inner').addEventListener('click', () => {
        audio.playSelect();
        document.getElementById('mode-selection-modal').classList.add('hidden');
        KeyboardNav.initForScreen(); // Modal kapandı, arkaplana odaklan
        document.dispatchEvent(new CustomEvent('go-to-route-screen', { detail: { city: Game.currentCity } }));
    });

    document.getElementById('btn-mode-cancel').addEventListener('click', () => {
        audio.playSelect();
        document.getElementById('mode-selection-modal').classList.add('hidden');
        KeyboardNav.initForScreen(); // Modal kapandı, arkaplana odaklan
    });

    document.getElementById('btn-mode-inter').addEventListener('click', () => {
        // Mikyas Kaptanlık Akademisi: Stajyer ve acemi şoförler uzun yol şehirlerarası sefere çıkamaz!
        if (typeof Game !== 'undefined' && typeof Game.hasPassedLevel10 === 'function' && !Game.hasPassedLevel10()) {
            if (typeof audio !== 'undefined' && audio.playWarning) {
                try { audio.playWarning(); } catch(e) {}
            } else if (typeof audio !== 'undefined' && audio.playSelect) {
                audio.playSelect();
            }
            const completed = (typeof Game.completedTasks === 'number') ? Game.completedTasks : 0;
            const academyMsg = `Mikyas Kaptanlık Akademisi Kuralı: Şehirlerarası uzun yol seferlerine çıkabilmek için önce şehir içi 10 görevi tamamlayıp Usta Kaptan ehliyetini almalısınız! Stajyer ve acemi şoförler uzun yola çıkamaz. Mevcut tamamlanan görev: ${completed} / 10.`;
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(academyMsg);
            if (typeof UI !== 'undefined' && UI.showToast) UI.showToast("Şehirlerarası Seferler İçin En Az 10 Görev Gerekir!", "warning");
            return;
        }

        audio.playSelect();
        document.getElementById('mode-selection-modal').classList.add('hidden');
        
        // Populate destination list
        const listEl = document.getElementById('intercity-dest-list');
        listEl.innerHTML = '';
        
        const unlockedCitiesArr = Game.unlockedCities;
        let hasDestinations = false;
        
        // Find all possible destinations (all unlocked + neighbors)
        const possibleDests = new Set([...unlockedCitiesArr]);
        const data = sehirRotalari[Game.currentCity];
        if (data) {
            if (data.komsular) {
                Object.values(data.komsular).forEach(n => {
                    if (typeof n === 'string') {
                        n.split(/[\/,]+/).map(s => s.trim()).forEach(sub => {
                            if (sub && (typeof sehirRotalari !== 'undefined' && sehirRotalari[sub])) possibleDests.add(sub);
                        });
                    }
                });
            }
            if (Array.isArray(data.komsuIller)) {
                data.komsuIller.forEach(sub => {
                    if (sub && (typeof sehirRotalari !== 'undefined' && sehirRotalari[sub])) possibleDests.add(sub);
                });
            }
            // Bütün illeri bütün illere komşu ve şehirlerarası sefer ağı olarak bağla:
            if (typeof masterCitiesList !== 'undefined' && Array.isArray(masterCitiesList)) {
                masterCitiesList.forEach(sub => {
                    if (sub && (typeof sehirRotalari !== 'undefined' && sehirRotalari[sub])) possibleDests.add(sub);
                });
            }
        }
        
        possibleDests.delete(Game.currentCity); // Can't go to self
        
        // Akıllı Sıralama: 1. Doğrudan Komşu İller, 2. Açılmış Şehirler, 3. Diğer İller (Alfabetik)
        const sortedDests = Array.from(possibleDests).sort((a, b) => {
            const isKomsuA = data && Array.isArray(data.komsuIller) && data.komsuIller.includes(a);
            const isKomsuB = data && Array.isArray(data.komsuIller) && data.komsuIller.includes(b);
            if (isKomsuA && !isKomsuB) return -1;
            if (!isKomsuA && isKomsuB) return 1;

            const isUnlA = unlockedCitiesArr.includes(a);
            const isUnlB = unlockedCitiesArr.includes(b);
            if (isUnlA && !isUnlB) return -1;
            if (!isUnlA && isUnlB) return 1;

            return a.localeCompare(b, 'tr');
        });

        sortedDests.forEach(destCity => {
            hasDestinations = true;
            const isUnlocked = unlockedCitiesArr.includes(destCity);
            const isKomsu = (data && Array.isArray(data.komsuIller) && data.komsuIller.includes(destCity));
            const li = document.createElement('li');
            li.style.marginBottom = "10px";
            
            const btn = document.createElement('button');
            btn.className = 'menu-btn nav-item';
            btn.style.width = '100%';
            btn.style.justifyContent = 'space-between';
            btn.style.padding = '15px';
            
            let previewDistKm = 0;
            const pairKey1 = Game.currentCity + "-" + destCity;
            const pairKey2 = destCity + "-" + Game.currentCity;
            if (typeof sehirlerarasiMesafeler !== 'undefined') {
                if (sehirlerarasiMesafeler[pairKey1]) previewDistKm = sehirlerarasiMesafeler[pairKey1];
                else if (sehirlerarasiMesafeler[pairKey2]) previewDistKm = sehirlerarasiMesafeler[pairKey2];
            }

            const cFromPrev = typeof sehirRotalari !== 'undefined' ? sehirRotalari[Game.currentCity] : null;
            const cToPrev = typeof sehirRotalari !== 'undefined' ? sehirRotalari[destCity] : null;
            if (!previewDistKm) {
                if (Game.currentCity === "Tekirdağ" && cToPrev && cToPrev.merkezeMesafeKm) previewDistKm = cToPrev.merkezeMesafeKm;
                else if (destCity === "Tekirdağ" && cFromPrev && cFromPrev.merkezeMesafeKm) previewDistKm = cFromPrev.merkezeMesafeKm;
                else if (cFromPrev && cFromPrev.tekirdagMesafeKm && cFromPrev.tekirdagMesafeKm[destCity]) previewDistKm = cFromPrev.tekirdagMesafeKm[destCity];
                else if (cToPrev && cToPrev.tekirdagMesafeKm && cToPrev.tekirdagMesafeKm[Game.currentCity]) previewDistKm = cToPrev.tekirdagMesafeKm[Game.currentCity];
                else if (cFromPrev && cFromPrev.coordinates && cToPrev && cToPrev.coordinates) {
                    const lat1 = cFromPrev.coordinates.lat, lon1 = cFromPrev.coordinates.lon;
                    const lat2 = cToPrev.coordinates.lat, lon2 = cToPrev.coordinates.lon;
                    if (lat1 && lon1 && lat2 && lon2) {
                        const R = 6371;
                        const dLat = (lat2 - lat1) * Math.PI / 180;
                        const dLon = (lon2 - lon1) * Math.PI / 180;
                        const a = Math.sin(dLat/2)*Math.sin(dLat/2) + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)*Math.sin(dLon/2);
                        previewDistKm = Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) * 1.28);
                    }
                }
            }
            if (!previewDistKm) previewDistKm = 150;

            const badgeHtml = isKomsu
                ? '<span style="background: rgba(56, 189, 248, 0.2); color: #38bdf8; padding: 2px 8px; border-radius: 4px; font-size: 0.8em; margin-left: 6px;">[Komşu İl]</span>'
                : (isUnlocked ? '<span style="color: #4ade80; font-size: 0.8em; margin-left: 6px;">(Açık Şehir)</span>' : '<span style="color: #94a3b8; font-size: 0.8em; margin-left: 6px;">(Keşfedilecek)</span>');

            btn.innerHTML = `
                <span><strong>${destCity}</strong> ${badgeHtml}</span>
                <span style="color: var(--secondary); font-weight: bold;">${previewDistKm} KM Sefer</span>
            `;
            
            btn.onclick = () => {
                audio.playSelect();
                document.getElementById('intercity-dest-modal').classList.add('hidden');
                
                // GENERATE AND START INTERCITY ROUTE
                const intercityRouteId = "intercity_" + Game.currentCity + "_" + destCity;
                const startStop = Game.currentCity + " Kalkış Peronu";
                const endStop = destCity + " Merkez Otogar";
                routesData[intercityRouteId] = {
                    id: intercityRouteId,
                    name: "Şehirlerarası Sefer: " + Game.currentCity + " ➔ " + destCity,
                    startStop: startStop,
                    endStop: endStop,
                    intermediateStops: [],
                    desc: "Kalkış: " + startStop + " ➔ Varış: " + endStop + ". Otoyol üzerinden ekspres şehirlerarası sefer.",
                    detailedInstructions: "Şehirlerarası Sefer Adımları:\n1. Adım: " + startStop + " durağından bekleyen 28 yolcuyu alarak hareket edin.\n2. Adım (Hedef Son Durak): Sonra " + endStop + " durağına gidin; tüm yolcuları indirin ve görevi başarıyla tamamlayın.",
                    speechBriefing: "Şehirlerarası " + Game.currentCity + " " + destCity + " seferi. 1. Adım: " + startStop + " durağından bekleyen yolcuları alarak hareket edin. 2. Adım: Son durak olan " + endStop + " durağına varıp tüm yolcuları indirin ve görevi tamamlayın.",
                    color: "#facc15",
                    taskIndex: Game.completedTasks,
                    otobusKapasitesi: 28,
                    biletFiyatMultiplier: 10,
                    isIntercity: true,
                    destCity: destCity,
                    stops: []
                };
                const intercityKey = Game.currentCity + "-" + destCity;
                let realDistKm = sehirlerarasiMesafeler[intercityKey];
                if (!realDistKm) {
                    const cFrom = typeof sehirRotalari !== 'undefined' ? sehirRotalari[Game.currentCity] : null;
                    const cTo = typeof sehirRotalari !== 'undefined' ? sehirRotalari[destCity] : null;
                    if (Game.currentCity === "Tekirdağ" && cTo && cTo.merkezeMesafeKm) realDistKm = cTo.merkezeMesafeKm;
                    else if (destCity === "Tekirdağ" && cFrom && cFrom.merkezeMesafeKm) realDistKm = cFrom.merkezeMesafeKm;
                    else if (cFrom && cFrom.tekirdagMesafeKm && cFrom.tekirdagMesafeKm[destCity]) realDistKm = cFrom.tekirdagMesafeKm[destCity];
                    else if (cTo && cTo.tekirdagMesafeKm && cTo.tekirdagMesafeKm[Game.currentCity]) realDistKm = cTo.tekirdagMesafeKm[Game.currentCity];
                    else if (cFrom && cFrom.coordinates && cTo && cTo.coordinates) {
                        const lat1 = cFrom.coordinates.lat, lon1 = cFrom.coordinates.lon;
                        const lat2 = cTo.coordinates.lat, lon2 = cTo.coordinates.lon;
                        if (lat1 && lon1 && lat2 && lon2) {
                            const R = 6371;
                            const dLat = (lat2 - lat1) * Math.PI / 180;
                            const dLon = (lon2 - lon1) * Math.PI / 180;
                            const a = Math.sin(dLat/2)*Math.sin(dLat/2) + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)*Math.sin(dLon/2);
                            realDistKm = Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) * 1.28);
                        }
                    }
                }
                if (!realDistKm) realDistKm = 150;
                
                const cFromData = (typeof sehirRotalari !== 'undefined') ? sehirRotalari[Game.currentCity] : null;
                const cToData = (typeof sehirRotalari !== 'undefined') ? sehirRotalari[destCity] : null;
                const lat1 = (cFromData && cFromData.coordinates) ? cFromData.coordinates.lat : 40.9833;
                const lon1 = (cFromData && cFromData.coordinates) ? cFromData.coordinates.lon : 27.5167;
                const lat2 = (cToData && cToData.coordinates) ? cToData.coordinates.lat : 41.0082;
                const lon2 = (cToData && cToData.coordinates) ? cToData.coordinates.lon : 28.9784;

                const midArr = (typeof window !== 'undefined' && window.midPoints && window.midPoints[destCity])
                    ? window.midPoints[destCity]
                    : ((typeof midPoints !== 'undefined' && midPoints[destCity]) ? midPoints[destCity] : null);

                if (realDistKm >= 200 && midArr && midArr.length > 0) {
                    const passName = midArr[0];
                    const midLat = Number((lat1 + (lat2 - lat1) * 0.50).toFixed(4));
                    const midLon = Number((lon1 + (lon2 - lon1) * 0.50).toFixed(4));
                    const dist1 = Math.round(realDistKm * 0.55);
                    const dist2 = realDistKm - dist1;

                    routesData[intercityRouteId].intermediateStops = [passName];
                    routesData[intercityRouteId].stops = [
                        { name: startStop, lat: lat1, lon: lon1, anons: `${startStop} kalkış peronundayız. ${destCity} seferi başlıyor.`, bekleyenYolcu: 28, inenYolcu: 0, gercekMesafeSonraki: dist1 },
                        { name: passName, lat: midLat, lon: midLon, anons: `Önemli geçiş noktası: ${passName}. Yolcularımızın emniyet kemerlerini takmaları rica olunur.`, bekleyenYolcu: 0, inenYolcu: 0, gercekMesafeSonraki: dist2 },
                        { name: endStop, lat: lat2, lon: lon2, anons: `Son durak: ${endStop}. Şehirlerarası seferimiz sona ermiştir.`, bekleyenYolcu: 0, inenYolcu: 28, gercekMesafeSonraki: 0 }
                    ];
                } else {
                    routesData[intercityRouteId].stops = [
                        { name: startStop, lat: lat1, lon: lon1, anons: startStop + " kalkış peronundayız. " + destCity + " seferi başlıyor.", bekleyenYolcu: 28, inenYolcu: 0, gercekMesafeSonraki: realDistKm },
                        { name: endStop, lat: lat2, lon: lon2, anons: "Son durak: " + endStop + ". Şehirlerarası seferimiz sona ermiştir.", bekleyenYolcu: 0, inenYolcu: 28, gercekMesafeSonraki: 0 }
                    ];
                }
                
                // Add to sehirRotalari temporarily so startRoute works
                if (!sehirRotalari[Game.currentCity].routes) sehirRotalari[Game.currentCity].routes = [];
                if (!sehirRotalari[Game.currentCity].routes.includes(intercityRouteId)) {
                    sehirRotalari[Game.currentCity].routes.push(intercityRouteId);
                }
                
                Game.startRoute(intercityRouteId);
            };
            li.appendChild(btn);
            listEl.appendChild(li);
        });
        
        if (hasDestinations) {
            document.getElementById('intercity-dest-modal').classList.remove('hidden');
            KeyboardNav.initForScreen(); // Modal açıldı, odağı buraya al
        } else {
            UI.showToast("Gidilebilecek şehir bulunamadı.", "error");
            document.getElementById('mode-selection-modal').classList.remove('hidden');
            KeyboardNav.initForScreen();
        }
    });

    
    // === İLÇE SEFERLERİ MODAL YÖNETİCİSİ ===
    const openDistrictModal = () => {
        if (!Game.hasPassedLevel10()) {
            audio.playSelect();
            audio.speak("İlçe seferleri için önce şehir içi 10 seviyeyi geçmelisiniz. Mevcut seviyeniz: " + Game.licenseLevel);
            UI.showToast("İlçe Seferleri 10. Seviyeden Sonra Açılır", "warning");
            return;
        }
        audio.playSelect();
        const modeModal = document.getElementById('mode-selection-modal');
        if (modeModal) modeModal.classList.add('hidden');
        
        const listEl = document.getElementById('district-dest-list');
        if (!listEl) return;
        listEl.innerHTML = '';
        
        const currentCity = Game.currentCity || "Tekirdağ";
        const districtList = (typeof ilceRotalari !== 'undefined' && ilceRotalari[currentCity]) 
            ? ilceRotalari[currentCity] 
            : (typeof ilceRotalari !== 'undefined' ? ilceRotalari["Tekirdağ"] : []);

        const curDist = (typeof Game !== 'undefined' && Game.activeDistrict) ? Game.activeDistrict : (localStorage.getItem('activeDistrict') || "Süleymanpaşa");
        const tkData = (typeof sehirRotalari !== 'undefined' && sehirRotalari["Tekirdağ"] && sehirRotalari["Tekirdağ"].ilcelerBilgisi) ? sehirRotalari["Tekirdağ"].ilcelerBilgisi : null;
        const komsuList = (tkData && tkData.komsuIlceler && tkData.komsuIlceler[curDist]) ? tkData.komsuIlceler[curDist] : [];

        const descEl = document.getElementById('district-modal-desc');
        if (descEl) {
            descEl.innerHTML = `📍 <strong>Aktif Bölgeniz:</strong> <span style="color:#38bdf8;">${curDist}</span> | İllerdeki komşuluk ilişkilerine göre hatlar:`;
        }
        
        if (!districtList || districtList.length === 0) {
            UI.showToast("Bu şehir için tanımlı ilçe hattı bulunamadı.", "error");
            if (modeModal) modeModal.classList.remove('hidden');
            KeyboardNav.initForScreen();
            return;
        }

        // Akıllı Sıralama: Aktif ilçenin Doğrudan Komşuları -> Komşu İl Sınır Kapıları -> İlçe İçi -> Diğerleri
        const sortedDistrictList = [...districtList].sort((a, b) => {
            const getPriority = (r) => {
                const isBorderThis = r.isBorderRoute && r.originDistrict === curDist;
                const isKomsuThis = (r.originDistrict === curDist && komsuList.includes(r.destDistrict)) || (r.destDistrict === curDist && komsuList.includes(r.originDistrict));
                const isLocalThis = (r.originDistrict === curDist && r.destDistrict === curDist) || r.district === curDist;
                const isRelThis = r.originDistrict === curDist || r.destDistrict === curDist;

                if (isKomsuThis) return 1;
                if (isBorderThis) return 2;
                if (isLocalThis) return 3;
                if (isRelThis) return 4;
                if (r.isBorderRoute) return 5;
                if (r.isKomsuRoute) return 6;
                return 7;
            };
            return getPriority(a) - getPriority(b);
        });

        sortedDistrictList.forEach(distRoute => {
            const li = document.createElement('li');
            li.style.marginBottom = "10px";
            
            const btn = document.createElement('button');
            btn.className = 'menu-btn nav-item';
            btn.style.width = '100%';
            btn.style.justifyContent = 'space-between';
            btn.style.padding = '15px';
            
            const totalKm = distRoute.totalKm || (distRoute.stops ? distRoute.stops.reduce((sum, s) => sum + (s.gercekMesafeSonraki || 0), 0) : 20);
            
            let badgeHtml = '';
            if (distRoute.isBorderRoute) {
                badgeHtml = '<span style="background: rgba(239,68,68,0.25); color: #f87171; border: 1px solid #ef4444; padding: 2px 7px; border-radius: 4px; font-size: 0.75rem; margin-left: 6px;">[Komşu İl Sınırı]</span>';
            } else if ((distRoute.originDistrict === curDist && komsuList.includes(distRoute.destDistrict)) || (distRoute.destDistrict === curDist && komsuList.includes(distRoute.originDistrict)) || distRoute.isKomsuRoute) {
                badgeHtml = '<span style="background: rgba(56,189,248,0.2); color: #38bdf8; border: 1px solid #0284c7; padding: 2px 7px; border-radius: 4px; font-size: 0.75rem; margin-left: 6px;">[Komşu İlçe]</span>';
            } else if (distRoute.originDistrict === distRoute.destDistrict) {
                badgeHtml = '<span style="background: rgba(34,197,94,0.2); color: #4ade80; border: 1px solid #22c55e; padding: 2px 7px; border-radius: 4px; font-size: 0.75rem; margin-left: 6px;">[İlçe İçi]</span>';
            }

            btn.innerHTML = `
                <span><strong style="color: ${distRoute.color || '#38bdf8'};">[Hat ${distRoute.hatNo}] ${distRoute.name}</strong> ${badgeHtml}</span>
                <span style="color: var(--secondary); font-weight: bold;">${Math.round(totalKm)} KM</span>
            `;
            
            btn.onclick = () => {
                audio.playSelect();
                document.getElementById('district-dest-modal').classList.add('hidden');
                
                // Rota verisini routesData havuzuna ekle
                routesData[distRoute.id] = distRoute;
                
                if (distRoute.id === "hat_velimese_cetin_ring" || distRoute.hatNo === "48/R") {
                    audio.speak("TEKULAŞ 48 Taksim R Velimeşe Çetin Sokak Mahalle Ring seferi devreye alındı. İyi yolculuklar kaptan.");
                    UI.showToast("48/R Hattı: Velimeşe Çetin Sokak Ring (6 KM)", "success");
                } else if (distRoute.hatNo === "48") {
                    audio.speak("TEKULAŞ 48 numaralı Velimeşe Çorlu hattı devreye alındı. İyi yolculuklar kaptan.");
                    UI.showToast("48 Numaralı Hat: Velimeşe - Çorlu (19 KM)", "success");
                } else if (distRoute.hatNo === "26") {
                    audio.speak("TEKULAŞ 26 numaralı Süleymanpaşa Saray hattı devreye alındı. İyi yolculuklar kaptan.");
                    UI.showToast("26 Numaralı Hat Devreye Alındı: Süleymanpaşa - Saray (86 KM)", "success");
                } else {
                    audio.speak(`${distRoute.name} hattı devreye alındı.`);
                    UI.showToast(`${distRoute.name} Devreye Alındı`, "success");
                }
                
                Game.startRoute(distRoute.id);
            };
            
            li.appendChild(btn);
            listEl.appendChild(li);
        });
        
        document.getElementById('district-dest-modal').classList.remove('hidden');
        KeyboardNav.initForScreen();
        audio.speak("İlçe seferleri listelendi. Lütfen gitmek istediğiniz hattı seçin.");
    };

    const btnModeDistrict = document.getElementById('btn-mode-district');
    if (btnModeDistrict) {
        btnModeDistrict.addEventListener('click', openDistrictModal);
    }
    
    const btnRouteDistrict = document.getElementById('btn-route-district-mode');
    if (btnRouteDistrict) {
        btnRouteDistrict.addEventListener('click', openDistrictModal);
    }

    const btnDistrictCancel = document.getElementById('btn-district-cancel');
    if (btnDistrictCancel) {
        btnDistrictCancel.addEventListener('click', () => {
            audio.playSelect();
            document.getElementById('district-dest-modal').classList.add('hidden');
            const modeModal = document.getElementById('mode-selection-modal');
            if (modeModal) modeModal.classList.remove('hidden');
            KeyboardNav.initForScreen();
        });
    }
    // ======================================

    document.getElementById('btn-intercity-cancel').addEventListener('click', () => {
        audio.playSelect();
        document.getElementById('intercity-dest-modal').classList.add('hidden');
        document.getElementById('mode-selection-modal').classList.remove('hidden');
        KeyboardNav.initForScreen(); // Önceki modala geri dönüldü
    });

    // 3. Route Menu // Eğer bu şehir için önceden API'den rota çekilmemişse, çek.
    document.addEventListener('go-to-route-screen', async (e) => {
        const cityName = (e.detail && e.detail.city) || (typeof Game !== 'undefined' && Game.currentCity) || "Tekirdağ";
        const districtName = (e.detail && e.detail.district) || (typeof Game !== 'undefined' && Game.activeDistrict) || localStorage.getItem('activeDistrict') || "Süleymanpaşa";
        
        // Tekirdağ için aktif ilçe rotaları kontrol et
        const task0 = (typeof routesData !== 'undefined') ? routesData["tekirdag_task_0"] : null;
        const needsRegen = (cityName === "Tekirdağ")
            ? (!task0 || task0.district !== districtName)
            : (!routesData || !routesData[`${cityName.toLowerCase()}_task_0`]);
            
        if (needsRegen) {
            const realCityStops = (typeof varsayilanSehirDuraklari !== 'undefined' && varsayilanSehirDuraklari[cityName])
                ? varsayilanSehirDuraklari[cityName]
                : (typeof varsayilanSehirDuraklari !== 'undefined' ? varsayilanSehirDuraklari["Tekirdağ"] : []);
            
            if (typeof generateRoutesFromAPI === 'function') {
                generateRoutesFromAPI(realCityStops, cityName, districtName);
            }
        }
        
        // Rotaları çiz ve ekrana anında geç
        UI.renderRoutes(cityName, Game.completedTasks);
        UI.switchScreen('route-menu');
    });

    // 3. Route Selection Screen
    document.getElementById('btn-route-back').addEventListener('click', () => {
        audio.playSelect();
        if (Game.hasPassedLevel10()) {
            UI.renderCityMap(Game.licenseLevel, Game.unlockedCities);
            UI.switchScreen('base-selection-menu');
        } else {
            UI.switchScreen('title-screen');
        }
    });

    // 4. Garage Logic (Sefer Özeti)
    const btnReadBriefing = document.getElementById("btn-read-briefing");
    if (btnReadBriefing) {
        btnReadBriefing.addEventListener("click", () => {
            audio.playSelect();
            if (Game.activeRouteData) {
                const briefing = Game.activeRouteData.speechBriefing || Game.activeRouteData.desc;
                if (typeof audio.speak === "function") {
                    audio.speak(briefing);
                }
                if (typeof audio.updateNvdaLiveRegion === "function") {
                    audio.updateNvdaLiveRegion(briefing);
                }
            }
        });
    }

    // B tuşuyla garajdayken brifing dinleme
    window.addEventListener("keydown", (e) => {
        if (e.key && e.key.toLowerCase() === "b" && !document.getElementById("garage-screen").classList.contains("hidden")) {
            const btn = document.getElementById("btn-read-briefing");
            if (btn) btn.click();
        }
    });

    document.getElementById('btn-garage-back').addEventListener('click', () => {
        audio.playSelect();
        if (typeof SanayiMechanic !== 'undefined') SanayiMechanic.isActive = false;
        UI.switchScreen('route-menu');
    });

    document.getElementById('start-engine-btn').addEventListener('click', () => {
        audio.playSelect();
        Game.beginDriving();
    });

    // 5. Stop Screen Logic
    document.getElementById('btn-front-door').addEventListener('click', (e) => {
        Game.toggleFrontDoor();
    });

    document.getElementById('btn-rear-door').addEventListener('click', (e) => {
        Game.toggleRearDoor();
    });

    const btnAllow = document.getElementById('btn-passenger-allow');
    if (btnAllow) {
        btnAllow.addEventListener('click', () => {
            if (typeof Game !== 'undefined' && typeof Game.resolveInsufficientBalance === 'function') {
                Game.resolveInsufficientBalance(true);
            }
        });
    }

    const btnReject = document.getElementById('btn-passenger-reject');
    if (btnReject) {
        btnReject.addEventListener('click', () => {
            if (typeof Game !== 'undefined' && typeof Game.resolveInsufficientBalance === 'function') {
                Game.resolveInsufficientBalance(false);
            }
        });
    }

    // 6. Results Logic
    document.getElementById('btn-next-mission').addEventListener('click', () => {
        audio.playSelect();
        UI.updatePlayerStats(Game.licenseLevel, Game.completedTasks, Game.playerBudget, Game.getLicenseTitle());
        
        let nextRouteId = null;
        if (Game.currentCity === "Tekirdağ") {
            const candidateKey = "tekirdag_task_" + Game.completedTasks;
            if (typeof routesData !== 'undefined' && routesData[candidateKey]) {
                nextRouteId = candidateKey;
            }
        }
        if (!nextRouteId && typeof routesData !== 'undefined') {
            nextRouteId = Object.keys(routesData).find(k => 
                routesData[k] &&
                routesData[k].sehir === Game.currentCity && 
                routesData[k].taskIndex === Game.completedTasks
            );
        }
        
        if (nextRouteId) {
            Game.startRoute(nextRouteId);
        } else {
            UI.showToast("Bu seviyedeki görevleri tamamladınız! Görev listesine dönülüyor.", "success");
            Game.activeRouteId = null;
            const btnStart = document.getElementById('btn-start-game');
            if (btnStart) btnStart.innerText = "Yeni Bir Oyuna Başla";
            UI.renderRoutes(Game.currentCity || "Tekirdağ", Game.completedTasks);
            UI.switchScreen('route-menu');
        }
    });

    document.getElementById('btn-finish').addEventListener('click', () => {
        audio.playSelect();
        UI.updatePlayerStats(Game.licenseLevel, Game.completedTasks, Game.playerBudget, Game.getLicenseTitle());
        
        Game.activeRouteId = null;
        const btnStart = document.getElementById('btn-start-game');
        if (btnStart) {
            btnStart.onclick = null;
            btnStart.innerText = "Yeni Bir Oyuna Başla";
        }
        
        if (Game.hasPassedLevel10()) {
            UI.renderCityMap(Game.licenseLevel, Game.unlockedCities);
            UI.switchScreen('base-selection-menu');
        } else {
            if (typeof UI !== 'undefined' && UI.updateTitleScreenButtons) {
                UI.updateTitleScreenButtons();
            }
            UI.switchScreen('title-screen');
        }
    });

    // Draw Highway Canvas background
    const canvas = document.getElementById('highway-bg');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let w = canvas.width = window.innerWidth;
        let h = canvas.height = window.innerHeight;
        
        window.addEventListener('resize', () => {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        });

        let offset = 0;
        function drawBg() {
            ctx.fillStyle = '#08090c';
            ctx.fillRect(0, 0, w, h);
            
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 2;
            
            offset = (offset + 1) % 100;
            
            ctx.beginPath();
            for(let x = 0; x < w; x += 100) {
                ctx.moveTo(x - offset, 0);
                ctx.lineTo(x - offset + h, h);
            }
            for(let y = 0; y < h; y += 100) {
                ctx.moveTo(0, y + offset);
                ctx.lineTo(w, y + offset);
            }
            ctx.stroke();
            requestAnimationFrame(drawBg);
        }
        drawBg();
    }

    // ==========================================================================
    // GLOBAL KEYBOARD EVENT LISTENER (REMOVED FOR ACCESSIBILITY)
    // ==========================================================================
    // Screen readers and standard keyboard users rely on native Tab/Shift+Tab 
    // and virtual cursor arrow keys. Custom KeyboardNav interferes with this.

});


if (typeof turkiyeDenizleri !== "undefined" && typeof window !== "undefined") { window.turkiyeDenizleri = turkiyeDenizleri; }
