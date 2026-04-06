const serviceArtPresets = {
  "video-production": {
    eyebrow: "Studio Build",
    palette: ["#07131f", "#12253d", "#f1b545", "#f6ecd6"],
  },
  "social-media-marketing": {
    eyebrow: "Social Growth",
    palette: ["#081722", "#14384f", "#6dd5ff", "#f5fafc"],
  },
  "lead-generation-performance-marketing": {
    eyebrow: "Demand Engine",
    palette: ["#08131f", "#1d2c4e", "#7de2a1", "#edf8f1"],
  },
  branding: {
    eyebrow: "Brand System",
    palette: ["#110d1f", "#2e2146", "#f7b85c", "#fbf1df"],
  },
  "seo-website-optimization": {
    eyebrow: "Search Lift",
    palette: ["#07161d", "#163542", "#9fe870", "#eef7e7"],
  },
  "analytics-reporting": {
    eyebrow: "Insight Layer",
    palette: ["#0a1221", "#1d2d54", "#8db4ff", "#eef2fb"],
  },
  "content-marketing": {
    eyebrow: "Story Engine",
    palette: ["#151120", "#2f2543", "#ff9070", "#fff1eb"],
  },
  "google-ads": {
    eyebrow: "Paid Search",
    palette: ["#091425", "#17365e", "#ffd155", "#fff5db"],
  },
  "web-development": {
    eyebrow: "Digital Build",
    palette: ["#07141f", "#173148", "#7cd8ff", "#edf8fc"],
  },
};

const mojibakeReplacements = [
  [/\u00e2\u20ac\u2122/g, "'"],
  [/\u00e2\u20ac\u0153/g, '"'],
  [/\u00e2\u20ac\u009d/g, '"'],
  [/\u00e2\u20ac\u201c/g, "-"],
  [/\u00e2\u20ac\u201d/g, "-"],
  [/\u00c2/g, ""],
];

function escapeXml(value = "") {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function cleanCopy(value = "") {
  const normalized = mojibakeReplacements.reduce(
    (current, [pattern, replacement]) => current.replace(pattern, replacement),
    value
  );

  return normalized.replace(/\s+/g, " ").trim();
}

function wrapTitle(title, maxChars = 16) {
  const words = cleanCopy(title).split(" ").filter(Boolean);
  const lines = [];
  let currentLine = "";

  words.forEach((word) => {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (candidate.length > maxChars && currentLine) {
      lines.push(currentLine);
      currentLine = word;
      return;
    }
    currentLine = candidate;
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.slice(0, 3);
}

function getInitials(title = "") {
  return cleanCopy(title)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function getKeywords(service) {
  const entries = service.services || service.points || [];

  if (!entries.length) {
    return ["Strategy", "Creative", "Growth"];
  }

  return entries
    .slice(0, 3)
    .map((entry) => (typeof entry === "string" ? entry : entry.title))
    .map((text) => cleanCopy(text))
    .map((text) => {
      if (text.length <= 26) {
        return text;
      }
      const words = text.split(" ");
      return words.slice(0, 3).join(" ");
    });
}

function createPill(text, y, fill, textColor) {
  const width = Math.max(174, Math.min(276, text.length * 10 + 34));

  return `
    <rect x="58" y="${y}" width="${width}" height="48" rx="24" fill="${fill}" />
    <text x="82" y="${y + 30}" fill="${textColor}" font-size="19" font-weight="600" font-family="Arial, Helvetica, sans-serif">${escapeXml(
      text
    )}</text>
  `;
}

export function getServiceCardArt(service) {
  const preset =
    serviceArtPresets[service.slug] || serviceArtPresets["web-development"];
  const [bgStart, bgEnd, accent, ink] = preset.palette;
  const lines = wrapTitle(service.title);
  const initials = getInitials(service.title);
  const keywords = getKeywords(service);
  const titleText = lines
    .map(
      (line, index) => `
        <text
          x="58"
          y="${230 + index * 70}"
          fill="${ink}"
          font-size="${index === 0 ? 54 : 50}"
          font-weight="800"
          letter-spacing="-1.4"
          font-family="Arial, Helvetica, sans-serif"
        >${escapeXml(line)}</text>
      `
    )
    .join("");
  const pills = keywords
    .map((keyword, index) =>
      createPill(keyword, 700 + index * 64, "rgba(255,255,255,0.08)", ink)
    )
    .join("");

  const svg = `
    <svg width="720" height="1100" viewBox="0 0 720 1100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="card-bg-${service.slug}" x1="96" y1="58" x2="624" y2="1036" gradientUnits="userSpaceOnUse">
          <stop stop-color="${bgStart}" />
          <stop offset="1" stop-color="${bgEnd}" />
        </linearGradient>
        <radialGradient id="card-glow-${service.slug}" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(564 170) rotate(132.8) scale(412 354)">
          <stop stop-color="${accent}" stop-opacity="0.94" />
          <stop offset="1" stop-color="${accent}" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="720" height="1100" rx="44" fill="url(#card-bg-${service.slug})" />
      <rect x="28" y="28" width="664" height="1044" rx="32" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.12)" />
      <circle cx="560" cy="170" r="240" fill="url(#card-glow-${service.slug})" />
      <path d="M560 82C648 188 678 316 650 464C618 642 492 756 348 818" stroke="rgba(255,255,255,0.12)" stroke-width="2" stroke-linecap="round" />
      <path d="M86 924C170 794 250 732 358 676C468 618 560 530 618 376" stroke="rgba(255,255,255,0.08)" stroke-width="2" stroke-linecap="round" />
      <rect x="58" y="70" width="174" height="38" rx="19" fill="rgba(255,255,255,0.08)" />
      <text x="84" y="95" fill="${accent}" font-size="19" font-weight="700" letter-spacing="1.8" font-family="Arial, Helvetica, sans-serif">${escapeXml(
        preset.eyebrow.toUpperCase()
      )}</text>
      ${titleText}
      <text x="58" y="438" fill="rgba(255,255,255,0.66)" font-size="24" font-weight="500" font-family="Arial, Helvetica, sans-serif">${escapeXml(
        cleanCopy(service.tagline || "Adstra Digital")
      )}</text>
      <text x="50" y="1006" fill="rgba(255,255,255,0.09)" font-size="220" font-weight="900" letter-spacing="-12" font-family="Arial, Helvetica, sans-serif">${escapeXml(
        initials
      )}</text>
      <rect x="58" y="614" width="144" height="3" rx="1.5" fill="${accent}" />
      <text x="58" y="664" fill="${ink}" font-size="22" font-weight="700" letter-spacing="2.8" font-family="Arial, Helvetica, sans-serif">FOCUS AREAS</text>
      ${pills}
      <text x="58" y="1040" fill="rgba(255,255,255,0.56)" font-size="18" font-weight="600" letter-spacing="2.4" font-family="Arial, Helvetica, sans-serif">ADSTRA DIGITAL</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
