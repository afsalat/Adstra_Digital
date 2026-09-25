const fs = require('fs');
const file = 'c:\\Projects\\Adstra_Digital\\adstra-next\\src\\components\\admin_side\\SocialManagement\\components\\WorkflowStageSection.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add state variable
if (!content.includes('const [showArchived, setShowArchived]')) {
    const targetState = 'const [copiedToken, setCopiedToken] = useState(null);';
    content = content.replace(targetState, targetState + '\n  const [showArchived, setShowArchived] = useState(false);');
}

// 2. Modify isStatusMatch
if (!content.includes('stageId === "published" && showArchived')) {
    const targetFilter = 'const isStatusMatch = stageMeta.statuses.includes(p.status);';
    const replacementFilter = 'const isStatusMatch = stageId === "published" && showArchived ? p.status === "archived" : stageMeta.statuses.includes(p.status);';
    content = content.replace(targetFilter, replacementFilter);
}

// 3. Add toggle buttons for Stage 7
if (!content.includes('setShowArchived(false)')) {
    const targetUI = '          </div>\n\n          {stageId === "scripts" && (';
    const replacementUI = `          </div>

          {stageId === "published" && (
            <div style={{ display: "flex", background: "#f1f5f9", padding: 3, borderRadius: 10, border: "1px solid #e2e8f0" }}>
              <button
                onClick={() => setShowArchived(false)}
                style={{
                  border: "none",
                  padding: "6px 14px",
                  borderRadius: 8,
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  background: !showArchived ? "#10b981" : "transparent",
                  color: !showArchived ? "#ffffff" : "#64748b",
                  transition: "all 0.15s ease",
                }}
              >
                <Send size={14} /> Live Posts
              </button>
              <button
                onClick={() => setShowArchived(true)}
                style={{
                  border: "none",
                  padding: "6px 14px",
                  borderRadius: 8,
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  background: showArchived ? "#f43f5e" : "transparent",
                  color: showArchived ? "#ffffff" : "#64748b",
                  transition: "all 0.15s ease",
                }}
              >
                <Archive size={14} /> Archived
              </button>
            </div>
          )}

          {stageId === "scripts" && (`
    content = content.replace(targetUI, replacementUI);
}

fs.writeFileSync(file, content);
console.log('Patch complete.');
