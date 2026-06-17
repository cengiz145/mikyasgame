$path = "c:\Users\Umit Ekrem Mikyas\Downloads\wep sitem\index.html"
$content = Get-Content -Path $path -Encoding UTF8
Set-Content -Path $path -Value $content -Encoding UTF8
Write-Host "wep sitem/index.html UTF-8 BOM ile kaydedildi."

$path2 = "c:\Users\Umit Ekrem Mikyas\Downloads\mikyas_oyunlar\index.html"
if (Test-Path $path2) {
    $content2 = Get-Content -Path $path2 -Encoding UTF8
    Set-Content -Path $path2 -Value $content2 -Encoding UTF8
    Write-Host "mikyas_oyunlar/index.html UTF-8 BOM ile kaydedildi."
}
