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
}

export interface TravelerStateEntry {
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
  comments: { author: string; body: string }[];
}
