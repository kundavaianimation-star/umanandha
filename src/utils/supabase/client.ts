import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://txdwhearutsdbppkrwyv.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_H2mBu1943xFJ5FTinuywRQ_vuNf2LFF";

export const createClient = () =>
  createBrowserClient(supabaseUrl, supabaseAnonKey);
