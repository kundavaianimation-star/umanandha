export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      photos: {
        Row: {
          id: string;
          image_url: string;
          title: string;
          caption: string;
          category: string;
          location: string;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          image_url: string;
          title: string;
          caption?: string;
          category?: string;
          location?: string;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          image_url?: string;
          title?: string;
          caption?: string;
          category?: string;
          location?: string;
          display_order?: number;
          updated_at?: string;
        };
      };
      perceptions: {
        Row: {
          id: string;
          photo_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          photo_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          photo_id?: string;
          content?: string;
        };
      };
      site_content: {
        Row: {
          id: string;
          key: string;
          value: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value: string;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: string;
          updated_at?: string;
        };
      };
    };
  };
}
