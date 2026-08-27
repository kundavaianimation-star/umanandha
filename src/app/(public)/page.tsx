import { getPhotos, getSiteContent } from "@/lib/queries";
import { HomePageClient } from "./HomePageClient";

export default async function HomePage() {
  let photos;
  let siteContent;

  try {
    [photos, siteContent] = await Promise.all([
      getPhotos(),
      getSiteContent(),
    ]);
  } catch {
    // Fallback to empty if Supabase not configured yet
    photos = [];
    siteContent = {};
  }

  return <HomePageClient photos={photos} siteContent={siteContent} />;
}
