const fs = require('fs');
const file = 'src/data/services.js';
let content = fs.readFileSync(file, 'utf8');

const newContent = content.replace(/^(\d+)\.\s+([^\n\?]+)\?\r?\n([A-Z])/gm, '$1) $2 ?\n\n$3');

if (newContent !== content) {
    fs.writeFileSync(file, newContent);
    console.log("Successfully formatted FAQ sections.");
} else {
    console.log("No changes made. Pattern not found.");
}
