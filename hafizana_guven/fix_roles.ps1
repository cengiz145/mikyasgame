$ErrorActionPreference = "Stop"

function Fix-File($Path) {
    # Using UTF8 encoding explicitly
    $content = Get-Content $Path -Raw -Encoding UTF8

    $content = $content -replace '<li tabindex="0">', '<li tabindex="0" role="menuitem">'
    $content = $content -replace '<li tabindex="0" class="stat-item"', '<li tabindex="0" role="menuitem" class="stat-item"'
    
    $content = $content -replace '<p tabindex="0"', '<p tabindex="0" role="textbox" aria-readonly="true"'
    $content = $content -replace '<p id="([^"]+)" tabindex="0"', '<p id="$1" tabindex="0" role="textbox" aria-readonly="true"'
    $content = $content -replace '<p style="([^"]+)" id="([^"]+)" tabindex="0"', '<p style="$1" id="$2" tabindex="0" role="textbox" aria-readonly="true"'
    
    $content = $content -replace '<div id="([^"]+)" tabindex="0">', '<div id="$1" tabindex="0" role="textbox" aria-readonly="true">'
    $content = $content -replace '<div id="([^"]+)" tabindex="0" style="', '<div id="$1" tabindex="0" role="textbox" aria-readonly="true" style="'
    $content = $content -replace '<div id="([^"]+)" tabindex="0"\s*>', '<div id="$1" tabindex="0" role="textbox" aria-readonly="true">'
    
    $content = $content -replace '<h1 id="([^"]+)" tabindex="0"', '<h1 id="$1" tabindex="0" role="textbox" aria-readonly="true"'
    $content = $content -replace '<h2 id="([^"]+)" tabindex="0"', '<h2 id="$1" tabindex="0" role="textbox" aria-readonly="true"'
    
    $content = $content -replace '<div id="version-display" aria-live="polite" tabindex="0"', '<div id="version-display" aria-live="polite" tabindex="0" role="textbox" aria-readonly="true"'

    $content = $content -replace '<div id="empty-stats-alert" tabindex="0" role="status"', '<div id="empty-stats-alert" tabindex="0" role="textbox" aria-readonly="true"'
    
    Set-Content -Path $Path -Value $content -Encoding UTF8
    Write-Host "Fixed: $Path"
}

Fix-File -Path ".\index.html"
Fix-File -Path ".\js\ui.js"
Fix-File -Path ".\js\game.js"
