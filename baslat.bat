@echo off
title Hafizana Guven - Yerel Sunucu
echo Oyununuz güvenli yerel sunucuda (localhost:8080) baslatiliyor...
echo Lutfen bu siyah pencereyi oyun esnasinda kapatmayiniz.

powershell -NoProfile -ExecutionPolicy Bypass -Command "$l=New-Object Net.HttpListener;$l.Prefixes.Add('http://localhost:8080/');$l.Start();Start-Process 'http://localhost:8080/';while($l.IsListening){$c=$l.GetContext();$p=$c.Request.Url.LocalPath;if($p -eq '/'){$p='/index.html'};$p=$p.Replace('/','\');$f=Join-Path $PWD $p;if(Test-Path $f -PathType Leaf){$e=[System.IO.Path]::GetExtension($f);$m=switch($e){'.html'{'text/html'}'.js'{'application/javascript'}'.css'{'text/css'}'.json'{'application/json'}'.mp3'{'audio/mpeg'}'.ogg'{'audio/ogg'}'.wav'{'audio/wav'}Default{'application/octet-stream'}};$c.Response.ContentType=$m;$b=[System.IO.File]::ReadAllBytes($f);$c.Response.ContentLength64=$b.Length;$c.Response.OutputStream.Write($b,0,$b.Length)}else{$c.Response.StatusCode=404};$c.Response.Close()}"
