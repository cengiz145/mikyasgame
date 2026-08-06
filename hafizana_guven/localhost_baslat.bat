@echo off
echo Yerel sunucu baslatiliyor... Lutfen bekleyin.
echo (Bu siyah pencereyi kapatirsaniz sunucu kapanir)
start http://localhost:8080
npx http-server -p 8080 -c-1
pause
