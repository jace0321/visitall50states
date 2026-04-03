import { STATE_NAMES } from "@/lib/states";
import type { TravelerBadge, TravelerMapState, TravelerProfile, TravelerStateEntry } from "./types";

const BADGES: TravelerBadge[] = [
  { key: "ten-states", name: "10 States", icon: "🔟", description: "Logged 10 states." },
  { key: "national-park-explorer", name: "Park Explorer", icon: "🏔️", description: "Visited national parks along the way." },
  { key: "capitol-collector", name: "Capitol Collector", icon: "🏛️", description: "Visited capitals and capitol buildings." },
];

export const demoProfile: TravelerProfile = {
  username: "jace-demo",
  displayName: "Jace Demo",
  bio: "Boilermaker, road chaser, memory keeper.",
  journeySummary: "Working through all 50 states one real trip at a time — family miles, roadside wins, and the places that actually stuck with us.",
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
};

const visited = new Set(["Illinois", "Tennessee", "Texas", "Florida", "Missouri", "Kentucky", "Indiana", "Wisconsin"]);
const wantToGo = new Set(["Alaska", "Maine", "Utah", "Arizona"]);

export const demoMapStates: TravelerMapState[] = STATE_NAMES.map((name) => ({
  code: name.slice(0, 2).toUpperCase(),
  name,
  status: visited.has(name) ? "visited" : wantToGo.has(name) ? "want_to_go" : "not_visited",
  hasStory: visited.has(name),
}));

export const demoEntries: TravelerStateEntry[] = [
  {
    stateCode: "TN",
    stateName: "Tennessee",
    status: "visited",
    title: "Nashville surprised me more than I expected",
    summary: "Good food, real energy, and way more than Broadway if you know where to look.",
    story: "We rolled into Nashville expecting a quick stop and ended up staying longer than planned. The city had more layers than I gave it credit for — music, food, and neighborhoods that actually felt lived in.",
    favoriteMemory: "Watching the city light up after a long day on the road.",
    bestStop: "Shelby Street Pedestrian Bridge at sunset.",
    hiddenGem: "A quieter breakfast spot off the main tourist strip was honestly one of the best parts.",
    bestFood: "Hot chicken — but not from the first flashy place you see.",
    rating: 5,
    dateVisited: "2025-08-12",
    cityRegion: "Nashville",
    familyFriendly: true,
    worthDetour: true,
    photos: [
      { url: "/hero-highway.jpg", caption: "Road in, city ahead." },
      { url: "/hero-highway.jpg", caption: "End of day light hit right." },
    ],
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
    story: "Texas is one of those states where the drive itself becomes the thing you remember. The distances force you to slow down and take it in differently.",
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
];

export function getDemoEntryByState(stateSlug: string) {
  return demoEntries.find((entry) => entry.stateName.toLowerCase().replace(/\s+/g, "-") === stateSlug);
}
