const fs = require('fs');
const file = 'c:\\Projects\\Adstra_Digital\\adstra-next\\src\\components\\admin_side\\SocialManagement\\components\\WorkflowStageSection.jsx';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

// The broken code starts right after:
//       if (formatFilter !== "all" && p.post_type !== formatFilter) {
//         return false;
//       }
// (Lines 234, 235)

const replacement = \`      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = (p.title || "").toLowerCase().includes(q);
        const captionMatch = (p.primary_caption || "").toLowerCase().includes(q);
        const hookMatch = (p.script_notes || "").toLowerCase().includes(q);
        const clientMatch = (p.client_name || "").toLowerCase().includes(q);
        if (!titleMatch && !captionMatch && !hookMatch && !clientMatch) return false;
      }
      return true;
    });
  }, [posts, stageMeta, stageId, selectedClientId, scriptSubFilter, formatFilter, searchQuery, showArchived]);

  // Transition Handler
  const handleTransition = async (post, targetStage, actionType, notes = "", extraData = {}) => {
    setSubmittingAction(true);
    try {
      const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      let actorName = "Creative Team";
      let actorRole = "Team Member";
      if (userStr) {
        try {
          const parsed = JSON.parse(userStr);
          actorName = parsed.fullname || parsed.name || parsed.username || actorName;
          actorRole = parsed.role || actorRole;
        } catch (err) {}
      }
\`;

// Let's find the line index for "return false;" inside the format filter (which is line 235)
// and the line index for "await axios.post..." (which is line 241)

let startIndex = -1;
let endIndex = -1;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('if (formatFilter !== "all" && p.post_type !== formatFilter) {')) {
        startIndex = i + 1; // The line with 'return false;'
        break;
    }
}

for (let i = startIndex + 1; i < lines.length; i++) {
    if (lines[i].includes('await axios.post(')) {
        endIndex = i; // The line with 'await axios.post'
        break;
    }
}

if (startIndex !== -1 && endIndex !== -1) {
    const newLines = [
        ...lines.slice(0, startIndex), // Keep up to `if (formatFilter...)`
        replacement, // Insert replacement
        ...lines.slice(endIndex) // Keep from `await axios.post` onwards
    ];
    fs.writeFileSync(file, newLines.join('\\n'));
    console.log("Successfully spliced the file!");
} else {
    console.log("Could not find start or end index.");
}
