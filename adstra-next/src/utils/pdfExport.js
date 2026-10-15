// Clean A4 PDF export for on-screen report documents.
//
// html2pdf's built-in page-break modes ("avoid-all" especially) inject spacer
// divs into flex rows and measure layout that html2canvas later ignores, which
// shifts headers and leaves blank gaps. Instead we clone the report at the exact
// A4 content width, paginate it ourselves (pushing blocks / table rows that
// straddle a page edge onto the next page), then let html2pdf only slice.

const A4 = { w: 210, h: 297 };

const SPACER_HOSTS = new Set(["block", "flow-root", "list-item"]);
const WALKABLE = new Set(["block", "flow-root", "list-item", "table", "table-row-group", "table-header-group", "table-footer-group"]);

const isHeading = (el) =>
  /^H[1-6]$/.test(el.tagName) || (el.querySelector("h1,h2,h3,h4,h5,h6") && el.getBoundingClientRect().height < 80);

const isCard = (cs) =>
  ["Top", "Right", "Bottom", "Left"].every((side) => parseFloat(cs[`border${side}Width`]) > 0) ||
  (cs.backgroundColor !== "rgba(0, 0, 0, 0)" && cs.backgroundColor !== "transparent" && cs.display !== "table");

const canHostSpacer = (parent) => {
  const cs = getComputedStyle(parent);
  return SPACER_HOSTS.has(cs.display) || (cs.display === "flex" && cs.flexDirection.startsWith("column"));
};

function prepareClone(clone, innerW) {
  clone.removeAttribute("id");
  clone.querySelectorAll(".no-print").forEach((el) => el.remove());

  // The outer card chrome (border, radius, shadow, padding) makes no sense on paper.
  Object.assign(clone.style, {
    border: "none",
    borderRadius: "0",
    boxShadow: "none",
    padding: "0",
    margin: "0",
    maxWidth: "none",
    width: "100%",
    background: "#ffffff",
  });

  // Charts rendered at screen width would overflow the narrower page.
  clone.querySelectorAll("svg.recharts-surface").forEach((svg) => {
    if (svg.getAttribute("width") > innerW) {
      svg.style.width = "100%";
      svg.style.height = "auto";
      const wrap = svg.closest(".recharts-wrapper");
      if (wrap) Object.assign(wrap.style, { width: "100%", height: "auto" });
    }
  });
}

// html2canvas paints padded inline backgrounds (pills/badges) offset from their
// text; inline-block renders them correctly.
function fixInlinePills(root) {
  root.querySelectorAll("span, strong, b, em").forEach((el) => {
    const cs = getComputedStyle(el);
    if (cs.display === "inline" && cs.backgroundColor !== "rgba(0, 0, 0, 0)" && cs.backgroundColor !== "transparent") {
      el.style.display = "inline-block";
      el.style.lineHeight = "1.4";
    }
  });
}

// Small flex boxes that centre a bare text run (bar segments, counters) get their
// text drawn low by html2canvas; pinning line-height to the box height centres it.
function fixCenteredText(root) {
  root.querySelectorAll("*").forEach((el) => {
    if (el.children.length || !el.textContent.trim()) return;
    const cs = getComputedStyle(el);
    if (!cs.display.includes("flex") || cs.alignItems !== "center") return;
    const inner = el.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    if (inner > 0 && inner <= 40) el.style.lineHeight = `${inner}px`;
  });
}

function waitForImages(root) {
  const pending = Array.from(root.querySelectorAll("img")).filter((img) => !img.complete);
  return Promise.all(
    pending.map((img) => new Promise((resolve) => {
      img.addEventListener("load", resolve, { once: true });
      img.addEventListener("error", resolve, { once: true });
    }))
  );
}

