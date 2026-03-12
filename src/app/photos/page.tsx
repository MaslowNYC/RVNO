import { supabase } from "@/lib/supabase";
import { PhotosContent } from "./PhotosContent";

export const revalidate = 60;

async function getAlbums() {
  const { data: albums } = await supabase
    .from("albums")
    .select("*");

  if (!albums) return [];

  // Get photo counts per album
  const { data: photoCounts } = await supabase
    .from("photos")
    .select("album_id");

  const countMap: Record<string, number> = {};
  photoCounts?.forEach((p) => {
    countMap[p.album_id] = (countMap[p.album_id] || 0) + 1;
  });

  // Sort: use sort_order if set, otherwise fall back to event_date desc
  const sorted = albums.sort((a, b) => {
    // If both have sort_order, use that
    if (a.sort_order !== null && b.sort_order !== null) {
      return a.sort_order - b.sort_order;
    }
    // If only one has sort_order, it comes first
    if (a.sort_order !== null) return -1;
    if (b.sort_order !== null) return 1;
    // Fall back to event_date descending
    return new Date(b.event_date).getTime() - new Date(a.event_date).getTime();
  });

  return sorted.map((a) => ({
    ...a,
    photo_count: countMap[a.id] || 0,
  }));
}

export default async function PhotosPage() {
  const albums = await getAlbums();

  return <PhotosContent albums={albums} />;
}
