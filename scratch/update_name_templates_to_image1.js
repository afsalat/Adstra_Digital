const fs = require('fs');
const path = require('path');

const targetFile = path.resolve(__dirname, '../adstra-next/src/components/admin_side/SocialManagement/components/MetaAdsManagerCampaignEditor.jsx');
let content = fs.readFileSync(targetFile, 'utf8');

// 1. Set campaignEditingMode default to false (Image 1 is the default state)
content = content.replace(
  'const [campaignEditingMode, setCampaignEditingMode] = useState(true);',
  'const [campaignEditingMode, setCampaignEditingMode] = useState(false);'
);

// 2. Set default separators to '—' and ':' as in Image 2
content = content.replace(
  'const [fieldSeparator, setFieldSeparator] = useState("\\\\");',
  'const [fieldSeparator, setFieldSeparator] = useState("—");'
);
content = content.replace(
  'const [itemSeparator, setItemSeparator] = useState("::");',
  'const [itemSeparator, setItemSeparator] = useState(":");'
);

content = content.replace(
  'const [adsetFieldSeparator, setAdsetFieldSeparator] = useState("\\\\");',
  'const [adsetFieldSeparator, setAdsetFieldSeparator] = useState("—");'
);
content = content.replace(
  'const [adsetItemSeparator, setAdsetItemSeparator] = useState("::");',
  'const [adsetItemSeparator, setAdsetItemSeparator] = useState(":");'
);

content = content.replace(
  'const [adFieldSeparator, setAdFieldSeparator] = useState("\\\\");',
  'const [adFieldSeparator, setAdFieldSeparator] = useState("—");'
);
content = content.replace(
  'const [adItemSeparator, setAdItemSeparator] = useState("::");',
  'const [adItemSeparator, setAdItemSeparator] = useState(":");'
);

// 3. In the campaign editor card, ensure clicking "Edit template" / "Create template" opens to Image 1
content = content.replace(
  `onClick={() => {
                            setCampaignEditingMode(true);
                            setTemplateModalOpen(true);
                          }}`,
  `onClick={() => {
                            setCampaignEditingMode(false);
                            setTemplateModalOpen(true);
                          }}`
);

content = content.replace(
  `onClick={() => {
                            setTemplateToggleOn(true);
                            setCampaignEditingMode(true);
                            setTemplateModalOpen(true);
                          }}`,
  `onClick={() => {
                            setTemplateToggleOn(true);
                            setCampaignEditingMode(false);
                            setTemplateModalOpen(true);
                          }}`
);

console.log("Replaced state & triggers successfully");
fs.writeFileSync(targetFile, content, 'utf8');
