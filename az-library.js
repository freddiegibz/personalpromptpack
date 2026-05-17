const defaultConfig = {
  title: "Your A-Z Library Title",
  titleAccent: "Library",
  subtitle: "COMPLETE A-Z GUIDE",
  heroDescription:
    "Replace this with a compelling description of your A-Z library. What will readers discover? Why does it matter?",
  ctaText: "Your Call to Action",
  ctaUrl: "https://your-link-here.com",
  videoUrl: "https://www.youtube.com/watch?v=YOUR_VIDEO_ID",
  videoId: "YOUR_VIDEO_ID",
  videoThumb: null,
};

const defaultEntries = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => ({
  letter,
  name: `${letter} Entry`,
  icon: "✨",
  summary: `Replace with a one-line summary of your ${letter} entry.`,
  details: "Replace with a fuller explanation of why this matters.",
  example: "Replace with a concrete, real-world example.",
  whoItsFor: "Replace with who benefits most from this.",
}));

const defaultCategories = [
  { label: "All", filter: null },
  { label: "A-F", filter: ["A", "B", "C", "D", "E", "F"] },
  { label: "G-M", filter: ["G", "H", "I", "J", "K", "L", "M"] },
  { label: "N-S", filter: ["N", "O", "P", "Q", "R", "S"] },
  { label: "T-Z", filter: ["T", "U", "V", "W", "X", "Y", "Z"] },
];

const accentColors = ["#E8845C", "#4CAF80", "#7C6BC4"];

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getThumbSrc(config) {
  if (config.videoThumb) return config.videoThumb;
  if (config.videoId && config.videoId !== "YOUR_VIDEO_ID") {
    return `https://img.youtube.com/vi/${config.videoId}/hqdefault.jpg`;
  }
  return "";
}

