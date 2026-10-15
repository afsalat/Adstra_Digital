const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('c:/adstradigital/Adstra_Digital/adstra-next/src/components/admin_side/SocialManagement/components/MetaAdsManagerCampaignEditor.jsx');
let content = fs.readFileSync(targetFile, 'utf8');

const targetSnippet = `                  {/* Card 2: App promotion (Screenshot 2) */}
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
                        App promotion
                      </h2>
                    </div>

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
                  </div>

                  {/* Card 3: Budget & schedule */}
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

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
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
                  </div>`;

const newSnippet = `                  {/* Card 2: App promotion / Conversion location (Screenshot 2 & 1) */}
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
                        marginBottom: 16,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <CheckCircle2 size={18} color="#008000" strokeWidth={2.5} />
                        <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#1c1e21" }}>
                          {conversionLocation === "app" ? "App promotion" : "Conversion location"}
                        </h2>
                      </div>

                      {/* Quick mode switcher to test both Image 2 (App promotion) and Image 1 (Leads) */}
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          background: "#f0f2f5",
                          padding: 2,
                          borderRadius: 6,
                          gap: 2,
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setConversionLocation("app")}
                          style={{
                            padding: "4px 10px",
                            borderRadius: 4,
                            border: "none",
                            background: conversionLocation === "app" ? "#ffffff" : "transparent",
                            color: conversionLocation === "app" ? "#0064e1" : "#65676b",
                            fontWeight: conversionLocation === "app" ? 650 : 500,
                            fontSize: "0.78rem",
                            cursor: "pointer",
                            boxShadow: conversionLocation === "app" ? "0 1px 2px rgba(0,0,0,0.08)" : "none",
                            transition: "all 0.12s ease",
                          }}
                        >
                          App promotion
                        </button>
                        <button
                          type="button"
                          onClick={() => setConversionLocation("instant_forms")}
                          style={{
                            padding: "4px 10px",
                            borderRadius: 4,
                            border: "none",
                            background: conversionLocation === "instant_forms" ? "#ffffff" : "transparent",
                            color: conversionLocation === "instant_forms" ? "#0064e1" : "#65676b",
                            fontWeight: conversionLocation === "instant_forms" ? 650 : 500,
                            fontSize: "0.78rem",
                            cursor: "pointer",
                            boxShadow: conversionLocation === "instant_forms" ? "0 1px 2px rgba(0,0,0,0.08)" : "none",
                            transition: "all 0.12s ease",
                          }}
                        >
                          Instant forms (Leads)
                        </button>
                        <button
                          type="button"
                          onClick={() => setConversionLocation("website")}
                          style={{
                            padding: "4px 10px",
                            borderRadius: 4,
                            border: "none",
                            background: conversionLocation === "website" ? "#ffffff" : "transparent",
                            color: conversionLocation === "website" ? "#0064e1" : "#65676b",
                            fontWeight: conversionLocation === "website" ? 650 : 500,
                            fontSize: "0.78rem",
                            cursor: "pointer",
                            boxShadow: conversionLocation === "website" ? "0 1px 2px rgba(0,0,0,0.08)" : "none",
                            transition: "all 0.12s ease",
                          }}
                        >
                          Website
                        </button>
                      </div>
                    </div>

                    {/* MODE A: App promotion (Exact match to Screenshot 2) */}
                    {conversionLocation === "app" && (
                      <div>
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
                      </div>
                    )}

                    {/* MODE B: Leads Conversion location (Screenshot 1 Leads) */}
                    {conversionLocation === "instant_forms" && (
                      <div>
                        <div style={{ fontSize: "0.84rem", color: "#65676b", marginBottom: 12 }}>
                          Choose where you want to generate leads.
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                          {[
                            { id: "forms", title: "Instant forms", desc: "Generate leads by asking people to fill in a form on Facebook or Instagram." },
                            { id: "messenger", title: "Messenger", desc: "Generate leads by starting conversations in Messenger." },
                            { id: "both", title: "Instant forms and Messenger", desc: "Generate leads both ways to maximize response rates." },
                            { id: "instagram", title: "Instagram", desc: "Generate leads by starting chats in Instagram Direct." },
                            { id: "website", title: "Website", desc: "Generate leads through lead capture forms on your website." },
                            { id: "calls", title: "Calls", desc: "Generate leads by asking people to call your business phone." },
                          ].map((opt) => (
                            <div
                              key={opt.id}
                              style={{
                                padding: "10px 14px",
                                borderRadius: 6,
                                border: opt.id === "forms" ? "2px solid #0064e1" : "1px solid #cbd5e1",
                                background: opt.id === "forms" ? "#f0f7ff" : "#ffffff",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 10,
                              }}
                            >
                              <div
                                style={{
                                  width: 16,
                                  height: 16,
                                  borderRadius: "50%",
                                  border: opt.id === "forms" ? "5px solid #0064e1" : "2px solid #cbd5e1",
                                  marginTop: 2,
                                  flexShrink: 0,
                                }}
                              />
                              <div>
                                <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#1c1e21" }}>
                                  {opt.title}
                                </div>
                                <div style={{ fontSize: "0.8rem", color: "#65676b", marginTop: 2 }}>
                                  {opt.desc}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Performance goal */}
                        <div>
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
                          <select
                            value={leadPerformanceGoal}
                            onChange={(e) => setLeadPerformanceGoal(e.target.value)}
                            style={{
                              width: "100%",
                              padding: "9px 12px",
                              borderRadius: 6,
                              border: "1px solid #cbd5e1",
                              fontSize: "0.88rem",
                              color: "#1c1e21",
                              background: "#ffffff",
                              cursor: "pointer",
                            }}
                          >
                            <option value="Maximise number of leads">Maximise number of leads (Recommended)</option>
                            <option value="Maximise number of conversion leads">Maximise number of conversion leads</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {/* MODE C: Website conversion */}
                    {conversionLocation === "website" && (
                      <div>
                        <div style={{ fontSize: "0.84rem", color: "#65676b", marginBottom: 12 }}>
                          Direct traffic to your landing page or website.
                        </div>
                        <div>
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
                          <select
                            style={{
                              width: "100%",
                              padding: "9px 12px",
                              borderRadius: 6,
                              border: "1px solid #cbd5e1",
                              fontSize: "0.88rem",
                              color: "#1c1e21",
                              background: "#ffffff",
                              cursor: "pointer",
                            }}
                          >
                            <option value="clicks">Maximise number of link clicks</option>
                            <option value="views">Maximise number of landing page views</option>
                            <option value="conversions">Maximise number of conversions</option>
                          </select>
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
                      <div style={{ marginBottom: 16 }}>
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
                  </div>`;

const normContent = content.replace(/\\r\\n/g, '\\n');
const normTarget = targetSnippet.replace(/\\r\\n/g, '\\n');

if (normContent.includes(normTarget)) {
  const updated = normContent.replace(normTarget, newSnippet.replace(/\\r\\n/g, '\\n'));
  fs.writeFileSync(targetFile, updated, 'utf8');
  console.log('[PASS] Replaced Card 2 & Card 3 in Ad Set successfully!');
} else {
  console.error('[FAIL] Could not match target snippet in editor file.');
}
