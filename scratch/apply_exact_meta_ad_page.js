const fs = require('fs');

const targetFile = 'adstra-next/src/components/admin_side/SocialManagement/components/MetaAdsManagerCampaignEditor.jsx';
let content = fs.readFileSync(targetFile, 'utf8');

// 1. UPDATE PRESET_CREATIVES
const oldCreativeTarget = `const PRESET_CREATIVES = [
  {
    id: "img-1",`;

const newCreativeTarget = `const PRESET_CREATIVES = [
  {
    id: "img-navratri",
    label: "Festive Saree Collection",
    url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=700&auto=format&fit=crop&q=80",
  },
  {
    id: "img-1",`;

if (content.includes(oldCreativeTarget)) {
  content = content.replace(oldCreativeTarget, newCreativeTarget);
  console.log('[PASS] Updated PRESET_CREATIVES with festive saree collection.');
}

// 2. UPDATE AD LEVEL STATE DEFINITIONS
const oldStatesTarget = `  // ── Ad Level State (Screenshot 3) ──
  const [adName, setAdName] = useState(
    initialData?.adName || \`New \${defaultObj} campaign - Ad\`
  );
  const [partnershipAdEnabled, setPartnershipAdEnabled] = useState(false);
  const [facebookPageConnected, setFacebookPageConnected] = useState(false);
  const [facebookPage, setFacebookPage] = useState("Adstra Digital");
  const [instagramAccount, setInstagramAccount] = useState("@adstradigital");
  const [facebookPageModalOpen, setFacebookPageModalOpen] = useState(false);
  const [newPageName, setNewPageName] = useState("Adstra Digital");
  const [newPageCategory, setNewPageCategory] = useState("Marketing Agency");
  const [leadInstantForm, setLeadInstantForm] = useState("Lead Generation Form - High Intent (Recommended)");
  const [previewPlacement, setPreviewPlacement] = useState("fb_feed");
  const [createFormModalOpen, setCreateFormModalOpen] = useState(false);
  const [newFormName, setNewFormName] = useState("Lead Generation Form - High Intent");

  const [adFormat, setAdFormat] = useState("single");
  const [primaryText, setPrimaryText] = useState(
    initialData?.primaryText || "Grow your mobile presence with high-performing Meta app install campaigns managed by industry specialists. Reach engaged users and boost daily retention."
  );
  const [headline, setHeadline] = useState(initialData?.headline || "Download & Experience the Future");
  const [descriptionText, setDescriptionText] = useState("Free install available on Google Play.");
  const [callToAction, setCallToAction] = useState(initialData?.callToAction || "See details");
  const [websiteUrl, setWebsiteUrl] = useState("https://play.google.com/store/apps");
  const [selectedCreativeUrl, setSelectedCreativeUrl] = useState(
    initialData?.selectedCreativeUrl || PRESET_CREATIVES[0].url
  );
  const [adPreviewEnabled, setAdPreviewEnabled] = useState(true);
  const [adPreviewMode, setAdPreviewMode] = useState("empty");`;

const newStatesReplacement = `  // ── Ad Level State (Native Meta Ads Manager matching Images 2, 3, 4, 5) ──
  const [adName, setAdName] = useState(
    initialData?.adName || \`New \${defaultObj} campaign - Ad\`
  );
  const [partnershipAdEnabled, setPartnershipAdEnabled] = useState(false);
  const [facebookPageConnected, setFacebookPageConnected] = useState(true);
  const [facebookPage, setFacebookPage] = useState(initialData?.facebookPage || "Lioraa London");
  const [instagramAccount, setInstagramAccount] = useState(initialData?.instagramAccount || "lioraalondon");
  const [threadsProfile, setThreadsProfile] = useState(initialData?.threadsProfile || "");
  const [whatsappNumber, setWhatsappNumber] = useState(initialData?.whatsappNumber || "");
  const [facebookPageModalOpen, setFacebookPageModalOpen] = useState(false);
  const [newPageName, setNewPageName] = useState("Lioraa London");
  const [newPageCategory, setNewPageCategory] = useState("Clothing (Brand)");
  const [leadInstantForm, setLeadInstantForm] = useState("Lead Generation Form - High Intent (Recommended)");
  const [previewPlacement, setPreviewPlacement] = useState("fb_feed");
  const [createFormModalOpen, setCreateFormModalOpen] = useState(false);
  const [newFormName, setNewFormName] = useState("Lead Generation Form - High Intent");

  // Meta Ad Setup & Creative States (Images 3 & 4)
  const [adSetupOption, setAdSetupOption] = useState("Use existing post");
  const [multiAdvertiserAds, setMultiAdvertiserAds] = useState(true);
  const [selectedPostId, setSelectedPostId] = useState("122207744828933412");
  const [selectedPostDate, setSelectedPostDate] = useState("11 Oct 2026");
  const [selectedPostTitle, setSelectedPostTitle] = useState("Your Navratri saree might be...");
  const [aiTransparency, setAiTransparency] = useState(false);
  const [addDestination, setAddDestination] = useState(false);
  const [previewPlacementFilter, setPreviewPlacementFilter] = useState("all");

  const [adFormat, setAdFormat] = useState("single");
  const [primaryText, setPrimaryText] = useState(
    initialData?.primaryText ||
      \`Your Navratri saree might be right here ❤️\\nNine days of devotion, colour, and beautiful traditions.\\n\\n🥻 UP TO 20% OFF Traditional Wear\\nBUY A SAREE & GET 35% OFF ON READYMADE BLOUSE\\nFREE UK DELIVERY\\n\\n🛍 Shop the Collection:\\nhttps://lioraalondon.uk/collections/woman\\n\\n📞 +44 7766 010701\`
  );
  const [headline, setHeadline] = useState(initialData?.headline || "Your Navratri saree might be right here ❤️");
  const [descriptionText, setDescriptionText] = useState("Free UK delivery on all orders.");
  const [callToAction, setCallToAction] = useState(initialData?.callToAction || "Learn more");
  const [websiteUrl, setWebsiteUrl] = useState(initialData?.websiteUrl || "https://lioraalondon.uk/collections/woman");
  const [selectedCreativeUrl, setSelectedCreativeUrl] = useState(
    initialData?.selectedCreativeUrl || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=700&auto=format&fit=crop&q=80"
  );
  const [adPreviewEnabled, setAdPreviewEnabled] = useState(true);
  const [adPreviewMode, setAdPreviewMode] = useState("live");`;

