import codecs

filename = 'index.html'

try:
    with codecs.open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
except UnicodeDecodeError:
    with codecs.open(filename, 'r', encoding='windows-1254') as f:
        content = f.read()

content = content.replace('entıra', "Enter'a")
content = content.replace('entır', 'Enter')
content = content.replace('page up', 'Page Up')
content = content.replace('page down', 'Page Down')

with codecs.open(filename, 'w', encoding='utf-8') as f:
    f.write(content)
