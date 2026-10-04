import urllib.request, re

url = 'https://chanakyauniversity.edu.in/wp-content/litespeed/css/c307387e029508d3f347473ee93affa1.css?ver=3b116'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    css = urllib.request.urlopen(req, timeout=10).read().decode('utf-8', errors='ignore')
    
    # Check font families
    fonts = set(re.findall(r'font-family\s*:\s*([^;}\r\n]+)', css))
    print('FONTS:', [f.strip() for f in list(fonts)[:15]])

    # Check root variables
    root_block = re.findall(r':root\s*\{([^}]+)\}', css)
    if root_block:
        vars = re.findall(r'--([a-zA-Z0-9_-]+)\s*:\s*([^;]+);', root_block[0])
        print('ROOT CSS VARS (sample 25):', vars[:25])
    
    # Find most common hex colors
    colors = re.findall(r'#([0-9a-fA-F]{6})\b', css)
    from collections import Counter
    c = Counter(colors)
    print('TOP 15 HEX COLORS:', c.most_common(15))
except Exception as e:
    print('Error:', e)
