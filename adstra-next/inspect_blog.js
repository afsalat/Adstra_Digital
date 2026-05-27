const fs = require('fs');
try {
    let content = fs.readFileSync('src/data/services.js', 'utf8');
    content = content.replace(/export const (\w+)/g, 'const $1');
    content = content.replace(/export default \w+;/g, '');
    content += `
const post = blogPosts[0];
for (const key in post) {
    const val = post[key];
    console.log(key + ' (' + typeof val + '): ' + (typeof val === 'object' ? JSON.stringify(val).slice(0, 100) + '...' : String(val).slice(0, 100)));
}
`;
    eval(content);
} catch (e) {
    console.error('Error:', e.message);
}
