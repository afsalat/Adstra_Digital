const nextConfig = {
  output: 'export',          // Static HTML export
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

