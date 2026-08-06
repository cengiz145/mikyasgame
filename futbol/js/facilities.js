// js/facilities.js - Stadyum ve Antrenman Tesisleri Yönetimi

window.FacilitiesManager = {
    stadiumLevels: [
        { level: 1, capacity: 25000, cost: 0, revenue: 0.2 }, 
        { level: 2, capacity: 40000, cost: 0.5, revenue: 0.5 }, // 500 Bin
        { level: 3, capacity: 60000, cost: 1.5, revenue: 1.2 }, // 1.5 Milyon
        { level: 4, capacity: 80000, cost: 3.0, revenue: 2.5 }  // 3 Milyon
    ],
    
    trainingLevels: [
        { level: 1, name: "Zayıf Tesis", cost: 0, boost: 0 },
        { level: 2, name: "Modern Tesis", cost: 0.25, boost: 0.05 }, // 250 Bin
        { level: 3, name: "Elit Tesis", cost: 0.75, boost: 0.15 }, // 750 Bin
        { level: 4, name: "Dünya Klası Tesis", cost: 1.5, boost: 0.30 } // 1.5 Milyon
    ],
    
    medicalLevels: [
        { level: 1, name: "Standart Sağlık Odası", cost: 0, injuryReduction: 0, recoveryBoost: 0 },
        { level: 2, name: "Soğuk Su Havuzları (Cryotherapy)", cost: 0.3, injuryReduction: 0.10, recoveryBoost: 5 }, // 300 Bin
        { level: 3, name: "Biyomekanik Laboratuvarı", cost: 0.8, injuryReduction: 0.25, recoveryBoost: 15 }, // 800 Bin
        { level: 4, name: "Tam Teşekküllü Spor Hastanesi", cost: 2.0, injuryReduction: 0.40, recoveryBoost: 25 } // 2 Milyon
    ],
    
    pitchLevels: [
        { level: 1, name: "Bozuk Toprak Zemin", cost: 0, injuryRiskMod: 1.20 },
        { level: 2, name: "Standart Doğal Çim", cost: 0.1, injuryRiskMod: 1.00 }, // 100 Bin
        { level: 3, name: "Drenajlı Kaliteli Çim", cost: 0.4, injuryRiskMod: 0.90 }, // 400 Bin
        { level: 4, name: "Hibrit Zemin (Dikişli Çim)", cost: 1.0, injuryRiskMod: 0.80 } // 1 Milyon
    ],

    init: function() {
        document.getElementById('btn-facilities')?.addEventListener('click', () => {
            if (typeof hideAllContainers === 'function') hideAllContainers();
            if(document.getElementById('facilities-container')) if(document.getElementById('facilities-container')) document.getElementById('facilities-container').style.display = 'block';
            this.updateUI();
        });

        document.getElementById('btn-back-facilities')?.addEventListener('click', () => {
            if(document.getElementById('facilities-container')) if(document.getElementById('facilities-container')) document.getElementById('facilities-container').style.display = 'none';
            if(document.getElementById('main-menu-container')) if(document.getElementById('main-menu-container')) document.getElementById('main-menu-container').style.display = 'flex';
        });

        document.getElementById('btn-upgrade-stadium')?.addEventListener('click', () => this.upgradeStadium());
        document.getElementById('btn-upgrade-training')?.addEventListener('click', () => this.upgradeTraining());
        document.getElementById('btn-upgrade-medical')?.addEventListener('click', () => this.upgradeMedical());
        document.getElementById('btn-upgrade-pitch')?.addEventListener('click', () => this.upgradePitch());
    },

    updateUI: function() {
        let myTeam = window.leagueData.teams.find(t => t.id === window.myTeamId);
        if (!myTeam) return;

        // Bütçe Gösterimi
        document.getElementById('facilities-budget-display').textContent = `Bütçe: ${myTeam.budget.toFixed(2)} Milyon Euro`;
        if (myTeam.budget < 0) document.getElementById('facilities-budget-display').style.color = "red";
        else if(document.getElementById('facilities-budget-display')) document.getElementById('facilities-budget-display').style.color = "#2ecc71";

        // Değerlerin atanması (Eğer yoksa Level 1'dir)
        myTeam.stadiumLevel = myTeam.stadiumLevel || 1;
        myTeam.trainingLevel = myTeam.trainingLevel || 1;
        myTeam.medicalLevel = myTeam.medicalLevel || 1;

        // Stadyum UI
        let currentStadium = this.stadiumLevels[myTeam.stadiumLevel - 1];
        let nextStadium = this.stadiumLevels[myTeam.stadiumLevel];
        document.getElementById('stadium-level-display').textContent = `Seviye ${currentStadium.level} (${currentStadium.capacity.toLocaleString()})`;
        
        let btnStad = document.getElementById('btn-upgrade-stadium');
        if (nextStadium) {
            btnStad.textContent = `Geliştir (Maliyet: ${nextStadium.cost} Milyon)`;
            btnStad.disabled = false;
        } else {
            btnStad.textContent = "Maksimum Seviye";
            btnStad.disabled = true;
        }

        // Pitch UI
        myTeam.pitchLevel = myTeam.pitchLevel || 1;
        let currentPitch = this.pitchLevels[myTeam.pitchLevel - 1];
        let nextPitch = this.pitchLevels[myTeam.pitchLevel];
        if (document.getElementById('pitch-level-display')) {
            document.getElementById('pitch-level-display').textContent = `Seviye ${currentPitch.level} (${currentPitch.name})`;
            
            let btnPitch = document.getElementById('btn-upgrade-pitch');
            if (nextPitch) {
                btnPitch.textContent = `Geliştir (Maliyet: ${nextPitch.cost} Milyon)`;
                btnPitch.disabled = false;
            } else {
                btnPitch.textContent = "Maksimum Seviye";
                btnPitch.disabled = true;
            }
        }

        // Medical UI
        let currentMedical = this.medicalLevels[myTeam.medicalLevel - 1];
        let nextMedical = this.medicalLevels[myTeam.medicalLevel];
        if (document.getElementById('medical-level-display')) {
            document.getElementById('medical-level-display').textContent = `Seviye ${currentMedical.level} (${currentMedical.name})`;
            
            let btnMed = document.getElementById('btn-upgrade-medical');
            if (nextMedical) {
                btnMed.textContent = `Geliştir (Maliyet: ${nextMedical.cost} Milyon)`;
                btnMed.disabled = false;
            } else {
                btnMed.textContent = "Maksimum Seviye";
                btnMed.disabled = true;
            }
        }

        // Tesis UI
        let currentTraining = this.trainingLevels[myTeam.trainingLevel - 1];
        let nextTraining = this.trainingLevels[myTeam.trainingLevel];
        document.getElementById('training-level-display').textContent = `Seviye ${currentTraining.level} (${currentTraining.name})`;
        
        let btnTrain = document.getElementById('btn-upgrade-training');
        if (nextTraining) {
            btnTrain.textContent = `Geliştir (Maliyet: ${nextTraining.cost} Milyon)`;
            btnTrain.disabled = false;
        } else {
            btnTrain.textContent = "Maksimum Seviye";
            btnTrain.disabled = true;
        }
    },

    upgradeStadium: function() {
        let myTeam = window.leagueData.teams.find(t => t.id === window.myTeamId);
        if (!myTeam) return;
        myTeam.stadiumLevel = myTeam.stadiumLevel || 1;
        let nextStadium = this.stadiumLevels[myTeam.stadiumLevel];

        if (!nextStadium) return;

        if (myTeam.budget >= nextStadium.cost) {
            myTeam.budget -= nextStadium.cost;
            myTeam.stadiumLevel = nextStadium.level;
            if(typeof updateBudgetUI === 'function') updateBudgetUI();
            this.updateUI();
            alert(`Tebrikler! Stadyum kapasitesi ${nextStadium.capacity.toLocaleString()} kişiye çıkarıldı!\nArtık iç saha maçlarında çok daha fazla gişe hasılatı elde edeceksiniz.`);
        } else {
            alert(`Yetersiz bütçe! Stadyumu geliştirmek için ${nextStadium.cost} Milyon Euro gerekiyor.\nMevcut Bütçe: ${myTeam.budget.toFixed(2)}`);
        }
    },

    upgradeMedical: function() {
        let myTeam = window.leagueData.teams.find(t => t.id === window.myTeamId);
        if (!myTeam) return;
        myTeam.medicalLevel = myTeam.medicalLevel || 1;
        let nextMedical = this.medicalLevels[myTeam.medicalLevel];

        if (!nextMedical) return;

        if (myTeam.budget >= nextMedical.cost) {
            myTeam.budget -= nextMedical.cost;
            myTeam.medicalLevel = nextMedical.level;
            if(typeof updateBudgetUI === 'function') updateBudgetUI();
            this.updateUI();
            alert(`Tebrikler! Sağlık ve Spor Bilimleri Tesisleri ${nextMedical.name} seviyesine yükseltildi!\nArtık oyuncularınız maç sonrası daha hızlı dinlenecek ve sakatlık riskleri düşecek.`);
        } else {
            alert(`Yetersiz bütçe! Tesisleri geliştirmek için ${nextMedical.cost} Milyon Euro gerekiyor.\nMevcut Bütçe: ${myTeam.budget.toFixed(2)}`);
        }
    },

    upgradeTraining: function() {
        let myTeam = window.leagueData.teams.find(t => t.id === window.myTeamId);
        if (!myTeam) return;
        myTeam.trainingLevel = myTeam.trainingLevel || 1;
        let nextTraining = this.trainingLevels[myTeam.trainingLevel];

        if (!nextTraining) return;

        if (myTeam.budget >= nextTraining.cost) {
            myTeam.budget -= nextTraining.cost;
            myTeam.trainingLevel = nextTraining.level;
            if(typeof updateBudgetUI === 'function') updateBudgetUI();
            this.updateUI();
            alert(`Tebrikler! Antrenman tesisleri ${nextTraining.name} seviyesine yükseltildi!\nArtık oyuncularınız haftalık antrenmanlarda çok daha hızlı güçlenecek.`);
        } else {
            alert(`Yetersiz bütçe! Tesisleri geliştirmek için ${nextTraining.cost} Milyon Euro gerekiyor.\nMevcut Bütçe: ${myTeam.budget.toFixed(2)}`);
        }
    },

    upgradePitch: function() {
        let myTeam = window.leagueData.teams.find(t => t.id === window.myTeamId);
        if (!myTeam) return;
        myTeam.pitchLevel = myTeam.pitchLevel || 1;
        let nextPitch = this.pitchLevels[myTeam.pitchLevel];

        if (!nextPitch) return;

        if (myTeam.budget >= nextPitch.cost) {
            myTeam.budget -= nextPitch.cost;
            myTeam.pitchLevel = nextPitch.level;
            if(typeof updateBudgetUI === 'function') updateBudgetUI();
            this.updateUI();
            alert(`Tebrikler! Saha zemini ${nextPitch.name} olarak yenilendi!\nArtık oyuncularınızın sakatlanma riski çok daha düşük olacak.`);
        } else {
            alert(`Yetersiz bütçe! Zemini yenilemek için ${nextPitch.cost} Milyon Euro gerekiyor.\nMevcut Bütçe: ${myTeam.budget.toFixed(2)}`);
        }
    }
};

// Sayfa yüklendiğinde başlat
document.addEventListener('DOMContentLoaded', () => {
    window.FacilitiesManager.init();
});
