/* =========================================================
   Shared helpers used across all pages.
   Loaded after data.js and carousel.js, before the
   page-specific script at the bottom of each HTML file.
   ========================================================= */

// Some browsers restore a page's last scroll position on navigation
// (back/forward, or reloading a page you'd scrolled down) instead of
// starting at the top — which reads as "the new page didn't scroll
// up" even though it's a full, separate page. Opt out of that
// automatic restore and force every normal page load (i.e. one that
// isn't jumping to a #section on the page) to start at the top.
if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}
window.addEventListener("pageshow", () => {
  if (!location.hash) window.scrollTo(0, 0);
});

const CATEGORY_LABELS = {
  journalism: "Dramatic",
  essays: "Epic",
  creative: "Lyric"
};

const CATEGORY_TAG_CLASS = {
  journalism: "tag--journalism",
  essays: "tag--essays",
  creative: "tag--creative"
};

// The kicker label above each category page's pushed/featured
// piece — a different descriptor per section (Lyric's own
// "Featured collection" kicker for the well – assembled showcase
// lives directly in lyric.html, since that block isn't built from
// a single piece via featureCardHTML like Dramatic/Epic are).
const CATEGORY_FEATURE_KICKER = {
  journalism: "Latest",
  essays: "Spotlight Feature"
};

// Each category now has its own page (see dramatic.html /
// epic.html / lyric.html) rather than one shared writing.html.
const CATEGORY_PAGES = {
  journalism: "dramatic.html",
  essays: "epic.html",
  creative: "lyric.html"
};

function formatDate(iso) {
  if (!iso || /^[A-Za-z]/.test(iso)) return iso; // already-human string like "TBC 2026"
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d)) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function pieceHref(piece) {
  return piece.external ? piece.external : `piece.html?id=${encodeURIComponent(piece.id)}`;
}

function pieceCardHTML(piece) {
  const tagClass = CATEGORY_TAG_CLASS[piece.category] || "";
  const label = CATEGORY_LABELS[piece.category] || piece.category;
  const external = piece.external ? ` target="_blank" rel="noopener"` : "";
  return `
    <a class="piece-card" href="${pieceHref(piece)}"${external}>
      <div class="piece-card__media">
        <img src="${piece.cover}" alt="" loading="lazy">
      </div>
      <div class="piece-card__body">
        <div class="piece-card__meta">
          <span class="tag ${tagClass}">${label}</span>
          ${piece.tag ? `<span class="tag-chip">${piece.tag}</span>` : ""}
          <time datetime="${piece.date}">${formatDate(piece.date)}</time>
        </div>
        <h3>${piece.title}</h3>
        <p>${piece.dek}</p>
        <span class="piece-card__read">${piece.external ? "Read on " + (piece.outlet || "site") : "Read"}</span>
      </div>
    </a>
  `;
}

// Category page (dramatic.html / epic.html / lyric.html): the most
// recent piece in that category, shown big — cover left, everything
// else (the same tag+date/title/dek/read a piece-card carries) in
// the space to the right. Same underlying markup shape as
// pieceCardHTML above (and the homepage's "Latest" card), just laid
// out as one wide row instead of a stacked card, so it reads as the
// homepage's own "Latest" treatment scaled up rather than a new
// component.
//
// Unlike pieceCardHTML, this ISN'T one single all-wrapping <a> —
// the two columns here sit far enough apart (and with enough of a
// gap between them) that a single full-card anchor made the empty
// space between the cover and the text read as clickable too. So the
// outer .category-feature is a plain (non-link) wrapper, with three
// separate <a>s inside it: the cover image, the title/subtitle/dek
// text block, and "Read" itself (styled as its own hero-style
// button — see .category-feature__read in style.css — sitting just
// below the dek with its own generous top margin, not nested inside
// the text block's anchor). The meta row
// (tag/date) and the kicker labels stay non-interactive.
function featureCardHTML(piece) {
  const tagClass = CATEGORY_TAG_CLASS[piece.category] || "";
  const label = CATEGORY_LABELS[piece.category] || piece.category;
  const kicker = CATEGORY_FEATURE_KICKER[piece.category] || "Latest";
  const href = pieceHref(piece);
  const external = piece.external ? ` target="_blank" rel="noopener"` : "";
  return `
    <div class="category-feature">
      <div class="category-feature__media-col">
        <p class="eyebrow category-feature__kicker">${kicker}</p>
        <a class="category-feature__media" href="${href}"${external}>
          <img src="${piece.cover}" alt="" loading="lazy">
        </a>
      </div>
      <div class="category-feature__body">
        <p class="eyebrow category-feature__kicker category-feature__kicker--ghost" aria-hidden="true">${kicker}</p>
        <div class="category-feature__meta">
          <span class="tag ${tagClass}">${label}</span>
          ${piece.tag ? `<span class="tag-chip">${piece.tag}</span>` : ""}
          <time datetime="${piece.date}">${formatDate(piece.date)}</time>
        </div>
        <a class="category-feature__text-link" href="${href}"${external}>
          <h2 class="category-feature__title">${piece.title}</h2>
          ${piece.subtitle ? `<p class="category-feature__subtitle">${piece.subtitle}</p>` : ""}
          <p class="category-feature__dek">${piece.dek}</p>
        </a>
        <a class="category-feature__read ${tagClass}" href="${href}"${external}>${piece.external ? "Read on " + (piece.outlet || "site") : "Read"}</a>
      </div>
    </div>
  `;
}

function initNav() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
}

// Mark the current page's nav link for styling / a11y.
function markCurrentNav() {
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".main-nav a, .site-footer a").forEach((a) => {
    const href = a.getAttribute("href");
    if (href === path) a.setAttribute("aria-current", "page");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  markCurrentNav();
});
