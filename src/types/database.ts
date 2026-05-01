/**
 * Supabase `public` schema types — keep in sync with `supabase/migrations/*.sql`.
 * Regenerate with `supabase gen types typescript --linked` when schema changes.
 */

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
      dj_mixes: {
        Row: {
          id: string;
          dj_name: string;
          email: string;
          city: string | null;
          instagram: string | null;
          mix_title: string;
          mix_link: string | null;
          platform: string | null;
          notes: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          dj_name: string;
          email: string;
          city?: string | null;
          instagram?: string | null;
          mix_title: string;
          mix_link?: string | null;
          platform?: string | null;
          notes?: string | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          dj_name?: string;
          email?: string;
          city?: string | null;
          instagram?: string | null;
          mix_title?: string;
          mix_link?: string | null;
          platform?: string | null;
          notes?: string | null;
          status?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      emails: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          role: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          role?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          title: string;
          event_date: string;
          location: string;
          description: string | null;
          rsvp_link: string | null;
          flyer_image_url: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          event_date: string;
          location: string;
          description?: string | null;
          rsvp_link?: string | null;
          flyer_image_url?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          event_date?: string;
          location?: string;
          description?: string | null;
          rsvp_link?: string | null;
          flyer_image_url?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      photos: {
        Row: {
          id: string;
          title: string;
          caption: string | null;
          link_url: string | null;
          media_urls: Json;
          published: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          caption?: string | null;
          link_url?: string | null;
          media_urls: Json;
          published?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          caption?: string | null;
          link_url?: string | null;
          media_urls?: Json;
          published?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      videos: {
        Row: {
          id: string;
          title: string;
          video_url: string;
          thumbnail_url: string | null;
          category: string | null;
          published: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          video_url: string;
          thumbnail_url?: string | null;
          category?: string | null;
          published?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          video_url?: string;
          thumbnail_url?: string | null;
          category?: string | null;
          published?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}

export type PublicTable = keyof Database["public"]["Tables"];

export type TableRow<Name extends PublicTable> =
  Database["public"]["Tables"][Name]["Row"];

export type TableInsert<Name extends PublicTable> =
  Database["public"]["Tables"][Name]["Insert"];

export type TableUpdate<Name extends PublicTable> =
  Database["public"]["Tables"][Name]["Update"];
