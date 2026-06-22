import * as cheerio from "cheerio";
import { MangaEntry, MangaDetails, ChapterEntry } from "./types";
import { action } from "../_generated/server";
import { v } from "convex/values";

const BASE_URL = "https://mangapill.com";

// Pure functions for HTML parsing (so we can test them in isolation)

export function parsePopularPage(html: string): MangaEntry[] {
  const $ = cheerio.load(html);
  const results: MangaEntry[] = [];
  
  // Selection based on the Search page grid layout
  $("div.my-3.grid > div").each((_, element) => {
    const aTag = $(element).find("a.relative.block");
    if (!aTag.length) return;
    
    const href = aTag.attr("href") || "";
    // href looks like: /manga/2/one-piece
    const externalId = href.startsWith("/manga/") ? href.substring(7) : href;
    
    const title = $(element).find("div.mt-3.font-black").text().trim();
    const coverUrl = aTag.find("img").attr("data-src") || aTag.find("img").attr("src") || "";
    
    if (externalId && title) {
      results.push({
        externalId,
        title,
        coverUrl,
      });
    }
  });
  
  return results;
}

export function parseLatestPage(html: string): MangaEntry[] {
  const $ = cheerio.load(html);
  const results: MangaEntry[] = [];
  
  // Selection based on latest updates page
  $("div.container div.grid > div").each((_, element) => {
    const aTag = $(element).find("a.relative.block");
    if (!aTag.length) return;
    
    const href = $(element).find("a.mt-1\\.5").attr("href") || "";
    const externalId = href.startsWith("/manga/") ? href.substring(7) : href;
    
    const title = $(element).find("a.mt-1\\.5 div.line-clamp-2").text().trim();
    const coverUrl = aTag.find("img").attr("data-src") || aTag.find("img").attr("src") || "";
    
    if (externalId && title) {
      // De-duplicate if already in list
      if (!results.some(r => r.externalId === externalId)) {
        results.push({
          externalId,
          title,
          coverUrl,
        });
      }
    }
  });
  
  return results;
}

export function parseDetailsPage(externalId: string, html: string): MangaDetails {
  const $ = cheerio.load(html);
  
  const title = $("h1.font-bold").text().trim();
  const coverUrl = $("div.text-transparent img").attr("data-src") || $("div.text-transparent img").attr("src") || "";
  const synopsis = $("p.text--secondary, p.text-secondary").text().trim();
  
  // Extract Status from key-value grid
  let status = "Unknown";
  $("div.grid div").each((_, element) => {
    const label = $(element).find("label").text().trim().toLowerCase();
    if (label === "status") {
      status = $(element).find("div").text().trim();
    }
  });
  
  // Extract Genres
  const genres: string[] = [];
  $("a[href*='genre=']").each((_, element) => {
    genres.push($(element).text().trim());
  });
  
  return {
    externalId,
    title,
    coverUrl,
    synopsis,
    status,
    genres,
  };
}

export function parseChaptersPage(html: string): ChapterEntry[] {
  const $ = cheerio.load(html);
  const results: ChapterEntry[] = [];
  
  $("#chapters a").each((_, element) => {
    const href = $(element).attr("href") || "";
    const title = $(element).text().trim();
    
    // Parse chapter number
    // Title is usually "Chapter 1185" or similar
    const numMatch = title.match(/Chapter\s+(\d+(\.\d+)?)/i);
    const number = numMatch ? parseFloat(numMatch[1]) : 0;
    
    results.push({
      number,
      title,
      externalUrl: BASE_URL + href,
      uploadDate: Date.now(), // Fallback as upload date is not listed in detail page
    });
  });
  
  return results;
}

// Convex Action Handlers

export const getPopular = action({
  args: { page: v.number() },
  handler: async (ctx, args) => {
    // Search page with blank query acts as popular/all page (paginated)
    const url = `${BASE_URL}/search?page=${args.page}&status=&type=manga`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch popular page: ${response.statusText}`);
    }
    const html = await response.text();
    return parsePopularPage(html);
  },
});

export const getLatest = action({
  args: { page: v.number() },
  handler: async (ctx, args) => {
    const url = `${BASE_URL}/manga/latest?page=${args.page}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch latest page: ${response.statusText}`);
    }
    const html = await response.text();
    return parseLatestPage(html);
  },
});

export const search = action({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const url = `${BASE_URL}/search?q=${encodeURIComponent(args.query)}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch search results: ${response.statusText}`);
    }
    const html = await response.text();
    return parsePopularPage(html);
  },
});

export const getDetails = action({
  args: { externalId: v.string() },
  handler: async (ctx, args) => {
    const url = `${BASE_URL}/manga/${args.externalId}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch details: ${response.statusText}`);
    }
    const html = await response.text();
    return parseDetailsPage(args.externalId, html);
  },
});

export const getChapterList = action({
  args: { externalId: v.string() },
  handler: async (ctx, args) => {
    const url = `${BASE_URL}/manga/${args.externalId}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch chapter list: ${response.statusText}`);
    }
    const html = await response.text();
    return parseChaptersPage(html);
  },
});
