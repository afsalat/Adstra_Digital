const fs = require('fs');

const targetFile = 'adstra-next/src/components/admin_side/SocialManagement/components/MetaAdsManagerCampaignEditor.jsx';
// Restore from backup first to ensure clean state
fs.copyFileSync(targetFile + '.bak', targetFile);
let content = fs.readFileSync(targetFile, 'utf8');

// 1. REPLACEMENT 1: Ad Set Card 2 & Card 3 (Lines ~2555 to ~2812)
const card2to4Start = '{/* Card 2: App promotion (Screenshot 2) */}';
const card2to4End = '{/* Card 4: Audience controls */}';

const startIdx = content.indexOf(card2to4Start);
const endIdx = content.indexOf(card2to4End);

if (startIdx === -1 || endIdx === -1) {
  console.error('[ERROR] Could not find boundary for Card 2 to Card 4');
  process.exit(1);
}

const newCard2And3 = `{/* Card 2: Conversion / App promotion (Dynamic to match Screenshot 1 & Screenshot 2) */}
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
                        gap: 8,
                        marginBottom: 16,
                      }}
                    >
                      <CheckCircle2 size={18} color="#008000" strokeWidth={2.5} />
                      <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#1c1e21" }}>
                        {objective === "App promotion" || conversionLocation === "app"
                          ? "App promotion"
                          : "Conversion"}
                      </h2>
                    </div>

                    {/* If Leads objective, offer Conversion Location switcher */}
                    {objective === "Leads" && (
                      <div style={{ marginBottom: 18 }}>
                        <label
                          style={{
                            display: "block",
                            fontSize: "0.86rem",
                            fontWeight: 700,
                            color: "#1c1e21",
                            marginBottom: 4,
                          }}
                        >
                          Conversion location
                        </label>
                        <div style={{ fontSize: "0.82rem", color: "#65676b", marginBottom: 10 }}>
                          Choose where you want to generate leads.
                        </div>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                            gap: 10,
                          }}
                        >
                          {[
                            {
                              id: "instant_forms",
                              label: "Instant forms",
                              desc: "Generate leads by asking people to fill out a form.",
                              icon: FileText,
                            },
                            {
                              id: "messenger",
                              label: "Messenger",
                              desc: "Generate leads by starting chats in Messenger.",
                              icon: MessageSquare,
                            },
                            {
                              id: "website",
                              label: "Website",
                              desc: "Generate leads through your website.",
                              icon: Globe,
                            },
                            {
                              id: "app",
                              label: "App",
                              desc: "Generate leads through your mobile app.",
                              icon: Smartphone,
                            },
                          ].map((loc) => {
                            const IconComponent = loc.icon;
                            const isSelected = conversionLocation === loc.id;
                            return (
                              <div
                                key={loc.id}
                                onClick={() => setConversionLocation(loc.id)}
                                style={{
                                  border: isSelected ? "2px solid #0064e1" : "1px solid #cbd5e1",
                                  borderRadius: 8,
                                  padding: "12px 14px",
                                  background: isSelected ? "#f0f7ff" : "#ffffff",
                                  cursor: "pointer",
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 4,
                                  transition: "all 0.15s ease",
                                }}
                              >
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <div
                                    style={{
                                      width: 16,
                                      height: 16,
                                      borderRadius: "50%",
                                      border: isSelected ? "5px solid #0064e1" : "1.5px solid #65676b",
                                      background: "#ffffff",
                                      boxSizing: "border-box",
                                      flexShrink: 0,
                                    }}
                                  />
                                  <IconComponent size={16} color={isSelected ? "#0064e1" : "#1c1e21"} />
                                  <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#1c1e21" }}>
                                    {loc.label}
                                  </span>
                                </div>
                                <div style={{ fontSize: "0.78rem", color: "#65676b", paddingLeft: 24, lineHeight: 1.35 }}>
                                  {loc.desc}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* App Promotion View (Matches Screenshot 2 exactly!) */}
                    {(objective === "App promotion" || conversionLocation === "app") ? (
                      <>
                        {/* Mobile app store */}
                        <div style={{ marginBottom: 16 }}>
                          <label
                            style={{
                              display: "block",
                              fontSize: "0.86rem",
                              fontWeight: 700,
                              color: "#1c1e21",
                              marginBottom: 4,
                            }}
                          >
                            Mobile app store
                          </label>
                          <div style={{ position: "relative" }}>
                            <select
                              value={mobileAppStore}
                              onChange={(e) => setMobileAppStore(e.target.value)}
                              style={{
                                width: "100%",
                                padding: "9px 34px 9px 12px",
                                borderRadius: 6,
                                border: "1px solid #cbd5e1",
                                fontSize: "0.9rem",
                                color: "#1c1e21",
                                background: "#ffffff",
                                cursor: "pointer",
                                appearance: "none",
                                outline: "none",
                              }}
                            >
                              <option value="Google Play Store">Google Play Store</option>
                              <option value="Apple App Store">Apple App Store</option>
                              <option value="Amazon Appstore">Amazon Appstore</option>
                              <option value="Windows Store">Windows Store</option>
                            </select>
                            <ChevronDown
                              size={15}
                              color="#65676b"
                              style={{
                                position: "absolute",
                                right: 12,
                                top: "50%",
                                transform: "translateY(-50%)",
                                pointerEvents: "none",
                              }}
                            />
                          </div>
                        </div>

                        {/* App name search */}
                        <div style={{ marginBottom: 12 }}>
                          <label
                            style={{
                              display: "block",
                              fontSize: "0.86rem",
                              fontWeight: 700,
                              color: "#1c1e21",
                              marginBottom: 4,
                            }}
                          >
                            App name
                          </label>
                          <div style={{ position: "relative" }}>
                            <Search
                              size={16}
                              color="#65676b"
                              style={{
                                position: "absolute",
                                left: 12,
                                top: "50%",
                                transform: "translateY(-50%)",
                              }}
                            />
                            <input
                              type="text"
                              placeholder="Enter app name, app ID or exact app store URL"
                              value={appNameQuery}
                              onChange={(e) => setAppNameQuery(e.target.value)}
                              style={{
                                width: "100%",
                                padding: "9px 12px 9px 36px",
                                borderRadius: 6,
                                border: "1px solid #cbd5e1",
                                fontSize: "0.88rem",
                                color: "#1c1e21",
                                outline: "none",
                                boxSizing: "border-box",
                              }}
                            />
                          </div>
                        </div>

                        {/* Checkbox: Find your app */}
                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            cursor: "pointer",
                            marginBottom: 16,
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={countryAvailabilityChecked}
                            onChange={(e) => setCountryAvailabilityChecked(e.target.checked)}
                            style={{ width: 16, height: 16, accentColor: "#0064e1" }}
                          />
                          <span style={{ fontSize: "0.86rem", color: "#1c1e21" }}>
                            Find your app by selecting a country where it's available.
                          </span>
                        </label>

                        {/* Performance goal */}
                        <div style={{ marginBottom: 16 }}>
                          <div
                            style={{
                              fontSize: "0.86rem",
                              fontWeight: 700,
                              color: "#1c1e21",
                              marginBottom: 4,
                            }}
                          >
                            Performance goal
                          </div>
                          <div style={{ fontSize: "0.86rem", color: "#1c1e21" }}>
                            Maximise number of app installs
                          </div>
                        </div>

                        {/* Callout box (Screenshot 2) */}
                        <div
                          style={{
                            border: "1px solid #e4e6eb",
                            borderRadius: 8,
                            background: "#ffffff",
                            padding: "14px 16px",
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 12,
                          }}
                        >
                          <Info size={18} color="#1c1e21" style={{ flexShrink: 0, marginTop: 1 }} />
                          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                            <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "#1c1e21" }}>
                              In-app ad impression and in-app purchase now available
                            </div>
                            <div style={{ fontSize: "0.82rem", color: "#475569", lineHeight: 1.45 }}>
                              To reach people who may drive higher in-app ad value, choose Maximise value
                              of conversions
                            </div>
                          </div>
                        </div>
                      </>
                    ) : conversionLocation === "instant_forms" ? (
                      /* Instant forms specific setup for Leads */
                      <div>
                        <div style={{ marginBottom: 16 }}>
                          <label
                            style={{
                              display: "block",
                              fontSize: "0.86rem",
                              fontWeight: 700,
                              color: "#1c1e21",
                              marginBottom: 4,
                            }}
                          >
                            Performance goal
                          </label>
                          <select
                            value={leadPerformanceGoal}
                            onChange={(e) => setLeadPerformanceGoal(e.target.value)}
                            style={{
                              width: "100%",
                              padding: "9px 12px",
                              borderRadius: 6,
                              border: "1px solid #cbd5e1",
                              fontSize: "0.88rem",
                              background: "#ffffff",
                              color: "#1c1e21",
                            }}
                          >
                            <option value="Maximise number of leads">Maximise number of leads (Recommended)</option>
                            <option value="Maximise number of conversion leads">Maximise number of conversion leads</option>
                          </select>
                          <div style={{ fontSize: "0.78rem", color: "#65676b", marginTop: 4 }}>
                            We'll try to show your ads to the people most likely to submit your form.
                          </div>
                        </div>

                        {/* Callout info */}
                        <div
                          style={{
                            border: "1px solid #e4e6eb",
                            borderRadius: 8,
                            background: "#f8fafc",
                            padding: "14px 16px",
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 12,
                          }}
                        >
                          <Info size={18} color="#0064e1" style={{ flexShrink: 0, marginTop: 1 }} />
                          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                            <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "#1c1e21" }}>
                              Instant forms load instantly on mobile
                            </div>
                            <div style={{ fontSize: "0.82rem", color: "#475569", lineHeight: 1.45 }}>
                              People can view and submit your form without leaving Facebook or Instagram, leading to higher completion rates.
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Website or other */
                      <div>
                        <div style={{ marginBottom: 16 }}>
                          <label
                            style={{
                              display: "block",
                              fontSize: "0.86rem",
                              fontWeight: 700,
                              color: "#1c1e21",
                              marginBottom: 4,
                            }}
                          >
                            Performance goal
                          </label>
                          <div style={{ fontSize: "0.88rem", color: "#1c1e21", fontWeight: 600 }}>
                            Maximise number of conversions
                          </div>
                          <div style={{ fontSize: "0.78rem", color: "#65676b", marginTop: 4 }}>
                            We'll try to show your ads to people most likely to take an action on your website.
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card 3: Budget & schedule (Screenshot 2) */}
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
                        gap: 8,
                        marginBottom: 14,
                      }}
                    >
                      <CheckCircle2 size={18} color="#008000" strokeWidth={2.5} />
                      <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#1c1e21" }}>
                        Budget & schedule
                      </h2>
                    </div>

                    {/* Budget row if Advantage campaign budget is off */}
                    {!shareBudgetEnabled && (
                      <div style={{ marginBottom: 16, paddingBottom: 14, borderBottom: "1px solid #f0f2f5" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 12 }}>
                          <div>
                            <label style={{ display: "block", fontSize: "0.84rem", fontWeight: 700, color: "#1c1e21", marginBottom: 4 }}>
                              Budget
                            </label>
                            <select
                              value={budgetType}
                              onChange={(e) => setBudgetType(e.target.value)}
                              style={{
                                width: "100%",
                                padding: "8px 10px",
                                borderRadius: 6,
                                border: "1px solid #cbd5e1",
                                fontSize: "0.88rem",
                                background: "#ffffff",
                                color: "#1c1e21",
                              }}
                            >
                              <option value="daily">Daily budget</option>
                              <option value="lifetime">Lifetime budget</option>
                            </select>
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: "0.84rem", fontWeight: 700, color: "#1c1e21", marginBottom: 4 }}>
                              Amount
                            </label>
                            <div style={{ position: "relative" }}>
                              <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#65676b", fontSize: "0.88rem", fontWeight: 600 }}>
                                ₹
                              </span>
                              <input
                                type="number"
                                value={budgetAmount}
                                onChange={(e) => setBudgetAmount(Number(e.target.value))}
                                style={{
                                  width: "100%",
                                  padding: "8px 10px 8px 26px",
                                  borderRadius: 6,
                                  border: "1px solid #cbd5e1",
                                  fontSize: "0.88rem",
                                  color: "#1c1e21",
                                  boxSizing: "border-box",
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 12 }}>
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "0.84rem",
                            fontWeight: 700,
                            marginBottom: 4,
                          }}
                        >
                          Start date
                        </label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "8px 10px",
                            borderRadius: 6,
                            border: "1px solid #cbd5e1",
                            fontSize: "0.88rem",
                            boxSizing: "border-box",
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "0.84rem",
                            fontWeight: 700,
                            marginBottom: 4,
                          }}
                        >
                          Start time
                        </label>
                        <input
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "8px 10px",
                            borderRadius: 6,
                            border: "1px solid #cbd5e1",
                            fontSize: "0.88rem",
                            boxSizing: "border-box",
                          }}
                        />
                      </div>
                    </div>

                    {/* Set an end date checkbox */}
                    <div>
                      <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: endDateEnabled ? 10 : 0 }}>
                        <input
                          type="checkbox"
                          checked={endDateEnabled}
                          onChange={(e) => setEndDateEnabled(e.target.checked)}
                          style={{ width: 16, height: 16, accentColor: "#0064e1" }}
                        />
                        <span style={{ fontSize: "0.86rem", color: "#1c1e21" }}>
                          Set an end date
                        </span>
                      </label>
                      {endDateEnabled && (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 10 }}>
                          <div>
                            <input
                              type="date"
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                              style={{
                                width: "100%",
                                padding: "8px 10px",
                                borderRadius: 6,
                                border: "1px solid #cbd5e1",
                                fontSize: "0.88rem",
                                boxSizing: "border-box",
                              }}
                            />
                          </div>
                          <div>
                            <input
                              type="time"
                              defaultValue="23:59"
                              style={{
                                width: "100%",
                                padding: "8px 10px",
                                borderRadius: 6,
                                border: "1px solid #cbd5e1",
                                fontSize: "0.88rem",
                                boxSizing: "border-box",
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  `;

