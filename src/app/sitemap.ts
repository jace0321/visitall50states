import type { MetadataRoute } from "next";
import { getAllStates, getStateSlug } from "@/lib/states";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://visitall50states.com";

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/map-maker`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/heic-to-jpeg`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.65 },
    { url: `${baseUrl}/states`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  const statePages: MetadataRoute.Sitemap = getAllStates().map((state) => ({
    url: `${baseUrl}/states/${getStateSlug(state)}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...statePages];
}
