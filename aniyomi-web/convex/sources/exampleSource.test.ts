import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { parsePopularPage, parseDetailsPage, parseChaptersPage } from "./exampleSource";

describe("MangaPill Parser Unit Tests", () => {
  it("should parse popular page correctly from fixture", () => {
    const fixturePath = path.join(__dirname, "../../testing/fixtures/exampleSource-popular.html");
    const html = fs.readFileSync(fixturePath, "utf-8");
    const results = parsePopularPage(html);
    
    expect(results).toHaveLength(2);
    expect(results[0]).toEqual({
      externalId: "2/one-piece",
      title: "One Piece",
      coverUrl: "https://cdn.readdetectiveconan.com/file/mangapill/i/2.webp",
    });
    expect(results[1]).toEqual({
      externalId: "3258/one-piece-digital-colored-comics",
      title: "One Piece - Digital Colored Comics",
      coverUrl: "https://cdn.readdetectiveconan.com/file/mangapill/i/3258.jpeg",
    });
  });

  it("should parse details page successfully", () => {
    const sampleDetailsHtml = `
      <div class="container">
        <h1 class="font-bold">One Piece</h1>
        <div class="text-transparent">
          <img data-src="https://cdn.readdetectiveconan.com/file/mangapill/i/2.webp" />
        </div>
        <p class="text-secondary">Monkey D. Luffy seeks the One Piece.</p>
        <div class="grid">
          <div>
            <label>Status</label>
            <div>publishing</div>
          </div>
        </div>
        <a href="/search?genre=Action">Action</a>
        <a href="/search?genre=Adventure">Adventure</a>
      </div>
    `;
    const details = parseDetailsPage("2/one-piece", sampleDetailsHtml);
    expect(details.title).toBe("One Piece");
    expect(details.coverUrl).toBe("https://cdn.readdetectiveconan.com/file/mangapill/i/2.webp");
    expect(details.synopsis).toBe("Monkey D. Luffy seeks the One Piece.");
    expect(details.status).toBe("publishing");
    expect(details.genres).toEqual(["Action", "Adventure"]);
  });

  it("should parse chapters list successfully", () => {
    const sampleChaptersHtml = `
      <div id="chapters">
        <a href="/chapters/2-11185000/one-piece-chapter-1185">Chapter 1185</a>
        <a href="/chapters/2-11184000/one-piece-chapter-1184">Chapter 1184</a>
      </div>
    `;
    const chapters = parseChaptersPage(sampleChaptersHtml);
    expect(chapters).toHaveLength(2);
    expect(chapters[0].number).toBe(1185);
    expect(chapters[0].title).toBe("Chapter 1185");
    expect(chapters[0].externalUrl).toBe("https://mangapill.com/chapters/2-11185000/one-piece-chapter-1185");
    expect(chapters[1].number).toBe(1184);
  });
});
