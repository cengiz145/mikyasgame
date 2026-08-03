# Project Rules

## Yapay Zeka Ses Klonlama ve Ses Ýþleme Kurallarý (AI Voice Cloning & Audio Processing)

1. **Agent Yetkileri:** Agent, standart bir sohbet botu deðildir; kullanýcýnýn yerel donanýmýný (RTX 3050 vb.) ve PowerShell'ini kullanarak Python üzerinden aðýr makine öðrenimi görevlerini (Demucs, UVR5, RVC, Piper) doðrudan çalýþtýrabilir. Ses ayýrma veya eðitim istekleri reddedilmemeli, doðrudan yerel kodla çözülmelidir.
2. **Eðitim Seti (Dataset) Hazýrlýðý:** Yapay zeka ses modelleri (RVC, Piper vb.) eðitilirken **ASLA** stüdyo yankýsý (reverb) veya delay barýndýran sesler modele doðrudan verilmez. Vokal, önce enstrümanlardan ayrýlmalý, ardýndan mutlaka yapay zeka destekli bir **De-Reverb (Yanký Silici)** iþleminden geçirilerek tamamen kuru (dry) hale getirilmelidir. Aksi takdirde model robotik ve metalik olur.
