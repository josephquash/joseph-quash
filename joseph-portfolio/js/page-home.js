/* Homepage: latest piece per category (Dramatic / Epic / Lyric)
   + events teaser preview. */
document.addEventListener("DOMContentLoaded", () => {
  const data = window.SITE_DATA;

  // Latest piece per category, mounted into the category bands —
  // plus a small "more recent" text-link row for whatever's left
  // over once the latest is pulled out, and the inline "Read the
  // latest here" link in the descriptor sentence above.
  const mounts = {
    journalism: {
      latest: document.getElementById("latest-journalism"),
      more: document.getElementById("more-journalism"),
      latestLink: document.getElementById("latest-link-journalism")
    },
    essays: {
      latest: document.getElementById("latest-essays"),
      more: document.getElementById("more-essays"),
      latestLink: document.getElementById("latest-link-essays")
    },
    creative: {
      latest: document.getElementById("latest-creative"),
      more: document.getElementById("more-creative"),
      latestLink: document.getElementById("latest-link-creative")
    }
  };
  Object.keys(mounts).forEach((cat) => {
    const { latest: latestMount, more: moreMount, latestLink } = mounts[cat];
    // Excludes "well – assembled" day-pieces (p.collection set) —
    // those are shown only on lyric.html, as the calendar tiles,
    // not mixed in with the homepage's "latest" picks.
    const sorted = data.writing
      .filter((p) => p.category === cat && !p.collection)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
    // Same featured: true override as page-category.js — lets a
    // pinned spotlight piece hold the homepage's "Latest" card too,
    // even if it isn't the most recent by date.
    const latest = sorted.find((p) => p.featured) || sorted[0];

    if (latestMount) {
      latestMount.innerHTML = latest
        ? pieceCardHTML(latest)
        : '<p class="empty-state">Nothing here yet — add one in js/data.js.</p>';
    }

    // Points "Read the latest here" at whatever piece the "Latest"
    // card above is currently showing — falls back to the category
    // page (its href in the HTML) if there's nothing to link to yet.
    if (latestLink && latest) {
      latestLink.href = pieceHref(latest);
      if (latest.external) {
        latestLink.target = "_blank";
        latestLink.rel = "noopener";
      }
    }

    // Up to two more, newest first — three pieces visible at once
    // reads better than two — same chronological order as the rest
    // of the site, so a left-to-right read always moves backward in
    // time from the "Latest" card, never jumps around. Each box also
    // carries its own date, right-aligned.
    if (moreMount) {
      const rest = sorted.filter((p) => p !== latest).slice(0, 2);
      moreMount.innerHTML = rest
        .map((p) => `
          <li>
            <a href="${pieceHref(p)}"${p.external ? ' target="_blank" rel="noopener"' : ""}>
              <span class="category-band__more-title">${p.title}</span>
              <time class="category-band__more-date" datetime="${p.date}">${formatDate(p.date)}</time>
            </a>
          </li>
        `)
        .join("");
      const wrap = moreMount.closest(".category-band__more-wrap");
      if (wrap) wrap.classList.toggle("is-empty", rest.length === 0);
    }
  });
});