function styles() {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;1,700&family=DM+Sans:wght@400;500;700&family=Space+Mono:wght@400;700&display=swap');
    .azlib, .azlib * { box-sizing: border-box; }
    .azlib { min-height: 100vh; background:#FAF6F1; font-family:'DM Sans',sans-serif; color:#2D2A33; }
    .azlib button, .azlib input { font: inherit; }
    .azlib-header, .azlib-footer { background:linear-gradient(135deg,#1E1B2E,#2A2540); color:white; }
    .azlib-shell { max-width:680px; margin:0 auto; padding:0 20px; }
    .azlib-header .azlib-shell { padding-top:48px; padding-bottom:40px; text-align:center; }
    .azlib-kicker, .azlib-meta { font-family:'Space Mono',monospace; text-transform:uppercase; letter-spacing:1.5px; }
    .azlib-kicker { color:#E8845C; font-size:10px; font-weight:700; margin:0 0 16px; }
    .azlib-title { font-family:'Playfair Display',serif; font-size:36px; line-height:1.12; margin:0 0 14px; }
    .azlib-title em { color:#E8845C; font-style:italic; }
    .azlib-desc { color:#C5C0CC; line-height:1.7; margin:0 auto 24px; max-width:520px; }
    .azlib-stats { display:flex; justify-content:center; gap:24px; flex-wrap:wrap; }
    .azlib-stat strong { display:block; font-family:'Playfair Display',serif; font-size:28px; color:#E8845C; }
    .azlib-stat span { display:block; color:#C5C0CC; font-size:9px; }
    .azlib-nav { padding:14px 20px; border-bottom:1px solid rgba(45,42,51,.06); }
    .azlib-letters, .azlib-filters { display:flex; gap:6px; flex-wrap:wrap; justify-content:center; }
    .azlib-letter, .azlib-filter, .azlib-save {
      border:0; cursor:pointer; transition:.2s ease;
    }
    .azlib-letter { width:34px; height:34px; border-radius:8px; background:rgba(45,42,51,.04); font-family:'Space Mono',monospace; font-weight:700; }
    .azlib-main { padding-top:28px; }
    .azlib-video, .azlib-about, .azlib-card, .azlib-empty { background:#fff; box-shadow:0 1px 4px rgba(45,42,51,.03); }
    .azlib-video { display:block; max-width:480px; margin:0 auto 28px; border:1px solid rgba(45,42,51,.08); border-radius:14px; overflow:hidden; color:inherit; text-decoration:none; }
    .azlib-thumb { aspect-ratio:16/9; background:linear-gradient(135deg,#1E1B2E,#2A2540); display:grid; place-items:center; position:relative; }
    .azlib-thumb img { width:100%; height:100%; object-fit:cover; display:block; }
    .azlib-play { position:absolute; width:52px; height:52px; border-radius:50%; background:#E8845C; display:grid; place-items:center; }
    .azlib-video-copy { padding:10px 14px; color:#6B6575; }
    .azlib-about { border-left:3px solid #E8845C; border-radius:0 12px 12px 0; padding:16px 20px; margin-bottom:24px; }
    .azlib-search { width:100%; min-height:48px; border-radius:10px; border:1px solid rgba(45,42,51,.1); padding:14px 16px; margin-bottom:14px; }
    .azlib-filters { justify-content:flex-start; margin-bottom:20px; }
    .azlib-filter { border:1px solid rgba(45,42,51,.08); background:#fff; border-radius:20px; padding:8px 14px; }
    .azlib-filter.is-active { color:#E8845C; border-color:#E8845C; background:rgba(232,132,92,.12); }
    .azlib-count { font-family:'Space Mono',monospace; font-size:10px; margin-bottom:16px; color:#6B6575; text-transform:uppercase; }
    .azlib-list { display:flex; flex-direction:column; gap:10px; padding-bottom:40px; }
    .azlib-card { border:1px solid rgba(45,42,51,.06); border-left:4px solid var(--accent); border-radius:0 14px 14px 0; overflow:hidden; }
    .azlib-card.is-open { box-shadow:0 4px 16px rgba(45,42,51,.08); }
    .azlib-card-head { display:flex; align-items:center; gap:14px; padding:16px 18px; cursor:pointer; }
    .azlib-circle { width:44px; height:44px; border-radius:50%; background:var(--accent); color:#fff; display:grid; place-items:center; font-family:'Space Mono',monospace; font-weight:700; flex:none; }
    .azlib-card-copy { flex:1; min-width:0; }
    .azlib-card-copy h3 { font-family:'Playfair Display',serif; font-size:16px; margin:0 0 3px; }
    .azlib-card-copy p { margin:0; color:#4A4555; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .azlib-card.is-open .azlib-card-copy p { white-space:normal; }
    .azlib-save { width:40px; height:40px; border-radius:8px; background:rgba(45,42,51,.04); }
    .azlib-save.is-saved { color:#4CAF80; background:rgba(76,175,128,.12); }
    .azlib-details { padding:0 18px 20px; }
    .azlib-detail-main, .azlib-detail-grid > div { padding:14px 16px; border-radius:12px; }
    .azlib-detail-main { border-left:3px solid var(--accent); background:color-mix(in srgb, var(--accent) 8%, white); margin-bottom:12px; }
    .azlib-detail-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:10px; }
    .azlib-detail-grid > div { border:1px solid rgba(45,42,51,.06); background:#fff; }
    .azlib-detail-title { font-family:'Space Mono',monospace; text-transform:uppercase; letter-spacing:1.5px; font-size:10px; margin:0 0 6px; }
    .azlib-footer .azlib-shell { padding-top:48px; padding-bottom:48px; text-align:center; }
    .azlib-actions { display:flex; gap:10px; flex-wrap:wrap; justify-content:center; }
    .azlib-btn { display:inline-flex; align-items:center; justify-content:center; min-height:48px; padding:14px 24px; border-radius:999px; text-decoration:none; }
    .azlib-btn-secondary { color:#C5C0CC; border:1px solid rgba(255,255,255,.12); background:rgba(255,255,255,.06); }
    .azlib-btn-primary { color:#fff; background:#E8845C; font-weight:700; }
    .azlib-empty { text-align:center; padding:32px; border-radius:12px; color:#6B6575; }
    @media (max-width:520px){ .azlib-title{font-size:26px}.azlib-detail-grid{grid-template-columns:1fr}.azlib-card-head{padding:14px 12px}.azlib-actions{flex-direction:column}.azlib-btn{width:100%} }
  `;
}

export function createAZLibrary(options = {}) {
  const config = { ...defaultConfig, ...(options.config || {}) };
  const entries = options.entries?.length ? options.entries : defaultEntries;
  const categories = options.categories?.length ? options.categories : defaultCategories;
  const mount = typeof options.mount === "string" ? document.querySelector(options.mount) : options.mount;
  if (!mount) throw new Error("createAZLibrary requires a valid mount element.");

  const state = { expandedIndex: null, activeCategory: 0, searchTerm: "", saved: new Set() };
  const uniqueLetters = [...new Set(entries.map((entry) => entry.letter))];

  const render = () => {
    const activeFilter = categories[state.activeCategory]?.filter;
    const filtered = entries.filter((entry) => {
      const text = `${entry.letter} ${entry.name} ${entry.summary}`.toLowerCase();
      return (!activeFilter || activeFilter.includes(entry.letter)) && text.includes(state.searchTerm.toLowerCase());
    });
    const thumb = getThumbSrc(config);

    mount.innerHTML = `
      <style>${styles()}</style>
      <div class="azlib">
        <header class="azlib-header">
          <div class="azlib-shell">
            <p class="azlib-kicker">${escapeHtml(config.subtitle)}</p>
            <h1 class="azlib-title">${escapeHtml(config.title).replace(escapeHtml(config.titleAccent), `<em>${escapeHtml(config.titleAccent)}</em>`)}</h1>
            <p class="azlib-desc">${escapeHtml(config.heroDescription)}</p>
            <div class="azlib-stats">
              <div class="azlib-stat"><strong>${uniqueLetters.length}</strong><span>Letters</span></div>
              <div class="azlib-stat"><strong>${entries.length}</strong><span>Entries</span></div>
              <div class="azlib-stat"><strong>${state.saved.size}</strong><span>Saved</span></div>
            </div>
          </div>
        </header>
        <nav class="azlib-nav"><div class="azlib-letters">${uniqueLetters
          .map((letter, index) => `<button class="azlib-letter" data-letter="${letter}" style="color:${accentColors[index % accentColors.length]}">${letter}</button>`)
          .join("")}</div></nav>
        <main class="azlib-shell azlib-main">
          ${
            config.videoUrl
              ? `<a class="azlib-video" href="${escapeHtml(config.videoUrl)}" target="_blank" rel="noopener noreferrer">
                  <div class="azlib-thumb">
                    ${thumb ? `<img src="${escapeHtml(thumb)}" alt="">` : `<span class="azlib-meta">Video thumbnail</span>`}
                    <span class="azlib-play">▶</span>
                  </div>
                  <div class="azlib-video-copy">▶ Watch the full video</div>
                </a>`
              : ""
          }
          <section class="azlib-about">
            <p class="azlib-meta">What is this</p>
            <p>This is your A-Z library. Browse by letter, search by keyword, or filter by category. Tap any entry to expand the full details.</p>
          </section>
          <input class="azlib-search" type="search" placeholder="Search by name, keyword, or letter..." value="${escapeHtml(state.searchTerm)}">
          <div class="azlib-filters">${categories
            .map((category, index) => `<button class="azlib-filter ${index === state.activeCategory ? "is-active" : ""}" data-category="${index}">${escapeHtml(category.label)}</button>`)
            .join("")}</div>
          <div class="azlib-count">${filtered.length} entr${filtered.length === 1 ? "y" : "ies"} shown${state.saved.size ? ` · ${state.saved.size} saved` : ""}</div>
          <section class="azlib-list">
            ${
              filtered.length
                ? filtered
                    .map((entry) => {
                      const globalIndex = entries.indexOf(entry);
                      const accent = accentColors[globalIndex % accentColors.length];
                      const open = state.expandedIndex === globalIndex;
                      const saved = state.saved.has(globalIndex);
                      return `
                        <article class="azlib-card ${open ? "is-open" : ""}" id="letter-${escapeHtml(entry.letter)}" style="--accent:${accent}">
                          <div class="azlib-card-head" data-expand="${globalIndex}">
                            <div class="azlib-circle">${escapeHtml(entry.letter)}</div>
                            <div class="azlib-card-copy">
                              <h3>${escapeHtml(entry.icon)} ${escapeHtml(entry.name)}</h3>
                              <p>${escapeHtml(entry.summary)}</p>
                            </div>
                            <button class="azlib-save ${saved ? "is-saved" : ""}" data-save="${globalIndex}">${saved ? "★" : "☆"}</button>
                          </div>
                          ${
                            open
                              ? `<div class="azlib-details">
                                  <div class="azlib-detail-main">
                                    <p class="azlib-detail-title" style="color:${accent}">Why it matters</p>
                                    <p>${escapeHtml(entry.details)}</p>
                                  </div>
                                  <div class="azlib-detail-grid">
                                    <div><p class="azlib-detail-title" style="color:#4CAF80">Example</p><p>${escapeHtml(entry.example)}</p></div>
                                    <div><p class="azlib-detail-title" style="color:#7C6BC4">Who it is for</p><p>${escapeHtml(entry.whoItsFor)}</p></div>
                                  </div>
                                </div>`
                              : ""
                          }
                        </article>`;
                    })
                    .join("")
                : `<div class="azlib-empty">No entries match your search.</div>`
            }
          </section>
        </main>
        <footer class="azlib-footer">
          <div class="azlib-shell">
            <p class="azlib-kicker">Ready to take action?</p>
            <p class="azlib-desc">Pick the entries that resonate with you. Start with one, build from there.</p>
            <div class="azlib-actions">
              ${config.videoUrl ? `<a class="azlib-btn azlib-btn-secondary" href="${escapeHtml(config.videoUrl)}" target="_blank" rel="noopener noreferrer">▶ Watch Video</a>` : ""}
              <a class="azlib-btn azlib-btn-primary" href="${escapeHtml(config.ctaUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(config.ctaText)} →</a>
            </div>
          </div>
        </footer>
      </div>`;
  };

  mount.addEventListener("input", (event) => {
    if (event.target.matches(".azlib-search")) {
      state.searchTerm = event.target.value;
      render();
    }
  });

  mount.addEventListener("click", (event) => {
    const save = event.target.closest("[data-save]");
    const expand = event.target.closest("[data-expand]");
    const category = event.target.closest("[data-category]");
    const letter = event.target.closest("[data-letter]");

    if (save) {
      const index = Number(save.dataset.save);
      state.saved.has(index) ? state.saved.delete(index) : state.saved.add(index);
      render();
      return;
    }
    if (expand) {
      const index = Number(expand.dataset.expand);
      state.expandedIndex = state.expandedIndex === index ? null : index;
      render();
      return;
    }
    if (category) {
      state.activeCategory = Number(category.dataset.category);
      state.searchTerm = "";
      render();
      return;
    }
    if (letter) {
      state.activeCategory = 0;
      state.searchTerm = "";
      render();
      mount.querySelector(`#letter-${CSS.escape(letter.dataset.letter)}`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  });

  render();
  return { render, state, config, entries, categories };
}

export default createAZLibrary;
