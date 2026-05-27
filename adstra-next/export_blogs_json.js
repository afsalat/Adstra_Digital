const fs = require('fs');
const path = require('path');
try {
    let content = fs.readFileSync('src/data/services.js', 'utf8');
    content = content.replace(/export const (\w+)/g, 'const $1');
    content = content.replace(/export default \w+;/g, '');
    
    // Append code to write to JSON file
    content += '\n\nfs.writeFileSync("../backend/blogs.json", JSON.stringify(blogPosts, null, 2), "utf8");';
    
    eval(content);
    console.log('Successfully exported blogs to backend/blogs.json');
} catch (e) {
    console.error('Error:', e.message);
}
