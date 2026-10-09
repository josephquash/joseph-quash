/* =========================================================
   Per-article social previews for piece.html.

   piece.html is one shared template for every piece of writing —
   the real title/dek/cover only exist as data in js/data.js and are
   normally filled in by client-side JS after the page loads. Social
   previews (Slack, iMessage, X, Facebook, LinkedIn...) don't run
   that JS — they only read the raw HTML — so without this function
   every shared piece link would show the same generic site-wide
   preview instead of its own title, description and image.

   This Edge Function intercepts requests to piece.html, looks up
   the piece from its ?id= and rewrites the small <!-- PIECE_META_START
   -->...<!-- PIECE_META_END --> block in piece.html's <head> (see
   that file) with this specific piece's own title, dek and cover
   image, before the page is sent to the browser/crawler. Everything
   else about the page — the real interactive reading view, text size,
   carousels — is completely unaffected; this only touches the <head>
   tags that exist for link previews.

   IMPORTANT — there is nothing to maintain here. This reads
   js/data.js directly (as plain text — see extractPieces below) every
   time someone requests a piece, so adding a new piece of writing the
   normal way (editing js/data.js, same as always) is automatically
   covered. There's no separate data file, build step or script to
   remember to run.

   Why plain-text extraction instead of just running data.js to get
   its data: Edge Functions have a 50ms-CPU-time budget per request
   and run in a restricted runtime, and js/data.js is large and only
   grows — actually executing the whole file on every single page
   view would be wasteful and is exactly the kind of thing that
   budget is there to discourage. Reading it as text and pulling out
   the handful of fields a preview needs (id/title/subtitle/dek/cover)
   is fast, simple, and never executes anything. It's deliberately
   NOT a general JS/JSON parser — it only needs to handle how this
   one file is actually written (flat double-quoted string fields per
   writing entry), and it's been tested against the real data.js plus
   a battery of edge cases (escaped quotes, brackets and apostrophes
   inside strings/comments, block comments, HTML tags in a dek, etc.)
   — see the project notes if you ever need to revisit this.
   ========================================================= */

function stripComments(code) {
  let out = "";
  let inString = null; // '"' | "'" | '`' | null
  let escaped = false;
  let i = 0;
  while (i < code.length) {
    const ch = code[i];

    if (inString) {
      out += ch;
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === inString) inString = null;
      i++;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === "`") {
      inString = ch;
      out += ch;
      i++;
      continue;
    }

    if (ch === "/" && code[i + 1] === "/") {
      const nl = code.indexOf("\n", i);
      const end = nl === -1 ? code.length : nl;
      out += " ".repeat(end - i);
      i = end;
      continue;
    }

    if (ch === "/" && code[i + 1] === "*") {
      const close = code.indexOf("*/", i + 2);
      const end = close === -1 ? code.length : close + 2;
      for (let j = i; j < end; j++) out += code[j] === "\n" ? "\n" : " ";
      i = end;
      continue;
    }

    out += ch;
    i++;
  }
  return out;
}

function findArrayBody(cleanCode, key) {
  const marker = key + ": [";
  const idx = cleanCode.indexOf(marker);
  if (idx === -1) return null;
  const openBracket = idx + marker.length - 1;
  let depth = 0;
  let inString = null;
  let escaped = false;
  for (let i = openBracket; i < cleanCode.length; i++) {
    const ch = cleanCode[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === inString) inString = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") { inString = ch; continue; }
    if (ch === "[") depth++;
    else if (ch === "]") {
      depth--;
      if (depth === 0) return cleanCode.slice(openBracket + 1, i);
    }
  }
  return null;
}

function splitTopLevelObjects(arrText) {
  const objects = [];
  let depth = 0;
  let start = -1;
  let inString = null;
  let escaped = false;

  for (let i = 0; i < arrText.length; i++) {
    const ch = arrText[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === inString) inString = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") { inString = ch; continue; }
    if (ch === "{") {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0 && start !== -1) {
        objects.push(arrText.slice(start, i + 1));
        start = -1;
      }
    }
  }
  return objects;
}

function extractField(objText, field) {
  const re = new RegExp(field + '\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"');
  const m = objText.match(re);
  if (!m) return undefined;
  return m[1].replace(/\\(.)/g, "$1");
}

function stripTags(s) {
  return s ? s.replace(/<[^>]*>/g, "") : s;
}

function extractPieces(rawCode) {
  const code = stripComments(rawCode);
  const body = findArrayBody(code, "writing");
  if (body == null) return [];
  const objs = splitTopLevelObjects(body);
  return objs.map((o) => ({
    id: extractField(o, "id"),
    collection: extractField(o, "collection"),
    external: extractField(o, "external"),
    title: extractField(o, "title"),
    subtitle: extractField(o, "subtitle"),
    dek: stripTags(extractField(o, "dek")),
    cover: extractField(o, "cover")
  }));
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default async (request, context) => {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  // No id at all — nothing to personalise, serve the page untouched.
  if (!id) return context.next();

  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;

  let piece;
  try {
    const dataRes = await fetch(new URL("/js/data.js", request.url));
    const code = await dataRes.text();
    const pieces = extractPieces(code);
    piece = pieces.find((p) => p.id === id);
  } catch (err) {
    // data.js couldn't be fetched/parsed for some reason — fail open:
    // visitors still get the real page, just without a personalised
    // preview for this one request.
    return response;
  }

  // Unknown id, or an external piece (nothing to preview locally since
  // it links straight out) — leave the generic fallback tags in place.
  if (!piece || piece.external) return response;

  const title = piece.collection === "well-assembled" && piece.subtitle
    ? `${piece.title} — ${piece.subtitle}`
    : piece.title;
  const fullTitle = `${title} — Joseph Quash`;
  const description = piece.dek || piece.subtitle || "Writing by Joseph Quash.";
  const image = piece.cover
    ? new URL(piece.cover, request.url).href
    : new URL("/images/misc/og-image.png", request.url).href;
  const canonicalUrl = url.href;

  const metaBlock = `<title>${escapeHtml(fullTitle)}</title>
<meta name="description" content="${escapeHtml(description)}">
<meta property="og:title" content="${escapeHtml(fullTitle)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:image" content="${escapeHtml(image)}">
<meta property="og:type" content="article">
<meta property="og:url" content="${escapeHtml(canonicalUrl)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(fullTitle)}">
<meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="twitter:image" content="${escapeHtml(image)}">
<link rel="canonical" href="${escapeHtml(canonicalUrl)}">`;

  let html = await response.text();
  html = html.replace(/<!-- PIECE_META_START -->[\s\S]*?<!-- PIECE_META_END -->/, metaBlock);

  const headers = new Headers(response.headers);
  headers.delete("content-length");

  return new Response(html, { status: response.status, headers });
};

export const config = { path: "/piece.html" };
