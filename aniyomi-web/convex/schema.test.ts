import { test, expect } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema";

test("schema loads without throwing", () => {
  const t = convexTest(schema, import.meta.glob("./**/*.*s"));
  expect(t).toBeDefined();
});

test("insert one document into EACH table and verify it returns an id", async () => {
  const t = convexTest(schema, import.meta.glob("./**/*.*s"));

  await t.run(async (ctx) => {
    // 1. sources
    const sourceId = await ctx.db.insert("sources", {
      name: "MangaDex",
      baseUrl: "https://mangadex.org",
      lang: "en",
      type: "manga",
      iconUrl: "https://mangadex.org/favicon.ico",
      version: "1.0.0",
      installed: true,
    });
    expect(sourceId).toBeDefined();

    // 2. manga
    const mangaId = await ctx.db.insert("manga", {
      sourceId,
      externalId: "manga-123",
      title: "One Piece",
      coverUrl: "https://example.com/cover.jpg",
      synopsis: "An awesome manga about pirates.",
      status: "Ongoing",
      genres: ["Action", "Adventure"],
    });
    expect(mangaId).toBeDefined();

    // 3. chapters
    const chapterId = await ctx.db.insert("chapters", {
      mangaId,
      number: 1,
      title: "Romance Dawn",
      externalUrl: "https://example.com/chapter1",
      uploadDate: Date.now(),
    });
    expect(chapterId).toBeDefined();

    // 4. episodes
    const episodeId = await ctx.db.insert("episodes", {
      mangaId,
      number: 1,
      title: "I'm Luffy!",
      externalUrl: "https://example.com/episode1",
      uploadDate: Date.now(),
    });
    expect(episodeId).toBeDefined();

    // 5. categories
    const categoryId = await ctx.db.insert("categories", {
      name: "Reading",
      order: 1,
    });
    expect(categoryId).toBeDefined();

    // 6. library
    const libraryId = await ctx.db.insert("library", {
      mangaId,
      categoryIds: [categoryId],
      addedAt: Date.now(),
    });
    expect(libraryId).toBeDefined();

    // 7. readingProgress
    const progressId = await ctx.db.insert("readingProgress", {
      mangaId,
      chapterId,
      position: 5,
      completed: false,
      lastReadAt: Date.now(),
    });
    expect(progressId).toBeDefined();

    const storageId = await ctx.storage.store(new Blob(["hello"], { type: "text/plain" }));
    const downloadId = await ctx.db.insert("downloads", {
      mangaId,
      chapterId,
      storageId,
      status: "completed",
    });
    expect(downloadId).toBeDefined();
  });
});

test("insert a manga + chapter, then query chapters by mangaId index", async () => {
  const t = convexTest(schema, import.meta.glob("./**/*.*s"));

  await t.run(async (ctx) => {
    const sourceId = await ctx.db.insert("sources", {
      name: "MangaDex",
      baseUrl: "https://mangadex.org",
      lang: "en",
      type: "manga",
      iconUrl: "https://mangadex.org/favicon.ico",
      version: "1.0.0",
      installed: true,
    });

    const mangaId = await ctx.db.insert("manga", {
      sourceId,
      externalId: "manga-123",
      title: "One Piece",
      coverUrl: "https://example.com/cover.jpg",
      synopsis: "An awesome manga about pirates.",
      status: "Ongoing",
      genres: ["Action", "Adventure"],
    });

    const chapterId = await ctx.db.insert("chapters", {
      mangaId,
      number: 1,
      title: "Romance Dawn",
      externalUrl: "https://example.com/chapter1",
      uploadDate: Date.now(),
    });

    const results = await ctx.db
      .query("chapters")
      .withIndex("by_mangaId", (q) => q.eq("mangaId", mangaId))
      .collect();

    expect(results.length).toBe(1);
    expect(results[0]._id).toBe(chapterId);
    expect(results[0].title).toBe("Romance Dawn");
  });
});
