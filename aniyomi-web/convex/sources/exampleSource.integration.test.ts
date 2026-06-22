import { describe, it, expect } from "vitest";
import { parsePopularPage, parseDetailsPage, parseChaptersPage } from "./exampleSource";

describe("MangaPill Live Scraper Integration Tests", () => {
  it("should fetch and parse popular page from live site", async () => {
    const response = await fetch("https://mangapill.com/search?q=one+piece");
    expect(response.ok).toBe(true);
    
    const html = await response.text();
    const results = parsePopularPage(html);
    
    expect(results.length).toBeGreaterThan(0);
    const op = results.find(r => r.title.toLowerCase().includes("one piece"));
    expect(op).toBeDefined();
    expect(op?.externalId).toBe("2/one-piece");
    expect(op?.coverUrl).toContain("mangapill");
  });

  it("should fetch and parse details page from live site", async () => {
    const response = await fetch("https://mangapill.com/manga/2/one-piece");
    expect(response.ok).toBe(true);
    
    const html = await response.text();
    const details = parseDetailsPage("2/one-piece", html);
    
    expect(details.title).toBe("One Piece");
    expect(details.status.toLowerCase()).toBe("publishing");
    expect(details.genres).toContain("Action");
    expect(details.synopsis.length).toBeGreaterThan(50);
  });

  it("should fetch and parse chapters list from live site", async () => {
    const response = await fetch("https://mangapill.com/manga/2/one-piece");
    expect(response.ok).toBe(true);
    
    const html = await response.text();
    const chapters = parseChaptersPage(html);
    
    expect(chapters.length).toBeGreaterThan(0);
    expect(chapters[0].number).toBeGreaterThan(0);
    expect(chapters[0].title).toContain("Chapter");
    expect(chapters[0].externalUrl).toContain("https://mangapill.com/chapters/");
  });
});
