import { supabase } from "@/lib/supabase";
import { HomeContent } from "./HomeContent";

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

export default async function Home() {
  const albums = await getAlbums();
  return <HomeContent albums={albums} />;
}
