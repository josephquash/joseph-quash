/* Events archive: one block per event, each with Photos /
   Video / Artwork tabs, each tab holding its own carousel. */
document.addEventListener("DOMContentLoaded", () => {
  const data = window.SITE_DATA;
  const container = document.getElementById("events-list");
  if (!container) return;

  if (!data.events.length) {
    container.innerHTML = '<p class="empty-state">No events yet — add some in js/data.js.</p>';
    return;
  }

  data.events.forEach((ev) => {
    const block = document.createElement("article");
    block.className = "event-block";
    block.id = ev.id;

    const isSidings = ev.series === "sidings";
    const eyebrowClass = isSidings ? "event-block__eyebrow--sidings" : "event-block__eyebrow--pc";
    const eyebrowLabel = isSidings ? "Sidings" : "People Carrier";

    // Not launched yet — no photos/video/artwork to show, so swap in
    // the same "Coming 2027" placeholder graphic used on the homepage
    // instead of the usual media-tabs carousel.
    // The Video tab/panel only renders when there's actually a video
    // to show (ev.videos non-empty) — e.g. all three People Carrier
    // volumes currently have portrait-only footage that's paused
    // rather than shown, so videos: [] and the tab just disappears.
    // Add entries back to ev.videos later and the tab returns on its
    // own, no further code change needed.
    const hasVideo = !!(ev.videos && ev.videos.length);
    const mediaHTML = ev.launched === false
      ? `<div class="sidings-placeholder">
           <p class="sidings-placeholder__tagline">Coming 2027.<br>Watch this space.</p>
         </div>`
      : `<div class="media-tabs" role="tablist" aria-label="${ev.name} media">
           <button class="media-tab" role="tab" data-media="artwork" aria-selected="true">Artwork</button>
           <button class="media-tab" role="tab" data-media="photos" aria-selected="false">Photos</button>
           ${hasVideo ? `<button class="media-tab" role="tab" data-media="video" aria-selected="false">Video</button>` : ""}
         </div>
         <div class="media-panel" data-media="artwork"></div>
         <div class="media-panel" data-media="photos" hidden></div>
         ${hasVideo ? `<div class="media-panel" data-media="video" hidden></div>` : ""}`;

    // Archive volumes get a structured Date / Venue / Lineup block; an
    // event with no lineup field yet (the not-launched Sidings entry)
    // keeps the simple one-line meta instead. Artwork/photo credits
    // render on their own carousels (see buildCarousel's `credit`
    // option below), not in this details block.
    const metaHTML = ev.lineup !== undefined
      ? `<dl class="event-block__details">
           <div class="event-block__detail"><dt>Date</dt><dd>${formatDate(ev.date)}</dd></div>
           <div class="event-block__detail"><dt>Venue</dt><dd>${ev.venue}</dd></div>
           <div class="event-block__detail"><dt>Lineup</dt><dd>${ev.lineup}</dd></div>
         </dl>`
      : `<p class="event-block__meta">${formatDate(ev.date)} — ${ev.venue}</p>`;

    // Skip the blurb paragraph(s) entirely when there's no copy yet,
    // rather than rendering an empty <p> (which would still take up
    // its margin-bottom as blank space). ev.blurb may be a single
    // string (one paragraph) or an array of strings (one <p> each).
    const blurbParas = !ev.blurb ? [] : Array.isArray(ev.blurb) ? ev.blurb : [ev.blurb];
    const blurbHTML = blurbParas.map((p) => `<p class="event-block__blurb">${p}</p>`).join("\n");

    // Artwork tab first, per the house style for this page — it's
    // the commissioned piece for the night, ahead of documentation.
    block.innerHTML = `
      <div class="container event-block__grid">
        <div class="event-block__media">
          ${mediaHTML}
        </div>
        <div class="event-block__info">
          <p class="eyebrow event-block__eyebrow ${eyebrowClass}">${eyebrowLabel}</p>
          <div class="event-block__head">
            <h2 class="display">${ev.name}</h2>
          </div>
          ${metaHTML}
          ${blurbHTML}
        </div>
      </div>
    `;

    container.appendChild(block);

    if (ev.launched === false) return;

    const panels = {
      photos: block.querySelector('[data-media="photos"].media-panel'),
      artwork: block.querySelector('[data-media="artwork"].media-panel')
    };
    if (hasVideo) panels.video = block.querySelector('[data-media="video"].media-panel');

    buildCarousel(panels.artwork, ev.artwork.map((a) => ({ type: "image", ...a })), { label: ev.name + " artwork", tiled: true, credit: ev.artworkCredit });
    buildCarousel(panels.photos, ev.photos.map((p) => ({ type: "image", ...p })), { label: ev.name + " photos", credit: ev.photoCredit });
    if (hasVideo) buildCarousel(panels.video, ev.videos.map((v) => ({ type: "video", ...v })), { label: ev.name + " video" });

    block.querySelectorAll(".media-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        block.querySelectorAll(".media-tab").forEach((t) => t.setAttribute("aria-selected", "false"));
        tab.setAttribute("aria-selected", "true");
        const key = tab.dataset.media;
        Object.keys(panels).forEach((k) => {
          panels[k].hidden = k !== key;
        });
      });
    });
  });

  // Deep-link to an event via #event-id
  if (location.hash) {
    const target = document.querySelector(location.hash);
    if (target) target.scrollIntoView();
  }
});
