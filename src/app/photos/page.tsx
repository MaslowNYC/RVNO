import { supabase } from "@/lib/supabase";
import { PhotosContent } from "./PhotosContent";

export const revalidate = 60; // Revalidate every 60 seconds

async function getAlbums() {
  const { data: albums } = await supabase
    .from("albums")
    .select("*")
    .order("event_date", { ascending: true });

  if (!albums) return [];

  // Get photo counts per album
  const { data: photoCounts } = await supabase
    .from("photos")
    .select("album_id");

  const countMap: Record<string, number> = {};
  photoCounts?.forEach((p) => {
    countMap[p.album_id] = (countMap[p.album_id] || 0) + 1;
  });

  return albums.map((a) => ({
    ...a,
    photo_count: countMap[a.id] || 0,
  }));
}

async function getPhotosWithLocation() {
  const { data: photos } = await supabase
    .from("photos")
    .select("*, location_lat, location_lng")
    .not("location_lat", "is", null)
    .not("location_lng", "is", null);

  return photos || [];
}

async function getMembers() {
  const { data: members } = await supabase
    .from("members")
    .select("*")
    .order("name", { ascending: true });

  return members || [];
}

export default async function PhotosPage() {
  const [albums, photos, members] = await Promise.all([
    getAlbums(),
    getPhotosWithLocation(),
    getMembers(),
  ]);

  return <PhotosContent albums={albums} photos={photos} members={members} />;
}
