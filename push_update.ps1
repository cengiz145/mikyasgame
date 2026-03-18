$path = "version.json"
$epoch = [int][double]::Parse((Get-Date (Get-Date).ToUniversalTime() -UFormat %s))
$jsonContent = Get-Content -Path $path | ConvertFrom-Json
$jsonContent.buildId = $epoch

# Sürüm numarasını "0.x" yapısına göre birer birer artırma (0.100'e kadar)
$currentVersion = $jsonContent.version
if ($currentVersion -match "^0\.(\d+)$") {
    $minor = [int]$matches[1]
    if ($minor -lt 100) {
        $minor++
    }
    $jsonContent.version = "0." + $minor
} else {
    # Eğer mevcut sürüm 0.x formatında değilse (örneğin 1.2), 0.1 olarak başlatır
    $jsonContent.version = "0.1"
}

$json = $jsonContent | ConvertTo-Json -Depth 10
Set-Content -Path $path -Value $json

git add .
git commit -m $args[0]
git push
