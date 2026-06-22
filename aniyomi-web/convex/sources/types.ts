export interface MangaEntry {
  externalId: string; // e.g. "2/one-piece" or "3258/one-piece-digital-colored-comics"
  title: string;
  coverUrl: string;
}

export interface MangaDetails {
  externalId: string;
  title: string;
  coverUrl: string;
  synopsis: string;
  status: string;
  genres: string[];
}

export interface ChapterEntry {
  number: number;
  title: string;
  externalUrl: string; // e.g. "/chapters/2-11185000/one-piece-chapter-1185"
  uploadDate: number; // Unix timestamp in ms
  scanlator?: string;
}

export interface MangaSource {
  id: string;
  name: string;
  baseUrl: string;
  lang: string;
  getPopular(page: number): Promise<MangaEntry[]>;
  getLatest(page: number): Promise<MangaEntry[]>;
  search(query: string): Promise<MangaEntry[]>;
  getDetails(externalId: string): Promise<MangaDetails>;
  getChapterList(externalId: string): Promise<ChapterEntry[]>;
}
