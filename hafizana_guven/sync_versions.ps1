$ErrorActionPreference = "Stop"
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$dir = $PSScriptRoot
if (-not $dir) { $dir = ".\" }
$newVersion = "0.98.1.7"

Write-Host "Updating version.json..."
$vJsonPath = Join-Path $dir "version.json"
$vJson = [System.IO.File]::ReadAllText($vJsonPath, $utf8NoBom) | ConvertFrom-Json
$vJson.version = $newVersion
$vJson.buildId = [int][double]::Parse((Get-Date -UFormat %s))
$vJson.changelog = "Oyun genelindeki tüm yazım, kodlama (UTF-8), odak tuzağı, Başarılar menüsü, Ritim Avcısı, Terminoloji Sınavı, 5 haneli PvP oda kodu ve mobil Tekrar Dinle hataları giderildi."
[System.IO.File]::WriteAllText($vJsonPath, ($vJson | ConvertTo-Json -Depth 5), $utf8NoBom)

Write-Host "Updating package.json..."
$pJsonPath = Join-Path $dir "package.json"
$pJson = [System.IO.File]::ReadAllText($pJsonPath, $utf8NoBom) | ConvertFrom-Json
$pJson.version = $newVersion
[System.IO.File]::WriteAllText($pJsonPath, ($pJson | ConvertTo-Json -Depth 5), $utf8NoBom)

Write-Host "Updating index.html..."
$htmlPath = Join-Path $dir "index.html"
$htmlContent = [System.IO.File]::ReadAllText($htmlPath, $utf8NoBom)
$htmlContent = $htmlContent -replace '\?v=[\d\._a-zA-Z]+', "?v=$newVersion"
$htmlContent = $htmlContent -replace "window\.UYGULAMA_SURUMU\s*=\s*'[\d\._a-zA-Z]+';", "window.UYGULAMA_SURUMU = '$newVersion';"
$htmlContent = $htmlContent -replace 'Sürüm:\s*[\d\.]+', "Sürüm: $newVersion"
$htmlContent = $htmlContent -replace 'Sürüm\s*[\d\.]+', "Sürüm $newVersion"
$htmlContent = $htmlContent -replace 'v[\d\.]+(?=</div>)', "v$newVersion"
[System.IO.File]::WriteAllText($htmlPath, $htmlContent, $utf8NoBom)

Write-Host "Updating .last_sent_version.txt..."
$lvPath = Join-Path $dir ".last_sent_version.txt"
[System.IO.File]::WriteAllText($lvPath, "v$newVersion", $utf8NoBom)

Write-Host "Checking changelog.txt..."
$changelogPath = Join-Path $dir "changelog.txt"
$changelogLines = [System.IO.File]::ReadAllLines($changelogPath, $utf8NoBom)
$firstVersion = $changelogLines | Where-Object { $_ -match '^\[v[\d\.]+\]' } | Select-Object -First 1

if ($firstVersion -notmatch "\[v$newVersion\]") {
    $todayDate = (Get-Date).ToString('dd.MM.yyyy')
    $newEntry = @(
        "[v$newVersion] - $todayDate",
        "",
        "Kapsamlı Yazım ve Kod Hataları Onarımı:",
        "- Oyun genelindeki tüm yazım, kodlama (UTF-8), odak tuzağı, Başarılar menüsü, Ritim Avcısı, Terminoloji Sınavı, 5 haneli PvP oda kodu ve mobil Tekrar Dinle hataları giderildi.",
        ""
    )
    $newChangelog = @($changelogLines[0], "") + $newEntry + $changelogLines[1..($changelogLines.Length - 1)]
    [System.IO.File]::WriteAllLines($changelogPath, $newChangelog, $utf8NoBom)
}

Write-Host "Tüm sürümler v$newVersion olarak eşitlendi!"