content = content.substring(0, startIdx) + newCard2And3 + content.substring(endIdx);
console.log('[PASS] Updated Ad Set Card 2 & Card 3.');

// 2. REPLACEMENT 2: Add Card 5 (Destination) & Card 6 (Tracking) to Ad Level
// Locate the closing select for callToAction and the closing div of Card 4
const useAppIdx = content.indexOf('value="Use app"');
if (useAppIdx === -1) {
  console.error('[ERROR] Could not find value="Use app" in content');
  process.exit(1);
}

// Find the closing select tag after useAppIdx
const selectCloseIdx = content.indexOf('</select>', useAppIdx);
// Find the closing </div> of Card 4 (two </div> tags after </select>)
const div1 = content.indexOf('</div>', selectCloseIdx);
const div2 = content.indexOf('</div>', div1 + 6);
const insertCard5Idx = div2 + 6;

const card5And6 = `

                  {/* Card 5: Destination (Screenshot 3 & Meta Ads Manager) */}
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
                        Destination
                      </h2>
                    </div>

                    {conversionLocation === "instant_forms" || objective === "Leads" ? (
                      <div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                          <label style={{ fontSize: "0.86rem", fontWeight: 700, color: "#1c1e21" }}>
                            Instant form
                          </label>
                          <button
                            type="button"
                            onClick={() => setCreateFormModalOpen(true)}
                            style={{
                              padding: "4px 12px",
                              borderRadius: 4,
                              border: "1px solid #cbd5e1",
                              background: "#ffffff",
                              color: "#0064e1",
                              fontSize: "0.82rem",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            + Create form
                          </button>
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "#65676b", marginBottom: 8 }}>
                          Select an instant form or create a new one to capture lead contact info.
                        </div>
                        <select
                          value={leadInstantForm}
                          onChange={(e) => setLeadInstantForm(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "9px 12px",
                            borderRadius: 6,
                            border: "1px solid #cbd5e1",
                            fontSize: "0.88rem",
                            background: "#ffffff",
                            color: "#1c1e21",
                          }}
                        >
                          <option value="Lead Generation Form - High Intent (Recommended)">
                            Lead Generation Form - High Intent (Recommended)
                          </option>
                          <option value="Quick Inquiry Form 2026">Quick Inquiry Form 2026</option>
                          <option value="Custom Consultation Request Form">
                            Custom Consultation Request Form
                          </option>
                          {leadInstantForm && !["Lead Generation Form - High Intent (Recommended)", "Quick Inquiry Form 2026", "Custom Consultation Request Form"].includes(leadInstantForm) && (
                            <option value={leadInstantForm}>{leadInstantForm}</option>
                          )}
                        </select>
                      </div>
                    ) : conversionLocation === "app" || objective === "App promotion" ? (
                      <div>
                        <label style={{ display: "block", fontSize: "0.86rem", fontWeight: 700, color: "#1c1e21", marginBottom: 6 }}>
                          App destination URL
                        </label>
                        <input
                          type="text"
                          value={websiteUrl}
                          onChange={(e) => setWebsiteUrl(e.target.value)}
                          placeholder="https://play.google.com/store/apps/details?id=..."
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
                    ) : (
                      <div>
                        <label style={{ display: "block", fontSize: "0.86rem", fontWeight: 700, color: "#1c1e21", marginBottom: 6 }}>
                          Website URL
                        </label>
                        <input
                          type="text"
                          value={websiteUrl}
                          onChange={(e) => setWebsiteUrl(e.target.value)}
                          placeholder="https://example.com/landing-page"
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

                  {/* Card 6: Tracking (Screenshot 3 & Meta Ads Manager) */}
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
                        Tracking
                      </h2>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                        <input
                          type="checkbox"
                          defaultChecked
                          id="meta-website-events"
                          style={{ width: 16, height: 16, marginTop: 2, accentColor: "#0064e1" }}
                        />
                        <div>
                          <label htmlFor="meta-website-events" style={{ fontSize: "0.86rem", fontWeight: 700, color: "#1c1e21", cursor: "pointer" }}>
                            Website events
                          </label>
                          <div style={{ fontSize: "0.8rem", color: "#65676b", marginTop: 2 }}>
                            Send web events using your dataset to measure performance and build audiences.
                          </div>
                          <div
                            style={{
                              marginTop: 6,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              background: "#f0fdf4",
                              color: "#166534",
                              padding: "3px 10px",
                              borderRadius: 12,
                              fontSize: "0.78rem",
                              fontWeight: 600,
                              border: "1px solid #bbf7d0",
                            }}
                          >
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#16a34a" }} />
                            Active • Pixel ID: 948201847192837 (Adstra Digital Dataset)
                          </div>
                        </div>
                      </div>

                      <div style={{ marginTop: 6 }}>
                        <label style={{ display: "block", fontSize: "0.84rem", fontWeight: 700, color: "#1c1e21", marginBottom: 4 }}>
                          URL parameters (optional)
                        </label>
                        <input
                          type="text"
                          defaultValue="utm_source=meta&utm_medium=paid&utm_campaign={{campaign.name}}"
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            borderRadius: 6,
                            border: "1px solid #cbd5e1",
                            fontSize: "0.85rem",
                            boxSizing: "border-box",
                            color: "#475569",
                          }}
                        />
                      </div>
                    </div>
                  </div>`;