function paginate(root, pageH) {
  const topOf = (el) => el.getBoundingClientRect().top - root.getBoundingClientRect().top;
  // +2px cushion absorbs sub-pixel rounding between our layout and html2pdf's canvas slicing.
  const nextPageStart = (top) => (Math.floor(top / pageH) + 1) * pageH + 2;

  // Insert `spacer` before `target`, sized so `alignEl` (default target) lands on the next page.
  const pushTo = (spacer, target, want, alignEl = target) => {
    target.parentNode.insertBefore(spacer, target);
    const setH = (h) => {
      const cell = spacer.tagName === "TR" ? spacer.firstChild : spacer;
      cell.style.height = `${Math.max(0, h)}px`;
    };
    setH(0);
    setH(want - topOf(alignEl));
  };

  const pushBlock = (kids, i) => {
    let target = kids[i];
    const prev = kids[i - 1];
    // Keep a section heading with the block that follows it.
    if (prev && isHeading(prev)) {
      const prevTop = topOf(prev);
      if (prevTop % pageH > 1 && Math.floor(prevTop / pageH) === Math.floor(topOf(target) / pageH)) target = prev;
    }
    const spacer = document.createElement("div");
    spacer.setAttribute("data-pdf-spacer", "");
    pushTo(spacer, target, nextPageStart(topOf(target)));
  };

  const pushRow = (tr) => {
    const table = tr.closest("table");
    const group = tr.parentElement;
    // First body row would be orphaned from its header: move the whole table instead.
    if (!tr.previousElementSibling && group.tagName === "TBODY" && table.getBoundingClientRect().height <= pageH && canHostSpacer(table.parentElement)) {
      const kids = Array.from(table.parentElement.children);
      pushBlock(kids, kids.indexOf(table));
      return;
    }
    const want = nextPageStart(topOf(tr));
    const spacer = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 99;
    td.style.cssText = "padding:0;border:none;background:#ffffff;";
    spacer.appendChild(td);

    // Repeat the column header on the new page.
    let alignEl = tr;
    if (group.tagName === "TBODY" && table.tHead) {
      const headRows = Array.from(table.tHead.rows).map((r) => r.cloneNode(true));
      headRows.forEach((r) => group.insertBefore(r, tr));
      alignEl = headRows[0] || tr;
      pushTo(spacer, alignEl, want, alignEl);
      return;
    }
    pushTo(spacer, tr, want);
  };

  const walk = (parent) => {
    const kids = Array.from(parent.children);
    for (let i = 0; i < kids.length; i++) {
      const el = kids[i];
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.position === "absolute" || cs.position === "fixed") continue;
      const rect = el.getBoundingClientRect();
      if (!rect.height) continue;
      const top = topOf(el);
      if (Math.floor(top / pageH) === Math.floor((top + rect.height - 1) / pageH)) continue;

      if (el.tagName === "TR") {
        pushRow(el);
        continue;
      }
      const isRowGroup = /^table-(row|header|footer)-group$/.test(cs.display);
      const walkable = WALKABLE.has(cs.display) && el.children.length > 0;
      // Keep cards and short blocks whole; let tall plain sections split between their
      // children so a big section doesn't leave half a page blank.
      const keepWhole = !walkable || isCard(cs) || rect.height <= pageH * 0.3;
      if (!isRowGroup && keepWhole && rect.height <= pageH && canHostSpacer(parent)) {
        pushBlock(kids, i);
        continue;
      }
      if (walkable) walk(el);
    }
  };

  walk(root);
}

export async function downloadElementAsPdf(source, { filename, marginMm = 10, scale = 2 } = {}) {
  const html2pdf = (await import("html2pdf.js")).default;

  const innerWmm = A4.w - marginMm * 2;
  const ratio = (A4.h - marginMm * 2) / innerWmm;

  // Lay out at the same width html2pdf uses for its container (inner page width in mm).
  const stage = document.createElement("div");
  stage.style.cssText = `position:absolute;left:-10000px;top:0;width:${innerWmm}mm;background:#ffffff;`;
  const clone = source.cloneNode(true);
  clone.classList.add("pdf-export-root");
  stage.appendChild(clone);
  document.body.appendChild(stage);

  // html2canvas finds the text baseline by appending a 1x1 probe <img> (data:image/gif) to
  // document.body. Tailwind's preflight `img { display: block }` drops that probe onto its own
  // line, so every text run gets painted about one line too low. Keep the probe inline.
  const fixStyle = document.createElement("style");
  fixStyle.textContent = 'body > div > img[src^="data:image/gif"] { display: inline !important; }';
  document.head.appendChild(fixStyle);

  try {
    const innerW = stage.getBoundingClientRect().width;
    // Mirror html2pdf's slicing: floor(canvasWidth * ratio) canvas px per page.
    const pageH = Math.floor(Math.round(innerW * scale) * ratio) / scale;
    prepareClone(clone, innerW);
    fixInlinePills(clone);
    fixCenteredText(clone);
    await waitForImages(clone);
    if (document.fonts?.ready) await document.fonts.ready;
    paginate(clone, pageH);

    await html2pdf()
      .set({
        margin: marginMm,
        filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale, useCORS: true, logging: false, backgroundColor: "#ffffff", scrollX: 0, scrollY: 0 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: [] },
      })
      .from(clone)
      .save();
  } finally {
    stage.remove();
    fixStyle.remove();
  }
}
