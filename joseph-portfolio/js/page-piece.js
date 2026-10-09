/* Single writing piece, loaded by id from the URL: piece.html?id=w1 */

// "well – assembled"'s five day-pages read in sequence (Thursday through
// Monday), so the reading-page footer gets a second button alongside the
// usual "More Lyric" one — snapped to the other end of that flex row by
// .reading__footer's existing justify-content: space-between — pointing at
// whichever comes next. Monday is the collection's last day, so it closes
// the loop into w11 ("Parsing My Poetry"), the Epic critical reflection on
// the collection, rather than a sixth day. That button keeps Lyric's own
// gold (tagClass, same as every other day-to-day link here) rather than
// picking up w11's Epic/essays accent, for visual consistency with the
// rest of the page — same treatment as the matching button on the Lyric
// page itself (see .wa-showcase__coda in lyric.html), including its full
// "Parsing my Poetry: A Critical Reflection" label, same trailing arrow as
// every other hero button here.
const WA_DAY_NEXT = {
  "wa-thu": { id: "wa-fri", label: "Friday" },
  "wa-fri": { id: "wa-sat", label: "Saturday" },
  "wa-sat": { id: "wa-sun", label: "Sunday" },
  "wa-sun": { id: "wa-mon", label: "Monday" },
  "wa-mon": { id: "w11", label: "Parsing my Poetry: A Critical Reflection" },
};

// The "well – assembled" day-pages (js/data.js: wa-thu/fri/sat/sun/mon) are
// prose poems — run as ordinary flowing paragraphs, not verse with its own
// meaningful line breaks — so they need no special-cased reflow handling.
// Each poem's .wa-poem container keeps its distinct, narrower-than-the-
// column look (and left/right alternation) via a plain CSS width in em
// units (see .reading__body .wa-poem in style.css), which scales together
// with the reader's chosen text size, and its opening drop cap is an
// ordinary CSS float that the browser reflows around on its own at any
// width or font size — nothing here needs measuring in JS.

