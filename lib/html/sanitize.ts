// src/lib/html/sanitize.ts

/** Minimal, SSR-safe HTML sanitizer:
 *  - Unwraps disallowed tags (e.g., div/span/section)
 *  - Keeps a tiny whitelist of semantic tags
 *  - Strips all attributes (except safe href on <a>)
 *  - Removes scripts/styles/inputs/forms/etc.
 *  - Normalizes <br> → <br/> and trims empties
 */
export function sanitizeDescHtml(raw = ""): string {
  let s = String(raw);

  // Remove comments
  s = s.replace(/<!--[\s\S]*?-->/g, "");

  // Strip risky containers entirely
  s = s.replace(
    /<(script|style|noscript|iframe|object|embed|form|input|button|textarea)[\s\S]*?<\/\1>/gi,
    ""
  );

  // Remove inline event handlers (onClick etc.)
  s = s.replace(/\son\w+\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi, "");

  // Normalize BRs
  s = s.replace(/<br\s*\/?>/gi, "<br/>");

  // Allowed tags only; unwrap the rest (remove tag but keep inner HTML)
  const ALLOWED = new Set([
    "p", "br", "ul", "ol", "li",
    "b", "strong", "i", "em", "u",
    "a", "h1", "h2", "h3", "h4", "h5", "h6",
    "blockquote", "code", "pre"
  ]);

  // Opening tags: unwrap if not allowed; strip all attrs (except safe href on <a>)
  s = s.replace(/<([a-z][a-z0-9:-]*)\b([^>]*)>/gi, (m, tag, attrs) => {
    tag = String(tag).toLowerCase();
    if (!ALLOWED.has(tag)) return ""; // unwrap disallowed opening tags

    if (tag === "a") {
      // keep only a safe href
      const hrefMatch = String(attrs).match(/\shref\s*=\s*(".*?"|'.*?'|[^\s>]+)/i);
      let href = hrefMatch ? hrefMatch[1] : "";
      href = href.replace(/^['"]|['"]$/g, ""); // strip quotes
      if (!href || /^javascript:/i.test(href)) href = "#";
      return `<a href="${href}">`;
    }

    return `<${tag}>`;
  });

  // Closing tags: unwrap if not allowed
  s = s.replace(/<\/([a-z][a-z0-9:-]*)>/gi, (m, tag) => {
    tag = String(tag).toLowerCase();
    return ALLOWED.has(tag) ? `</${tag}>` : "";
  });

  // Remove empty paragraphs and tidy whitespace
  s = s.replace(/<p>\s*<\/p>/gi, "");
  s = s.replace(/\s+\n/g, "\n").trim();

  return s;
}

/** Turn plaintext (or loose HTML) into sanitized paragraph HTML. */
export function coerceToHtml(input = ""): string {
  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(input);
  if (looksLikeHtml) return sanitizeDescHtml(input);
  const escaped = String(input)
    // Basic escape for angle brackets present in plain text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const html = `<p>${escaped.replace(/\n{2,}/g, "</p><p>").replace(/\n/g, "<br/>")}</p>`;
  return sanitizeDescHtml(html);
}

/** Block-aware HTML→text (useful when you need text for summaries, etc.). */
export function htmlToTextPreserveBlocks(html = ""): string {
  let s = html
    .replace(/<li[^>]*>\s*/gi, "\n- ")
    .replace(/<\/li>/gi, "")
    .replace(/<p[^>]*>\s*/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<h[1-6][^>]*>\s*/gi, "\n\n")
    .replace(/<(?:div|section|article|ul|ol|tbody|tr)[^>]*>\s*/gi, "\n")
    .replace(/<\/(?:div|section|article|ul|ol|tbody|tr)>/gi, "\n")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ");

  s = s
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();

  return s;
}

/* =========================
   ADD THESE PLAIN-TEXT HELPERS
   ========================= */

/** Sanitize first, then convert to plain text (no tags), preserving blocks. */
export function sanitizeToText(raw = ""): string {
  return htmlToTextPreserveBlocks(sanitizeDescHtml(raw));
}

/** Coerce plaintext or loose HTML to clean plain text (no tags). */
export function coerceToText(input = ""): string {
  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(input);
  if (looksLikeHtml) return sanitizeToText(input);
  return String(input)
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}
