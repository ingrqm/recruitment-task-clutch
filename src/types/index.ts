export type VideoUrlKey =
  | 'clutch_autopan'
  | 'match_wo_breaks'
  | 'clutch_landscape';

export type HighlightVideoUrls = Record<VideoUrlKey, string>;
export type HighlightThumbnailUrls = Record<VideoUrlKey, string>;

export type Video = {
  id: number;
  highlight_urls: {
    highlight_video_urls: HighlightVideoUrls;
    highlight_thumbnail_urls: HighlightThumbnailUrls;
  };
};

export type VideosResponse = {
  data: Video[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
};

export type Profile = {
  id: string;
  username: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  created_at: string;
};

export type Like = {
  id: string;
  user_id: string;
  video_id: string;
  created_at: string;
};

export type VideoStats = {
  video_id: string;
  like_count: number;
  comment_count: number;
};

export type Comment = {
  id: string;
  user_id: string;
  video_id: string;
  content: string;
  created_at: string;
  parent_id: string | null;
  profiles?: Profile;
  replies?: Comment[];
};
