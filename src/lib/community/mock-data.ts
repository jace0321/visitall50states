import { STATE_NAMES } from "@/lib/states";
import US_STATE_PATHS from "@/lib/us-map-paths";
import { resolveEntryHeroImageUrl } from "./entry-gallery";
import type {
  CommunityStoryPreview,
  TravelerBadge,
  TravelerMapState,
  TravelerProfile,
  TravelerSpotlightCard,
  TravelerStateEntry,
} from "./types";

const nameToCode = new Map(US_STATE_PATHS.map((s) => [s.name, s.code]));

const BADGES: TravelerBadge[] = [
  { key: "ten-states", name: "10 States", icon: "🔟", description: "Logged double-digit state progress." },
  { key: "national-park-explorer", name: "Park Explorer", icon: "🏔️", description: "National park miles are part of the route." },
  { key: "capitol-collector", name: "Capitol Collector", icon: "🏛️", description: "Stops for capitals and domes, not just highways." },
];

const COMMON_PHOTOS = [
  { url: "/hero-highway.jpg", caption: "Road in, story waiting." },
  { url: "/hero-highway.jpg", caption: "End-of-day light that made the stop stick." },
];

function slugify(value: string) {
  return value.toLowerCase().replace(/\s+/g, "-");
}

function makeMapStates(visited: string[], wishlist: string[], lived: string[] = []): TravelerMapState[] {
  const visitedSet = new Set(visited);
  const wishlistSet = new Set(wishlist);
  const livedSet = new Set(lived);

  return STATE_NAMES.map((name) => {
    const status = livedSet.has(name)
      ? "lived"
      : visitedSet.has(name)
        ? "visited"
        : wishlistSet.has(name)
          ? "want_to_go"
          : "not_visited";

    return {
      code: nameToCode.get(name) ?? name.slice(0, 2).toUpperCase(),
      name,
      status,
      hasStory: visitedSet.has(name) || livedSet.has(name),
    };
  });
}

const travelerProfiles: Record<string, TravelerProfile> = {
  "jace-demo": {
    username: "jace-demo",
    displayName: "Jace Demo",
    bio: "Boilermaker, road chaser, memory keeper.",
    journeySummary:
      "Working through all 50 states one real trip at a time — family miles, roadside wins, and the places that actually stayed with us.",
    homeState: "Illinois",
    travelStyle: "family",
    travelingWith: "Family",
    statesVisited: 18,
    statesLived: 1,
    capitalsVisited: 7,
    capitolBuildingsVisited: 4,
    nationalParksVisited: 9,
    completionPercent: 36,
    badges: BADGES,
    featuredState: "Tennessee",
    currentRouteLabel: "Spring southbound loop",
    routeHighlights: ["St. Louis", "Nashville", "Chattanooga", "Smokies edge"],
    northStar: "Build an honest family road archive, not fake flex travel content.",
    nextTargets: ["Maine", "Utah", "Arizona"],
  },
  "roadmom-jess": {
    username: "roadmom-jess",
    displayName: "Jess Carter",
    bio: "Weekend route planner, cooler packer, and sunrise stop defender.",
    journeySummary:
      "Trying to show my kids the country in pieces that feel real: a state at a time, one memory-rich stop at a time.",
    homeState: "Missouri",
    travelStyle: "family",
    travelingWith: "Two kids + snacks",
    statesVisited: 23,
    statesLived: 2,
    capitalsVisited: 11,
    capitolBuildingsVisited: 6,
    nationalParksVisited: 7,
    completionPercent: 46,
    badges: BADGES,
    featuredState: "Colorado",
    currentRouteLabel: "Summer mountain swing",
    routeHighlights: ["Kansas City", "Denver", "Estes Park", "Santa Fe"],
    northStar: "Leave the kids with a memory map they can still feel later.",
    nextTargets: ["Oregon", "Washington", "Maine"],
  },
  "dieselanddust": {
    username: "dieselanddust",
    displayName: "Marcus Hale",
    bio: "Trade work, long-haul drives, and a camera that only comes out when a place earns it.",
    journeySummary:
      "More blue-collar roadbook than influencer feed — truck stops, state lines, city edges, and the stops worth the detour.",
    homeState: "Texas",
    travelStyle: "motorcycle",
    travelingWith: "Mostly solo",
    statesVisited: 31,
    statesLived: 3,
    capitalsVisited: 14,
    capitolBuildingsVisited: 9,
    nationalParksVisited: 12,
    completionPercent: 62,
    badges: BADGES,
    featuredState: "Montana",
    currentRouteLabel: "Big sky reset run",
    routeHighlights: ["Amarillo", "Santa Fe", "Wyoming line", "Bozeman"],
    northStar: "Make the map feel earned instead of completed.",
    nextTargets: ["Alaska", "Maine", "Vermont"],
  },
};