document.addEventListener("DOMContentLoaded", () => {
  const data = window.SITE_DATA;
  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  const piece = data.writing.find((p) => p.id === id);

  const mount = document.getElementById("reading-mount");
  if (!mount) return;

  if (!piece) {
    mount.innerHTML = `
      <p class="eyebrow">Not found</p>
      <h1 class="display">This piece isn't here yet.</h1>
      <p class="reading__dek">Check the link, or head back to the <a href="index.html">homepage</a>.</p>
    `;
    document.title = "Not found — Joseph Quash";
    return;
  }

  const label = CATEGORY_LABELS[piece.category] || piece.category;
  const tagClass = CATEGORY_TAG_CLASS[piece.category] || "";
  // Journalism runs its publication date as its own prominent group
  // in the article-tools rail instead of the small inline date in
  // .reading__meta (see toolsHTML / .reading__meta below) — date
  // matters more for a reported piece than an essay or a poem, and
  // dropping it from the meta row also leaves that row more room for
  // the run of tag chips a news piece tends to carry. Essays and
  // creative work are untouched, keeping the original inline date.
  const isJournalism = piece.category === "journalism";
  // Lyric (category: "creative") pieces run without the usual dek
  // (the intro line beneath the cover art, between subtitle and
  // body) — a poem or story doesn't need to be pitched to the
  // reader the way an essay or news piece does. piece.dek is kept
  // in the data regardless, since it still supplies the blurb on
  // the piece's card in the Lyric grid (see pieceCardHTML);  this
  // only suppresses it on the full reading page itself. In its
  // place, an optional piece.context renders as its own small
  // section at the foot of the piece, below the divider — a short
  // explanatory/contextual note the reader can take or leave once
  // they've already read the work, rather than a framing note
  // pushed on them before it.
  const isCreative = piece.category === "creative";
  // A category class on the article root itself, so CSS can colour-
  // match anything scoped by ancestor selector instead of needing the
  // class on every individual element — e.g. in-body blockquotes
  // below. Deliberately its own "cat--*" class rather than reusing
  // tagClass ("tag--*"): that name is already a bare, unscoped
  // selector elsewhere (the small category tag pill's own fill
  // colour), and putting it on the root article too would have that
  // same rule paint the whole article's background.
  if (piece.category) mount.classList.add(`cat--${piece.category}`);

  // "well – assembled"'s five day-pages all share the same
  // piece.title now (see js/data.js), so the subtitle (the day name)
  // is folded in here too — otherwise five browser tabs/bookmarks
  // would all read identically as "well – assembled — Joseph Quash".
  // Every other piece's subtitle is prose, not a short disambiguator,
  // so this only applies to the well-assembled collection.
  const titleForTab = piece.collection === "well-assembled" && piece.subtitle
    ? `${piece.title} — ${piece.subtitle}`
    : piece.title;
  document.title = titleForTab + " — Joseph Quash";

  // In-body photos: a piece can carry an optional "media" array (see
  // js/data.js) of { after, images } blocks — "after" is the 0-based
  // index of the body paragraph the block follows. Each entry in
  // "images" is either a plain caption string (no photo dropped in
  // yet — renders as a placeholder box standing in for an <img>) or
  // an { src, caption } object once a real photo exists (renders the
  // actual image, cropped to a consistent frame via CSS). A single-
  // image block renders as one standalone figure — capped narrower
  // than the column (.reading__media--standalone in style.css)
  // rather than stretching to both margins, since a photo doesn't
  // need to fill the measure the way body text does; more than one
  // image renders as a grid of smaller figures side by side instead
  // (.reading__media--grid-item — used for ITPG's four-photo group).
  const mediaByIndex = {};
  (piece.media || []).forEach((block) => { mediaByIndex[block.after] = block; });

  const figureHTML = (entry, variantClass, phClass = "", suppressCaption = false, kind = "photo") => {
    const isPhoto = entry && typeof entry === "object" && entry.src;
    const caption = suppressCaption ? "" : (isPhoto ? (entry.caption || "") : entry);
    // A real photo's own credit line (photographer + source, e.g.
    // "Bradley Leftley, Unsplash") is a small, low-contrast overlay
    // sitting in the image's own bottom-right corner rather than a
    // second caption line — kept deliberately unobtrusive (see
    // .reading__media-credit in style.css) since it's attribution,
    // not part of the piece's own text. Wrapped in its own
    // position:relative frame so the overlay sits within the photo's
    // bounds (inside the ink/category-colour ring) rather than the
    // figure as a whole. A video block (kind === "video") with a real
    // src renders a native <video> in the same frame/credit pattern
    // instead of an <img> — first used for the Hyde Park bonfire
    // piece's resident-filmed footage, once it was small enough to
    // embed directly.
    const isVideo = isPhoto && kind === "video";
    const posterAttr = isVideo && entry.poster ? ` poster="${entry.poster}"` : "";
    const mediaTag = isVideo
      ? `<video class="reading__media-img ${phClass} ${tagClass}" src="${entry.src}"${posterAttr} controls playsinline preload="metadata"></video>`
      : `<img class="reading__media-img ${phClass} ${tagClass}" src="${entry.src}" alt="${(entry.alt || caption || "").replace(/"/g, "&quot;")}" loading="lazy">`;
    const visual = isPhoto
      ? `<div class="reading__media-frame">
          ${mediaTag}
          ${entry.credit ? `<span class="reading__media-credit">${entry.credit}</span>` : ""}
        </div>`
      : `<div class="reading__media-ph ${phClass} ${tagClass}">
          <span class="reading__media-ph__label">${kind === "video" ? "Video" : "Photo"}</span>
          <span class="reading__media-ph__sub">${kind === "video" ? "Video placeholder" : "Image placeholder"}</span>
        </div>`;
    return `
    <figure class="reading__media ${variantClass}">
      ${visual}
      ${caption ? `<figcaption class="reading__media-caption">${caption}</figcaption>` : ""}
    </figure>
  `;
  };
  // block.layout is optional — omitted, a multi-image block renders as
  // the standard two-column grid (ITPG's four-photo group). "portrait-
  // grid" is a second, distinct variant: a tighter three-column grid of
  // small portrait-oriented figures (see PMP's "narrative holes" photo
  // group) — its own modifier classes (.reading__media-grid--tight,
  // .reading__media--portrait) so it doesn't affect the existing grid.
  // Unlike the ordinary grid, individual figures in a portrait-grid
  // carry no caption of their own — block.rowCaptions (one entry per
  // row of block.columns images, default 3) renders as a single
  // caption line beneath each row instead, since six near-identical
  // placeholders don't each need their own label.
  const mediaBlockHTML = (block) => {
    if (block.layout === "portrait-grid") {
      const cols = block.columns || 3;
      const rows = [];
      for (let i = 0; i < block.images.length; i += cols) rows.push(block.images.slice(i, i + cols));
      return rows.map((rowImages, rowIndex) => {
        const rowCaption = (block.rowCaptions && block.rowCaptions[rowIndex]) || "";
        const figuresHTML = rowImages.map((entry) => figureHTML(entry, "reading__media--grid-item", "reading__media--portrait", true)).join("");
        return `
        <figure class="reading__media-row">
          <div class="reading__media-grid reading__media-grid--tight">${figuresHTML}</div>
          ${rowCaption ? `<figcaption class="reading__media-caption">${rowCaption}</figcaption>` : ""}
        </figure>
      `;
      }).join("");
    }
    // block.imgClass carries an optional modifier through to the img
    // itself (see "reading__media-img--diagram" in style.css, used
    // by a chart or map that needs to show its full extent rather
    // than being cropped like a photo); block.wide widens a
    // standalone figure's cap for the same kind of image, since a
    // labelled chart needs more than a photo's 560px to stay legible.
    const imgClass = block.imgClass || "";
    if (block.images.length > 1) {
      return `<div class="reading__media-grid">${block.images.map((entry) => figureHTML(entry, "reading__media--grid-item", imgClass)).join("")}</div>`;
    }
    // block.kind === "video" is a standalone, centre-aligned, portrait-
    // oriented slot for embedded footage (see the Hyde Park bonfire
    // piece, w1) — same placeholder mechanism as a photo, but sized
    // like a phone-shot vertical clip (9:16) rather than a 3:2 photo,
    // and captioned "Video" rather than "Photo" until a real source
    // is dropped in.
    if (block.kind === "video") {
      return figureHTML(block.images[0], "reading__media--standalone reading__media--video", "reading__media--portrait-video", false, "video");
    }
    const standaloneVariant = block.wide ? "reading__media--standalone reading__media--wide" : "reading__media--standalone";
    return figureHTML(block.images[0], standaloneVariant, imgClass);
  };

  // Bibliography (endnotes): pieces with academic-style citations
  // (see js/data.js's "notes" field) carry a matching set of
  // in-body markers like
  // <sup><a href="#fn1" id="fnref1" role="doc-noteref">1</a></sup> —
  // written directly into that piece's body strings. "Bibliography"
  // itself is a plain (non-link) section heading; the citation list
  // sits behind its own "References" tab below that heading, as a
  // <details>/<summary> disclosure collapsed by default, each entry
  // closing with a "back to text" link to the matching fnrefN
  // anchor. Pieces with no notes (most of them) render exactly as
  // before.
  const notesHTML = piece.notes && piece.notes.length
    ? `
    <div class="reading__notes-section">
      <p class="reading__notes-heading">Bibliography</p>
      <details class="reading__notes" role="doc-endnotes">
        <summary class="reading__notes-toggle">References</summary>
        <ol>
          ${piece.notes.map((note, i) => `
            <li id="fn${i + 1}" role="doc-endnote"><p>${note} <a href="#fnref${i + 1}" class="reading__notes-back" role="doc-backlink" aria-label="Back to reference ${i + 1} in the text">&#8617;</a></p></li>
          `).join("")}
        </ol>
      </details>
    </div>`
    : "";

  // Left-margin article tools: author credit, a text-size control
  // (scoped to the byline + body copy only — see the --size-mult
  // custom property in style.css), and share links. Sits in the
  // page's own left margin on wide viewports (position: fixed,
  // clear of the 840px reading column) and collapses to a plain
  // horizontal bar above the title once that margin disappears —
  // see .reading-tools in style.css for both layouts. Built once
  // here so both breakpoints share the same markup and JS.
  const authorName = piece.author || "Joseph Quash";
  const toolsHTML = `
    <aside class="reading-tools" aria-label="Article tools">
      ${isJournalism ? `
      <div class="reading-tools__group reading-tools__group--pubdate">
        <p class="reading-tools__label eyebrow">Published</p>
        <time class="reading-tools__pubdate" datetime="${piece.date}">${formatDate(piece.date)}</time>
      </div>
      ` : ""}
      <div class="reading-tools__group">
        <p class="reading-tools__label eyebrow">Author</p>
        <p class="reading-tools__author">${authorName}</p>
      </div>
      <div class="reading-tools__group">
        <p class="reading-tools__label eyebrow">Text size</p>
        <div class="reading-tools__size-row" role="group" aria-label="Text size">
          <button type="button" class="reading-tools__size-btn" data-size="s" aria-pressed="false">S</button>
          <button type="button" class="reading-tools__size-btn" data-size="m" aria-pressed="true">M</button>
          <button type="button" class="reading-tools__size-btn" data-size="l" aria-pressed="false">L</button>
        </div>
      </div>
      <div class="reading-tools__group">
        <p class="reading-tools__label eyebrow">Share</p>
        <div class="reading-tools__share-row">
          <a class="reading-tools__icon-btn" data-share="x" href="#" target="_blank" rel="noopener" aria-label="Share on X">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </a>
          <a class="reading-tools__icon-btn" data-share="bluesky" href="#" target="_blank" rel="noopener" aria-label="Share on Bluesky">
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 11.5c-.8-2.6-3.3-5.8-6.4-7.2C3.2 3.2 2 3.7 2 5.4c0 .6.2 4.9.4 5.6.6 2.4 3 3 5 2.7-2.9.4-5.4 1.5-2.1 5.2C8.6 22.4 11 18.9 12 17c1 1.9 3.4 5.4 6.7 1.9 3.3-3.7.8-4.8-2.1-5.2 2-.3 4.4-.3 5-2.7.2-.7.4-5 .4-5.6 0-1.7-1.2-2.2-3.6-1.1-3.1 1.4-5.6 4.6-6.4 7.2z"/></svg>
          </a>
          <a class="reading-tools__icon-btn" data-share="email" href="#" aria-label="Share via email">
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M4 6.5l8 6 8-6"/></svg>
          </a>
          <button type="button" class="reading-tools__icon-btn" data-share="copy" aria-label="Copy link">
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 14.5l5-5"/><path d="M13 6.5l1-1a3 3 0 0 1 4.24 4.24l-1.5 1.5"/><path d="M11 17.5l-1 1A3 3 0 0 1 5.76 14.3l1.5-1.5"/></svg>
          </button>
        </div>
      </div>
    </aside>
  `;

  mount.innerHTML = `
    ${toolsHTML}
    <div class="reading__meta">
      <span class="tag ${tagClass}">${label}</span>
      ${piece.tag ? `<span class="tag-chip">${piece.tag}</span>` : ""}
      ${(piece.tags || []).map((t) => `<span class="tag-chip">${t}</span>`).join("")}
      ${!isJournalism ? `<time class="eyebrow" datetime="${piece.date}">${formatDate(piece.date)}</time>` : ""}
      ${piece.outlet ? `<span class="eyebrow">— ${piece.outlet}</span>` : ""}
    </div>
    <h1 class="display">${piece.title}</h1>
    ${piece.subtitle ? `<p class="reading__subtitle">${piece.subtitle}</p>` : ""}
    ${piece.cover ? `
    <div class="reading__cover-frame">
      <img class="reading__cover ${tagClass}" src="${piece.cover}" alt="">
      ${piece.coverCredit ? `<span class="reading__media-credit">${piece.coverCredit}</span>` : ""}
    </div>
    ` : ""}
    ${!isCreative ? `<p class="reading__dek">${piece.dek}</p>` : ""}
    ${piece.sourceNote ? `<p class="reading__source-note">${piece.sourceNote}</p>` : ""}
    ${piece.epigraph ? `
    <blockquote class="reading__epigraph">
      <p>${piece.epigraph}</p>
      ${piece.epigraphCite ? `<cite>${piece.epigraphCite}</cite>` : ""}
    </blockquote>
    ` : ""}
    <div class="reading__body">
      ${piece.body.map((p, i) => {
        // A body entry is normally prose, wrapped in its own <p>. But
        // a set-off quotation or a section heading (see w8's Milton
        // essay for the first pieces to use either) is written as its
        // own block-level element already — <blockquote> or <h2> —
        // and wrapping THAT in a <p> too would nest a block element
        // inside an inline one, which browsers "fix" by silently
        // closing the <p> early, leaving a stray empty paragraph
        // behind (extra vertical gap, invalid markup). Detecting that
        // up front and skipping the wrapper for those entries avoids
        // it, while every plain-prose entry works exactly as before.
        // <pre> and <div> cover Manna's poem stanzas and its
        // between-stanza "–" divider (see js/data.js, w5) — a poem's
        // exact line breaks and tab-driven gaps are preserved via
        // white-space: pre-wrap on .poem__stanza rather than being
        // collapsed and re-flowed like ordinary prose.
        const isBlockLevel = /^\s*<(blockquote|h2|h3|pre|div)[\s>]/i.test(p);
        return `${isBlockLevel ? p : `<p>${p}</p>`}${mediaByIndex[i] ? mediaBlockHTML(mediaByIndex[i]) : ""}`;
      }).join("")}
    </div>
    ${piece.context ? `
    <div class="reading__context-section">
      <p class="reading__context-heading">Context</p>
      <p class="reading__context-body">${piece.context}</p>
    </div>` : ""}
    ${notesHTML}
    <div class="reading__footer">
      <a class="btn reading__more ${tagClass}" href="${CATEGORY_PAGES[piece.category] || "index.html"}">&larr; More ${label}</a>
      ${WA_DAY_NEXT[piece.id] ? (() => {
        const next = WA_DAY_NEXT[piece.id];
        const nextPiece = data.writing.find((p) => p.id === next.id);
        const arrow = next.noArrow ? "" : " &rarr;";
        return `<a class="btn reading__more ${tagClass}" href="${pieceHref(nextPiece)}">${next.label}${arrow}</a>`;
      })() : ""}
    </div>
  `;

  // Text size: scoped to the byline + body copy only (see the
  // --size-mult custom property on .reading in style.css), remembered
  // across pieces via localStorage so a reader's chosen size holds
  // as they move between articles. Every element that needs to scale
  // with it (including a "well – assembled" poem's own width, see
  // style.css) does so in plain CSS off that one custom property, so
  // toggling the size here needs nothing further from this script.
  const sizeBtns = mount.querySelectorAll(".reading-tools__size-btn");
  const applySize = (size) => {
    mount.setAttribute("data-text-size", size);
    sizeBtns.forEach((btn) => {
      btn.setAttribute("aria-pressed", btn.dataset.size === size ? "true" : "false");
    });
  };
  let savedSize = "m";
  try { savedSize = window.localStorage.getItem("jq-text-size") || "m"; } catch (err) { /* no-op */ }
  applySize(savedSize);
  sizeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const size = btn.dataset.size;
      applySize(size);
      try { window.localStorage.setItem("jq-text-size", size); } catch (err) { /* no-op */ }
    });
  });

  // Share links need the page's own final URL, so they're wired up
  // after the markup above is in the DOM rather than baked into the
  // template string.
  const pageUrl = location.href;
  const shareText = piece.title;
  const xLink = mount.querySelector('[data-share="x"]');
  if (xLink) xLink.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(pageUrl)}`;
  const skyLink = mount.querySelector('[data-share="bluesky"]');
  if (skyLink) skyLink.href = `https://bsky.app/intent/compose?text=${encodeURIComponent(shareText + " " + pageUrl)}`;
  const emailLink = mount.querySelector('[data-share="email"]');
  if (emailLink) emailLink.href = `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(pageUrl)}`;

  // Copy link: Clipboard API where available, with a document.
  // execCommand fallback for older browsers, and a brief "Copied"
  // state on the button itself so the click has visible feedback.
  const copyBtn = mount.querySelector('[data-share="copy"]');
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      const done = () => {
        copyBtn.classList.add("is-copied");
        copyBtn.setAttribute("aria-label", "Link copied");
        window.clearTimeout(copyBtn._resetTimer);
        copyBtn._resetTimer = window.setTimeout(() => {
          copyBtn.classList.remove("is-copied");
          copyBtn.setAttribute("aria-label", "Copy link");
        }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(pageUrl).then(done).catch(() => {
          fallbackCopy(pageUrl);
          done();
        });
      } else {
        fallbackCopy(pageUrl);
        done();
      }
    });
  }
  function fallbackCopy(text) {
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    el.style.position = "absolute";
    el.style.left = "-9999px";
    document.body.appendChild(el);
    el.select();
    try { document.execCommand("copy"); } catch (err) { /* no-op */ }
    document.body.removeChild(el);
  }

  // Clicking a footnote marker once the page has already loaded is a
  // same-document navigation the browser handles natively: modern
  // browsers (Chrome/Edge 90+, Firefox 92+, Safari 16.4+) open
  // whichever ancestor <details> a link's target sits inside before
  // jumping to it, so the bibliography's collapsed-by-default
  // <details> above needs no extra JS for that case. A direct link
  // straight to a citation (e.g. piece.html?id=w8#fn3) is different,
  // though — the browser's one-time attempt to jump to that fragment
  // happens before this script has even run, since the <details> and
  // its #fnN targets don't exist until the innerHTML above is set.
  // This is the fallback for that one case: reveal and scroll to it
  // ourselves once the content actually exists.
  if (location.hash) {
    const target = document.getElementById(location.hash.slice(1));
    const details = target && target.closest("details.reading__notes");
    if (details && !details.open) {
      details.open = true;
      target.scrollIntoView();
    }
  }
});
