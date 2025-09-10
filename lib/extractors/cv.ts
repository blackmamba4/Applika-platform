/// <reference types="node" />
import { Buffer } from "node:buffer";
import mammoth from "mammoth";
import JSZip from "jszip";
import { XMLParser } from "fast-xml-parser";

// Simple PDF text extraction without external dependencies
const extractPdfText = async (buffer: Buffer): Promise<string> => {
  try {
    // Convert buffer to string and look for text patterns
    const pdfString = buffer.toString('binary');
    
    // Look for text objects in PDF format
    const textMatches = pdfString.match(/BT\s+([^E]+)ET/g);
    if (textMatches && textMatches.length > 0) {
      return textMatches
        .map(match => {
          // Extract text content between BT and ET
          const content = match.replace(/BT\s+/, '').replace(/ET/, '');
          // Remove PDF formatting codes
          return content
            .replace(/\(/g, '')
            .replace(/\)/g, '')
            .replace(/\\n/g, ' ')
            .replace(/\\r/g, ' ')
            .replace(/\\t/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        })
        .filter(text => text.length > 0)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
    }
    
    // Alternative: look for stream objects with text
    const streamMatches = pdfString.match(/stream\s+([^e]+)endstream/g);
    if (streamMatches && streamMatches.length > 0) {
      return streamMatches
        .map(match => {
          const content = match.replace(/stream\s+/, '').replace(/endstream/, '');
          // Try to extract readable text
          return content
            .replace(/[^\x20-\x7E]/g, ' ') // Keep only printable ASCII
            .replace(/\s+/g, ' ')
            .trim();
        })
        .filter(text => text.length > 10) // Only keep substantial text
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
    }
    
    // Final fallback: try to extract any readable text
    const readableText = buffer.toString('utf8')
      .replace(/[^\x20-\x7E]/g, ' ') // Keep only printable ASCII
      .replace(/\s+/g, ' ')
      .trim();
    
    return readableText;
  } catch (error) {
    console.warn("PDF text extraction failed:", error);
    // Ultimate fallback
    return buffer.toString('utf8').trim();
  }
};

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
    try {
      const text = await extractPdfText(buf);
      
      // If PDF parsing returned empty text, try fallback
      if (!text) {
        console.warn("PDF parsing returned empty text, using fallback");
        return buf.toString("utf8").trim();
      }
      
      return text;
    } catch (error: any) {
      console.error("PDF parsing failed:", error?.message || error);
      // Fallback to utf8 decoding for PDFs
      return buf.toString("utf8").trim();
    }
  }

  // ---- DOCX ----
  if (
    isType(
      mime,
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) || ends(name, ".docx")
  ) {
    try {
      const { value } = await mammoth.extractRawText({ buffer: buf });
      return (value || "").trim();
    } catch (error: any) {
      console.error("DOCX parsing failed:", error?.message || error);
      return buf.toString("utf8").trim();
    }
  }

  // ---- ODT ----
  if (isType(mime, "application/vnd.oasis.opendocument.text") || ends(name, ".odt")) {
    try {
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
    } catch (error: any) {
      console.error("ODT parsing failed:", error?.message || error);
      return buf.toString("utf8").trim();
    }
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