const travelerEntries: Record<string, TravelerStateEntry[]> = {
  "jace-demo": [
    {
      stateCode: "TN",
      stateName: "Tennessee",
      status: "visited",
      title: "Nashville surprised me more than I expected",
      summary: "Good food, real energy, and way more than Broadway if you know where to look.",
      story:
        "We rolled into Nashville expecting a quick stop and ended up staying longer than planned. The city had more layers than I gave it credit for — music, food, and neighborhoods that actually felt lived in. What stuck with me most was how the stop changed pace after sunset. The loud parts were still there, but the better memory was just standing back for a minute and letting the whole place breathe.",
      favoriteMemory: "Watching the city light up after a long day on the road.",
      bestStop: "Shelby Street Pedestrian Bridge at sunset.",
      hiddenGem: "A quieter breakfast spot off the main tourist strip was honestly one of the best parts.",
      bestFood: "Hot chicken — but not from the first flashy place you see.",
      rating: 5,
      dateVisited: "2025-08-12",
      cityRegion: "Nashville",
      familyFriendly: true,
      worthDetour: true,
      photos: COMMON_PHOTOS,
      comments: [
        { author: "RoadDad83", body: "Agree on Nashville — way better once you get beyond the obvious spots." },
        { author: "TravelMomJess", body: "Would love to know your breakfast recommendation once comments go live." },
      ],
    },
    {
      stateCode: "TX",
      stateName: "Texas",
      status: "visited",
      title: "Texas feels bigger than the map can show",
      summary: "Long miles, big skies, and the kind of trip that resets your head.",
      story:
        "Texas is one of those states where the drive itself becomes the thing you remember. The distances force you to slow down and take it in differently. By the second day, the point wasn’t the next stop anymore — it was the space between them. That’s what made it good.",
      favoriteMemory: "Watching the road stretch out forever under a gold sky.",
      bestStop: "Any scenic roadside pull-off where the sky opens up.",
      hiddenGem: "The quieter stretches between the obvious destinations.",
      bestFood: "Brisket, no question.",
      rating: 5,
      dateVisited: "2025-05-03",
      cityRegion: "Hill Country",
      familyFriendly: true,
      worthDetour: true,
      photos: [{ url: "/hero-highway.jpg", caption: "Texas miles." }],
      comments: [{ author: "MapChaser", body: "This is exactly how Texas feels." }],
    },
    {
      stateCode: "IL",
      stateName: "Illinois",
      status: "lived",
      title: "Home state, but still part of the story",
      summary: "Illinois is less a checkbox than the baseline everything else gets measured against.",
      story:
        "The easiest state to overlook is home. But Illinois is where the rhythm starts — loading the truck, getting everybody moving, knowing which miles feel familiar and which ones mean you’re finally headed somewhere. It matters because every trip out gets compared back to the places that raised your eye for roads in the first place.",
      favoriteMemory: "Crossing back in and feeling the trip settle into memory.",
      bestStop: "Any diner where the coffee is honest and nobody’s rushing you out.",
      hiddenGem: "The quieter river towns once you get off the main route.",
      bestFood: "A real local breakfast before wheels-up.",
      rating: 4,
      dateVisited: "2025-03-18",
      cityRegion: "Southern Illinois",
      familyFriendly: true,
      worthDetour: true,
      photos: [{ url: "/hero-highway.jpg", caption: "Heading out starts here." }],
      comments: [{ author: "StillMoving", body: "Love treating home state like part of the archive too." }],
    },
  ],
  "roadmom-jess": [
    {
      stateCode: "CO",
      stateName: "Colorado",
      status: "visited",
      title: "Colorado finally gave us the mountain week we wanted",
      summary: "Cool air, better-than-expected family stops, and enough room to feel the trip shift gears.",
      story:
        "Colorado felt like a reward state. After flatter miles and a lot of car snacks, finally hitting elevation made the whole crew wake back up. The best part wasn’t just the postcard views — it was the change in energy. Everybody got quieter in a good way, like the landscape had taken over the conversation for a while.",
      favoriteMemory: "The kids going silent the first time the mountains really opened up.",
      bestStop: "An early-morning overlook before the day crowds build.",
      hiddenGem: "The small-town bakery stop on the way back down.",
      bestFood: "Green chile breakfast burritos.",
      rating: 5,
      dateVisited: "2025-07-07",
      cityRegion: "Front Range",
      familyFriendly: true,
      worthDetour: true,
      photos: COMMON_PHOTOS,
      comments: [{ author: "MileMarkerMax", body: "That silence when the mountains hit is real." }],
    },
    {
      stateCode: "NM",
      stateName: "New Mexico",
      status: "visited",
      title: "New Mexico felt like color after a long gray stretch",
      summary: "A state that somehow feels warm, calm, and cinematic at the same time.",
      story:
        "New Mexico caught me off guard in the best way. The colors make everything feel deliberate — the buildings, the dirt, the sky, even the late light. It ended up being one of those states where every stop felt more textured than it looked on a map before we got there.",
      favoriteMemory: "Late-evening light against adobe walls.",
      bestStop: "Old town walks with no real schedule.",
      hiddenGem: "A roadside art market we almost drove right by.",
      bestFood: "Red chile enchiladas.",
      rating: 5,
      dateVisited: "2025-07-11",
      cityRegion: "Santa Fe",
      familyFriendly: true,
      worthDetour: true,
      photos: [{ url: "/hero-highway.jpg", caption: "Desert color everywhere." }],
      comments: [{ author: "AtlasAmy", body: "New Mexico really does feel like that." }],
    },
  ],
  dieselanddust: [
    {
      stateCode: "MT",
      stateName: "Montana",
      status: "visited",
      title: "Montana reset my head in about twenty miles",
      summary: "Big sky is real, and the scale of the place makes every earlier hurry feel dumb.",
      story:
        "Montana stripped the noise out fast. There’s something about getting into a place with that much space that resets your pacing whether you planned for it or not. I stopped trying to stack stops and just let the road have the day. Ended up being one of the best decisions of the whole run.",
      favoriteMemory: "A gas stop that turned into thirty extra minutes just staring out at the horizon.",
      bestStop: "Any high pull-off where the sky feels oversized.",
      hiddenGem: "The quieter two-lane routes once you leave the fastest road.",
      bestFood: "A steakhouse that looked too plain to be that good.",
      rating: 5,
      dateVisited: "2025-09-02",
      cityRegion: "Southwest Montana",
      familyFriendly: true,
      worthDetour: true,
      photos: COMMON_PHOTOS,
      comments: [{ author: "NorthboundNick", body: "Montana does that to people." }],
    },
    {
      stateCode: "WY",
      stateName: "Wyoming",
      status: "visited",
      title: "Wyoming made the map feel honest again",
      summary: "Wind, distance, and a kind of quiet that makes you pay attention.",
      story:
        "Wyoming felt severe in a way I liked. Nothing about it tries too hard, and that makes the good parts land harder. It’s a state that asks whether you really like the road or just like saying you do. If you do, it gives you plenty back.",
      favoriteMemory: "The kind of wind that makes the whole ride feel alive.",
      bestStop: "Long empty stretches where the horizon keeps moving away from you.",
      hiddenGem: "The diners right before the next state line.",
      bestFood: "Chicken fried steak and stronger coffee than expected.",
      rating: 4,
      dateVisited: "2025-08-30",
      cityRegion: "Central Wyoming",
      familyFriendly: false,
      worthDetour: true,
      photos: [{ url: "/hero-highway.jpg", caption: "Wind-country miles." }],
      comments: [{ author: "WrenchAndRoad", body: "Perfect description of Wyoming." }],
    },
  ],
};

