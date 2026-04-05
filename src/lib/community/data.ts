import type { SupabaseClient } from "@supabase/supabase-js";
import { STATE_NAMES } from "@/lib/states";
import US_STATE_PATHS from "@/lib/us-map-paths";
import { supabase } from "@/lib/supabase";
import { resolveEntryHeroImageUrl, resolveEntryPreviewImageUrl } from "./entry-gallery";
import type {
  TravelerMapState,
  TravelerProfile,
  TravelerSpotlightCard,
  TravelerStateEntry,
  TravelerStateMediaItem,
} from "./types";

const nameToCode = new Map(US_STATE_PATHS.map((s) => [s.name, s.code]));

type TravelerProfileRow = {
  id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  home_state: string | null;
  travel_style: TravelerProfile["travelStyle"] | null;
  traveling_with: string | null;
  is_public: boolean | null;
  featured_state: string | null;
  current_route_label: string | null;
  north_star: string | null;
  next_targets: string[] | null;
  route_highlights: string[] | null;
};

type UserMapRow = {
  states_visited: string[] | null;
};

type TravelerStateEntryRow = {
  id: string;
  traveler_profile_id: string;
  state_code: string;
  state_name: string;
  slug: string;
  status: TravelerStateEntry["status"];
  title: string;
  summary: string;
  story: string;
  favorite_memory: string | null;
  best_stop: string | null;
  hidden_gem: string | null;
  best_food: string | null;
  rating: number | null;
  date_visited: string | null;
  city_region: string | null;
  family_friendly: boolean | null;
  worth_detour: boolean | null;
  photos: TravelerStateEntry["photos"] | null;
  comments: TravelerStateEntry["comments"] | null;
};

type TravelerStateMediaRow = {
  id: string;
  traveler_state_entry_id: string;
  media_kind: string;
  public_url: string | null;
  storage_path: string | null;
  poster_url: string | null;
  caption: string | null;
  alt_text: string | null;
  sort_order: number | null;
  is_featured: boolean | null;
  width: number | null;
  height: number | null;
  duration_seconds: number | null;
};

function resolvePublicMediaUrl(
  row: Pick<TravelerStateMediaRow, "public_url" | "storage_path">,
  baseUrl: string
): string {
  const direct = row.public_url?.trim();
  if (direct) return direct;
  const path = row.storage_path?.trim();
  if (path && baseUrl) {
    return `${baseUrl.replace(/\/$/, "")}/storage/v1/object/public/traveler-state-media/${path}`;
  }
  return "";
}

function mapMediaRowToItem(row: TravelerStateMediaRow, baseUrl: string): TravelerStateMediaItem {
  const isVideo = row.media_kind === "video";
  const posterRaw = row.poster_url?.trim();
  const posterUrl =
    isVideo && posterRaw
      ? posterRaw.startsWith("http")
        ? posterRaw
        : `${baseUrl.replace(/\/$/, "")}/storage/v1/object/public/traveler-state-media/${posterRaw}`
      : undefined;

  return {
    id: row.id,
    mediaKind: isVideo ? "video" : "photo",
    url: resolvePublicMediaUrl(row, baseUrl),
    posterUrl,
    caption: row.caption ?? "",
    altText: row.alt_text ?? "",
    sortOrder: row.sort_order ?? 0,
    isFeatured: Boolean(row.is_featured),
    width: row.width,
    height: row.height,
    durationSeconds: row.duration_seconds,
  };
}

async function fetchMediaForEntries(
  entryIds: string[],
  client: SupabaseClient = supabase
): Promise<Map<string, TravelerStateMediaItem[]>> {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const result = new Map<string, TravelerStateMediaItem[]>();
  if (entryIds.length === 0) return result;

  const { data, error } = await client
    .from("traveler_state_media")
    .select(
      "id, traveler_state_entry_id, media_kind, public_url, storage_path, poster_url, caption, alt_text, sort_order, is_featured, width, height, duration_seconds"
    )
    .in("traveler_state_entry_id", entryIds)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to load traveler state media", error);
    return result;
  }

  for (const row of (data as TravelerStateMediaRow[] | null) ?? []) {
    const item = mapMediaRowToItem(row, baseUrl);
    if (!item.url) continue;
    const list = result.get(row.traveler_state_entry_id) ?? [];
    list.push(item);
    result.set(row.traveler_state_entry_id, list);
  }

  return result;
}

