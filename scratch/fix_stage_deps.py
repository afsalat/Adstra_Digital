import os

filepath = r"c:\Projects\Adstra_Digital\adstra-next\src\components\admin_side\SocialManagement\components\WorkflowStageSection.jsx"

with open(filepath, "r", encoding="utf-8") as f:
    lines = f.readlines()

start_index = -1
end_index = -1

for i, line in enumerate(lines):
    if 'if (formatFilter !== "all" && p.post_type !== formatFilter) {' in line:
        start_index = i + 1  # The line with `return false;`
        break

for i in range(start_index + 1, len(lines)):
    if 'await axios.post(' in lines[i]:
        end_index = i  # The line with `await axios.post`
        break

replacement = """        return false;
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
          const parsed = JSON.parse(userStr);
          actorName = parsed.fullname || parsed.name || parsed.username || actorName;
          actorRole = parsed.role || actorRole;
        } catch (err) {}
      }

      """

if start_index != -1 and end_index != -1:
    new_lines = lines[:start_index] + [replacement] + lines[end_index:]
    with open(filepath, "w", encoding="utf-8") as f:
        f.writelines(new_lines)
    print("Successfully spliced the file!")
else:
    print("Could not find start or end index.")