const travelerMaps: Record<string, TravelerMapState[]> = {
  "jace-demo": makeMapStates(
    ["Illinois", "Tennessee", "Texas", "Florida", "Missouri", "Kentucky", "Indiana", "Wisconsin", "Georgia", "Alabama"],
    ["Alaska", "Maine", "Utah", "Arizona", "Montana"],
    ["Illinois"]
  ),
  "roadmom-jess": makeMapStates(
    ["Missouri", "Kansas", "Colorado", "New Mexico", "Oklahoma", "Texas", "Arkansas", "Tennessee", "Illinois", "Indiana", "Kentucky"],
    ["Oregon", "Washington", "Maine", "Vermont"],
    ["Missouri", "Kansas"]
  ),
  dieselanddust: makeMapStates(
    ["Texas", "New Mexico", "Colorado", "Wyoming", "Montana", "South Dakota", "North Dakota", "Nebraska", "Oklahoma", "Missouri", "Tennessee", "Arizona"],
    ["Alaska", "Maine", "Vermont", "Washington"],
    ["Texas", "Oklahoma", "Missouri"]
  ),
};

export const demoProfile = travelerProfiles["jace-demo"];
export const demoEntries = travelerEntries["jace-demo"];
export const demoMapStates = travelerMaps["jace-demo"];

