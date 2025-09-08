/// <reference types="node" />
import { Buffer } from "node:buffer";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import JSZip from "jszip";
import { XMLParser } from "fast-xml-parser";

const isType = (t: string | null, m: string) => (t || "").toLowerCase() === m;
const ends = (n: string | null | undefined, ext: string) =>
  (n || "").toLowerCase().endsWith(ext);

export async function extractTextFromFile(file: File): Promise<string> {
  // Always start from File -> Buffer (works for all libs)
  const buf: Buffer = Buffer.from(await file.arrayBuffer());
  const name = file.name || "";
  const mime = (file.type || "").toLowerCase();

  // ---- PDF ----
  if (isType(mime, "application/pdf") || ends(name, ".pdf")) {
    const res = await pdfParse(buf);
    return (res.text || "").trim();
  }

  // ---- DOCX ----
  if (
    isType(
      mime,
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) || ends(name, ".docx")
  ) {
    const { value } = await mammoth.extractRawText({ buffer: buf });
    return (value || "").trim();
  }

  // ---- ODT ----
  if (isType(mime, "application/vnd.oasis.opendocument.text") || ends(name, ".odt")) {
    const zip = await JSZip.loadAsync(buf);
    const xml = await zip.file("content.xml")?.async("text");
    if (!xml) return "";
    const parser = new XMLParser({
      ignoreAttributes: false,
      removeNSPrefix: true,
      trimValues: false,
    });
    const j = parser.parse(xml);
    const office = j.office || j["office:document"];
    const body   = office?.body || office?.["office:body"];
    const text   = body?.text || body?.["office:text"];

    const out: string[] = [];
    const visit = (n: any): void => {
      if (!n) return;
      if (typeof n === "string") out.push(n);
      else if (Array.isArray(n)) n.forEach(visit);
      else {
        if (n.p) visit(n.p);
        if (n.h) visit(n.h);
        if (n.span) visit(n.span);
        if (n.s) out.push(" ");
        if (n.tab) out.push("\t");
        for (const k of Object.keys(n)) {
          if (["p","h","span","s","tab","@_style-name"].includes(k)) continue;
          visit(n[k]);
        }
      }
    };
    visit(text);

    return out.join(" ").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
  }

  // ---- Text-ish ----
  if (mime.startsWith("text/") || ends(name, ".txt") || ends(name, ".md") || ends(name, ".rtf")) {
    return buf.toString("utf8").trim();
  }

  // Fallback to utf8
  return buf.toString("utf8").trim();
}

// If other files still import the old name, you can keep this alias:
export const extractCvText = extractTextFromFile;
