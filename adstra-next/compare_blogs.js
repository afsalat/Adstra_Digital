const fs = require('fs');
try {
    // Read services.js
    let contentServices = fs.readFileSync('src/data/services.js', 'utf8');
    contentServices = contentServices.replace(/export const (\w+)/g, 'global.$1');
    eval(contentServices);
    const servicesBlogs = global.blogPosts.map(b => b.slug);
    console.log('Services.js count:', servicesBlogs.length);
    // console.log('Services.js slugs:', servicesBlogs);

    // Read Blog.js is harder because it has imports.
    // I will just read it as text and extract slugs using regex which is safer/easier for this mix.
    const contentBlog = fs.readFileSync('src/components/Blog/Blog.js', 'utf8');
    // Regex to find "slug": "..." or slug: "..."
    const blogJsSlugs = [];
    const regex = /["']?slug["']?\s*:\s*["']([^"']+)["']/g;
    let match;
    while ((match = regex.exec(contentBlog)) !== null) {
        if (!blogJsSlugs.includes(match[1])) {
            blogJsSlugs.push(match[1]);
        }
    }
    // The regex might pick up non-blog slugs if any?
    // Blog.js seems to only have the blogPosts array with slugs.
    console.log('Blog.js count (approx via regex):', blogJsSlugs.length);

    // Find differences
    const missingInServices = blogJsSlugs.filter(x => !servicesBlogs.includes(x));
    const missingInBlog = servicesBlogs.filter(x => !blogJsSlugs.includes(x));

    console.log('Missing in services.js:', missingInServices);
    console.log('Missing in Blog.js:', missingInBlog);

} catch (e) {
    console.error('Error:', e.message);
}