export function getTravelerProfile(username: string) {
  return travelerProfiles[username] ?? null;
}

export function getTravelerEntries(username: string) {
  return travelerEntries[username] ?? [];
}

export function getTravelerMapStates(username: string) {
  return travelerMaps[username] ?? demoMapStates;
}

export function getTravelerEntry(username: string, stateSlug: string) {
  return getTravelerEntries(username).find((entry) => slugify(entry.stateName) === stateSlug) ?? null;
}

export function getDemoEntryByState(stateSlug: string) {
  return demoEntries.find((entry) => slugify(entry.stateName) === stateSlug) ?? null;
}

export const travelerSpotlightCards: TravelerSpotlightCard[] = Object.values(travelerProfiles).map((profile) => {
  const featuredEntry = getTravelerEntries(profile.username)[0];
  return {
    username: profile.username,
    displayName: profile.displayName,
    homeState: profile.homeState,
    statesVisited: profile.statesVisited,
    completionPercent: profile.completionPercent,
    routeLabel: profile.currentRouteLabel ?? "Open road",
    featuredState: featuredEntry?.stateName ?? profile.featuredState ?? profile.homeState,
    featuredStoryTitle: featuredEntry?.title ?? "Open road notes",
    deck: profile.northStar ?? profile.journeySummary,
  };
});

export const communityStoryPreviews: CommunityStoryPreview[] = Object.values(travelerProfiles).flatMap((profile) =>
  getTravelerEntries(profile.username).slice(0, 2).map((entry) => ({
    username: profile.username,
    displayName: profile.displayName,
    stateName: entry.stateName,
    stateSlug: slugify(entry.stateName),
    title: entry.title,
    summary: entry.summary,
    routeLabel: profile.currentRouteLabel ?? "Open road",
    photoUrl: resolveEntryHeroImageUrl(entry),
  }))
);
