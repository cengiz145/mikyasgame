@echo off
color 0B
echo ===================================================
echo     HAFIZANA GUVEN - OTOMATIK GUNCELLEME SISTEMI
echo ===================================================
echo.
powershell.exe -ExecutionPolicy Bypass -File "%~dp0push_update.ps1"
