const fs = require("fs");
const path = require("path");

const BASE_URL = "https://adstradigital.com";

function uniq(arr) {
  return [...new Set(arr)];
}

function extractSlugs(block, regex) {
  const slugs = [];
  let match;
  while ((match = regex.exec(block)) !== null) {
    if (match[1]) slugs.push(match[1].trim());
  }
  return slugs;
}

function buildSitemapXml(paths) {
  const lastmod = new Date().toISOString().split("T")[0];
  const lines = [];

  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');

  for (const routePath of paths) {
    const priority =
      routePath === "/"
        ? "1.0"
        : routePath.startsWith("/blogs/") || routePath.startsWith("/service/")
          ? "0.8"
          : "0.7";

    const changefreq =
      routePath === "/" || routePath.startsWith("/blogs/")
        ? "weekly"
        : "monthly";

    lines.push("  <url>");
    lines.push(`    <loc>${BASE_URL}${routePath}</loc>`);
    lines.push(`    <lastmod>${lastmod}</lastmod>`);
    lines.push(`    <changefreq>${changefreq}</changefreq>`);
    lines.push(`    <priority>${priority}</priority>`);
    lines.push("  </url>");
  }

  lines.push("</urlset>");
  return `${lines.join("\n")}\n`;
}

async function main() {
  const projectRoot = path.resolve(__dirname, "..");
  const servicesFile = path.join(projectRoot, "src", "data", "services.js");
  const sitemapFile = path.join(projectRoot, "public", "sitemap.xml");

  const raw = fs.readFileSync(servicesFile, "utf8");
  const blogStart = raw.indexOf("export const blogPosts = [");
  if (blogStart === -1) {
    throw new Error("Could not find 'export const blogPosts = [' in services.js");
  }

  // Strip full-line comments to avoid including disabled slugs.
  const serviceBlock = raw
    .slice(0, blogStart)
    .replace(/^\s*\/\/.*$/gm, "");
  const blogBlock = raw
    .slice(blogStart)
    .replace(/^\s*\/\/.*$/gm, "");

  const serviceSlugs = uniq(extractSlugs(serviceBlock, /slug:\s*"([^"]+)"/g));
  let blogSlugs = uniq(
    extractSlugs(blogBlock, /(?:"slug"|slug)\s*:\s*"([^"]+)"/g)
  );

  // Fetch dynamic blogs from the production API to include live database blogs in the sitemap automatically
  try {
    // We try to fetch from production API. If build is running locally, it fetches live production URLs.
    const res = await fetch("https://adstradigital.com/api/blogs/");
    if (res.ok) {
      const apiBlogs = await res.json();
      if (Array.isArray(apiBlogs)) {
        const apiSlugs = apiBlogs.map((b) => b.slug).filter(Boolean);
        const originalCount = blogSlugs.length;
        blogSlugs = uniq([...blogSlugs, ...apiSlugs]);
        const addedCount = blogSlugs.length - originalCount;
        console.log(`Successfully fetched and merged ${addedCount} additional dynamic blog posts from production database.`);
      }
    }
  } catch (err) {
    console.warn(
      `Could not fetch dynamic blogs from API during sitemap generation (using services.js fallback):`,
      err.message
    );
  }

  const staticPaths = [
    "/",
    "/about/",
    "/career/",
    "/blogs/all/",
    "/service/all/",
    "/products/",
    "/products/campus-management-system/",
    "/privacypolicy/",
    "/TermsNconditions/",
    "/refundpolicy/",
    "/sitemap/",
  ];

  const allPaths = uniq([
    ...staticPaths,
    ...serviceSlugs.map((slug) => `/service/${slug}/`),
    ...blogSlugs.map((slug) => `/blogs/${slug}/`),
  ]).sort();

  const xml = buildSitemapXml(allPaths);
  fs.writeFileSync(sitemapFile, xml, "utf8");

  console.log(
    `sitemap.xml generated with ${allPaths.length} URLs (${serviceSlugs.length} services, ${blogSlugs.length} blogs).`
  );
}

main().catch((err) => {
  console.error("Error generating sitemap:", err);
  process.exit(1);
});
