$ErrorActionPreference = "Stop"
$dir = ".\"
$vJsonPath = Join-Path $dir "version.json"
$vJson = Get-Content $vJsonPath -Raw -Encoding UTF8 | ConvertFrom-Json
$currentVersion = $vJson.version
$parts = $currentVersion.Split('.')
$lastPart = [int]$parts[-1]
$lastPart++
$parts[-1] = $lastPart.ToString()
$newVersion = $parts -join '.'

Write-Host "Futbol Mevcut sürüm: $currentVersion -> Yeni sürüm: $newVersion"
Write-Host "Updating version.json..."
$vJson.version = $newVersion
$vJson.changelog = "Tüm sistemlerde versiyon numaraları eşitlendi ve senkronize edildi."
$vJson | ConvertTo-Json -Depth 5 | Set-Content $vJsonPath -Encoding UTF8

Write-Host "Updating index.html (cache-busting parameter)..."
$indexPath = Join-Path $dir "index.html"
$indexContent = Get-Content $indexPath -Raw -Encoding UTF8
$indexContent = $indexContent -replace '\?v=[0-9\.]+', "?v=$newVersion"
Set-Content $indexPath -Value $indexContent -Encoding UTF8

Write-Host "Updating changelog.txt..."
$changelogPath = Join-Path $dir "changelog.txt"
$changelogContent = Get-Content $changelogPath -Encoding UTF8
$currentDate = Get-Date -Format "dd.MM.yyyy"
$newEntry = @"
[v$newVersion] - $currentDate

Genel:
- Sürüm numaraları otomatik olarak güncellendi ve JS/CSS önbellek (cache) parametreleri yenilendi.

"@
$newChangelog = $newEntry + "`n`n" + ($changelogContent -join "`n")
Set-Content $changelogPath -Value $newChangelog -Encoding UTF8

Write-Host "Tüm sürümler $newVersion olarak eşitlendi!"
