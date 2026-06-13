@echo off
chcp 65001 >nul
echo Yeni ses dosyalari taranip oyuna entegre ediliyor...
setlocal enabledelayedexpansion
set "files="
for %%F in (sounds\npc\*.*) do (
    set "files=!files!"%%~nxF", "
)
if defined files set "files=!files:~0,-2!"
echo const NPC_SOUNDS = [!files!]; > sounds\npc_list.js
echo.
echo Islem basariyla tamamlandi! Oyununuz yeni sesleri artik taniyacaktir.
echo Sayfayi yenileyip oynamaya devam edebilirsiniz.
pause
