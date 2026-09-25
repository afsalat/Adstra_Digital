const fs = require('fs');
const file = 'c:\\Projects\\Adstra_Digital\\adstra-next\\src\\components\\admin_side\\SocialManagement\\components\\WorkflowStageSection.jsx';
let content = fs.readFileSync(file, 'utf8');

// Using regex to match from `const titleMatch` to `let actorName = "Creative Team";`
const regex = /const titleMatch = \(p\.title \|\| ""\)\.toLowerCase\(\)\.includes\(q\);\s*const userStr = typeof window !== "undefined" \? localStorage\.getItem\("user"\) : null;\s*let actorName = "Creative Team";/;

const replacement = \`const titleMatch = (p.title || "").toLowerCase().includes(q);
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
      let actorName = "Creative Team";\`;

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(file, content);
    console.log("Fixed dependencies and restored deleted lines successfully!");
} else {
    console.log("Could not find the exact broken target string with Regex.");
}
