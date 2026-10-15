const fs = require('fs');

const targetFile = 'adstra-next/src/components/admin_side/SocialManagement/components/MetaAdsManagerCampaignEditor.jsx';
const lines = fs.readFileSync(targetFile, 'utf8').split('\n');

const startIdx = lines.findIndex(l => l.includes('// ── Ad Level State (Screenshot 3) ──'));
const endIdx = lines.findIndex(l => l.includes('// Sync state whenever initialData changes'));

console.log('startIdx:', startIdx, 'endIdx:', endIdx);

if (startIdx === -1 || endIdx === -1) {
  console.error('[ERROR] Cannot find state lines range');
  process.exit(1);
}

const newStates = [
  '  // ── Ad Level State (Native Meta Ads Manager matching Images 2, 3, 4, 5) ──',
  '  const [adName, setAdName] = useState(',
  '    initialData?.adName || `New ${defaultObj} campaign - Ad`',
  '  );',
  '  const [partnershipAdEnabled, setPartnershipAdEnabled] = useState(false);',
  '  const [facebookPageConnected, setFacebookPageConnected] = useState(true);',
  '  const [facebookPage, setFacebookPage] = useState(initialData?.facebookPage || "Lioraa London");',
  '  const [instagramAccount, setInstagramAccount] = useState(initialData?.instagramAccount || "lioraalondon");',
  '  const [threadsProfile, setThreadsProfile] = useState(initialData?.threadsProfile || "");',
  '  const [whatsappNumber, setWhatsappNumber] = useState(initialData?.whatsappNumber || "");',
  '  const [facebookPageModalOpen, setFacebookPageModalOpen] = useState(false);',
  '  const [newPageName, setNewPageName] = useState("Lioraa London");',
  '  const [newPageCategory, setNewPageCategory] = useState("Clothing (Brand)");',
  '  const [leadInstantForm, setLeadInstantForm] = useState("Lead Generation Form - High Intent (Recommended)");',
  '  const [previewPlacement, setPreviewPlacement] = useState("fb_feed");',
  '  const [createFormModalOpen, setCreateFormModalOpen] = useState(false);',
  '  const [newFormName, setNewFormName] = useState("Lead Generation Form - High Intent");',
  '',
  '  // Meta Ad Setup & Creative States (Images 3 & 4)',
  '  const [adSetupOption, setAdSetupOption] = useState("Use existing post");',
  '  const [multiAdvertiserAds, setMultiAdvertiserAds] = useState(true);',
  '  const [selectedPostId, setSelectedPostId] = useState("122207744828933412");',
  '  const [selectedPostDate, setSelectedPostDate] = useState("11 Oct 2026");',
  '  const [selectedPostTitle, setSelectedPostTitle] = useState("Your Navratri saree might be...");',
  '  const [aiTransparency, setAiTransparency] = useState(false);',
  '  const [addDestination, setAddDestination] = useState(false);',
  '  const [previewPlacementFilter, setPreviewPlacementFilter] = useState("all");',
  '',
  '  const [adFormat, setAdFormat] = useState("single");',
  '  const [primaryText, setPrimaryText] = useState(',
  '    initialData?.primaryText ||',
  '      `Your Navratri saree might be right here ❤️\\nNine days of devotion, colour, and beautiful traditions.\\n\\n🥻 UP TO 20% OFF Traditional Wear\\nBUY A SAREE & GET 35% OFF ON READYMADE BLOUSE\\nFREE UK DELIVERY\\n\\n🛍 Shop the Collection:\\nhttps://lioraalondon.uk/collections/woman\\n\\n📞 +44 7766 010701`',
  '  );',
  '  const [headline, setHeadline] = useState(initialData?.headline || "Your Navratri saree might be right here ❤️");',
  '  const [descriptionText, setDescriptionText] = useState("Free UK delivery on all orders.");',
  '  const [callToAction, setCallToAction] = useState(initialData?.callToAction || "Learn more");',
  '  const [websiteUrl, setWebsiteUrl] = useState(initialData?.websiteUrl || "https://lioraalondon.uk/collections/woman");',
  '  const [selectedCreativeUrl, setSelectedCreativeUrl] = useState(',
  '    initialData?.selectedCreativeUrl || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=700&auto=format&fit=crop&q=80"',
  '  );',
  '  const [adPreviewEnabled, setAdPreviewEnabled] = useState(true);',
  '  const [adPreviewMode, setAdPreviewMode] = useState("live");',
  ''
];

lines.splice(startIdx, endIdx - startIdx, ...newStates);
fs.writeFileSync(targetFile, lines.join('\n'), 'utf8');
console.log('[PASS] Replaced Ad Level state variables successfully!');
