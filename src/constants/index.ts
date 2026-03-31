export const CLUTCH_API_URL = process.env.EXPO_PUBLIC_CLUTCH_API_URL!;

export const VIDEO_URL_LABELS: Record<string, string> = {
  clutch_autopan: 'Autopan',
  match_wo_breaks: 'Full Match',
  clutch_landscape: 'Landscape',
};

export const DEFAULT_VIDEO_URL_KEY = 'clutch_autopan' as const;

export const AVATARS_BUCKET = 'avatars';
