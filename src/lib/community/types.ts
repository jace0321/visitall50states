export type TravelStyle =
  | "family"
  | "solo"
  | "couple"
  | "rv"
  | "motorcycle"
  | "van-life";

export type EntryStatus = "not_visited" | "visited" | "lived" | "want_to_go";

export interface TravelerProfile {
  username: string;
  displayName: string;
  avatarUrl?: string;
  bio: string;
  journeySummary: string;
  homeState: string;
  travelStyle: TravelStyle;
  travelingWith: string;
  statesVisited: number;
  statesLived: number;
  capitalsVisited: number;
  capitolBuildingsVisited: number;
  nationalParksVisited: number;
  completionPercent: number;
  badges: TravelerBadge[];
  featuredState?: string;
  currentRouteLabel?: string;
  routeHighlights?: string[];
  northStar?: string;
  nextTargets?: string[];
}

export interface TravelerBadge {
  key: string;
  name: string;
  icon: string;
  description: string;
}

export interface TravelerMapState {
  code: string;
  name: string;
  status: EntryStatus;
  hasStory?: boolean;
  storySlug?: string;
  /** Hero image from journal media when present (fills state shape on profile map). */
  previewImageUrl?: string;
}

export interface TravelerStateMediaItem {
  id: string;
  mediaKind: "photo" | "video";
  url: string;
  /** Poster image URL for video (map thumbnail + journal tiles). */
  posterUrl?: string | null;
  caption: string;
  altText: string;
  sortOrder: number;
  isFeatured: boolean;
  width?: number | null;
  height?: number | null;
  durationSeconds?: number | null;
}

export interface TravelerStateEntry {
  /** Present when loaded from Supabase (used by dashboard; safe to ignore on public pages). */
  entryId?: string;
  stateCode: string;
  stateName: string;
  status: EntryStatus;
  title: string;
  summary: string;
  story: string;
  favoriteMemory: string;
  bestStop: string;
  hiddenGem: string;
  bestFood: string;
  rating: number;
  dateVisited: string;
  cityRegion: string;
  familyFriendly: boolean;
  worthDetour: boolean;
  photos: { url: string; caption: string }[];
  /** Structured media from `traveler_state_media` when present. */
  structuredMedia?: TravelerStateMediaItem[];
  comments: { author: string; body: string }[];
}

export interface TravelerSpotlightCard {
  username: string;
  displayName: string;
  homeState: string;
  statesVisited: number;
  completionPercent: number;
  routeLabel: string;
  featuredState: string;
  featuredStoryTitle: string;
  deck: string;
  /** Hero image for directory cards (first journal lead or legacy photo). */
  coverImageUrl?: string;
}

export interface CommunityStoryPreview {
  username: string;
  displayName: string;
  stateName: string;
  stateSlug: string;
  title: string;
  summary: string;
  routeLabel: string;
  photoUrl: string;
}
