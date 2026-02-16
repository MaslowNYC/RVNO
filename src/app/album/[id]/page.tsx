import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { AlbumViewer } from "./AlbumViewer";

export const revalidate = 60;

async function getAlbum(id: string) {
  const { data: album } = await supabase
    .from("albums")
    .select("*")
    .eq("id", id)
    .single();

  if (!album) return null;

  const { data: photos } = await supabase
    .from("photos")
    .select("*")
    .eq("album_id", id)
    .order("sort_order", { ascending: true });

  return { album, photos: photos || [] };
}

export default async function AlbumPage({
  params,
}: {
  params: { id: string };
}) {
  const data = await getAlbum(params.id);
  if (!data) notFound();

  const { album, photos } = data;

  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      {/* Album header */}
      <header className="mb-8">
        <a
          href="/"
          className="font-mono text-[10px] text-rvno-ink-dim hover:text-rvno-teal no-underline tracking-wide mb-4 inline-block"
        >
          ← Back to The Road
        </a>
        <h1 className="font-display text-2xl font-bold text-rvno-ink mb-1.5">
          {album.title}
        </h1>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-mono text-[10px] text-rvno-teal tracking-wide">
            {new Date(album.event_date + "T00:00:00").toLocaleDateString(
              "en-US",
              {
                month: "long",
                day: "numeric",
                year: "numeric",
              }
            )}
          </span>
          {album.location_name && (
            <span className="font-mono text-[10px] text-rvno-ink-dim tracking-wide">
              📍 {album.location_name}
            </span>
          )}
        </div>
        {album.description && (
          <p className="font-body text-sm text-rvno-ink-muted mt-3 leading-relaxed max-w-2xl">
            {album.description}
          </p>
        )}
      </header>

      {/* Photos */}
      {photos.length === 0 ? (
        <div className="text-center py-16 bg-rvno-card rounded-lg border border-white/[0.06]">
          <p className="font-mono text-sm text-rvno-ink-dim">
            Photos coming soon.
          </p>
        </div>
      ) : (
        <AlbumViewer photos={photos} albumTitle={album.title} />
      )}
    </div>
  );
}
