import urllib.request, re

req = urllib.request.Request('https://chanakyauniversity.edu.in/', headers={'User-Agent': 'Mozilla/5.0'})
try:
    html = urllib.request.urlopen(req, timeout=10).read().decode('utf-8', errors='ignore')
    
    with open('documentation/scripts/cu_raw.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("Saved cu_raw.html, size:", len(html))

    lines = []
    for m in re.finditer(r'<(h[1-6]|p|a|li)[^>]*>(.*?)</\1>', html, re.DOTALL):
        tag = m.group(1)
        txt = re.sub(r'<[^>]+>', ' ', m.group(2)).strip()
        txt = ' '.join(txt.split())
        if len(txt) > 3 and not txt.startswith(('http', '{', 'function', 'var ')):
            lines.append(f"[{tag.upper()}] {txt}")
    
    print("Extracted content lines (sample 60):")
    for l in lines[:60]:
        print(l)

    print("\nNext 60 lines:")
    for l in lines[60:120]:
        print(l)

except Exception as e:
    print('Error:', e)