content = content.substring(0, insertCard5Idx) + card5And6 + content.substring(insertCard5Idx);
console.log('[PASS] Added Card 5 (Destination) & Card 6 (Tracking) to Ad Level.');

// 3. REPLACEMENT 3: Add CreateFormModal right before FacebookPageModal
const fbModalIdx = content.indexOf('{facebookPageModalOpen && (');
if (fbModalIdx === -1) {
  console.error('[ERROR] Could not find {facebookPageModalOpen && ( in content');
  process.exit(1);
}

const formModalCode = `{/* ── CREATE INSTANT FORM MODAL ── */}
      {createFormModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setCreateFormModalOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100000,
            background: "rgba(0, 0, 0, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#ffffff",
              borderRadius: 10,
              width: "100%",
              maxWidth: 540,
              boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
              overflow: "hidden",
              border: "1px solid #e4e6eb",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #e4e6eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "#1c1e21" }}>
                Create instant form
              </h3>
              <button
                type="button"
                onClick={() => setCreateFormModalOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#65676b",
                  padding: 4,
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px", maxHeight: "70vh", overflowY: "auto" }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#1c1e21", marginBottom: 4 }}>
                  Form name
                </label>
                <input
                  type="text"
                  value={newFormName}
                  onChange={(e) => setNewFormName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 6,
                    border: "1px solid #cbd5e1",
                    fontSize: "0.9rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#1c1e21", marginBottom: 6 }}>
                  Form type
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label
                    style={{
                      border: "1px solid #cbd5e1",
                      borderRadius: 6,
                      padding: "10px 14px",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      cursor: "pointer",
                      background: "#f0f7ff",
                    }}
                  >
                    <input type="radio" name="formType" defaultChecked style={{ marginTop: 2, accentColor: "#0064e1" }} />
                    <div>
                      <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "#1c1e21" }}>
                        Higher intent (Recommended)
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "#65676b" }}>
                        Add a review step that gives people a chance to confirm their info before submitting.
                      </div>
                    </div>
                  </label>
                  <label
                    style={{
                      border: "1px solid #cbd5e1",
                      borderRadius: 6,
                      padding: "10px 14px",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      cursor: "pointer",
                    }}
                  >
                    <input type="radio" name="formType" style={{ marginTop: 2, accentColor: "#0064e1" }} />
                    <div>
                      <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "#1c1e21" }}>
                        More volume
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "#65676b" }}>
                        Use a form that is quick to complete and submit on a mobile device.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#1c1e21", marginBottom: 6 }}>
                  User questions (Prefilled automatically)
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, background: "#f8fafc", padding: "12px", borderRadius: 6, border: "1px solid #e2e8f0" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.84rem", color: "#1c1e21" }}>
                    <input type="checkbox" defaultChecked disabled style={{ accentColor: "#0064e1" }} />
                    <span>Full name (Required)</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.84rem", color: "#1c1e21" }}>
                    <input type="checkbox" defaultChecked disabled style={{ accentColor: "#0064e1" }} />
                    <span>Email address (Required)</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.84rem", color: "#1c1e21" }}>
                    <input type="checkbox" defaultChecked style={{ accentColor: "#0064e1" }} />
                    <span>Phone number</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.84rem", color: "#1c1e21" }}>
                    <input type="checkbox" defaultChecked style={{ accentColor: "#0064e1" }} />
                    <span>City</span>
                  </label>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#1c1e21", marginBottom: 4 }}>
                  Privacy policy link
                </label>
                <input
                  type="text"
                  defaultValue="https://adstradigital.com/privacy-policy"
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
            </div>

            <div
              style={{
                padding: "14px 20px",
                borderTop: "1px solid #e4e6eb",
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                background: "#f8fafc",
              }}
            >
              <button
                type="button"
                onClick={() => setCreateFormModalOpen(false)}
                style={{
                  padding: "7px 18px",
                  borderRadius: 6,
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  color: "#1c1e21",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setLeadInstantForm(newFormName || "Lead Generation Form - High Intent");
                  setCreateFormModalOpen(false);
                }}
                style={{
                  padding: "7px 20px",
                  borderRadius: 6,
                  border: "none",
                  background: "#0064e1",
                  color: "#ffffff",
                  fontSize: "0.88rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Create form
              </button>
            </div>
          </div>
        </div>
      )}

      `;

content = content.substring(0, fbModalIdx) + formModalCode + content.substring(fbModalIdx);
console.log('[PASS] Added CreateFormModal.');

fs.writeFileSync(targetFile, content, 'utf8');
console.log('[COMPLETE] All redesign updates applied successfully to MetaAdsManagerCampaignEditor.jsx!');
