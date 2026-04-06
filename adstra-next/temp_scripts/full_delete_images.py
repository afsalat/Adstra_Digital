import re
import os

filepath = r"c:\Projects\Adstra_Digital\adstra-next\src\data\services.js"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern to match imageUrl: "https://adstradigital.com/media/blog_images/..."
# or "imageUrl": "https://adstradigital.com/media/blog_images/..."
# and also single quotes.
pattern = r'("?imageUrl"?:\s*["\'])(https://adstradigital\.com/media/blog_images/[^"\']*)(["\'])'

new_content = re.sub(pattern, r'\1\3', content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Successfully cleared production image URLs from services.js")
