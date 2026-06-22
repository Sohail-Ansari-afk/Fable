# Source Extension Interface Guidelines

All scraper sources (manga or anime) must implement a consistent interface contract.

## MangaSource Interface
```typescript
interface MangaEntry {
  externalId: string;
  title: string;
  coverUrl: string;
}

interface MangaDetails {
  title: string;
  coverUrl: string;
  synopsis: string;
  status: string;
  genres: string[];
}

interface ChapterEntry {
  number: number;
  title: string;
  externalUrl: string;
  uploadDate: number; // timestamp
  scanlator?: string;
}

interface MangaSource {
  id: string;
  name: string;
  baseUrl: string;
  lang: string;
  getPopular(page: number): Promise<MangaEntry[]>;
  getLatest(page: number): Promise<MangaEntry[]>;
  search(query: string): Promise<MangaEntry[]>;
  getDetails(externalId: string): Promise<MangaDetails>;
  getChapterList(externalId: string): Promise<ChapterEntry[]>;
  getPageList(chapterExternalId: string): Promise<string[]>; // page image URLs
}
```

## AnimeSource Interface
```typescript
interface EpisodeEntry {
  number: number;
  title: string;
  externalUrl: string;
  uploadDate: number; // timestamp
  duration?: number;
}

interface AnimeSource {
  id: string;
  name: string;
  baseUrl: string;
  lang: string;
  getPopular(page: number): Promise<MangaEntry[]>; // returns AnimeEntry
  getLatest(page: number): Promise<MangaEntry[]>;
  search(query: string): Promise<MangaEntry[]>;
  getDetails(externalId: string): Promise<MangaDetails>;
  getEpisodeList(externalId: string): Promise<EpisodeEntry[]>;
  getStreamUrl(episodeExternalId: string): Promise<string>; // .m3u8 or video stream URL
}
```
