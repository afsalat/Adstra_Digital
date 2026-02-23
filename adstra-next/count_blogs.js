const fs = require('fs');
try {
    let content = fs.readFileSync('src/data/services.js', 'utf8');
    // Replace export const with global assignments to make variables accessible
    content = content.replace(/export const (\w+)/g, 'global.$1');

    eval(content);

    if (global.blogPosts) {
        console.log('Blog Posts Count:', global.blogPosts.length);
    } else {
        console.log('blogPosts not found');
    }
} catch (e) {
    console.error('Error:', e.message);
}
