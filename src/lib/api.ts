import { createClient } from "@/utils/supabase/client";
import type { Photo, Perception } from "./types";

// =============================================
// PHOTOS
// =============================================

export async function fetchPhotos(): Promise<Photo[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .order("display_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchPhoto(id: string): Promise<Photo | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function createPhoto(photo: {
  image_url: string;
  title: string;
  caption?: string;
  category?: string;
  location?: string;
  display_order?: number;
}): Promise<Photo> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("photos")
    .insert(photo)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePhoto(
  id: string,
  updates: Partial<{
    image_url: string;
    title: string;
    caption: string;
    category: string;
    location: string;
    display_order: number;
  }>
): Promise<Photo> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("photos")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deletePhoto(id: string): Promise<void> {
  const supabase = createClient();
  // Perceptions are deleted via ON DELETE CASCADE
  const { error } = await supabase.from("photos").delete().eq("id", id);
  if (error) throw error;
}

export async function reorderPhotos(
  orderedIds: string[]
): Promise<void> {
  const supabase = createClient();
  const updates = orderedIds.map((id, index) =>
    supabase
      .from("photos")
      .update({ display_order: index + 1, updated_at: new Date().toISOString() })
      .eq("id", id)
  );
  await Promise.all(updates);
}

// =============================================
// IMAGE UPLOAD
// =============================================

export async function uploadImage(file: File): Promise<string> {
  const supabase = createClient();
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const { error } = await supabase.storage
    .from("photos")
    .upload(fileName, file, { upsert: true });
  if (error) throw error;
  const { data: urlData } = supabase.storage
    .from("photos")
    .getPublicUrl(fileName);
  return urlData.publicUrl;
}

export async function deleteImage(fileName: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.storage
    .from("photos")
    .remove([fileName]);
  if (error) throw error;
}

// =============================================
// PERCEPTIONS
// =============================================

export async function fetchPerceptions(photoId: string): Promise<Perception[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("perceptions")
    .select("*")
    .eq("photo_id", photoId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchAllPerceptions(): Promise<
  (Perception & { photos: { title: string } | null })[]
> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("perceptions")
    .select("*, photos(title)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function submitPerception(
  photoId: string,
  content: string
): Promise<Perception> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("perceptions")
    .insert({ photo_id: photoId, content })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deletePerception(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("perceptions").delete().eq("id", id);
  if (error) throw error;
}

// =============================================
// SITE CONTENT
// =============================================

export async function fetchSiteContent(): Promise<Record<string, string>> {
  const supabase = createClient();
  const { data, error } = await supabase.from("site_content").select("*");
  if (error) throw error;
  const content: Record<string, string> = {};
  data?.forEach((item) => {
    content[item.key] = item.value;
  });
  return content;
}

export async function updateSiteContent(
  key: string,
  value: string
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("site_content")
    .upsert({ key, value, updated_at: new Date().toISOString() })
    .eq("key", key);
  if (error) throw error;
}

export async function updateSiteContentBatch(
  items: { key: string; value: string }[]
): Promise<void> {
  const supabase = createClient();
  const updates = items.map((item) =>
    supabase
      .from("site_content")
      .upsert({
        key: item.key,
        value: item.value,
        updated_at: new Date().toISOString(),
      })
      .eq("key", item.key)
  );
  await Promise.all(updates);
}
