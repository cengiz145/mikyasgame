$ErrorActionPreference = "Stop"

function Fix-File($Path) {
    $content = Get-Content $Path -Raw -Encoding UTF8

    $content = $content -replace '0\.97\.4\.42', '0.97.4.48'
    $content = $content -replace '0\.97\.4\.44', '0.97.4.48'
    $content = $content -replace '0\.97\.4\.46', '0.97.4.48'
    
    Set-Content -Path $Path -Value $content -Encoding UTF8
    Write-Host "Fixed: $Path"
}

Fix-File -Path ".\index.html"
