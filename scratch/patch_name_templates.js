const fs = require('fs');
const path = require('path');

const targetFile = path.resolve(__dirname, '../adstra-next/src/components/admin_side/SocialManagement/components/MetaAdsManagerCampaignEditor.jsx');
let content = fs.readFileSync(targetFile, 'utf8');

// 1. Update Campaign level card (around line 1380-1440)
// When !templateToggleOn, render input + "Create template" button
const oldCampaignToggleBlock = `{templateToggleOn ? (
                      <div
                        style={{
                          background: "#ffffff",
                          border: "1px solid #cbd5e1",
                          borderRadius: 6,
                          padding: "10px 14px",
                          marginBottom: 10,
                        }}
                      >
                        <div
                          style={{
                            fontSize: "0.8rem",
                            color: "#65676b",
                            fontWeight: 500,
                            marginBottom: 4,
                          }}
                        >
                          Open text field
                        </div>
                        <input
                          type="text"
                          value={campaignName}
                          onChange={(e) => {
                            setCampaignName(e.target.value);
                            setIsTemplateConventionActive(false);
                          }}
                          style={{
                            width: "100%",
                            border: "none",
                            outline: "none",
                            fontSize: "0.92rem",
                            color: "#1c1e21",
                            fontWeight: 500,
                            padding: 0,
                            background: "transparent",
                          }}
                        />
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={campaignName}
                        onChange={(e) => {
                          setCampaignName(e.target.value);
                          setIsTemplateConventionActive(false);
                        }}
                        placeholder="Enter campaign name"
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          borderRadius: 6,
                          border: "1px solid #cbd5e1",
                          fontSize: "0.9rem",
                          color: "#1c1e21",
                          outline: "none",
                          marginBottom: 10,
                          boxSizing: "border-box",
                        }}
                      />
                    )}

                    {templateToggleOn && (
                      <button
                        type="button"
                        onClick={() => setTemplateModalOpen(true)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#0064e1",
                          fontSize: "0.86rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          padding: 0,
                          display: "inline-flex",
                          alignItems: "center",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                        onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                      >
                        Edit template
                      </button>
                    )}`;

const newCampaignToggleBlock = `{templateToggleOn ? (
                      <div>
                        <div
                          style={{
                            background: "#ffffff",
                            border: "1px solid #ced0d4",
                            borderRadius: 6,
                            padding: "10px 14px",
                            marginBottom: 10,
                          }}
                        >
                          <div
                            style={{
                              fontSize: "0.8rem",
                              color: "#65676b",
                              fontWeight: 500,
                              marginBottom: 4,
                            }}
                          >
                            Open text field
                          </div>
                          <input
                            type="text"
                            value={campaignName}
                            onChange={(e) => {
                              setCampaignName(e.target.value);
                              setIsTemplateConventionActive(false);
                            }}
                            style={{
                              width: "100%",
                              border: "none",
                              outline: "none",
                              fontSize: "0.92rem",
                              color: "#1c1e21",
                              fontWeight: 500,
                              padding: 0,
                              background: "transparent",
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setCampaignEditingMode(true);
                            setTemplateModalOpen(true);
                          }}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#0064e1",
                            fontSize: "0.86rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            padding: 0,
                            display: "inline-flex",
                            alignItems: "center",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                        >
                          Edit template
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                        <input
                          type="text"
                          value={campaignName}
                          onChange={(e) => {
                            setCampaignName(e.target.value);
                            setIsTemplateConventionActive(false);
                          }}
                          placeholder="Enter campaign name"
                          style={{
                            flex: 1,
                            padding: "8px 12px",
                            borderRadius: 6,
                            border: "1px solid #ced0d4",
                            fontSize: "0.9rem",
                            color: "#1c1e21",
                            outline: "none",
                            boxSizing: "border-box",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setTemplateToggleOn(true);
                            setCampaignEditingMode(true);
                            setTemplateModalOpen(true);
                          }}
                          style={{
                            padding: "8px 16px",
                            borderRadius: 6,
                            border: "1px solid #ced0d4",
                            background: "#ffffff",
                            color: "#1c1e21",
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
                        >
                          Create template
                        </button>
                      </div>
                    )}`;

