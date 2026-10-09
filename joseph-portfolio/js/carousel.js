/* =========================================================
   Lightweight, dependency-free carousel.
   Builds slides from an array of items and wires up arrows,
   dots, keyboard, and touch/drag swipe.

   item shapes:
     { type: "image", src, caption }
     { type: "video", poster, embedUrl, caption }
   ========================================================= */

function buildCarousel(mountEl, items, opts) {
  opts = opts || {};
  const label = opts.label || "media";

  if (!items || items.length === 0) {
    mountEl.innerHTML = '<p class="empty-state">No ' + label + ' yet — add some in js/data.js.</p>';
    return null;
  }

  const wrap = document.createElement("div");
  wrap.className = "carousel";
  wrap.setAttribute("role", "region");
  wrap.setAttribute("aria-roledescription", "carousel");
  wrap.setAttribute("aria-label", label);

  const viewport = document.createElement("div");
  viewport.className = "carousel__viewport";

  const track = document.createElement("div");
  track.className = "carousel__track";

  items.forEach((item, i) => {
    const slide = document.createElement("figure");
    slide.className = "carousel__slide";
    slide.setAttribute("role", "group");
    slide.setAttribute("aria-roledescription", "slide");
    slide.setAttribute("aria-label", (i + 1) + " of " + items.length);
    slide.style.position = "relative";

    if (item.type === "video") {
      if (item.embedUrl) {
        const iframe = document.createElement("iframe");
        iframe.src = item.embedUrl;
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        iframe.style.border = "0";
        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
        iframe.allowFullscreen = true;
        iframe.loading = "lazy";
        slide.appendChild(iframe);
      } else {
        const img = document.createElement("img");
        img.src = item.poster;
        img.alt = item.caption || "Video placeholder";
        img.loading = "lazy";
        slide.appendChild(img);
      }
    } else if (opts.tiled) {
      // Artwork: repeat the image edge-to-edge across the slide
      // (full height, natural proportions) instead of an <img> —
      // CSS background-repeat can tile an image; an <img> can't.
      // See the .carousel__slide--tiled rule in css/style.css.
      slide.classList.add("carousel__slide--tiled");
      slide.style.backgroundImage = `url("${item.src}")`;
    } else {
      const img = document.createElement("img");
      img.src = item.src;
      img.alt = item.caption || "";
      img.loading = "lazy";
      slide.appendChild(img);
    }

    if (item.caption) {
      const cap = document.createElement("figcaption");
      cap.textContent = item.caption;
      slide.appendChild(cap);
    }

    track.appendChild(slide);
  });

  viewport.appendChild(track);

  // A single credit for the whole carousel (e.g. the photographer or
  // artwork designer) — not per-slide, since one person usually shot
  // or made the whole set. Reuses .reading__media-credit, the same
  // small low-contrast bottom-right overlay used for photo credits
  // on the writing pages, so attribution reads consistently across
  // the site.
  if (opts.credit) {
    const credit = document.createElement("span");
    credit.className = "reading__media-credit";
    credit.textContent = opts.credit;
    viewport.appendChild(credit);
  }

  wrap.appendChild(viewport);

  if (items.length > 1) {
    const controls = document.createElement("div");
    controls.className = "carousel__controls";

    const prevBtn = document.createElement("button");
    prevBtn.className = "carousel__btn";
    prevBtn.type = "button";
    prevBtn.innerHTML = "&larr;";
    prevBtn.setAttribute("aria-label", "Previous " + label);

    const nextBtn = document.createElement("button");
    nextBtn.className = "carousel__btn";
    nextBtn.type = "button";
    nextBtn.innerHTML = "&rarr;";
    nextBtn.setAttribute("aria-label", "Next " + label);

    controls.appendChild(prevBtn);
    controls.appendChild(nextBtn);
    wrap.appendChild(controls);

    const dots = document.createElement("div");
    dots.className = "carousel__dots";
    const dotEls = items.map((_, i) => {
      const d = document.createElement("button");
      d.className = "carousel__dot";
      d.type = "button";
      d.setAttribute("aria-label", "Go to slide " + (i + 1));
      d.addEventListener("click", () => goTo(i));
      dots.appendChild(d);
      return d;
    });
    wrap.appendChild(dots);

    let index = 0;
    function render() {
      track.style.transform = "translateX(-" + (index * 100) + "%)";
      dotEls.forEach((d, i) => d.setAttribute("aria-current", i === index ? "true" : "false"));
    }
    function goTo(i) {
      index = (i + items.length) % items.length;
      render();
    }
    prevBtn.addEventListener("click", () => goTo(index - 1));
    nextBtn.addEventListener("click", () => goTo(index + 1));

    wrap.setAttribute("tabindex", "0");
    wrap.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") goTo(index - 1);
      if (e.key === "ArrowRight") goTo(index + 1);
    });

    // touch / pointer swipe
    let startX = null;
    viewport.addEventListener("pointerdown", (e) => { startX = e.clientX; });
    viewport.addEventListener("pointerup", (e) => {
      if (startX === null) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 40) goTo(dx > 0 ? index - 1 : index + 1);
      startX = null;
    });

    render();
  }

  mountEl.innerHTML = "";
  mountEl.appendChild(wrap);
  return wrap;
}
