# Joseph Quash — portfolio site

A plain HTML/CSS/JS site (no build step, no framework) for your writing
— split into **Dramatic** (journalism), **Epic** (essays & reviews) and
**Lyric** (poetry & fiction) — and your event series, Sidings (formerly
People Carrier). Free to host on Netlify.

## Pages

Each writing category has its own page, linked directly from the header:
`dramatic.html`, `epic.html`, `lyric.html`. They all pull from the same
`js/data.js`, so there's nothing to duplicate — each page just filters to
its own category. `piece.html` is the shared template every individual
piece opens into, regardless of which category it belongs to.
`contact.html` is a standalone contact form, linked from the footer's
"Contact form" link on every page rather than from the header.

## Editing content

Almost everything lives in **`js/data.js`**. You shouldn't need to touch
any HTML to add a piece of writing or an event.

**To add a piece of writing:** copy one of the existing objects in the
`writing` array and change `id` (must be unique), `category`
(`journalism` → shows on Dramatic, `essays` → Epic, or `creative` →
Lyric — these internal values didn't change, only their on-page labels),
`title`, `dek`, `date` (`YYYY-MM-DD`), `outlet`, `cover` (path to an
image), and `body` (an array of paragraph strings). If the piece is
already published elsewhere, set `external` to that URL instead of
filling in `body` — the card will link straight out. It'll show up
automatically on the matching category page and, if it's the most
recent in its category, on the homepage.

**To add an event:** copy one of the objects in the `events` array.
`series` is `"sidings"` or `"people-carrier"` — it controls the tag
colour and label. Fill in `photos`, `videos` and `artwork` arrays. For
a video, either point `poster` at a placeholder/thumbnail image, or
set `embedUrl` to a YouTube/Vimeo embed link (e.g.
`https://www.youtube.com/embed/VIDEO_ID`) to play it inline.

Events are shown newest-first in the order they appear in the array —
keep your most recent or upcoming event at the top.

## Replacing placeholder images

All images live under `images/` and are simple generated placeholders
(coloured SVGs with a text label) so you can see the layout before you
have final assets. Replace them by adding your own file with the
**same name and path** referenced in `js/data.js` (or add new files
and update the paths). Any image format works (`.jpg`, `.png`, `.webp`
— doesn't have to stay `.svg`), just update the extension in
`data.js` to match.

Three images aren't referenced from `data.js` and are instead
hard-coded in the HTML:

- `images/misc/favicon.svg` — the "JQ" logo mark used everywhere on
  the light (writing) pages: the browser-tab icon and the header
  logo. Cream background, black mark, red bar.
- `images/misc/favicon-dark.svg` — the same mark for the dark Sidings
  page (events.html only): black background, red mark, cream bar.
  Swap either file and both its uses (tab icon + header) update
  together. A rendered 240×240 PNG of the light version is also
  included at the project root (`favicon-240.png`) for anywhere that
  won't take an SVG. Both marks are built from plain SVG shapes/text
  rather than an embedded font, so they render identically everywhere
  without depending on Big Shoulders Display having loaded.
- `images/misc/hero-visual.svg` — the bold graphic next to the intro
  text on the homepage: an overlapping square, triangle and circle
  standing for Dramatic, Epic and Lyric, colour-coded to match their
  tags. Treat it as a working placeholder — replace with a refined
  version of the same idea, or a portrait/commissioned illustration,
  whenever you're ready. Referenced directly in `index.html`.

## The contact form

`contact.html` includes a working contact form using **Netlify Forms** —
once deployed to Netlify, submissions will appear under
**Site settings → Forms** in your Netlify dashboard, and you can wire
up email notifications there. No backend code needed. Remember to
replace the placeholder email address in `contact.html`.

## Footer: CV, email and social links

Every page's footer has a "Contact" title on the left (with the
copyright beneath it, and a small "Contact form" link in between that
points at `contact.html`) and, opposite it on the right, your email as
a `mailto:` link, a "Download CV (.pdf)" link, and Instagram links for
you and Sidings. The CV link points at `files/joseph-quash-cv.pdf`,
which right now is just a one-page placeholder saying so — replace it
with your real CV exported as a PDF, using the **same file name and
path**, and the link updates automatically everywhere. This footer is
duplicated across all seven HTML pages (there's no shared template),
so if you ever change one of these links by hand, update it in the
others too.

## Deploying to Netlify

**Recommended — connect a Git repo (needed for per-article previews, see below):**
1. Push this folder to a new GitHub (or GitLab) repository.
2. In Netlify: **Add new site → Import an existing project**, pick the
   repo.
3. Leave the build command blank and set the publish directory to `.`
   (this is a static site — nothing to build).
4. Every time you push a change (e.g. editing `js/data.js` to add a
   new piece or event), Netlify redeploys automatically.

**Quickest to try, but with one limitation — drag and drop:**
1. Go to [app.netlify.com/drop](https://app.netlify.com/drop).
2. Drag the whole `joseph-portfolio` folder onto the page.
3. Netlify gives you a live URL immediately. You can rename the site
   and add a custom domain for free under Site settings → Domain
   management (you'd still pay your domain registrar, not Netlify, for
   the domain itself).

   **The one thing this method can't do:** Netlify only runs Edge
   Functions (see "Per-article previews when sharing a piece" below)
   for Git-connected or Netlify CLI deploys — a plain drag-and-drop
   upload skips that step entirely. The site itself works completely
   normally either way; the only difference is that a link to an
   individual piece will show the same generic site-wide preview
   everywhere instead of that piece's own title/image when deployed
   this way. If you start here and want per-article previews later,
   switching to the Git-connected method above (same files, nothing to
   redo) turns it on.

Either way, Netlify's free tier covers a personal portfolio site like
this comfortably — no monthly fee, unlike your old Squarespace plan.

## Per-article previews when sharing a piece

When you share a link to the homepage, Epic, Dramatic, Lyric, Sidings
or Contact, the preview that shows up in Slack/iMessage/X/etc. (title,
description, image) is baked right into that page's HTML, so it just
works everywhere.

An individual piece is different: every piece opens through the same
shared `piece.html` template (just with a different `?id=` in the
URL), and its real title/dek/cover only exist as data, filled in by
JavaScript after the page loads — which link-preview crawlers don't
run. `netlify/edge-functions/piece-meta.js` solves this: it intercepts
each request to `piece.html`, reads the `id`, looks up that piece in
`js/data.js`, and swaps in its real title, description and cover image
before the page is sent — so sharing a link to one specific piece
shows that piece's own preview, not a generic one.

**Nothing to maintain.** This reads `js/data.js` directly (as text,
not by running it) on every request, so adding a new piece the normal
way — editing `js/data.js`, same as always — is automatically covered.
There's no second data file or extra step. The only requirement is
deploying via the Git-connected method above (see the drag-and-drop
note just above) rather than Netlify Drop, since that's what runs Edge
Functions at all. If `js/data.js` ever changes shape in a way that
trips this function up, it fails open — visitors still get the real
page, just without a personalised preview for that one link.

## Design notes

- Colour palette, type (Big Shoulders Display for headlines/nav,
  Fraunces for the odd quiet italic serif moment, Inter for body,
  Space Mono for meta) and component styles all live in
  `css/style.css`, organised with section comments.
- The look takes cues from bold-but-light editorial design (the
  brief referenced *The Fence*): cream paper background, thick black
  rules, saturated flat colour used as flags rather than backgrounds,
  chunky offset-shadow buttons, a bold condensed headline face.
- **Two halves, one throughline.** The writing pages (Home, Dramatic,
  Epic, Lyric, About) stay on the light paper theme; Sidings
  (`events.html`) runs a fully inverted dark theme via
  `<body data-theme="dark">`, which just redefines the same colour
  tokens — every component is built from those tokens, so the flip
  cascades automatically with no per-component overrides. What stays
  identical on both sides: type, spacing, rule weights, the
  offset-shadow button mechanic, and `--sidings` (the brick red),
  which is the one colour that does **not** change between light and
  dark — it's Sidings' own fixed identity, used for its logo border,
  nav pill, dashed dividers and event-page accents.
- Category colours: **Dramatic** = blue, **Epic** = orange-red,
  **Lyric** = yellow — each also gets its own always-on wavy nav
  underline. **Sidings** = brick red (`--sidings`), a fourth identity
  colour of its own rather than tied to a category. Change any of
  these in the `:root` tokens at the top of `css/style.css`.
- **Lyric** intentionally breaks from the shared grid: circular
  cropped covers, staggered card positions, centred italic serif
  titles — Dramatic and Epic still share the standard card template.
  Extend the same idea to them (their own layout rhythm) in
  `.writing-grid` rules in `css/style.css` whenever you want to push
  the differentiation further.
- The homepage's "Background" section is intentionally sparse
  placeholder copy — it has its own full section (like the writing
  categories do) so there's room for a proper bio once you write one.
- The site is fully responsive and works without JavaScript for
  navigation and reading layout; JavaScript is only used to render
  the writing/events lists from `data.js` and to run the carousels.