if (content.includes(oldCampaignToggleBlock)) {
  content = content.replace(oldCampaignToggleBlock, newCampaignToggleBlock);
  console.log("Campaign card updated");
} else {
  console.log("Campaign card block not matched verbatim, checking substring...");
}

// 2. Update Ad set name card
const oldAdsetBlock = `<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <input
                        type="text"
                        value={adsetName}
                        onChange={(e) => setAdsetName(e.target.value)}
                        placeholder="Enter ad set name"
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
                    </div>`;

const newAdsetBlock = `{isAdsetTemplateActive ? (
                      <div>
                        <div
                          style={{
                            background: "#ffffff",
                            border: "1px solid #ced0d4",
                            borderRadius: 6,
                            padding: "10px 14px",
                            marginBottom: 10,
                          }}
                        >
                          <div style={{ fontSize: "0.8rem", color: "#65676b", fontWeight: 500, marginBottom: 4 }}>
                            Open text field
                          </div>
                          <div style={{ fontSize: "0.92rem", color: "#1c1e21", fontWeight: 500 }}>
                            {adsetName}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setAdsetEditingMode(true);
                            setTemplateModalOpen(true);
                          }}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#0064e1",
                            fontSize: "0.86rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            padding: 0,
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                        >
                          Edit template
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <input
                          type="text"
                          value={adsetName}
                          onChange={(e) => {
                            setAdsetName(e.target.value);
                            setIsAdsetTemplateActive(false);
                          }}
                          placeholder="Enter ad set name"
                          style={{
                            flex: 1,
                            padding: "8px 12px",
                            borderRadius: 6,
                            border: "1px solid #ced0d4",
                            fontSize: "0.9rem",
                            color: "#1c1e21",
                            outline: "none",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setAdsetEditingMode(true);
                            setTemplateModalOpen(true);
                          }}
                          style={{
                            padding: "8px 16px",
                            borderRadius: 6,
                            border: "1px solid #ced0d4",
                            background: "#ffffff",
                            color: "#1c1e21",
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
                        >
                          Create template
                        </button>
                      </div>
                    )}`;

if (content.includes(oldAdsetBlock)) {
  content = content.replace(oldAdsetBlock, newAdsetBlock);
  console.log("Adset card updated");
}

// 3. Update Ad name card
const oldAdBlock = `<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <input
                        type="text"
                        value={adName}
                        onChange={(e) => setAdName(e.target.value)}
                        placeholder="Enter ad name"
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
                    </div>`;

const newAdBlock = `{isAdTemplateActive ? (
                      <div>
                        <div
                          style={{
                            background: "#ffffff",
                            border: "1px solid #ced0d4",
                            borderRadius: 6,
                            padding: "10px 14px",
                            marginBottom: 10,
                          }}
                        >
                          <div style={{ fontSize: "0.8rem", color: "#65676b", fontWeight: 500, marginBottom: 4 }}>
                            Open text field
                          </div>
                          <div style={{ fontSize: "0.92rem", color: "#1c1e21", fontWeight: 500 }}>
                            {adName}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setAdEditingMode(true);
                            setTemplateModalOpen(true);
                          }}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#0064e1",
                            fontSize: "0.86rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            padding: 0,
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                        >
                          Edit template
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <input
                          type="text"
                          value={adName}
                          onChange={(e) => {
                            setAdName(e.target.value);
                            setIsAdTemplateActive(false);
                          }}
                          placeholder="Enter ad name"
                          style={{
                            flex: 1,
                            padding: "8px 12px",
                            borderRadius: 6,
                            border: "1px solid #ced0d4",
                            fontSize: "0.9rem",
                            color: "#1c1e21",
                            outline: "none",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setAdEditingMode(true);
                            setTemplateModalOpen(true);
                          }}
                          style={{
                            padding: "8px 16px",
                            borderRadius: 6,
                            border: "1px solid #ced0d4",
                            background: "#ffffff",
                            color: "#1c1e21",
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
                        >
                          Create template
                        </button>
                      </div>
                    )}`;

if (content.includes(oldAdBlock)) {
  content = content.replace(oldAdBlock, newAdBlock);
  console.log("Ad card updated");
}

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Step 3 completed');
