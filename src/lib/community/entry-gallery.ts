import type { TravelerStateEntry, TravelerStateMediaItem } from "./types";

export type GalleryPhoto = { url: string; caption: string };

export type JournalGalleryItem =
  | { mediaKind: "photo"; url: string; caption: string }
  | { mediaKind: "video"; url: string; posterUrl: string; caption: string };

function sortStructuredMedia(entry: TravelerStateEntry): TravelerStateMediaItem[] {
  const items = entry.structuredMedia?.filter((m) => m.url) ?? [];
  const featured = items.filter((m) => m.isFeatured).sort((a, b) => a.sortOrder - b.sortOrder);
  const rest = items.filter((m) => !m.isFeatured).sort((a, b) => a.sortOrder - b.sortOrder);
  return [...featured, ...rest];
}

/** Photos + videos in display order (featured first) for the state journal lightbox. */
export function resolveJournalGallery(entry: TravelerStateEntry): JournalGalleryItem[] {
  const sorted = sortStructuredMedia(entry);
  if (sorted.length > 0) {
    return sorted.map((m) => {
      if (m.mediaKind === "video") {
        const poster = (m.posterUrl ?? "").trim();
        return {
          mediaKind: "video" as const,
          url: m.url,
          posterUrl: poster || m.url,
          caption: m.caption || m.altText || "",
        };
      }
      return {
        mediaKind: "photo" as const,
        url: m.url,
        caption: m.caption || m.altText || "",
      };
    });
  }
  return entry.photos
    .filter((p) => p.url)
    .map((p) => ({ mediaKind: "photo" as const, url: p.url!, caption: p.caption || "" }));
}

/**
 * Photos only (excludes video). Prefer `resolveJournalGallery` when rendering the full journal.
 */
export function resolveEntryGalleryPhotos(entry: TravelerStateEntry): GalleryPhoto[] {
  return resolveJournalGallery(entry)
    .filter((item): item is { mediaKind: "photo"; url: string; caption: string } => item.mediaKind === "photo")
    .map(({ url, caption }) => ({ url, caption }));
}

/** First hero still: lead photo URL, or video poster if the lead is a clip. */
export function resolveEntryHeroImageUrl(entry: TravelerStateEntry, fallback = "/hero-highway.jpg"): string {
  const sorted = sortStructuredMedia(entry);
  const first = sorted[0];
  if (first) {
    if (first.mediaKind === "photo") return first.url || fallback;
    if (first.mediaKind === "video") return (first.posterUrl?.trim() || first.url || fallback) as string;
  }
  const legacy = entry.photos.find((p) => p.url)?.url;
  return legacy || fallback;
}

/**
 * Map tile inset: prefer a real photo URL; for a featured video use its poster (not the raw `.mp4` in an `<img>`).
 */
export function resolveEntryPreviewImageUrl(entry: TravelerStateEntry): string | undefined {
  const sorted = sortStructuredMedia(entry);
  const first = sorted[0];
  if (first) {
    if (first.mediaKind === "photo") {
      const u = first.url;
      if (!u || u === "/hero-highway.jpg") return undefined;
      return u;
    }
    const poster = first.posterUrl?.trim();
    if (poster) return poster;
    return undefined;
  }
  const legacy = entry.photos.find((p) => p.url)?.url;
  if (!legacy || legacy === "/hero-highway.jpg") return undefined;
  return legacy;
}

export function entryPhotoCount(entry: TravelerStateEntry): number {
  const structured = entry.structuredMedia ?? [];
  if (structured.length > 0) {
    return structured.filter((m) => m.mediaKind === "photo").length;
  }
  return entry.photos.filter((p) => p.url).length;
}

export function entryVideoCount(entry: TravelerStateEntry): number {
  return (entry.structuredMedia ?? []).filter((m) => m.mediaKind === "video").length;
}
