export interface ViralScore {
  score: number;
  reason: string;
  tags: string[];
}

export interface Article {
  id: number;
  title: string;
  source: string;
  url: string;
  summary?: string | null;
  published_at?: string | null;
  read_time_seconds?: number | null;
  image_url?: string | null;
  virality_view?: ViralScore | null;
}

export type SortBy = 'score' | 'published_at';
