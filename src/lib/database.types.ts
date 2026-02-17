export type Album = {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  location_name: string;
  location_lat: number | null;
  location_lng: number | null;
  cover_photo_url: string | null;
  offset_x: number | null;
  offset_y: number | null;
  created_at: string;
  updated_at: string;
};

export type Photo = {
  id: string;
  album_id: string;
  url: string;
  caption: string | null;
  sort_order: number;
  location_lat: number | null;
  location_lng: number | null;
  taken_at: string | null;
  created_at: string;
};

export type MemberType = "member" | "friend";

export type Member = {
  id: string;
  name: string;
  title: string | null;
  bio: string | null;
  bikes: string | null;
  photo_url: string | null;
  sort_order: number;
  location_name: string | null;
  location_lat: number | null;
  location_lng: number | null;
  city: string | null;
  state: string | null;
  country: string | null;
  member_type: MemberType;
  created_at: string;
};

export type AlbumInsert = {
  title: string;
  description?: string | null;
  event_date: string;
  location_name?: string;
  location_lat?: number | null;
  location_lng?: number | null;
  cover_photo_url?: string | null;
  offset_x?: number | null;
  offset_y?: number | null;
};

export type PhotoInsert = {
  album_id: string;
  url: string;
  caption?: string | null;
  sort_order?: number;
  location_lat?: number | null;
  location_lng?: number | null;
  taken_at?: string | null;
};

export type MemberInsert = {
  name: string;
  title?: string | null;
  bio?: string | null;
  bikes?: string | null;
  photo_url?: string | null;
  sort_order?: number;
  location_name?: string | null;
  location_lat?: number | null;
  location_lng?: number | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  member_type?: MemberType;
};

export type Database = {
  public: {
    Tables: {
      albums: {
        Row: Album;
        Insert: AlbumInsert;
        Update: Partial<AlbumInsert>;
        Relationships: [];
      };
      photos: {
        Row: Photo;
        Insert: PhotoInsert;
        Update: Partial<PhotoInsert>;
        Relationships: [
          {
            foreignKeyName: "photos_album_id_fkey";
            columns: ["album_id"];
            referencedRelation: "albums";
            referencedColumns: ["id"];
          }
        ];
      };
      members: {
        Row: Member;
        Insert: MemberInsert;
        Update: Partial<MemberInsert>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