const normContent = content.replace(/\\r\\n/g, '\\n');
const normOldStates = oldStatesTarget.replace(/\\r\\n/g, '\\n');

if (normContent.includes(normOldStates)) {
  content = normContent.replace(normOldStates, newStatesReplacement.replace(/\\r\\n/g, '\\n'));
  console.log('[PASS] Updated Ad Level state declarations.');
} else {
  console.log('[WARN] Could not find exact oldStatesTarget, will verify if state already updated.');
}

// 3. REPLACEMENT FOR AD LEVEL VIEW
const startMarker = '3. AD LEVEL VIEW';
const endMarker = 'BOTTOM STICKY ACTION BAR';

const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
  console.error('[ERROR] Could not find startMarker or endMarker');
  process.exit(1);
}

// Find the beginning of the comment line before startMarker:
const commentStart = content.lastIndexOf('{/*', startIdx);
// Find the closing brace of activeLevel === "ad" before endMarker:
const adLevelClose = content.lastIndexOf(')}', endIdx);
const actualEnd = adLevelClose + 2;

const newAdLevelView = `{/* ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ 
                3. AD LEVEL VIEW (Exact Native Meta Ads Manager UI matching Images 2, 3, 4, 5)
               ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═  */}
            {activeLevel === "ad" && (
              <div style={{ display: "flex", gap: 24, alignItems: "flex-start", position: "relative" }}>
                {/* ── LEFT COLUMN: FORM CARDS (Images 2, 3, 4, 5) ── */}
                <div style={{ flex: "1 1 500px", minWidth: 440, display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* Card 1: Ad name (Image 2) */}
                  <div
                    style={{
                      background: "#ffffff",
                      borderRadius: 8,
                      border: "1px solid #e4e6eb",
                      padding: "18px 22px",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <CheckCircle2 size={18} color="#008000" strokeWidth={2.5} />
                      <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#1c1e21" }}>
                        Ad name
                      </h2>
                    </div>

                    <div style={{ display: "flex", gap: 10 }}>
                      <input
                        type="text"
                        value={adName}
                        onChange={(e) => setAdName(e.target.value)}
                        style={{
                          flex: 1,
                          padding: "8px 12px",
                          borderRadius: 6,
                          border: "1px solid #cbd5e1",
                          fontSize: "0.9rem",
                          color: "#1c1e21",
                          outline: "none",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setTemplateModalOpen(true)}
                        style={{
                          padding: "8px 16px",
                          borderRadius: 6,
                          border: "1px solid #cbd5e1",
                          background: "#ffffff",
                          color: "#1c1e21",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Create template
                      </button>
                    </div>
                  </div>

                  {/* Card 2: Partnership ad (Image 2) */}
                  <div
                    style={{
                      background: "#ffffff",
                      borderRadius: 8,
                      border: "1px solid #e4e6eb",
                      padding: "18px 22px",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 6,
                      }}
                    >
                      <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#1c1e21" }}>
                        Partnership ad
                      </h2>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: "0.85rem", color: "#1c1e21", fontWeight: 500 }}>
                          {partnershipAdEnabled ? "On" : "Off"}
                        </span>
                        <div
                          role="switch"
                          aria-checked={partnershipAdEnabled}
                          onClick={() => setPartnershipAdEnabled((prev) => !prev)}
                          style={{
                            width: 32,
                            height: 18,
                            borderRadius: 9,
                            background: partnershipAdEnabled ? "#0064e1" : "#cbd5e1",
                            padding: 2,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: partnershipAdEnabled ? "flex-end" : "flex-start",
                            boxSizing: "border-box",
                            transition: "background 0.15s ease",
                          }}
                        >
                          <span
                            style={{
                              width: 14,
                              height: 14,
                              borderRadius: "50%",
                              background: "#ffffff",
                              boxShadow: "0 1px 2px rgba(0,0,0,0.25)",
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: "0.84rem", color: "#334155", lineHeight: 1.45 }}>
                      Run ads with creators, brands and other businesses to improve campaign performance.{" "}
                      <a
                        href="#creator-hub"
                        onClick={(e) => e.preventDefault()}
                        style={{ color: "#0064e1", textDecoration: "none", fontWeight: 500 }}
                      >
                        Go to Creator Marketing Hub to view creator content
                      </a>
                    </div>
                  </div>

                  {/* Card 3: Identity (Image 2) */}
                  <div
                    style={{
                      background: "#ffffff",
                      borderRadius: 8,
                      border: "1px solid #e4e6eb",
                      padding: "18px 22px",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <CheckCircle2 size={18} color="#008000" strokeWidth={2.5} />
                      <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#1c1e21" }}>
                        Identity
                      </h2>
                    </div>

                    <div style={{ fontSize: "0.84rem", color: "#475569", marginBottom: 16 }}>
                      The profiles that will be used in your ad.
                    </div>

                    {/* Field 1: Facebook Page (Image 2) */}
                    <div style={{ marginBottom: 16 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          fontSize: "0.86rem",
                          fontWeight: 700,
                          color: "#1c1e21",
                          marginBottom: 6,
                        }}
                      >
                        <span>* Facebook Page</span>
                        <Info size={13} color="#65676b" />
                      </div>

                      <div
                        style={{
                          position: "relative",
                          display: "flex",
                          alignItems: "center",
                          border: "1px solid #cbd5e1",
                          borderRadius: 6,
                          background: "#ffffff",
                          padding: "6px 12px",
                        }}
                      >
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            background: "#050505",
                            color: "#ffffff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: "0.82rem",
                            marginRight: 10,
                            flexShrink: 0,
                          }}
                        >
                          {facebookPage ? facebookPage.charAt(0) : "L"}
                        </div>
                        <input
                          type="text"
                          value={facebookPage}
                          onChange={(e) => setFacebookPage(e.target.value)}
                          style={{
                            flex: 1,
                            border: "none",
                            outline: "none",
                            fontSize: "0.88rem",
                            fontWeight: 600,
                            color: "#1c1e21",
                            background: "transparent",
                          }}
                        />
                        <ChevronDown size={16} color="#65676b" style={{ marginLeft: 8 }} />
                      </div>
                    </div>

                    {/* Field 2: Instagram profile (Image 2) */}
                    <div style={{ marginBottom: 16 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          fontSize: "0.86rem",
                          fontWeight: 700,
                          color: "#1c1e21",
                          marginBottom: 6,
                        }}
                      >
                        <span>Instagram profile</span>
                        <Info size={13} color="#65676b" />
                      </div>

                      <div
                        style={{
                          position: "relative",
                          display: "flex",
                          alignItems: "center",
                          border: "1px solid #cbd5e1",
                          borderRadius: 6,
                          background: "#ffffff",
                          padding: "6px 12px",
                        }}
                      >
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            background: "#050505",
                            color: "#ffffff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: "0.82rem",
                            marginRight: 10,
                            flexShrink: 0,
                          }}
                        >
                          {instagramAccount ? instagramAccount.charAt(0) : "l"}
                        </div>
                        <input
                          type="text"
                          value={instagramAccount}
                          onChange={(e) => setInstagramAccount(e.target.value)}
                          style={{
                            flex: 1,
                            border: "none",
                            outline: "none",
                            fontSize: "0.88rem",
                            fontWeight: 600,
                            color: "#1c1e21",
                            background: "transparent",
                          }}
                        />
                        <ChevronDown size={16} color="#65676b" style={{ marginLeft: 8 }} />
                      </div>
                    </div>

                    {/* Field 3: Threads profile (Image 2) */}
                    <div style={{ marginBottom: 16 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          fontSize: "0.86rem",
                          fontWeight: 700,
                          color: "#1c1e21",
                          marginBottom: 6,
                        }}
                      >
                        <span>Threads profile</span>
                        <Info size={13} color="#65676b" />
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ flex: 1, position: "relative" }}>
                          <select
                            value={threadsProfile}
                            onChange={(e) => setThreadsProfile(e.target.value)}
                            style={{
                              width: "100%",
                              padding: "8px 30px 8px 12px",
                              borderRadius: 6,
                              border: "1px solid #cbd5e1",
                              fontSize: "0.88rem",
                              background: "#ffffff",
                              color: threadsProfile ? "#1c1e21" : "#65676b",
                              appearance: "none",
                              cursor: "pointer",
                            }}
                          >
                            <option value="">Select a Threads profile</option>
                            <option value="@lioraalondon">@lioraalondon</option>
                            <option value="@adstradigital">@adstradigital</option>
                          </select>
                          <ChevronDown
                            size={14}
                            color="#65676b"
                            style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                          />
                        </div>
                        <span style={{ fontSize: "0.84rem", color: "#65676b" }}>or</span>
                        <button
                          type="button"
                          style={{
                            padding: "8px 14px",
                            borderRadius: 6,
                            border: "1px solid #cbd5e1",
                            background: "#ffffff",
                            color: "#1c1e21",
                            fontSize: "0.84rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Create profile
                        </button>
                      </div>
                    </div>

                    {/* Field 4: WhatsApp phone number (Image 2) */}
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          fontSize: "0.86rem",
                          fontWeight: 700,
                          color: "#1c1e21",
                          marginBottom: 6,
                        }}
                      >
                        <span>WhatsApp phone number</span>
                        <Info size={13} color="#65676b" />
                      </div>

                      <div style={{ position: "relative" }}>
                        <select
                          value={whatsappNumber}
                          onChange={(e) => setWhatsappNumber(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "8px 30px 8px 12px",
                            borderRadius: 6,
                            border: "1px solid #cbd5e1",
                            fontSize: "0.88rem",
                            background: "#ffffff",
                            color: whatsappNumber ? "#1c1e21" : "#65676b",
                            appearance: "none",
                            cursor: "pointer",
                          }}
                        >
                          <option value="">Select a WhatsApp number</option>
                          <option value="+44 7766 010701">+44 7766 010701 (Lioraa London)</option>
                          <option value="+91 98765 43210">+91 98765 43210 (Adstra Business)</option>
                        </select>
                        <ChevronDown
                          size={14}
                          color="#65676b"
                          style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Ad setup (Image 3) */}
                  <div
                    style={{
                      background: "#ffffff",
                      borderRadius: 8,
                      border: "1px solid #e4e6eb",
                      padding: "18px 22px",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                      <CheckCircle2 size={18} color="#008000" strokeWidth={2.5} />
                      <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#1c1e21" }}>
                        Ad setup
                      </h2>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <div style={{ position: "relative" }}>
                        <select
                          value={adSetupOption}
                          onChange={(e) => setAdSetupOption(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "9px 34px 9px 12px",
                            borderRadius: 6,
                            border: "1px solid #cbd5e1",
                            fontSize: "0.9rem",
                            background: "#ffffff",
                            color: "#1c1e21",
                            appearance: "none",
                            cursor: "pointer",
                          }}
                        >
                          <option value="Use existing post">Use existing post</option>
                          <option value="Create ad">Create ad</option>
                          <option value="Use Creative Hub mockup">Use Creative Hub mockup</option>
                        </select>
                        <ChevronDown
                          size={16}
                          color="#65676b"
                          style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                        />
                      </div>
                    </div>

                    {/* Multi-advertiser ads checkbox (Image 3) */}
                    <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={multiAdvertiserAds}
                        onChange={(e) => setMultiAdvertiserAds(e.target.checked)}
                        style={{ width: 16, height: 16, marginTop: 2, accentColor: "#0064e1" }}
                      />
                      <div>
                        <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "#1c1e21" }}>
                          Multi-advertiser ads
                        </div>
                        <div style={{ fontSize: "0.82rem", color: "#65676b", lineHeight: 1.45, marginTop: 2 }}>
                          Your ad can appear with others in the same ad unit to help promote discoverability. Your ad creative may be resized or cropped.{" "}
                          <a href="#about-multi" onClick={(e) => e.preventDefault()} style={{ color: "#0064e1", textDecoration: "none" }}>
                            About multi-advertiser ads
                          </a>
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Card 5: Ad creative (Images 3 & 4) */}
                  <div
                    style={{
                      background: "#ffffff",
                      borderRadius: 8,
                      border: "1px solid #e4e6eb",
                      padding: "18px 22px",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <CheckCircle2 size={18} color="#008000" strokeWidth={2.5} />
                      <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#1c1e21" }}>
                        Ad creative
                      </h2>
                    </div>

                    <div style={{ fontSize: "0.84rem", color: "#475569", marginBottom: 14 }}>
                      Select and optimise your ad text, media and enhancements.
                    </div>

                    {/* Notice Callout (Image 3) */}
                    <div
                      style={{
                        background: "#f0f7ff",
                        border: "1px solid #cce3fd",
                        borderRadius: 6,
                        padding: "10px 14px",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 16,
                      }}
                    >
                      <Info size={16} color="#0064e1" style={{ flexShrink: 0 }} />
                      <div style={{ fontSize: "0.82rem", color: "#1c1e21" }}>
                        Your Instagram ad will render Facebook mentions as regular text.
                      </div>
                    </div>

                    {/* Selected Facebook Post Snippet (Image 3) */}
                    <div
                      style={{
                        border: "1px solid #e4e6eb",
                        borderRadius: 8,
                        padding: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        marginBottom: 14,
                        background: "#fafbfd",
                      }}
                    >
                      <img
                        src={selectedCreativeUrl}
                        alt="Selected post"
                        style={{ width: 48, height: 48, borderRadius: 6, objectFit: "cover", border: "1px solid #cbd5e1" }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem", color: "#65676b" }}>
                          <span style={{ width: 14, height: 14, borderRadius: "50%", background: "#0064e1", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.68rem", fontWeight: 700 }}>f</span>
                          <span>Facebook post</span>
                        </div>
                        <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#1c1e21", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>
                          {selectedPostTitle}
                        </div>
                        <div style={{ fontSize: "0.78rem", color: "#65676b", marginTop: 2 }}>
                          {selectedPostId} • {selectedPostDate}
                        </div>
                      </div>
                    </div>

                    {/* Change post / Create post buttons (Image 3) */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                      <button
                        type="button"
                        onClick={() => {
                          const nextIdx = (PRESET_CREATIVES.findIndex(c => c.url === selectedCreativeUrl) + 1) % PRESET_CREATIVES.length;
                          setSelectedCreativeUrl(PRESET_CREATIVES[nextIdx].url);
                        }}
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                          padding: "8px 14px",
                          borderRadius: 6,
                          border: "1px solid #cbd5e1",
                          background: "#ffffff",
                          color: "#1c1e21",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        <FileText size={15} color="#1c1e21" />
                        <span>Change post</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const promptText = window.prompt("Enter new primary text for post:", primaryText);
                          if (promptText) setPrimaryText(promptText);
                        }}
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                          padding: "8px 14px",
                          borderRadius: 6,
                          border: "1px solid #cbd5e1",
                          background: "#ffffff",
                          color: "#1c1e21",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        <Plus size={16} color="#1c1e21" />
                        <span>Create post</span>
                      </button>
                    </div>

                    {/* Enter post ID link (Image 3) */}
                    <div style={{ marginBottom: 14 }}>
                      <span
                        onClick={() => {
                          const id = window.prompt("Enter Facebook post ID:", selectedPostId);
                          if (id) setSelectedPostId(id);
                        }}
                        style={{ color: "#0064e1", fontSize: "0.84rem", fontWeight: 600, cursor: "pointer" }}
                      >
                        Enter post ID
                      </span>
                    </div>

                    {/* AI Info Checkbox (Image 3 & 4) */}
                    <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", marginBottom: 16 }}>
                      <input
                        type="checkbox"
                        checked={aiTransparency}
                        onChange={(e) => setAiTransparency(e.target.checked)}
                        style={{ width: 16, height: 16, marginTop: 2, accentColor: "#0064e1" }}
                      />
                      <div>
                        <div style={{ fontSize: "0.86rem", color: "#1c1e21" }}>
                          Ad includes media created or edited with AI
                        </div>
                        <div style={{ fontSize: "0.78rem", color: "#65676b", marginTop: 2 }}>
                          Ticking this box may add an AI info label to your ad.{" "}
                          <a href="#ai-info" onClick={(e) => e.preventDefault()} style={{ color: "#0064e1", textDecoration: "none" }}>
                            About AI transparency
                          </a>
                        </div>
                      </div>
                    </label>

                    {/* Primary Text (Image 4) */}
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: "block", fontSize: "0.86rem", fontWeight: 700, color: "#1c1e21", marginBottom: 6 }}>
                        Primary text
                      </label>
                      <textarea
                        rows={7}
                        value={primaryText}
                        onChange={(e) => setPrimaryText(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: 6,
                          border: "1px solid #cbd5e1",
                          fontSize: "0.86rem",
                          color: "#1c1e21",
                          lineHeight: 1.5,
                          boxSizing: "border-box",
                          fontFamily: "inherit",
                          resize: "vertical",
                        }}
                      />
                    </div>

                    {/* Add a destination checkbox (Image 4) */}
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={addDestination}
                          onChange={(e) => setAddDestination(e.target.checked)}
                          style={{ width: 16, height: 16, marginTop: 2, accentColor: "#0064e1" }}
                        />
                        <div>
                          <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "#1c1e21" }}>
                            Add a destination
                          </div>
                          <div style={{ fontSize: "0.78rem", color: "#65676b", lineHeight: 1.4, marginTop: 2 }}>
                            If you add a destination, you can send people immediately after they've tapped or clicked your ad to a website, a full-screen experience or a call. If you don't, they'll be sent to your Facebook Page or Instagram profile.
                          </div>
                        </div>
                      </label>

                      {addDestination && (
                        <div style={{ marginTop: 12, paddingLeft: 26 }}>
                          <label style={{ display: "block", fontSize: "0.84rem", fontWeight: 700, color: "#1c1e21", marginBottom: 4 }}>
                            Website URL
                          </label>
                          <input
                            type="text"
                            value={websiteUrl}
                            onChange={(e) => setWebsiteUrl(e.target.value)}
                            style={{
                              width: "100%",
                              padding: "8px 12px",
                              borderRadius: 6,
                              border: "1px solid #cbd5e1",
                              fontSize: "0.88rem",
                              boxSizing: "border-box",
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Call to action (Image 4) */}
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.86rem", fontWeight: 700, color: "#1c1e21", marginBottom: 6 }}>
                        <span>Call to action</span>
                        <Info size={13} color="#65676b" />
                      </div>
                      <div style={{ position: "relative" }}>
                        <select
                          value={callToAction}
                          onChange={(e) => setCallToAction(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "8px 30px 8px 12px",
                            borderRadius: 6,
                            border: "1px solid #cbd5e1",
                            fontSize: "0.88rem",
                            background: "#ffffff",
                            color: "#1c1e21",
                            appearance: "none",
                            cursor: "pointer",
                          }}
                        >
                          <option value="Learn more">Learn more</option>
                          <option value="Shop now">Shop now</option>
                          <option value="See details">See details</option>
                          <option value="Sign up">Sign up</option>
                          <option value="Send WhatsApp message">Send WhatsApp message</option>
                          <option value="Contact us">Contact us</option>
                        </select>
                        <ChevronDown size={14} color="#65676b" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                      </div>
                    </div>

                    {/* Edit placement dropdown (Image 4) */}
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "#1c1e21", marginBottom: 6 }}>
                        Edit placement
                      </div>
                      <div style={{ position: "relative" }}>
                        <select
                          value={previewPlacementFilter}
                          onChange={(e) => setPreviewPlacementFilter(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "8px 34px 8px 34px",
                            borderRadius: 6,
                            border: "1px solid #cbd5e1",
                            fontSize: "0.88rem",
                            background: "#ffffff",
                            color: "#1c1e21",
                            appearance: "none",
                            cursor: "pointer",
                          }}
                        >
                          <option value="all">Select a placement to edit</option>
                          <option value="feeds">Feeds (Facebook & Instagram)</option>
                          <option value="stories">Stories & Reels</option>
                          <option value="marketplace">Marketplace</option>
                        </select>
                        <LayoutGrid size={15} color="#65676b" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                        <ChevronDown size={14} color="#65676b" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                      </div>
                    </div>

                    {/* Advantage+ creative enhancements (0/3) (Image 4 & 5) */}
                    <div style={{ borderTop: "1px solid #f0f2f5", paddingTop: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.86rem", fontWeight: 700, color: "#1c1e21" }}>
                          <span>Advantage+ creative enhancements (0/3)</span>
                          <Info size={13} color="#65676b" />
                        </div>
                        <button
                          type="button"
                          style={{
                            padding: "4px 12px",
                            borderRadius: 6,
                            border: "1px solid #cbd5e1",
                            background: "#ffffff",
                            color: "#1c1e21",
                            fontSize: "0.82rem",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Try it out
                        </button>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {["Visual touch-ups", "Add animation", "Show spotlights"].map((item) => (
                          <div
                            key={item}
                            style={{
                              padding: "4px 10px",
                              borderRadius: 14,
                              background: "#f0f2f5",
                              fontSize: "0.78rem",
                              color: "#65676b",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <span>{item}</span>
                            <span style={{ fontWeight: 700, color: "#475569" }}>Off</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card 6: Creative testing (Image 5) */}
                  <div
                    style={{
                      background: "#ffffff",
                      borderRadius: 8,
                      border: "1px solid #e4e6eb",
                      padding: "18px 22px",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "1rem", fontWeight: 700, color: "#1c1e21", marginBottom: 6 }}>
                      <span>Creative testing</span>
                      <Info size={13} color="#65676b" />
                    </div>
                    <div style={{ fontSize: "0.84rem", color: "#475569", lineHeight: 1.45, marginBottom: 12 }}>
                      Compare up to 7 different versions of your creative in a test that helps ensure delivery to new test ads.{" "}
                      <a href="#about-test" onClick={(e) => e.preventDefault()} style={{ color: "#0064e1", textDecoration: "none" }}>
                        About creative testing
                      </a>
                    </div>
                    <button
                      type="button"
                      style={{
                        padding: "7px 16px",
                        borderRadius: 6,
                        border: "1px solid #cbd5e1",
                        background: "#ffffff",
                        color: "#1c1e21",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Set up test
                    </button>
                  </div>

                  {/* Card 7: Tracking (Image 5) */}
                  <div
                    style={{
                      background: "#ffffff",
                      borderRadius: 8,
                      border: "1px solid #e4e6eb",
                      padding: "18px 22px",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <CheckCircle2 size={18} color="#008000" strokeWidth={2.5} />
                      <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#1c1e21" }}>
                        Tracking
                      </h2>
                    </div>

                    <div style={{ fontSize: "0.84rem", color: "#475569", marginBottom: 16 }}>
                      Choose conversion events to track. This ad account's selected conversion dataset will be tracked by default.
                    </div>

                    {/* Website events */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.86rem", fontWeight: 700, color: "#1c1e21" }}>
                        <span>Website events</span>
                        <Info size={13} color="#65676b" />
                      </div>
                      <button
                        type="button"
                        style={{
                          padding: "5px 14px",
                          borderRadius: 6,
                          border: "1px solid #cbd5e1",
                          background: "#ffffff",
                          color: "#1c1e21",
                          fontSize: "0.84rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Set up
                      </button>
                    </div>

                    {/* App events checkbox */}
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                        <input type="checkbox" style={{ width: 16, height: 16, accentColor: "#0064e1" }} />
                        <span style={{ fontSize: "0.86rem", color: "#1c1e21" }}>App events</span>
                      </label>
                    </div>

                    {/* Offline events */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.86rem", fontWeight: 700, color: "#1c1e21" }}>
                        <span>Offline events</span>
                        <Info size={13} color="#65676b" />
                      </div>
                      <button
                        type="button"
                        style={{
                          padding: "5px 14px",
                          borderRadius: 6,
                          border: "1px solid #cbd5e1",
                          background: "#ffffff",
                          color: "#1c1e21",
                          fontSize: "0.84rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Set up
                      </button>
                    </div>

                    {/* URL parameters */}
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.86rem", fontWeight: 700, color: "#1c1e21", marginBottom: 4 }}>
                        <span>URL parameters</span>
                        <Info size={13} color="#65676b" />
                      </div>
                      <input
                        type="text"
                        placeholder="key1=value1&key2=value2"
                        defaultValue="utm_source=meta&utm_medium=paid&utm_campaign={{campaign.name}}"
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          borderRadius: 6,
                          border: "1px solid #cbd5e1",
                          fontSize: "0.86rem",
                          boxSizing: "border-box",
                          color: "#475569",
                          marginBottom: 6,
                        }}
                      />
                      <span style={{ color: "#0064e1", fontSize: "0.84rem", fontWeight: 600, cursor: "pointer" }}>
                        Build a URL parameter
                      </span>
                    </div>

                    {/* Third-party reporting */}
                    <div style={{ borderTop: "1px solid #f0f2f5", paddingTop: 14 }}>
                      <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "#1c1e21", marginBottom: 4 }}>
                        Third-party reporting
                      </div>
                      <div style={{ fontSize: "0.82rem", color: "#65676b", lineHeight: 1.4, marginBottom: 10 }}>
                        Meta purchases may not be included in your Google reporting. Connect your account to measure actions on ads that send people to your website or shop.{" "}
                        <a href="#about-reporting" onClick={(e) => e.preventDefault()} style={{ color: "#0064e1", textDecoration: "none" }}>
                          Learn more
                        </a>
                      </div>
                      <button
                        type="button"
                        style={{
                          padding: "6px 16px",
                          borderRadius: 6,
                          border: "1px solid #cbd5e1",
                          background: "#ffffff",
                          color: "#1c1e21",
                          fontSize: "0.84rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Connect
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── RIGHT COLUMN: NATIVE META MULTI-PLACEMENT AD PREVIEW PANEL (Images 2, 3, 4, 5) ── */}
                <div
                  style={{
                    flex: "1 1 540px",
                    minWidth: 480,
                    maxWidth: 620,
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                    position: "sticky",
                    top: 16,
                    maxHeight: "calc(100vh - 120px)",
                    overflowY: "auto",
                    paddingRight: 6,
                  }}
                >
                  {/* Card 1: Campaign recommendations (Image 2, 3, 4, 5) */}
                  <div
                    style={{
                      background: "#ffffff",
                      borderRadius: 8,
                      border: "1px solid #e4e6eb",
                      padding: "14px 18px",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "#ecfdf5",
                        color: "#059669",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#1c1e21" }}>
                        Campaign recommendations
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "#475569", marginTop: 1 }}>
                        All recommended settings applied.
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Ad preview container (Images 2, 3, 4, 5) */}
                  <div
                    style={{
                      background: "#ffffff",
                      borderRadius: 8,
                      border: "1px solid #e4e6eb",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
                      overflow: "hidden",
                    }}
                  >
                    {/* Header bar (Image 2) */}
                    <div
                      style={{
                        padding: "12px 16px",
                        borderBottom: "1px solid #f0f2f5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      {/* Left: Ad preview toggle */}
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          role="switch"
                          aria-checked={adPreviewEnabled}
                          onClick={() => setAdPreviewEnabled((prev) => !prev)}
                          style={{
                            width: 36,
                            height: 20,
                            borderRadius: 10,
                            background: adPreviewEnabled ? "#0064e1" : "#cbd5e1",
                            padding: 2,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: adPreviewEnabled ? "flex-end" : "flex-start",
                            boxSizing: "border-box",
                            transition: "background 0.15s ease",
                          }}
                        >
                          <span
                            style={{
                              width: 16,
                              height: 16,
                              borderRadius: "50%",
                              background: "#ffffff",
                              boxShadow: "0 1px 2px rgba(0,0,0,0.25)",
                            }}
                          />
                        </div>
                        <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#1c1e21" }}>
                          Ad preview
                        </span>
                      </div>

                      {/* Right icons: Review defaults, Expand, Share (Image 2) */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <button
                          type="button"
                          style={{
                            padding: "4px 12px",
                            borderRadius: 4,
                            border: "1px solid #cbd5e1",
                            background: "#ffffff",
                            color: "#1c1e21",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Review defaults
                        </button>
                        <button
                          type="button"
                          style={{
                            padding: "5px",
                            border: "1px solid #cbd5e1",
                            borderRadius: 4,
                            background: "#ffffff",
                            cursor: "pointer",
                            color: "#65676b",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Maximize2 size={13} />
                        </button>
                        <button
                          type="button"
                          style={{
                            padding: "5px 8px",
                            border: "1px solid #cbd5e1",
                            borderRadius: 4,
                            background: "#ffffff",
                            cursor: "pointer",
                            color: "#65676b",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 3,
                          }}
                        >
                          <Share2 size={13} />
                          <ChevronDown size={11} />
                        </button>
                      </div>
                    </div>

                    {/* Sub-bar: 4 Device Placement View Icons (Image 2) */}
                    <div
                      style={{
                        padding: "8px 16px",
                        borderBottom: "1px solid #f0f2f5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: "#fafbfd",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {[
                          { id: "all", label: "Feeds", icon: LayoutGrid },
                          { id: "stories", label: "Stories", icon: Smartphone },
                          { id: "marketplace", label: "Marketplace", icon: ShoppingBag },
                          { id: "video", label: "In-stream", icon: Tv || LayoutGrid },
                        ].map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setPreviewPlacementFilter(m.id)}
                            style={{
                              padding: "4px 8px",
                              borderRadius: 4,
                              border: previewPlacementFilter === m.id ? "1.5px solid #0064e1" : "1px solid transparent",
                              background: previewPlacementFilter === m.id ? "#e7f3ff" : "transparent",
                              color: previewPlacementFilter === m.id ? "#0064e1" : "#65676b",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <m.icon size={14} />
                          </button>
                        ))}
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#008000" }}>
                        <CheckCircle2 size={15} color="#008000" />
                      </div>
                    </div>

                    {/* Preview Body with Multi-Placement Grid (Images 2, 3, 4, 5) */}
                    {adPreviewEnabled ? (
                      <div style={{ padding: "16px", background: "#f0f2f5", display: "flex", flexDirection: "column", gap: 16 }}>
                        {/* ── ROW 1: FACEBOOK FEED & INSTAGRAM FEED (Image 2) ── */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                          {/* Placement 1: Facebook Feed Preview */}
                          <div
                            style={{
                              background: "#ffffff",
                              borderRadius: 8,
                              border: "1px solid #e4e6eb",
                              overflow: "hidden",
                              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                              display: "flex",
                              flexDirection: "column",
                            }}
                          >
                            {/* FB Header */}
                            <div style={{ padding: "10px 12px 6px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div
                                  style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: "50%",
                                    background: "#050505",
                                    color: "#ffffff",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: 700,
                                    fontSize: "0.85rem",
                                    flexShrink: 0,
                                  }}
                                >
                                  {facebookPage ? facebookPage.charAt(0) : "L"}
                                </div>
                                <div>
                                  <div style={{ fontSize: "0.84rem", fontWeight: 700, color: "#050505", lineHeight: 1.2 }}>
                                    {facebookPage}
                                  </div>
                                  <div style={{ fontSize: "0.72rem", color: "#65676b", display: "flex", alignItems: "center", gap: 3 }}>
                                    <span>Sponsored</span> • <Globe size={10} />
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#65676b" }}>
                                <MoreHorizontal size={14} />
                                <X size={14} />
                              </div>
                            </div>

                            {/* FB Primary Text */}
                            <div style={{ padding: "0 12px 8px 12px", fontSize: "0.78rem", color: "#050505", lineHeight: 1.35, maxHeight: 54, overflow: "hidden" }}>
                              {primaryText.split("\\n").slice(0, 2).join(" ")} ...see more
                            </div>

                            {/* FB Media Image */}
                            <div style={{ width: "100%", height: 210, background: "#000", overflow: "hidden" }}>
                              <img
                                src={selectedCreativeUrl}
                                alt="Feed ad creative"
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                            </div>

                            {/* FB Social Footer */}
                            <div style={{ padding: "6px 12px", borderBottom: "1px solid #f0f2f5", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.72rem", color: "#65676b" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                <span style={{ width: 14, height: 14, borderRadius: "50%", background: "#0064e1", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem" }}>👍</span>
                                <span>1</span>
                              </div>
                              <div>1 share</div>
                            </div>

                            <div style={{ padding: "6px 12px", display: "flex", alignItems: "center", justifyContent: "space-around", fontSize: "0.74rem", fontWeight: 600, color: "#65676b" }}>
                              <span>Like</span>
                              <span>Comment</span>
                              <span>Share</span>
                            </div>
                          </div>

                          {/* Placement 2: Instagram Feed Preview */}
                          <div
                            style={{
                              background: "#ffffff",
                              borderRadius: 8,
                              border: "1px solid #e4e6eb",
                              overflow: "hidden",
                              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                              display: "flex",
                              flexDirection: "column",
                            }}
                          >
                            {/* IG Header */}
                            <div style={{ padding: "10px 12px 6px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div
                                  style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: "50%",
                                    background: "#050505",
                                    color: "#ffffff",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: 700,
                                    fontSize: "0.8rem",
                                    flexShrink: 0,
                                  }}
                                >
                                  {instagramAccount ? instagramAccount.charAt(0) : "l"}
                                </div>
                                <div>
                                  <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#050505", lineHeight: 1.2 }}>
                                    {instagramAccount}
                                  </div>
                                  <div style={{ fontSize: "0.7rem", color: "#65676b" }}>
                                    Sponsored
                                  </div>
                                </div>
                              </div>
                              <MoreHorizontal size={14} color="#65676b" />
                            </div>

                            {/* IG Media */}
                            <div style={{ width: "100%", height: 210, background: "#000", overflow: "hidden" }}>
                              <img
                                src={selectedCreativeUrl}
                                alt="IG ad creative"
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                            </div>

                            {/* IG CTA strip */}
                            <div
                              style={{
                                padding: "6px 12px",
                                background: "#f8fafc",
                                borderBottom: "1px solid #e2e8f0",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                fontSize: "0.76rem",
                                fontWeight: 600,
                                color: "#0064e1",
                              }}
                            >
                              <span>{callToAction}</span>
                              <ChevronRight size={14} />
                            </div>

                            {/* IG Icons bar */}
                            <div style={{ padding: "6px 12px 4px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", color: "#262626" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <span style={{ cursor: "pointer" }}>♡</span>
                                <span style={{ cursor: "pointer" }}>💬</span>
                                <span style={{ cursor: "pointer" }}>✈</span>
                              </div>
                              <span style={{ cursor: "pointer" }}>🔖</span>
                            </div>

                            {/* IG Caption */}
                            <div style={{ padding: "0 12px 10px 12px", fontSize: "0.75rem", color: "#050505", lineHeight: 1.35, maxHeight: 38, overflow: "hidden" }}>
                              <strong>{instagramAccount}</strong> {primaryText.split("\\n")[0]} ... more
                            </div>
                          </div>
                        </div>

                        {/* ── ROW 2: INSTAGRAM STORIES & FACEBOOK STORIES (Images 3 & 4) ── */}
                        <div>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                            <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#1c1e21", display: "flex", alignItems: "center", gap: 6 }}>
                              <Smartphone size={14} color="#0064e1" />
                              <span>Instagram Stories & Facebook Stories</span>
                            </div>
                            <MoreHorizontal size={14} color="#65676b" />
                          </div>

                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            {/* Instagram Story 9:16 Card */}
                            <div
                              style={{
                                width: "100%",
                                height: 290,
                                borderRadius: 10,
                                overflow: "hidden",
                                position: "relative",
                                background: "#050505",
                                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                              }}
                            >
                              <img
                                src={selectedCreativeUrl}
                                alt="Story Creative"
                                style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.9 }}
                              />
                              <div
                                style={{
                                  position: "absolute",
                                  inset: 0,
                                  background: "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.65) 100%)",
                                }}
                              />

                              {/* Story Progress Bar */}
                              <div style={{ position: "absolute", top: 8, left: 8, right: 8, height: 2, background: "rgba(255,255,255,0.4)", borderRadius: 1 }}>
                                <div style={{ width: "65%", height: "100%", background: "#fff", borderRadius: 1 }} />
                              </div>

                              {/* Story Top Profile */}
                              <div style={{ position: "absolute", top: 16, left: 10, right: 10, display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#000", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700 }}>
                                  L
                                </div>
                                <span style={{ fontSize: "0.76rem", fontWeight: 700, color: "#ffffff" }}>
                                  {instagramAccount}
                                </span>
                                <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.7)" }}>Sponsored</span>
                              </div>

                              {/* Story Bottom Swipe-up CTA */}
                              <div style={{ position: "absolute", bottom: 12, left: 10, right: 10, textAlign: "center" }}>
                                <div style={{ fontSize: "0.75rem", color: "#ffffff", marginBottom: 4, textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}>
                                  {callToAction}
                                </div>
                                <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24, height: 16, borderRadius: 8, background: "rgba(255,255,255,0.3)" }}>
                                  <ChevronUp size={12} color="#fff" />
                                </div>
                              </div>
                            </div>

                            {/* Reels 9:16 Card (Image 5) */}
                            <div
                              style={{
                                width: "100%",
                                height: 290,
                                borderRadius: 10,
                                overflow: "hidden",
                                position: "relative",
                                background: "#050505",
                                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                              }}
                            >
                              <img
                                src={selectedCreativeUrl}
                                alt="Reels Creative"
                                style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.95 }}
                              />
                              <div
                                style={{
                                  position: "absolute",
                                  inset: 0,
                                  background: "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.8) 100%)",
                                }}
                              />

                              <div style={{ position: "absolute", top: 10, left: 10, fontSize: "0.75rem", fontWeight: 700, color: "#fff" }}>
                                Reels
                              </div>

                              {/* Vertical Right Actions (Image 5) */}
                              <div style={{ position: "absolute", right: 8, bottom: 40, display: "flex", flexDirection: "column", gap: 10, alignItems: "center", color: "#fff", fontSize: "0.68rem" }}>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                  <span>♡</span>
                                  <span>1</span>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                  <span>💬</span>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                  <span>✈</span>
                                </div>
                              </div>

                              {/* Reels Bottom Caption & CTA (Image 5) */}
                              <div style={{ position: "absolute", bottom: 10, left: 10, right: 38 }}>
                                <div style={{ fontSize: "0.74rem", fontWeight: 700, color: "#fff" }}>{facebookPage}</div>
                                <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.9)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>
                                  {headline}
                                </div>
                                <div style={{ marginTop: 6, display: "inline-flex", alignItems: "center", gap: 4, background: "#0064e1", color: "#fff", padding: "3px 10px", borderRadius: 4, fontSize: "0.72rem", fontWeight: 600 }}>
                                  <span>{callToAction}</span>
                                  <ChevronRight size={10} />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Footer disclaimer (Image 5) */}
                        <div style={{ fontSize: "0.74rem", color: "#65676b", textAlign: "center", marginTop: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                          <span>Ad rendering and interaction may vary based on device, format and other factors.</span>
                          <Info size={12} color="#65676b" />
                        </div>
                      </div>
                    ) : (
                      <div style={{ padding: 40, textAlign: "center", color: "#65676b", fontSize: "0.85rem" }}>
                        Preview is turned off
                      </div>
                    )}
                  </div>

                  {/* Floating Meta AI gradient sparkle button (Images 2, 3, 4, 5) */}
                  <div
                    title="Meta AI Assistant"
                    style={{
                      position: "fixed",
                      bottom: 74,
                      right: 32,
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #3b82f6 100%)",
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 14px rgba(168, 85, 247, 0.4)",
                      cursor: "pointer",
                      zIndex: 20,
                    }}
                  >
                    <Sparkles size={20} />
                  </div>
                </div>
              </div>
            )}`;

content = content.substring(0, commentStart) + newAdLevelView + content.substring(actualEnd);
console.log('[PASS] Replaced Ad Level View with exact native Meta Ads Manager UI!');

fs.writeFileSync(targetFile, content, 'utf8');
console.log('[COMPLETE] MetaAdsManagerCampaignEditor.jsx updated successfully!');
