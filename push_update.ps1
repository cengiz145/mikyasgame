$path = "version.json"
$epoch = [int][double]::Parse((Get-Date (Get-Date).ToUniversalTime() -UFormat %s))
$jsonContent = Get-Content -Path $path | ConvertFrom-Json
$jsonContent.buildId = $epoch

# Sürüm numarasını "0.x" yapısına göre birer birer artırma (0.100'e kadar)
$currentVersion = $jsonContent.version
if ($currentVersion -match "^(\d+)\.(\d+)$") {
    $major = [int]$matches[1]
    $minor = [int]$matches[2]
    $minor++
    $jsonContent.version = "$major.$minor"
} else {
    # Eğer format tamamen bozuksa kaldığı yerden kurtar
    $jsonContent.version = "0.75" 
}

$jsonContent.changelog = $args[0]
$json = $jsonContent | ConvertTo-Json -Depth 10
$utf8NoBom = New-Object System.Text.UTF8Encoding($False)
[System.IO.File]::WriteAllText($path, $json, $utf8NoBom)

$htmlPath = "index.html"
$htmlContent = [System.IO.File]::ReadAllText($htmlPath, $utf8NoBom)
$newVersionString = "const UYGULAMA_SURUMU = `"$($jsonContent.version)`";"
$htmlContent = $htmlContent -replace 'const UYGULAMA_SURUMU = ".*";', $newVersionString
[System.IO.File]::WriteAllText($htmlPath, $htmlContent, $utf8NoBom)

git add .
git commit -m $args[0]
git push
