import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.NEXT_PUBLIC_APP_URL;
  const now = new Date();
  const staticPaths = [
    "",
    "/lol",
    "/tft",
    "/valorant",
    "/lor",
    "/rankings",
    "/tier-list",
    "/compare",
    "/pricing",
    "/developers",
  ];
  return staticPaths.map((p) => ({
    url: `${base}${p}`,
    lastModified: now,
    changeFrequency: p === "" ? "daily" : "weekly",
    priority: p === "" ? 1 : 0.7,
  }));
}
