const fs = require('fs');
const file = 'c:\\Projects\\Adstra_Digital\\adstra-next\\src\\components\\admin_side\\SocialManagement\\components\\WorkflowStageSection.jsx';
let content = fs.readFileSync(file, 'utf8');

const broken = `      // Format filter
      if (formatFilter !== "all" && p.post_type !== formatFilter) {
        return false;
          actorName = parsed.fullname || parsed.name || parsed.username || actorName;
          actorRole = parsed.role || actorRole;
        } catch (err) {}
      }`;

const fixed = `      // Format filter
      if (formatFilter !== "all" && p.post_type !== formatFilter) {
        return false;
      }
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
          actorName = parsed.fullname || parsed.name || parsed.username || actorName;
          actorRole = parsed.role || actorRole;
        } catch (err) {}
      }`;

content = content.replace(broken, fixed);
fs.writeFileSync(file, content);
console.log("Fixed dependencies and restored deleted lines successfully!");
