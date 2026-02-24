import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { AlbumDetail } from "./AlbumDetail";

export const revalidate = 60;

async function getAlbum(id: string) {
  const { data: album } = await supabase
    .from("albums")
    .select("*")
    .eq("id", id)
    .single();

  return album;
}

async function getPhotos(albumId: string) {
  const { data: photos } = await supabase
    .from("photos")
    .select("*")
    .eq("album_id", albumId)
    .order("sort_order", { ascending: true });

  return photos || [];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AlbumPage({ params }: PageProps) {
  const { id } = await params;
  const [album, photos] = await Promise.all([getAlbum(id), getPhotos(id)]);

  if (!album) {
    notFound();
  }

  return <AlbumDetail album={album} initialPhotos={photos} />;
}