function toTravelerProfile(row: TravelerProfileRow, statesVisited: number): TravelerProfile {
  const completionPercent = Math.round((statesVisited / 50) * 100);

  return {
    username: row.username,
    displayName: row.display_name ?? row.username,
    bio: row.bio ?? "Road-tripping across the country one earned stop at a time.",
    journeySummary:
      row.north_star ??
      "Building a real 50-state map from actual miles, honest stops, and the places worth remembering.",
    homeState: row.home_state ?? "Unknown",
    travelStyle: row.travel_style ?? "family",
    travelingWith: row.traveling_with ?? "Open road",
    statesVisited,
    statesLived: 0,
    capitalsVisited: 0,
    capitolBuildingsVisited: 0,
    nationalParksVisited: 0,
    completionPercent,
    badges: [],
    featuredState: row.featured_state ?? undefined,
    currentRouteLabel: row.current_route_label ?? undefined,
    routeHighlights: row.route_highlights ?? [],
    northStar: row.north_star ?? undefined,
    nextTargets: row.next_targets ?? [],
  };
}

function slugify(value: string) {
  return value.toLowerCase().replace(/\s+/g, "-");
}

function makeVisitedOnlyMapStates(visited: string[], entries: TravelerStateEntry[] = []): TravelerMapState[] {
  const visitedSet = new Set(visited);
  const entriesByState = new Map(entries.map((entry) => [entry.stateCode, entry]));

  return STATE_NAMES.map((name) => {
    const code = nameToCode.get(name) ?? name.slice(0, 2).toUpperCase();
    const entry = entriesByState.get(code);

    return {
      code,
      name,
      status: entry?.status ?? (visitedSet.has(name) ? "visited" : "not_visited"),
      hasStory: Boolean(entry),
      storySlug: entry ? slugify(entry.stateName) : undefined,
      previewImageUrl: entry ? resolveEntryPreviewImageUrl(entry) : undefined,
    };
  });
}

async function fetchPublicTravelerProfileRow(username: string) {
  const { data, error } = await supabase
    .from("traveler_profiles")
    .select(
      "id, user_id, username, display_name, bio, home_state, travel_style, traveling_with, is_public, featured_state, current_route_label, north_star, next_targets, route_highlights"
    )
    .eq("username", username)
    .eq("is_public", true)
    .maybeSingle();

  if (error) {
    console.error("Failed to load traveler profile", error);
    return null;
  }

  return (data as TravelerProfileRow | null) ?? null;
}

async function fetchVisitedStatesForUser(userId: string, client: SupabaseClient = supabase) {
  const { data, error } = await client
    .from("users_maps")
    .select("states_visited")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Failed to load traveler map states", error);
    return [];
  }

  return Array.isArray((data as UserMapRow | null)?.states_visited)
    ? ((data as UserMapRow).states_visited ?? []).filter((value): value is string => typeof value === "string")
    : [];
}

