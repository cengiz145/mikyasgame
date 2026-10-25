@echo off
chcp 65001 > nul
echo Balik Tutma Oyunu Guncelleniyor...
powershell -ExecutionPolicy Bypass -File "%~dp0GUNCELLE.ps1"
