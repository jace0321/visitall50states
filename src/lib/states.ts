import statesData from "@/data/states.json";

export interface State {
  code: string;
  name: string;
  nickname: string;
  capital: string;
  region: string;
  bestTimeToVisit: string;
  hiddenGems: string[];
  mustSeeSpots: string[];
  nationalParks: string[];
  insiderTips: string[];
}

export function getAllStates(): State[] {
  return statesData.states as State[];
}

export function getStateBySlug(slug: string): State | undefined {
  return getAllStates().find(
    (s) => s.name.toLowerCase().replace(/\s+/g, "-") === slug
  );
}

export function getStateSlug(state: State): string {
  return state.name.toLowerCase().replace(/\s+/g, "-");
}

export const STATE_NAMES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California",
  "Colorado", "Connecticut", "Delaware", "Florida", "Georgia",
  "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland",
  "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri",
  "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
  "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
  "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
  "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming",
];
