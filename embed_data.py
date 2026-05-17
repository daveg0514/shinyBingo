"""
Embeds encounter_data.js directly into index.html, replacing the external
<script src="encounter_data.js"> tag with an inline <script> block.
Result is a fully self-contained index.html that works on GitHub Pages
without any separate files.
"""
import os

BASE = os.path.dirname(os.path.abspath(__file__))

with open(os.path.join(BASE, 'encounter_data.js'), encoding='utf-8') as f:
    data_js = f.read().strip()

with open(os.path.join(BASE, 'index.html'), encoding='utf-8') as f:
    html = f.read()

OLD_TAG = '<script src="encounter_data.js"></script>'
NEW_TAG = f'<script>\n{data_js}\n</script>'

if OLD_TAG not in html:
    print("ERROR: could not find the script src tag in index.html")
    exit(1)

html = html.replace(OLD_TAG, NEW_TAG)

with open(os.path.join(BASE, 'index.html'), 'w', encoding='utf-8') as f:
    f.write(html)

size_kb = os.path.getsize(os.path.join(BASE, 'index.html')) / 1024
print(f"Done. index.html is now {size_kb:.1f} KB (self-contained, no external data file needed).")
