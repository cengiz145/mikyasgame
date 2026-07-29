$ErrorActionPreference = "Stop"
$dir = ".\";
$newVersion = "0.97.4.61"

Write-Host "Updating version.json..."
$vJsonPath = Join-Path $dir "version.json"
$vJson = Get-Content $vJsonPath -Raw -Encoding UTF8 | ConvertFrom-Json
$vJson.version = $newVersion
$vJson.changelog = "Tüm sistemlerde versiyon numaraları eşitlendi ve senkronize edildi."
$vJson | ConvertTo-Json -Depth 5 | Set-Content $vJsonPath -Encoding UTF8

Write-Host "Updating package.json..."
$pJsonPath = Join-Path $dir "package.json"
$pJson = Get-Content $pJsonPath -Raw -Encoding UTF8 | ConvertFrom-Json
$pJson.version = $newVersion
$pJson | ConvertTo-Json -Depth 5 | Set-Content $pJsonPath -Encoding UTF8

Write-Host "Updating index.html..."
$htmlPath = Join-Path $dir "index.html"
(Get-Content $htmlPath -Encoding UTF8) -replace '\?v=[\d\.]+', "?v=$newVersion" | Set-Content $htmlPath -Encoding UTF8

Write-Host "Updating .last_sent_version.txt..."
$lvPath = Join-Path $dir ".last_sent_version.txt"
Set-Content $lvPath -Value "v$newVersion" -Encoding UTF8

Write-Host "Updating changelog.txt..."
$changelogPath = Join-Path $dir "changelog.txt"
$changelogContent = Get-Content $changelogPath -Encoding UTF8
$todayDate = (Get-Date).ToString('dd.MM.yyyy')
$newEntry = @"
[v$newVersion] - $todayDate

Genel:
- Sistem genelindeki tüm versiyon numaraları (index.html, package.json, version.json) senkronize edildi ve eşitlendi.

"@

$newChangelog = @()
$newChangelog += $changelogContent[0] # Header
$newChangelog += ""
$newChangelog += $newEntry
for ($i=1; $i -lt $changelogContent.Length; $i++) {
    $newChangelog += $changelogContent[$i]
}
$newChangelog | Set-Content $changelogPath -Encoding UTF8

Write-Host "Tüm sürümler v$newVersion olarak eşitlendi!"

