import type { Photo, Perception } from "./types";

// This file is kept for fallback/mock data when Supabase is not configured.
// The app now fetches from Supabase directly.

export const siteSettings = {
  siteName: "UMANANDA",
  tagline: "Visual Ethnography of the Sacred",
  aboutText: "Umananda Perceptions is a visual ethnography project exploring the Umananda Temple on Peacock Island, Assam.",
  heroTitle: "A photographic perception archive documenting the Umananda Temple on Peacock Island — through collective anonymous observation.",
  heroSubtitle: "UMA NANDA",
};

export const photos: Photo[] = [];
export const perceptions: Perception[] = [];
export const categories = ["Architecture", "Landscape", "Details", "Ritual", "Life"];
