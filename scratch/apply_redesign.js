const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('c:/adstradigital/Adstra_Digital/adstra-next/src/components/admin_side/SocialManagement/components/MetaAdsManagerCampaignEditor.jsx');
let content = fs.readFileSync(targetFile, 'utf8');

// 1. Update state declarations around lines 360-440
const oldStateBlock = `  // ── Campaign Level State (Screenshot 1 & 3) ──
  const defaultObj = initialData?.objective || "Leads";
  const [objective, setObjective] = useState(defaultObj);
  const [campaignName, setCampaignName] = useState(
    initialData?.campaignName || \`New \${defaultObj} Campaign\`
  );
  const [buyingType, setBuyingType] = useState(initialData?.buyingType || "Auction");
  const [templateToggleOn, setTemplateToggleOn] = useState(true);
  const [showMoreSettings, setShowMoreSettings] = useState(false);
  const [campaignSpendingLimit, setCampaignSpendingLimit] = useState("");

  // Budget & A/B testing & Frequency (Image 1 & 2)
  const [budgetStrategyOpen, setBudgetStrategyOpen] = useState(true);
  const [budgetStrategy, setBudgetStrategy] = useState("adset");
  const [shareBudgetEnabled, setShareBudgetEnabled] = useState(false);
  const [campaignFrequencyControlEnabled, setCampaignFrequencyControlEnabled] = useState(false);
  const [budgetType, setBudgetType] = useState(initialData?.budgetType || "daily");
  const [budgetAmount, setBudgetAmount] = useState(initialData?.budgetAmount || 1000);
  const [bidStrategy, setBidStrategy] = useState("Highest volume");
  const [showMoreBudgetSettings, setShowMoreBudgetSettings] = useState(false);
  const [budgetScheduling, setBudgetScheduling] = useState("None selected");
  const [abTestEnabled, setAbTestEnabled] = useState(false);
  const [specialCategory, setSpecialCategory] = useState(
    initialData?.specialCategory || "none"
  );
  const [selectedSpecialCategories, setSelectedSpecialCategories] = useState(
    initialData?.specialCategories ||
    (initialData?.specialCategory && initialData.specialCategory !== "none"
      ? [initialData.specialCategory]
      : [])
  );
  const [specialDropdownOpen, setSpecialDropdownOpen] = useState(false);
  const specialDropdownRef = useRef(null);

  // ── Ad Set Level State (Screenshot 2) ──
  const [adsetName, setAdsetName] = useState(
    initialData?.adsetName || \`New \${defaultObj} Ad set\`
  );
  const [mobileAppStore, setMobileAppStore] = useState("Google Play Store");
  const [appNameQuery, setAppNameQuery] = useState("");
  const [countryAvailabilityChecked, setCountryAvailabilityChecked] = useState(false);
  const [performanceGoal, setPerformanceGoal] = useState("Maximise number of app installs");
  const [showEstimatedAudienceSize, setShowEstimatedAudienceSize] = useState(false);
  const [startDate, setStartDate] = useState("2026-09-30");
  const [startTime, setStartTime] = useState("10:45");
  const [endDateEnabled, setEndDateEnabled] = useState(false);
  const [endDate, setEndDate] = useState("2026-10-30");
  const [targetLocation, setTargetLocation] = useState("India");
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState("65+");
  const [targetGender, setTargetGender] = useState("All");
  const [placementsType, setPlacementsType] = useState("advantage");

  // ── Ad Level State (Screenshot 3) ──
  const [adName, setAdName] = useState(
    initialData?.adName || \`New \${defaultObj} Ad\`
  );`;

const newStateBlock = `  // ── Campaign Level State (Screenshot 1 & 3) ──
  const defaultObj = initialData?.objective || "Leads";
  const [objective, setObjective] = useState(defaultObj);
  const [campaignName, setCampaignName] = useState(
    initialData?.campaignName || \`New \${defaultObj} campaign\`
  );
  const [buyingType, setBuyingType] = useState(initialData?.buyingType || "Auction");
  const [templateToggleOn, setTemplateToggleOn] = useState(true);
  const [showMoreSettings, setShowMoreSettings] = useState(false);
  const [campaignSpendingLimit, setCampaignSpendingLimit] = useState("");

  // Budget & A/B testing & Frequency (Image 1 & 2)
  const [budgetStrategyOpen, setBudgetStrategyOpen] = useState(true);
  const [budgetStrategy, setBudgetStrategy] = useState("adset");
  const [shareBudgetEnabled, setShareBudgetEnabled] = useState(false);
  const [campaignFrequencyControlEnabled, setCampaignFrequencyControlEnabled] = useState(false);
  const [budgetType, setBudgetType] = useState(initialData?.budgetType || "daily");
  const [budgetAmount, setBudgetAmount] = useState(initialData?.budgetAmount || 1000);
  const [bidStrategy, setBidStrategy] = useState("Highest volume");
  const [showMoreBudgetSettings, setShowMoreBudgetSettings] = useState(false);
  const [budgetScheduling, setBudgetScheduling] = useState("None selected");
  const [abTestEnabled, setAbTestEnabled] = useState(false);
  const [specialCategory, setSpecialCategory] = useState(
    initialData?.specialCategory || "none"
  );
  const [selectedSpecialCategories, setSelectedSpecialCategories] = useState(
    initialData?.specialCategories ||
    (initialData?.specialCategory && initialData.specialCategory !== "none"
      ? [initialData.specialCategory]
      : [])
  );
  const [specialDropdownOpen, setSpecialDropdownOpen] = useState(false);
  const specialDropdownRef = useRef(null);

  // ── Ad Set Level State (Screenshot 2) ──
  const [adsetName, setAdsetName] = useState(
    initialData?.adsetName || \`New \${defaultObj} campaign - Ad Set\`
  );
  const [conversionLocation, setConversionLocation] = useState(
    defaultObj === "App promotion" ? "app" : "instant_forms"
  );
  const [mobileAppStore, setMobileAppStore] = useState("Google Play Store");
  const [appNameQuery, setAppNameQuery] = useState("");
  const [countryAvailabilityChecked, setCountryAvailabilityChecked] = useState(false);
  const [performanceGoal, setPerformanceGoal] = useState("Maximise number of app installs");
  const [leadPerformanceGoal, setLeadPerformanceGoal] = useState("Maximise number of leads");
  const [showEstimatedAudienceSize, setShowEstimatedAudienceSize] = useState(false);
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("14:30");
  const [endDateEnabled, setEndDateEnabled] = useState(false);
  const [endDate, setEndDate] = useState("2026-11-30");
  const [targetLocation, setTargetLocation] = useState("India");
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState("65+");
  const [targetGender, setTargetGender] = useState("All");
  const [placementsType, setPlacementsType] = useState("advantage");

  // ── Ad Level State (Screenshot 3) ──
  const [adName, setAdName] = useState(
    initialData?.adName || \`New \${defaultObj} campaign - Ad\`
  );
  const [leadInstantForm, setLeadInstantForm] = useState("Lead Generation Form - High Intent (Recommended)");
  const [previewPlacement, setPreviewPlacement] = useState("fb_feed");
  const [createFormModalOpen, setCreateFormModalOpen] = useState(false);
  const [newFormName, setNewFormName] = useState("Lead Generation Form - High Intent");`;

if (content.includes(oldStateBlock)) {
  content = content.replace(oldStateBlock, newStateBlock);
  console.log('[PASS] Replaced state declarations.');
} else {
  console.warn('[WARN] Old state block not matched exactly, checking partial.');
}

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Done script 1');
