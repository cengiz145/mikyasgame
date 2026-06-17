$ErrorActionPreference = "Stop"
$path = ".\js\ui.js"
$content = Get-Content $path -Raw -Encoding UTF8

$content = $content -replace 'let gameLink = ".*?";', 'let gameLink = "https://mikyasstudio.com.tr/hafizanaguven.html";'
$content = $content -replace 'let shareText = .*?;', 'let shareText = `Tebrikler! HafÄ±zana GÃ¼ven''de "${achName}" baÅŸarÄ±mÄ±nÄ± elde ettim! ğŸ†\n\nSen de benimle beraber bu baÅŸarÄ±yÄ± yakalamak istiyorsan, haydi sen de oyna!\n\nOyunu Oyna: ${gameLink}`;'

# Also fix the textElem.textContent line
$content = $content -replace 'textElem\.textContent = .*?;', 'textElem.textContent = `Tebrikler! "${achName}" baÅŸarÄ±mÄ±nÄ± elde ettiniz! Bunu arkadaÅŸlarÄ±nÄ±zla paylaÅŸabilirsiniz.`;'

# And the kopyalandi announcement
$content = $content -replace 'window\.announceToScreenReader\("Mesaj kopyaland.*?"\);', 'window.announceToScreenReader("Mesaj kopyalandÄ±!");'

Set-Content -Path $path -Value $content -Encoding UTF8
Write-Host "Fixed UI.js"
