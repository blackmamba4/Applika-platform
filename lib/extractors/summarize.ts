// src/lib/html/sanitize.ts
// PLAIN TEXT ONLY — no tags, no attrs, block-aware newlines.

function collapse(s: string) {
  return s.replace(/[ \t]+\n/g, "\n").replace(/[ \t]{2,}/g, " ").trim();
}

function decodeEntities(s: string) {
  const named: Record<string, string> = {
    nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'",
    mdash: "—", ndash: "–",
  };
  s = s.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (_, ent: string) => {
    if (ent[0] === "#") {
      if (ent[1].toLowerCase() === "x") {
        const code = parseInt(ent.slice(2), 16);
        return Number.isFinite(code) ? String.fromCharCode(code) : "";
      }
      const code = parseInt(ent.slice(1), 10);
      return Number.isFinite(code) ? String.fromCharCode(code) : "";
    }
    const key = ent.toLowerCase();
    return key in named ? named[key] : "";
  });
  return s;
}

/** Core: turn HTML or text into clean, tag-free plain text. */
export function toPlainText(input = ""): string {
  let s = String(input);

  // 1) remove comments
  s = s.replace(/<!--[\s\S]*?-->/g, "");

  // 2) drop risky containers WITH their content
  s = s.replace(
    /<(script|style|noscript|iframe|object|embed|form|button|textarea|select)[\s\S]*?<\/\1>/gi,
    ""
  );

  // 3) normalize common block semantics → newlines
  s = s
    // lists → dash bullets
    .replace(/<li[^>]*>\s*/gi, "\n- ")
    .replace(/<\/li>/gi, "")
    // paragraphs & headings → blank lines
    .replace(/<p[^>]*>\s*/gi, "\n\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<h[1-6][^>]*>\s*/gi, "\n\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    // table-ish → soft breaks
    .replace(/<(?:tr|tbody|thead|tfoot)[^>]*>/gi, "\n")
    .replace(/<\/(?:tr|tbody|thead|tfoot)>/gi, "\n")
    .replace(/<(?:td|th)[^>]*>/gi, " ")
    .replace(/<\/(?:td|th)>/gi, " ")
    // generic block containers → newline
    .replace(/<(?:div|section|article|header|footer|main)[^>]*>/gi, "\n")
    .replace(/<\/(?:div|section|article|header|footer|main)>/gi, "\n")
    // line breaks & rules
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<hr\s*\/?>/gi, "\n");

  // 4) strip ANY remaining tags
  s = s.replace(/<[^>]+>/g, " ");

  // 5) decode basic HTML entities (&nbsp;, &amp;, &#x...;, &#...;)
  s = decodeEntities(s);

  // 6) whitespace tidy
  s = s.replace(/\u00A0/g, " "); // non-breaking space
  s = s.replace(/\s+\n/g, "\n");
  s = s.replace(/\n{3,}/g, "\n\n");
  s = s.replace(/[ \t]{2,}/g, " ");

  return collapse(s);
}

/** Compatibility helpers (all return tag-free text). */
export const sanitizeToText = toPlainText;
export const coerceToText = (input = "") => toPlainText(input);
export const htmlToTextPreserveBlocks = (html = "") => toPlainText(html);

// These keep old import names working but now also return PLAIN TEXT.
export const sanitizeDescHtml = toPlainText;
export const coerceToHtml = toPlainText;

