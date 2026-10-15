const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('c:/adstradigital/Adstra_Digital/adstra-next/src/components/admin_side/SocialManagement/components/MetaAdsManagerCampaignEditor.jsx');

let content = fs.readFileSync(targetFile, 'utf8');

content = content.replace(/â‚¹/g, '₹');
content = content.replace(/âœ¦/g, '✦');
content = content.replace(/â€“/g, '–');
content = content.replace(/â€”/g, '—');
content = content.replace(/â€¢/g, '•');
content = content.replace(/â”€/g, '─');
content = content.replace(/â•/g, '═');
content = content.replace(/Â₹/g, '₹');
content = content.replace(/â€œ/g, '"');
content = content.replace(/â€/g, '"');
content = content.replace(/â€™/g, "'");

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Cleaned encoding artifacts successfully!');
