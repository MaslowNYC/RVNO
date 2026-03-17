"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";
import type { Album } from "@/lib/database.types";

type AlbumWithCount = Album & { photo_count: number };

interface PhotosContentProps {
  albums: AlbumWithCount[];
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function PhotosContent({ albums: initialAlbums }: PhotosContentProps) {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [albums, setAlbums] = useState(initialAlbums);
  const [isReordering, setIsReordering] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  function handleDragStart(index: number) {
    dragItem.current = index;
  }

  function handleDragEnter(index: number) {
    dragOverItem.current = index;
  }

  function handleDragEnd() {
    if (dragItem.current === null || dragOverItem.current === null) return;
    if (dragItem.current === dragOverItem.current) return;

    const newAlbums = [...albums];
    const draggedAlbum = newAlbums[dragItem.current];
    newAlbums.splice(dragItem.current, 1);
    newAlbums.splice(dragOverItem.current, 0, draggedAlbum);

    setAlbums(newAlbums);
    setHasChanges(true);
    dragItem.current = null;
    dragOverItem.current = null;
  }

  async function saveOrder() {
    setSaving(true);
    for (let i = 0; i < albums.length; i++) {
      await supabase
        .from("albums")
        .update({ sort_order: i })
        .eq("id", albums[i].id);
    }
    setSaving(false);
    setHasChanges(false);
    setIsReordering(false);
    router.refresh();
  }

  function cancelReorder() {
    setAlbums(initialAlbums);
    setHasChanges(false);
    setIsReordering(false);
  }

  function moveAlbum(fromIndex: number, toIndex: number) {
    if (toIndex < 0 || toIndex >= albums.length) return;
    const newAlbums = [...albums];
    const [movedAlbum] = newAlbums.splice(fromIndex, 1);
    newAlbums.splice(toIndex, 0, movedAlbum);
    setAlbums(newAlbums);
    setHasChanges(true);
  }

  return (
    <div className="max-w-5xl mx-auto px-5 py-12">
      <header className="mb-10 text-center">
        <h1 className="font-display text-3xl font-bold text-rvno-ink mb-2">
          Photo Albums
        </h1>
        <p className="font-body text-base text-rvno-ink-muted italic">
          Miles traveled, memories captured
        </p>
        {isAdmin && albums.length > 1 && (
          <div className="mt-4">
            {isReordering ? (
              <div className="flex items-center justify-center gap-3">
                <p className="font-body text-sm text-rvno-ink-dim">
                  Drag albums to reorder
                </p>
                <button
                  onClick={cancelReorder}
                  disabled={saving}
                  className="font-body text-sm text-rvno-ink-dim hover:text-rvno-ink transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveOrder}
                  disabled={saving || !hasChanges}
                  className="bg-[#BB0000] text-gray-100 font-mono text-xs font-semibold px-3 py-1.5 rounded hover:bg-[#9E0000] transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Order"}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsReordering(true)}
                className="font-body text-sm font-semibold text-gray-100 bg-[#BB0000] hover:bg-[#9E0000] transition-colors px-4 py-2 rounded-lg"
              >
                Reorder Albums
              </button>
            )}
          </div>
        )}
      </header>

      {albums.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-body text-base text-rvno-ink-dim">
            No albums yet. Check back soon.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {albums.map((album, index) => {
            const cardContent = (
              <>
                {/* Drag handle indicator when reordering */}
                {isReordering && (
                  <div className="absolute top-2 left-2 z-10 bg-black/50 rounded p-1">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                    >
                      <circle cx="9" cy="6" r="1.5" fill="white" />
                      <circle cx="15" cy="6" r="1.5" fill="white" />
                      <circle cx="9" cy="12" r="1.5" fill="white" />
                      <circle cx="15" cy="12" r="1.5" fill="white" />
                      <circle cx="9" cy="18" r="1.5" fill="white" />
                      <circle cx="15" cy="18" r="1.5" fill="white" />
                    </svg>
                  </div>
                )}
                {/* Cover photo */}
                <div className="aspect-[4/3] bg-rvno-surface overflow-hidden">
                  {album.cover_photo_url ? (
                    <img
                      src={album.cover_photo_url}
                      alt={album.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      style={{
                        objectPosition: `${album.offset_x ?? 50}% ${album.offset_y ?? 50}%`,
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="font-mono text-sm text-rvno-ink-dim">
                        No cover photo
                      </span>
                    </div>
                  )}
                </div>

                {/* Album info */}
                <div className="p-4">
                  <h2 className="font-display text-lg font-semibold text-rvno-ink group-hover:text-[#C4853A] transition-colors">
                    {album.title}
                  </h2>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-xs text-rvno-ink-dim">
                      {formatDate(album.event_date)}
                    </span>
                    {album.location_name && (
                      <>
                        <span className="text-rvno-ink-dim">·</span>
                        <span className="font-mono text-xs text-rvno-ink-dim">
                          {album.location_name}
                        </span>
                      </>
                    )}
                  </div>

                  {album.description && (
                    <p className="font-body text-sm text-rvno-ink-muted mt-2 line-clamp-2">
                      {album.description}
                    </p>
                  )}

                  <p className="font-mono text-xs text-rvno-teal mt-3">
                    {album.photo_count} {album.photo_count === 1 ? "photo" : "photos"}
                  </p>
                </div>
              </>
            );

            if (isReordering) {
              return (
                <div
                  key={album.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragEnter={() => handleDragEnter(index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  className="relative group block bg-rvno-card rounded-lg border-2 border-rvno-teal/50 overflow-hidden cursor-grab active:cursor-grabbing hover:border-rvno-teal transition-colors"
                >
                  {cardContent}
                  {/* Inline reorder controls */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/80 rounded-lg px-2 py-1.5 z-10">
                    <button
                      onClick={(e) => { e.stopPropagation(); moveAlbum(index, 0); }}
                      disabled={index === 0}
                      className="p-1.5 rounded text-white hover:bg-[#BB0000] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                      title="Move to first"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="11 17 6 12 11 7" />
                        <polyline points="18 17 13 12 18 7" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); moveAlbum(index, index - 1); }}
                      disabled={index === 0}
                      className="p-1.5 rounded text-white hover:bg-[#BB0000] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                      title="Move left"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                    </button>
                    <span className="font-mono text-sm text-white px-1.5">{index + 1}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); moveAlbum(index, index + 1); }}
                      disabled={index === albums.length - 1}
                      className="p-1.5 rounded text-white hover:bg-[#BB0000] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                      title="Move right"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); moveAlbum(index, albums.length - 1); }}
                      disabled={index === albums.length - 1}
                      className="p-1.5 rounded text-white hover:bg-[#BB0000] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                      title="Move to last"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="13 17 18 12 13 7" />
                        <polyline points="6 17 11 12 6 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={album.id}
                href={`/photos/${album.id}`}
                className="relative group block bg-rvno-card rounded-lg border-2 border-rvno-border overflow-hidden hover:border-[#C4853A]/50 transition-colors"
              >
                {cardContent}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
