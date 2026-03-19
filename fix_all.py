import codecs

filename = 'index.html'

with codecs.open(filename, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Phonetic Turkish Replacements
content = content.replace('entıra', "Enter'a")
content = content.replace('entır', 'Enter')
content = content.replace('page up', 'Page Up')
content = content.replace('page down', 'Page Down')

# 2. Body Focus Mode (NVDA Browse mode fix)
content = content.replace('<body>', '<body role="application" aria-roledescription="&#8203;">')

# 3. switchMenu Null Fix
old_switch = """        function switchMenu(hideMenu, showMenu, newActiveMenuName) {
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
        }"""

new_switch = """        function switchMenu(hideMenu, showMenu, newActiveMenuName) {
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
        }"""

content = content.replace(old_switch, new_switch)

with codecs.open(filename, 'w', encoding='utf-8') as f:
    f.write(content)
