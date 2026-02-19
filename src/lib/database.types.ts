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
  is_crew: boolean;
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
  is_crew?: boolean;
};

export type PageContent = {
  id: string;
  page_key: string;
  title: string | null;
  body: string | null;
  updated_at: string;
};

export type PageContentInsert = {
  page_key: string;
  title?: string | null;
  body?: string | null;
};

export type Event = {
  id: string;
  title: string;
  event_date: string;
  event_time: string | null;
  location: string | null;
  description: string | null;
  open_to_all: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type EventInsert = {
  title: string;
  event_date: string;
  event_time?: string | null;
  location?: string | null;
  description?: string | null;
  open_to_all?: boolean;
  sort_order?: number;
};

export type Resource = {
  id: string;
  section: string;
  name: string;
  url: string;
  description: string | null;
  sort_order: number;
  created_at: string;
};

export type ResourceInsert = {
  section: string;
  name: string;
  url: string;
  description?: string | null;
  sort_order?: number;
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
      page_content: {
        Row: PageContent;
        Insert: PageContentInsert;
        Update: Partial<PageContentInsert>;
        Relationships: [];
      };
      events: {
        Row: Event;
        Insert: EventInsert;
        Update: Partial<EventInsert>;
        Relationships: [];
      };
      resources: {
        Row: Resource;
        Insert: ResourceInsert;
        Update: Partial<ResourceInsert>;
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
