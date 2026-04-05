import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";
import { getAllStates, getStateSlug } from "@/lib/states";

function slugifyStatePath(stateName: string) {
  return stateName.toLowerCase().replace(/\s+/g, "-");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://visitall50states.com";
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/map-maker`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/states`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/travelers`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${baseUrl}/search`, lastModified: now, changeFrequency: "monthly", priority: 0.75 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  const statePages: MetadataRoute.Sitemap = getAllStates().map((state) => ({
    url: `${baseUrl}/states/${getStateSlug(state)}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const travelerPages: MetadataRoute.Sitemap = [];

  try {
    const { data: profiles, error: profileError } = await supabase
      .from("traveler_profiles")
      .select("id, username, updated_at")
      .eq("is_public", true);

    if (profileError) {
      console.error("sitemap: traveler_profiles", profileError);
    } else {
      for (const p of profiles ?? []) {
        if (!p?.username) continue;
        travelerPages.push({
          url: `${baseUrl}/travelers/${p.username}`,
          lastModified: p.updated_at ? new Date(p.updated_at) : now,
          changeFrequency: "weekly",
          priority: 0.72,
        });
      }

      const ids = (profiles ?? []).map((p) => p.id).filter(Boolean);
      if (ids.length > 0) {
        const { data: entries, error: entryError } = await supabase
          .from("traveler_state_entries")
          .select("traveler_profile_id, state_name, updated_at")
          .in("traveler_profile_id", ids);

        if (entryError) {
          console.error("sitemap: traveler_state_entries", entryError);
        } else {
          const idToUsername = new Map((profiles ?? []).map((row) => [row.id, row.username]));
          for (const row of entries ?? []) {
            const username = idToUsername.get(row.traveler_profile_id);
            const stateSlug = slugifyStatePath(row.state_name ?? "");
            if (!username || !stateSlug) continue;
            travelerPages.push({
              url: `${baseUrl}/travelers/${username}/${stateSlug}`,
              lastModified: row.updated_at ? new Date(row.updated_at) : now,
              changeFrequency: "monthly",
              priority: 0.65,
            });
          }
        }
      }
    }
  } catch (e) {
    console.error("sitemap: traveler fetch failed", e);
  }

  return [...staticPages, ...statePages, ...travelerPages];
}
