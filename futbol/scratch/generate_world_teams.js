const fs = require('fs');
const path = require('path');

const worldData = [
    { country: "Arjantin", teams: ["Boca Juniors", "River Plate", "Racing Club"] },
    { country: "Suudi Arabistan", teams: ["Al-Hilal", "Al-Nassr", "Al-Ittihad"] },
    { country: "ABD (MLS)", teams: ["Inter Miami", "LA Galaxy", "Los Angeles FC"] },
    { country: "Meksika", teams: ["Club America", "Tigres", "Monterrey"] },
    { country: "Japonya", teams: ["Vissel Kobe", "Yokohama F. Marinos", "Urawa Red Diamonds"] },
    { country: "Güney Kore", teams: ["Ulsan Hyundai", "Jeonbuk Motors"] },
    { country: "Mısır", teams: ["Al Ahly", "Zamalek"] },
    { country: "Fas", teams: ["Wydad", "Raja Casablanca"] },
    { country: "Cezayir", teams: ["CR Belouizdad", "ES Setif"] },
    { country: "Güney Afrika", teams: ["Mamelodi Sundowns", "Kaizer Chiefs"] },
    { country: "Yunanistan", teams: ["Olympiakos", "Panathinaikos", "AEK Athens", "PAOK"] },
    { country: "İskoçya", teams: ["Celtic", "Rangers"] },
    { country: "Rusya", teams: ["Zenit", "Spartak Moskova", "CSKA Moskova"] },
    { country: "Ukrayna", teams: ["Shakhtar Donetsk", "Dinamo Kiev"] },
    { country: "Sırbistan", teams: ["Kızılyıldız", "Partizan"] },
    { country: "Hırvatistan", teams: ["Dinamo Zagreb", "Hajduk Split"] },
    { country: "İsviçre", teams: ["Young Boys", "FC Basel"] },
    { country: "Avusturya", teams: ["RB Salzburg", "Sturm Graz"] },
    { country: "Belçika", teams: ["Club Brugge", "Anderlecht", "Genk"] },
    { country: "Çekya", teams: ["Slavia Prag", "Sparta Prag"] },
    { country: "Polonya", teams: ["Legia Varşova", "Lech Poznan"] },
    { country: "İsveç", teams: ["Malmö FF", "AIK"] },
    { country: "Danimarka", teams: ["FC Kopenhag", "Midtjylland"] },
    { country: "Norveç", teams: ["Bodo/Glimt", "Molde"] },
    { country: "Romanya", teams: ["FCSB", "CFR Cluj"] },
    { country: "Bulgaristan", teams: ["Ludogorets", "CSKA Sofya"] },
    { country: "Kolombiya", teams: ["Atletico Nacional", "Millonarios"] },
    { country: "Uruguay", teams: ["Nacional", "Penarol"] },
    { country: "Şili", teams: ["Colo-Colo", "Universidad de Chile"] },
    { country: "Peru", teams: ["Alianza Lima", "Universitario"] },
    { country: "Ekvador", teams: ["Independiente del Valle", "LDU Quito"] },
    { country: "Paraguay", teams: ["Olimpia", "Cerro Porteno"] },
    { country: "Kosta Rika", teams: ["Saprissa", "Alajuelense"] },
    { country: "Honduras", teams: ["Olimpia", "Motagua"] },
    { country: "Avustralya", teams: ["Sydney FC", "Melbourne City"] },
    { country: "Yeni Zelanda", teams: ["Auckland City", "Wellington Phoenix"] },
    { country: "İran", teams: ["Persepolis", "Esteghlal"] },
    { country: "Birleşik Arap Emirlikleri", teams: ["Al Ain", "Shabab Al Ahli"] },
    { country: "Katar", teams: ["Al Sadd", "Al Duhail"] },
    { country: "Çin", teams: ["Shanghai Port", "Beijing Guoan"] },
    { country: "Özbekistan", teams: ["Pakhtakor", "Nasaf"] },
    { country: "Tayland", teams: ["Buriram United", "BG Pathum"] },
    { country: "Endonezya", teams: ["Persija", "Persib Bandung"] },
    { country: "Malezya", teams: ["Johor Darul Ta'zim", "Selangor"] },
    { country: "Hindistan", teams: ["Mumbai City", "Mohun Bagan"] },
    { country: "Kıbrıs", teams: ["APOEL", "Omonia"] },
    { country: "İsrail", teams: ["Maccabi Tel Aviv", "Maccabi Haifa"] },
    { country: "Macaristan", teams: ["Ferencvaros", "Puskas Akademia"] },
    { country: "Slovakya", teams: ["Slovan Bratislava", "Spartak Trnava"] },
    { country: "Slovenya", teams: ["Olimpija Ljubljana", "Maribor"] },
    { country: "Galler", teams: ["The New Saints", "Connah's Quay"] },
    { country: "İrlanda", teams: ["Shamrock Rovers", "Dundalk"] },
    { country: "Kuzey İrlanda", teams: ["Linfield", "Cliftonville"] },
    { country: "İzlanda", teams: ["Breidablik", "Vikingur"] },
    { country: "Faroe Adaları", teams: ["KI Klaksvik", "HB Torshavn"] },
    { country: "San Marino", teams: ["Tre Penne", "La Fiorita"] },
    { country: "Andorra", teams: ["Santa Coloma", "Inter d'Escaldes"] },
    { country: "Lüksemburg", teams: ["Dudelange", "Swift Hesperange"] },
    { country: "Gürcistan", teams: ["Dinamo Tiflis", "Dinamo Batum"] },
    { country: "Ermenistan", teams: ["Pyunik", "Urartu"] },
    { country: "Azerbaycan", teams: ["Qarabağ", "Neftçi Bakü"] },
    { country: "Kazakistan", teams: ["Astana", "Kairat"] },
    { country: "Kırgızistan", teams: ["Dordoi", "Abdish-Ata"] },
    { country: "Tacikistan", teams: ["Istiklol", "Ravshan"] },
    { country: "Tunus", teams: ["Esperance", "Club Africain"] },
    { country: "Senegal", teams: ["Génération Foot", "Diambars"] },
    { country: "Fildişi Sahili", teams: ["ASEC Mimosas", "San Pédro"] },
    { country: "Nijerya", teams: ["Enyimba", "Kano Pillars"] },
    { country: "Kamerun", teams: ["Coton Sport", "Canon Yaoundé"] },
    { country: "Gana", teams: ["Asante Kotoko", "Hearts of Oak"] },
    { country: "Kongo", teams: ["TP Mazembe", "AS Vita"] },
    { country: "Angola", teams: ["Petro de Luanda", "1º de Agosto"] },
    { country: "Kenya", teams: ["Gor Mahia", "AFC Leopards"] },
    { country: "Tanzanya", teams: ["Simba", "Young Africans"] },
    { country: "Uganda", teams: ["Vipers", "KCCA"] },
    { country: "Zambiya", teams: ["ZESCO United", "Power Dynamos"] },
    { country: "Sudan", teams: ["Al-Merrikh", "Al-Hilal Omdurman"] },
    { country: "Zimbabve", teams: ["FC Platinum", "Dynamos"] },
    { country: "Irak", teams: ["Al-Quwa Al-Jawiya", "Al-Shorta"] },
    { country: "Suriye", teams: ["Al-Jaish", "Tishreen"] },
    { country: "Lübnan", teams: ["Al-Ahed", "Nejmeh"] },
    { country: "Ürdün", teams: ["Al-Wehdat", "Al-Faisaly"] },
    { country: "Kuveyt", teams: ["Al-Qadsia", "Al-Kuwait"] },
    { country: "Bahreyn", teams: ["Al-Muharraq", "Al-Riffa"] },
    { country: "Umman", teams: ["Al-Seeb", "Dhofar"] },
    { country: "Yemen", teams: ["Al-Ahli Sana'a", "Al-Tilal"] },
    { country: "Filistin", teams: ["Jabal Al-Mukaber", "Hilal Al-Quds"] },
    { country: "Vietnam", teams: ["Hanoi FC", "Viettel"] },
    { country: "Kamboçya", teams: ["Phnom Penh Crown", "Visakha"] },
    { country: "Laos", teams: ["Young Elephants", "Ezra"] },
    { country: "Myanmar", teams: ["Shan United", "Yangon United"] },
    { country: "Filipinler", teams: ["Kaya FC", "United City"] },
    { country: "Singapur", teams: ["Lion City Sailors", "Albirex Niigata (S)"] },
    { country: "Kuzey Kore", teams: ["April 25", "Kigwancha"] },
    { country: "Hong Kong", teams: ["Kitchee", "Lee Man"] },
    { country: "Makao", teams: ["Must CPK", "Benfica de Macau"] },
    { country: "Tayvan", teams: ["Tainan City", "Taichung Futuro"] },
    { country: "Guam", teams: ["Rovers FC", "Islanders FC"] },
    { country: "Fiji", teams: ["Ba FC", "Lautoka"] },
    { country: "Tahiti", teams: ["AS Pirae", "AS Venus"] },
    { country: "Vanuatu", teams: ["Ifira Black Bird", "Amicale"] },
    { country: "Yeni Kaledonya", teams: ["Hienghene Sport", "AS Magenta"] },
    { country: "Solomon Adaları", teams: ["Solomon Warriors", "Henderson Eels"] },
    { country: "Papua Yeni Gine", teams: ["Hekari United", "Lae City"] },
    { country: "Jamaika", teams: ["Cavalier", "Mount Pleasant"] },
    { country: "Trinidad ve Tobago", teams: ["Defence Force", "Police FC"] },
    { country: "Haiti", teams: ["Violette", "Arcahaie"] },
    { country: "El Salvador", teams: ["Alianza", "FAS"] },
    { country: "Nikaragua", teams: ["Real Esteli", "Diriangen"] },
    { country: "Panama", teams: ["Independiente", "Tauro"] },
    { country: "Guatemala", teams: ["Comunicaciones", "Municipal"] },
    { country: "Surinam", teams: ["Robinhood", "Inter Moengotapoe"] },
    { country: "Bolivya", teams: ["Bolivar", "The Strongest"] },
    { country: "Venezuela", teams: ["Deportivo Tachira", "Caracas"] },
    { country: "Küba", teams: ["FC Cienfuegos", "La Habana"] },
    { country: "Finlandiya", teams: ["HJK Helsinki", "KuPS"] },
    { country: "Estonya", teams: ["Flora Tallinn", "FCI Levadia"] },
    { country: "Letonya", teams: ["Riga FC", "RFS"] },
    { country: "Litvanya", teams: ["Zalgiris", "Panevezys"] },
    { country: "Belarus", teams: ["BATE Borisov", "Dinamo Minsk"] },
    { country: "Moldova", teams: ["Sheriff Tiraspol", "Petrocub"] },
    { country: "Arnavutluk", teams: ["Partizani", "Tirana"] },
    { country: "Kuzey Makedonya", teams: ["Struga", "Shkupi"] },
    { country: "Kosova", teams: ["Balkani", "Drita"] },
    { country: "Karadağ", teams: ["Buducnost", "Sutjeska"] },
    { country: "Bosna Hersek", multi_replace_file_content: false, teams: ["Zrinjski Mostar", "Sarajevo"] },
    { country: "Malta", teams: ["Hamrun Spartans", "Hibernians"] },
    { country: "Cebelitarık", teams: ["Lincoln Red Imps", "Europa FC"] }
];

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const teams = [];
let idCounter = 3000;

