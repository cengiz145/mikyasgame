$content = [System.IO.File]::ReadAllText("index.html", [System.Text.Encoding]::UTF8)

$content = $content -replace 'entıra', "Enter'a"
$content = $content -replace 'entır', 'Enter'
$content = $content -replace 'page up(?![a-zA-Z])', 'Page Up'
$content = $content -replace 'page down(?![a-zA-Z])', 'Page Down'
$content = $content.Replace('<body>', '<body role="application" aria-roledescription="&#8203;">')

$oldSwitch = @"
        function switchMenu(hideMenu, showMenu, newActiveMenuName) {
            hideMenu.style.opacity = '0';

            setTimeout(() => {
                hideMenu.style.display = 'none';
                hideMenu.setAttribute('aria-hidden', 'true');

                showMenu.style.display = 'flex';
                showMenu.removeAttribute('aria-hidden');

                setTimeout(() => {
                    showMenu.style.opacity = '1';
                    currentActiveMenu = newActiveMenuName;
                    updateMobileKeysVisibility();
                    currentFocusIndex = 0;
                    const firstBtn = showMenu.querySelector('.menu-button');
                    if (firstBtn) firstBtn.focus();
                }, 50);
            }, 300); // 300ms CSS transition süresi ile uyumlu
        }
"@

$newSwitch = @"
        function switchMenu(hideMenu, showMenu, newActiveMenuName) {
            if (hideMenu) hideMenu.style.opacity = '0';

            setTimeout(() => {
                if (hideMenu) {
                    hideMenu.style.display = 'none';
                    hideMenu.setAttribute('aria-hidden', 'true');
                }

                if (showMenu) {
                    showMenu.style.display = 'flex';
                    showMenu.removeAttribute('aria-hidden');
                }

                setTimeout(() => {
                    if (showMenu) showMenu.style.opacity = '1';
                    if (newActiveMenuName) currentActiveMenu = newActiveMenuName;
                    updateMobileKeysVisibility();
                    if (showMenu) {
                        currentFocusIndex = 0;
                        const firstBtn = showMenu.querySelector('.menu-button');
                        if (firstBtn) firstBtn.focus();
                    }
                }, 50);
            }, hideMenu ? 300 : 0);
        }
"@

$content = $content.Replace($oldSwitch, $newSwitch)

$utf8NoBom = New-Object System.Text.UTF8Encoding($False)
[System.IO.File]::WriteAllText("index.html", $content, $utf8NoBom)
