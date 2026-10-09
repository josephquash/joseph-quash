/* Lyric page — different shape from Dramatic/Epic. Rather than one
   "latest piece" feature, the top of the page showcases the five
   days of the "well – assembled" collection (data.writing entries
   with collection: "well-assembled") as calendar-style tiles. Below
   a subdivider, the plain writing-grid carries up to three other,
   standalone Lyric pieces — same card treatment as Dramatic/Epic. */
document.addEventListener("DOMContentLoaded", () => {
  const data = window.SITE_DATA;
  const calendar = document.getElementById("wa-calendar");
  const grid = document.getElementById("writing-grid");
  const moreWrap = document.getElementById("more-recent-wrap");
  if (!grid) return;

  const pieces = data.writing.filter((p) => p.category === "creative");

  const collection = pieces
    .filter((p) => p.collection === "well-assembled")
    .sort((a, b) => (a.part || 0) - (b.part || 0));

  const misc = pieces
    .filter((p) => p.collection !== "well-assembled")
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 3);

  if (calendar) {
    calendar.innerHTML = collection.length
      ? collection.map(calendarDayHTML).join("") + CODA_HTML
      : '<p class="empty-state">Add the five days of the collection in js/data.js.</p>';
  }

  grid.innerHTML = misc.length
    ? misc.map(pieceCardHTML).join("")
    : '<p class="empty-state">Nothing here yet — add pieces in js/data.js.</p>';

  if (moreWrap) moreWrap.classList.toggle("is-empty", misc.length === 0);
});

// "Parsing My Poetry" (the Epic critical reflection on the collection)
// isn't a day of the calendar, so it's rendered as the grid's 6th/last
// child rather than one of the five day tiles. At 5 and 3 columns
// (tablet/desktop) .wa-calendar__coda spans every column, so it still
// reads as its own full-width line below the tiles — unchanged from
// the previous standalone markup. Only at the 2-column mobile
// breakpoint does it stop spanning and fall into normal grid flow,
// where it lands in the one empty cell the 5-tiles-in-2-columns
// layout always leaves (beside the last tile, Monday) instead of
// leaving that gap empty.
const CODA_HTML = `
  <a class="btn reading__more tag--creative wa-calendar__coda" href="piece.html?id=w11">Parsing my Poetry: A Critical Reflection &rarr;</a>
`;

function calendarDayHTML(piece) {
  const external = piece.external ? ` target="_blank" rel="noopener"` : "";
  // Each day of "well – assembled" is really a small suite of poems
  // (see the h2.reading__section titles inside piece.body on the
  // piece page itself), not a single poem — piece.title is now just
  // "well – assembled" for all five days, so the card's own job is
  // to list that day's full catalogue (piece.poems, in reading
  // order) rather than a single name.
  const poems = piece.poems && piece.poems.length
    ? piece.poems.map((title) => `<span class="wa-day__poem">${title}</span>`).join("")
    : `<span class="wa-day__poem">${piece.title}</span>`;
  return `
    <a class="wa-day" href="${pieceHref(piece)}"${external}>
      <span class="wa-day__band">${piece.part ? "Part " + piece.part : "well – assembled"}</span>
      <span class="wa-day__weekday">${piece.day || ""}</span>
      <span class="wa-day__poems">${poems}</span>
      <span class="wa-day__read">Read</span>
    </a>
  `;
}
