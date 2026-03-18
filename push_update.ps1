$path = "version.json"
$epoch = [int][double]::Parse((Get-Date (Get-Date).ToUniversalTime() -UFormat %s))
$jsonContent = Get-Content -Path $path | ConvertFrom-Json
$jsonContent.buildId = $epoch
$json = $jsonContent | ConvertTo-Json -Depth 10
Set-Content -Path $path -Value $json

git add .
git commit -m $args[0]
git push
