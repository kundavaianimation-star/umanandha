import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function getPhotos() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .order("display_order", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getPhoto(id: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function getPerceptions(photoId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase
    .from("perceptions")
    .select("*")
    .eq("photo_id", photoId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getAllPerceptions() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase
    .from("perceptions")
    .select("*, photos(title)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getSiteContent() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase
    .from("site_content")
    .select("*");
  if (error) throw error;
  // Convert key-value array to object
  const content: Record<string, string> = {};
  data?.forEach((item) => {
    content[item.key] = item.value;
  });
  return content;
}

export async function getPerceptionCount(photoId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { count, error } = await supabase
    .from("perceptions")
    .select("*", { count: "exact", head: true })
    .eq("photo_id", photoId);
  if (error) throw error;
  return count ?? 0;
}