async function fetchTravelerEntriesForProfile(profileId: string, client: SupabaseClient = supabase) {
  const { data, error } = await client
    .from("traveler_state_entries")
    .select(
      "id, traveler_profile_id, state_code, state_name, slug, status, title, summary, story, favorite_memory, best_stop, hidden_gem, best_food, rating, date_visited, city_region, family_friendly, worth_detour, photos, comments"
    )
    .eq("traveler_profile_id", profileId)
    .order("date_visited", { ascending: false, nullsFirst: false });

  if (error) {
    console.error("Failed to load traveler entries", error);
    return [];
  }

  const rows = (data as TravelerStateEntryRow[] | null) ?? [];
  const mediaByEntry = await fetchMediaForEntries(rows.map((r) => r.id), client);

  return rows.map((row) => ({
    entryId: row.id,
    stateCode: row.state_code,
    stateName: row.state_name,
    status: row.status ?? "visited",
    title: row.title,
    summary: row.summary,
    story: row.story,
    favoriteMemory: row.favorite_memory ?? "",
    bestStop: row.best_stop ?? "",
    hiddenGem: row.hidden_gem ?? "",
    bestFood: row.best_food ?? "",
    rating: row.rating ?? 0,
    dateVisited: row.date_visited ?? "",
    cityRegion: row.city_region ?? "",
    familyFriendly: row.family_friendly ?? true,
    worthDetour: row.worth_detour ?? true,
    photos: Array.isArray(row.photos) ? row.photos : [],
    structuredMedia: mediaByEntry.get(row.id) ?? [],
    comments: Array.isArray(row.comments) ? row.comments : [],
  })) satisfies TravelerStateEntry[];
}

/** Signed-in dashboard: load profile + map + entries using the browser Supabase client (session-aware). */
export async function fetchTravelerDashboardBundle(
  client: SupabaseClient,
  userId: string
): Promise<{ profile: TravelerProfile; mapStates: TravelerMapState[] } | null> {
  const { data: row, error } = await client
    .from("traveler_profiles")
    .select(
      "id, user_id, username, display_name, bio, home_state, travel_style, traveling_with, is_public, featured_state, current_route_label, north_star, next_targets, route_highlights"
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Failed to load dashboard traveler profile", error);
    return null;
  }
  if (!row) return null;

  const profileRow = row as TravelerProfileRow;
  const visitedStates = await fetchVisitedStatesForUser(userId, client);
  const entries = await fetchTravelerEntriesForProfile(profileRow.id, client);
  const profile = toTravelerProfile(profileRow, visitedStates.length);
  const mapStates = makeVisitedOnlyMapStates(visitedStates, entries);

  return { profile, mapStates };
}

export async function getTravelerProfile(username: string) {
  const row = await fetchPublicTravelerProfileRow(username);
  if (!row) return null;

  const visitedStates = await fetchVisitedStatesForUser(row.user_id);
  return toTravelerProfile(row, visitedStates.length);
}

export async function getTravelerMapStates(username: string) {
  const row = await fetchPublicTravelerProfileRow(username);
  if (!row) return makeVisitedOnlyMapStates([]);

  const { data: profileData, error: profileError } = await supabase
    .from("traveler_profiles")
    .select("id")
    .eq("username", username)
    .eq("is_public", true)
    .maybeSingle();

  if (profileError || !profileData?.id) {
    if (profileError) console.error("Failed to resolve traveler profile id", profileError);
    const visitedStates = await fetchVisitedStatesForUser(row.user_id);
    return makeVisitedOnlyMapStates(visitedStates);
  }

  const visitedStates = await fetchVisitedStatesForUser(row.user_id);
  const entries = await fetchTravelerEntriesForProfile(profileData.id as string);
  return makeVisitedOnlyMapStates(visitedStates, entries);
}

export async function getTravelerEntries(username: string): Promise<TravelerStateEntry[]> {
  const { data, error } = await supabase
    .from("traveler_profiles")
    .select("id")
    .eq("username", username)
    .eq("is_public", true)
    .maybeSingle();

  if (error || !data?.id) {
    if (error) console.error("Failed to resolve traveler profile for entries", error);
    return [];
  }

  return fetchTravelerEntriesForProfile(data.id as string);
}

export async function getTravelerEntry(username: string, stateSlug: string): Promise<TravelerStateEntry | null> {
  const entries = await getTravelerEntries(username);
  return entries.find((entry) => slugify(entry.stateName) === stateSlug) ?? null;
}

