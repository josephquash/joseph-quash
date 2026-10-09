/* Dedicated single-category page (dramatic.html / epic.html).
   Lyric has its own bespoke script — see js/page-lyric.js —
   since it leads with the "well – assembled" calendar instead
   of a single featured piece. Expects window.PAGE_CATEGORY to
   be set to "journalism" | "essays" in an inline <script>
   before this file loads. */
document.addEventListener("DOMContentLoaded", () => {
  const data = window.SITE_DATA;
  const grid = document.getElementById("writing-grid");
  const moreWrap = document.getElementById("more-recent-wrap");
  const featureMount = document.getElementById("category-feature");
  const category = window.PAGE_CATEGORY;
  if (!grid || !category) return;

  const pieces = data.writing
    .filter((p) => p.category === category)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  // The most recent piece runs as its own big feature row up top
  // (cover left, everything else to the right); everything older
  // than that fills the 3-across grid below it, under its own
  // "More recent" kicker — same pairing as the homepage's
  // "Latest" / "More recent" labels, for a bit of continuity.
  // A piece can override this by setting featured: true in
  // js/data.js (e.g. a spotlight essay that isn't the newest) —
  // that one runs as the feature instead, and everything else,
  // including anything actually newer, drops into the grid below.
  const latest = pieces.find((p) => p.featured) || pieces[0];
  const rest = pieces.filter((p) => p !== latest);

  if (featureMount) {
    featureMount.innerHTML = latest ? featureCardHTML(latest) : "";
  }

  grid.innerHTML = rest.length
    ? rest.map(pieceCardHTML).join("")
    : pieces.length
      ? ""
      : '<p class="empty-state">Nothing here yet — add pieces in js/data.js.</p>';

  if (moreWrap) moreWrap.classList.toggle("is-empty", rest.length === 0);
});
