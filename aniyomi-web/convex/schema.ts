import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  sources: defineTable({
    name: v.string(),
    baseUrl: v.string(),
    lang: v.string(),
    type: v.union(v.literal("manga"), v.literal("anime")),
    iconUrl: v.string(),
    version: v.string(),
    installed: v.boolean(),
  }),
  
  manga: defineTable({
    sourceId: v.id("sources"),
    externalId: v.string(),
    title: v.string(),
    coverUrl: v.string(),
    synopsis: v.string(),
    status: v.string(),
    genres: v.array(v.string()),
    anilistId: v.optional(v.string()),
  })
    .index("by_sourceId", ["sourceId"])
    .index("by_externalId", ["externalId"])
    .index("by_sourceId_externalId", ["sourceId", "externalId"]),

  chapters: defineTable({
    mangaId: v.id("manga"),
    number: v.number(),
    title: v.string(),
    externalUrl: v.string(),
    uploadDate: v.number(),
    scanlator: v.optional(v.string()),
  })
    .index("by_mangaId", ["mangaId"])
    .index("by_mangaId_number", ["mangaId", "number"]),

  episodes: defineTable({
    mangaId: v.id("manga"),
    number: v.number(),
    title: v.string(),
    externalUrl: v.string(),
    uploadDate: v.number(),
    duration: v.optional(v.number()),
  })
    .index("by_mangaId", ["mangaId"])
    .index("by_mangaId_number", ["mangaId", "number"]),

  categories: defineTable({
    name: v.string(),
    order: v.number(),
  }),

  library: defineTable({
    mangaId: v.id("manga"),
    categoryIds: v.array(v.id("categories")),
    addedAt: v.number(),
  })
    .index("by_mangaId", ["mangaId"]),

  readingProgress: defineTable({
    mangaId: v.id("manga"),
    chapterId: v.optional(v.id("chapters")),
    episodeId: v.optional(v.id("episodes")),
    position: v.number(),
    completed: v.boolean(),
    lastReadAt: v.number(),
  })
    .index("by_mangaId", ["mangaId"])
    .index("by_mangaId_chapterId", ["mangaId", "chapterId"])
    .index("by_mangaId_episodeId", ["mangaId", "episodeId"]),

  downloads: defineTable({
    mangaId: v.id("manga"),
    chapterId: v.optional(v.id("chapters")),
    episodeId: v.optional(v.id("episodes")),
    storageId: v.id("_storage"),
    status: v.string(),
  })
    .index("by_mangaId", ["mangaId"])
    .index("by_chapterId", ["chapterId"])
    .index("by_episodeId", ["episodeId"]),
});
