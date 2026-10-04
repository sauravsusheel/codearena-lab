import re

with open('documentation/scripts/cu_raw.html', 'r', encoding='utf-8') as f:
    html = f.read()

sections = re.findall(r'<section[^>]*>(.*?)</section>', html, re.DOTALL)
print(f"Total sections: {len(sections)}")

for i, sec in enumerate(sections[:10]):
    h = re.findall(r'<(h[1-4])[^>]*>([^<]+)</\1>', sec)
    p = re.findall(r'<p[^>]*>([^<]+)</p>', sec)
    imgs = re.findall(r'src=["\'](https://[^"\']+\.(?:jpg|png|webp|svg))["\']', sec)
    print(f"\n--- Section {i+1} ---")
    if h: print("Headings:", h[:4])
    if p: print("Paragraphs (sample):", [x.strip() for x in p[:2]])
    if imgs: print("Images (sample):", imgs[:2])