export async function getCommunityStoryPreviews(currentUsername?: string) {
  const { data, error } = await supabase
    .from("traveler_state_entries")
    .select("id, state_name, title, summary, date_visited, photos, traveler_profile_id")
    .order("date_visited", { ascending: false, nullsFirst: false })
    .limit(28);

  if (error) {
    console.error("Failed to load community story previews", error);
    return [];
  }

  const rows = (data ?? []) as Pick<
    TravelerStateEntryRow,
    "id" | "state_name" | "title" | "summary" | "date_visited" | "photos" | "traveler_profile_id"
  >[];

  if (rows.length === 0) return [];

  const profileIds = Array.from(new Set(rows.map((r) => r.traveler_profile_id)));
  const { data: profileRows, error: profileError } = await supabase
    .from("traveler_profiles")
    .select("id, username, display_name, current_route_label")
    .in("id", profileIds)
    .eq("is_public", true);

  if (profileError) {
    console.error("Failed to load profiles for community previews", profileError);
    return [];
  }

  const profileById = new Map(
    ((profileRows ?? []) as { id: string; username: string; display_name: string | null; current_route_label: string | null }[]).map(
      (p) => [p.id, p]
    )
  );

  const mediaByEntry = await fetchMediaForEntries(rows.map((r) => r.id));

  let previews = rows
    .map((r) => {
      const p = profileById.get(r.traveler_profile_id);
      if (!p) return null;

      const structuredMedia = mediaByEntry.get(r.id) ?? [];
      const pseudo: TravelerStateEntry = {
        stateCode: "",
        stateName: r.state_name,
        status: "visited",
        title: r.title,
        summary: r.summary,
        story: "",
        favoriteMemory: "",
        bestStop: "",
        hiddenGem: "",
        bestFood: "",
        rating: 0,
        dateVisited: r.date_visited ?? "",
        cityRegion: "",
        familyFriendly: true,
        worthDetour: true,
        photos: Array.isArray(r.photos) ? (r.photos as TravelerStateEntry["photos"]) : [],
        structuredMedia,
        comments: [],
      };

      return {
        username: p.username,
        displayName: p.display_name?.trim() || p.username,
        stateName: r.state_name,
        stateSlug: slugify(r.state_name),
        title: r.title,
        summary: r.summary,
        routeLabel: p.current_route_label?.trim() || "On the road",
        photoUrl: resolveEntryHeroImageUrl(pseudo),
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  if (currentUsername) {
    previews = previews.filter((s) => s.username !== currentUsername);
  }

  return previews.slice(0, 12);
}

export async function getTravelerSpotlightCards(): Promise<TravelerSpotlightCard[]> {
  const { data, error } = await supabase
    .from("traveler_profiles")
    .select(
      "id, user_id, username, display_name, bio, home_state, travel_style, traveling_with, is_public, featured_state, current_route_label, north_star, next_targets, route_highlights"
    )
    .eq("is_public", true)
    .order("created_at", { ascending: true })
    .limit(24);

  if (error) {
    console.error("Failed to load traveler spotlight cards", error);
    return [];
  }

  if (!data?.length) return [];

  const rows = data as TravelerProfileRow[];
  const cards = await Promise.all(
    rows.map(async (row) => {
      const visitedStates = await fetchVisitedStatesForUser(row.user_id);
      const profile = toTravelerProfile(row, visitedStates.length);
      const entries = await fetchTravelerEntriesForProfile(row.id);
      const featuredEntry = entries[0];
      const coverImageUrl = featuredEntry ? resolveEntryHeroImageUrl(featuredEntry) : undefined;

      return {
        username: profile.username,
        displayName: profile.displayName,
        homeState: profile.homeState,
        statesVisited: profile.statesVisited,
        completionPercent: profile.completionPercent,
        routeLabel: profile.currentRouteLabel ?? "On the road",
        featuredState: featuredEntry?.stateName ?? profile.featuredState ?? profile.homeState,
        featuredStoryTitle: featuredEntry?.title ?? "Stories from the road",
        deck: profile.northStar ?? profile.journeySummary,
        coverImageUrl,
      } satisfies TravelerSpotlightCard;
    })
  );

  return cards;
}
