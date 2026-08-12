const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  ...(isProd ? { output: 'export' } : {}),
  // Keep `next dev` artifacts separate from `next build`. Running a production
  // build while the dev server is open otherwise replaces its manifests and
  // causes every `/_next/static/*` request to start returning 404 until restart.
  distDir: isProd ? '.next' : '.next-dev',
  trailingSlash: true,       // /page/ URLs
  images: { unoptimized: true },
  basePath: '',              // Optional: subfolder
  assetPrefix: '',           // Optional: CDN/subfolder
  webpack: (config) => {
    config.resolve.alias['@'] = require('path').resolve(__dirname, 'src');
    return config;
  },
};
module.exports = nextConfig;