worldData.forEach(countryData => {
    countryData.teams.forEach((teamName, index) => {
        let power = getRandomInt(50, 65);
        let rankingPoints = getRandomInt(200, 1500);

        if (["Arjantin", "Brezilya", "ABD (MLS)", "Meksika", "Suudi Arabistan", "Rusya", "Yunanistan"].includes(countryData.country)) {
            power = getRandomInt(70, 82);
            rankingPoints = getRandomInt(2000, 5000);
        } else if (["Belçika", "İskoçya", "Ukrayna", "Avusturya", "İsviçre", "Sırbistan", "Hırvatistan", "Çekya", "Polonya", "Danimarka"].includes(countryData.country)) {
            power = getRandomInt(70, 78);
            rankingPoints = getRandomInt(1500, 4000);
        } else if (["San Marino", "Fiji", "Andorra", "Cebelitarık", "Faroe Adaları"].includes(countryData.country)) {
            power = getRandomInt(30, 45);
            rankingPoints = getRandomInt(50, 200);
        }

        teams.push({
            id: idCounter++,
            name: teamName,
            country: countryData.country,
            power: power,
            budget: Math.floor((power - 30) * 1.5),
            rankingPoints: rankingPoints,
            isWorldTeam: true
        });
    });
});

const fileContent = `// js/data_world_ranking.js
// Arka plan simülasyonu ve Dünya Sıralaması için gerçek dünyadaki tüm ülkelerden takımlar.
window.worldRankingTeams = ${JSON.stringify(teams, null, 4)};
`;

fs.writeFileSync(path.join(__dirname, '..', 'js', 'data_world_ranking.js'), fileContent);
console.log('data_world_ranking.js created successfully with ' + teams.length + ' teams across ' + worldData.length + ' countries.');
