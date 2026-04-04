/** Supabase Storage bucket for traveler state photos and videos. */
export const TRAVELER_STATE_MEDIA_BUCKET = "traveler-state-media";

/** Max photos per state entry (structured + legacy combined cap for new uploads). */
export const MAX_PHOTOS_PER_STATE_ENTRY = 10;

/** Max videos per state (browser upload; users should pre-compress — see storage bucket limit). */
export const MAX_VIDEOS_PER_STATE_ENTRY = 5;

/** Align with `storage_traveler_state_media_video.sql` per-object limit (50 MB). */
export const MAX_VIDEO_UPLOAD_BYTES = 50 * 1024 * 1024;

export type TravelerStateMediaTableRow = {
  id: string;
  media_kind: "photo" | "video";
  public_url: string | null;
  storage_path: string | null;
  poster_url?: string | null;
  caption: string | null;
  alt_text: string | null;
  sort_order: number | null;
  is_featured: boolean | null;
};
