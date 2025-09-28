// storage.ts
"use client";

import LZString from "lz-string";

const STORAGE_PREFIX = "scrape_";
const MAX_SCRAPES = 1;
export const LATEST_SCRAPE_ID = "company_latest";

export type ScrapeData = {
  ts: number;
  url: string;
  pages: { url: string; text: string }[];
  cleanedText?: string;
};

function isBrowser(): boolean {
  const ok = typeof window !== "undefined" && typeof localStorage !== "undefined";
  if (!ok) console.warn("[scrape] localStorage unavailable (SSR or restricted env)");
  return ok;
}

export function saveLatestScrape(data: Omit<ScrapeData, "ts">): void {
  saveScrape(LATEST_SCRAPE_ID, data);
}

export function loadLatestScrape(): ScrapeData | null {
  return loadScrape(LATEST_SCRAPE_ID);
}

export function saveScrape(id: string, data: Omit<ScrapeData, "ts">): void {
  if (!isBrowser()) return;

  cleanupOldScrapes();

  const key = STORAGE_PREFIX + id;
  const payload: ScrapeData = { ts: Date.now(), ...data };

  try {
    const json = JSON.stringify(payload);
    const compressed = LZString.compressToUTF16(json);
    localStorage.setItem(key, compressed);
  } catch (e) {
    console.error("[scrape] Failed to save:", e);
  }
}

export function loadScrape(id: string): ScrapeData | null {
  if (!isBrowser()) return null;

  const key = STORAGE_PREFIX + id;
  const compressed = localStorage.getItem(key);
  if (!compressed) {
    console.warn("[scrape] load: key missing", { key });
    return null;
  }
  try {
    const json = LZString.decompressFromUTF16(compressed);
    const data = json ? (JSON.parse(json) as ScrapeData) : null;
    return data;
  } catch (e) {
    console.error("[scrape] Failed to load:", e);
    return null;
  }
}

export function listScrapes(): Array<{ id: string; ts: number; url: string }> {
  if (!isBrowser()) return [];
  return Object.keys(localStorage)
    .filter((k) => k.startsWith(STORAGE_PREFIX))
    .map((k) => {
      const id = k.replace(STORAGE_PREFIX, "");
      const d = loadScrape(id);
      return d ? { id, ts: d.ts, url: d.url } : null;
    })
    .filter((x): x is { id: string; ts: number; url: string } => !!x);
}

export function deleteScrape(id: string): void {
  if (!isBrowser()) return;
  const key = STORAGE_PREFIX + id;
  localStorage.removeItem(key);
}

function cleanupOldScrapes(): void {
  if (!isBrowser()) return;
  const entries = listScrapes().sort((a, b) => a.ts - b.ts); // oldest first
  while (entries.length >= MAX_SCRAPES) {
    const oldest = entries.shift();
    if (oldest) deleteScrape(oldest.id);
  }
}

/** One-liner you can run in DevTools to inspect the latest */
export function debugLogLatest(): void {
  const d = loadLatestScrape();
  if (!d) return;
  console.table(d.pages.map((p, i) => ({ idx: i, url: p.url })));
}
