$ErrorActionPreference = "Stop"
$dir = $PSScriptRoot
if (-not $dir) { $dir = ".\" }
$newVersion = "0.98.0.1"

Write-Host "Updating version.json..."
$vJsonPath = Join-Path $dir "version.json"
$vJson = Get-Content $vJsonPath -Raw -Encoding UTF8 | ConvertFrom-Json
$vJson.version = $newVersion
$vJson.buildId = [int][double]::Parse((Get-Date -UFormat %s))
$vJson.changelog = "Başarımlar listesindeki hata düzeltildi, rütbe ve bilişsel başarılar sistemi aktif edildi."
$vJson | ConvertTo-Json -Depth 5 | Set-Content $vJsonPath -Encoding UTF8

Write-Host "Updating package.json..."
$pJsonPath = Join-Path $dir "package.json"
$pJson = Get-Content $pJsonPath -Raw -Encoding UTF8 | ConvertFrom-Json
$pJson.version = $newVersion
$pJson | ConvertTo-Json -Depth 5 | Set-Content $pJsonPath -Encoding UTF8

Write-Host "Updating index.html..."
$htmlPath = Join-Path $dir "index.html"
$htmlContent = Get-Content $htmlPath -Encoding UTF8
$htmlContent = $htmlContent -replace '\?v=[\d\._a-zA-Z]+', "?v=$newVersion"
$htmlContent = $htmlContent -replace "window\.UYGULAMA_SURUMU\s*=\s*'[\d\._a-zA-Z]+';", "window.UYGULAMA_SURUMU = '$newVersion';"
$htmlContent = $htmlContent -replace 'Sürüm:\s*[\d\.]+', "Sürüm: $newVersion"
$htmlContent = $htmlContent -replace 'Sürüm\s*[\d\.]+', "Sürüm $newVersion"
$htmlContent = $htmlContent -replace 'v[\d\.]+(?=</div>)', "v$newVersion"
$htmlContent | Set-Content $htmlPath -Encoding UTF8

Write-Host "Updating .last_sent_version.txt..."
$lvPath = Join-Path $dir ".last_sent_version.txt"
Set-Content $lvPath -Value "v$newVersion" -Encoding UTF8

Write-Host "Checking changelog.txt..."
$changelogPath = Join-Path $dir "changelog.txt"
$changelogContent = Get-Content $changelogPath -Encoding UTF8
$firstVersion = $changelogContent | Where-Object { $_ -match '^\[v[\d\.]+\]' } | Select-Object -First 1

if ($firstVersion -notmatch "\[v$newVersion\]") {
    $todayDate = (Get-Date).ToString('dd.MM.yyyy')
    $newEntry = @"
[v$newVersion] - $todayDate

Düzeltme:
- Başarımlar listesindeki hata giderildi, rütbe ve bilişsel başarılar sistemi aktif edildi.

"@
    $newChangelog = @()
    $newChangelog += $changelogContent[0] # Header
    $newChangelog += ""
    $newChangelog += $newEntry
    for ($i=1; $i -lt $changelogContent.Length; $i++) {
        $newChangelog += $changelogContent[$i]
    }
    $newChangelog | Set-Content $changelogPath -Encoding UTF8
}

Write-Host "Tüm sürümler v$newVersion olarak eşitlendi!"
