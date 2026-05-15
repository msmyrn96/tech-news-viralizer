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
  summary?: string;
  published_at?: string;
  read_time_seconds?: number;
  image_url?: string;
  virality_view?: ViralScore;
}

export type SortBy = 'score' | 'published_at';
