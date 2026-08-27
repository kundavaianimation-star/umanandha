export interface Photo {
  id: string;
  image_url: string;
  title: string;
  caption: string;
  category: string;
  location: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Perception {
  id: string;
  photo_id: string;
  content: string;
  created_at: string;
}

export interface SiteContent {
  site_name: string;
  location: string;
  date: string;
  hero_title: string;
  hero_description: string;
  hero_image_url: string;
  about_text: string;
  credits_design: string;
  credits_images: string;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  aboutText: string;
  heroTitle: string;
  heroSubtitle: string;
}
