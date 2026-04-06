const fs = require('fs');
const path = require('path');

const filepath = 'c:\\Projects\\Adstra_Digital\\adstra-next\\src\\data\\services.js';

try {
    let content = fs.readFileSync(filepath, 'utf8');

    // Pattern to match imageUrl: "https://adstradigital.com/media/blog_images/..."
    // or "imageUrl": "https://adstradigital.com/media/blog_images/..."
    // and also single quotes.
    const pattern = /("?imageUrl"?:\s*["'])(https:\/\/adstradigital\.com\/media\/blog_images\/[^"']*)(["'])/g;

    const newContent = content.replace(pattern, '$1$3');

    fs.writeFileSync(filepath, newContent, 'utf8');
    console.log("Successfully cleared production image URLs from services.js");
} catch (err) {
    console.error("Error processing file:", err);
    process.exit(1);
}
