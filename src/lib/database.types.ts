export type Album = {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  location_name: string;
  location_lat: number | null;
  location_lng: number | null;
  cover_photo_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Photo = {
  id: string;
  album_id: string;
  url: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
};

export type Member = {
  id: string;
  name: string;
  title: string | null;
  bio: string | null;
  bikes: string | null;
  photo_url: string | null;
  sort_order: number;
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
};

export type PhotoInsert = {
  album_id: string;
  url: string;
  caption?: string | null;
  sort_order?: number;
};

export type Database = {
  public: {
    Tables: {
      albums: {
        Row: Album;
        Insert: AlbumInsert;
        Update: Partial<AlbumInsert>;
      };
      photos: {
        Row: Photo;
        Insert: PhotoInsert;
        Update: Partial<PhotoInsert>;
      };
      members: {
        Row: Member;
        Insert: Omit<Member, "id" | "created_at">;
        Update: Partial<Omit<Member, "id" | "created_at">>;
      };
    };
  };
};