@echo off
title KalpKalbe - Cift Etkilesim Uygulamasi
echo ===================================================
echo KalpKalbe - Cift Dokunus ve Ask Uygulamasi Baslatiliyor...
echo ===================================================
echo.
echo Yerel sunucu aciliyor (Port 8085)...
start "" http://localhost:8085/index.html
python -m http.server 8085
pause
