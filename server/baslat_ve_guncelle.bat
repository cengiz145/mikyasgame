@echo off
echo Sunucu dosyalari Github'dan guncelleniyor... Lutfen bekleyin.
git pull origin main
echo.
echo Guncelleme tamamlandi! Sunucu baslatiliyor...
start BC-servidor.nvgt
exit
