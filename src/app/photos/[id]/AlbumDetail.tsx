"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import type { Album, Photo } from "@/lib/database.types";

interface AlbumDetailProps {
  album: Album;
  initialPhotos: Photo[];
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function AlbumDetail({ album, initialPhotos }: AlbumDetailProps) {
  const { isAdmin } = useAuth();
  const router = useRouter();

  const [photos] = useState(initialPhotos);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [editingCaption, setEditingCaption] = useState<string | null>(null);
  const [captionText, setCaptionText] = useState("");
  const [saving, setSaving] = useState(false);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const goToPrevious = () => {
    if (lightboxIndex !== null && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    }
  };

  const goToNext = () => {
    if (lightboxIndex !== null && lightboxIndex < photos.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    }
  };

  const startEditCaption = (photo: Photo) => {
    setEditingCaption(photo.id);
    setCaptionText(photo.caption || "");
  };

  const cancelEditCaption = () => {
    setEditingCaption(null);
    setCaptionText("");
  };

  const saveCaption = async (photoId: string) => {
    setSaving(true);
    await supabase
      .from("photos")
      .update({ caption: captionText || null })
      .eq("id", photoId);
    setSaving(false);
    setEditingCaption(null);
    router.refresh();
  };

  // Handle keyboard navigation in lightbox
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (lightboxIndex === null) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") goToPrevious();
    if (e.key === "ArrowRight") goToNext();
  };

  return (
    <div className="max-w-5xl mx-auto px-5 py-12">
      {/* Back link */}
      <Link
        href="/photos"
        className="inline-flex items-center gap-2 font-mono text-sm text-rvno-ink-dim hover:text-rvno-teal transition-colors mb-8"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to Albums
      </Link>

      {/* Album header */}
      <header className="mb-10">
        <h1 className="font-display text-3xl font-bold text-rvno-ink mb-2">
          {album.title}
        </h1>
        <div className="flex items-center gap-2 text-rvno-ink-dim">
          <span className="font-mono text-sm">{formatDate(album.event_date)}</span>
          {album.location_name && (
            <>
              <span>·</span>
              <span className="font-mono text-sm">{album.location_name}</span>
            </>
          )}
        </div>
        {album.description && (
          <p className="font-body text-base text-rvno-ink-muted mt-4 max-w-2xl">
            {album.description}
          </p>
        )}
      </header>

      {/* Photo grid */}
      {photos.length === 0 ? (
        <div className="text-center py-16 bg-rvno-card rounded-lg border border-rvno-border">
          <p className="font-body text-base text-rvno-ink-dim">
            No photos in this album yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map((photo, index) => (
            <div key={photo.id} className="group relative">
              <button
                onClick={() => openLightbox(index)}
                className="block w-full aspect-square bg-rvno-surface rounded-lg overflow-hidden border border-rvno-border hover:border-[#C4853A]/50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#C4853A]/50"
              >
                <img
                  src={photo.url}
                  alt={photo.caption || `Photo ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </button>

              {/* Caption display/edit */}
              {editingCaption === photo.id ? (
                <div className="mt-2 space-y-2">
                  <textarea
                    value={captionText}
                    onChange={(e) => setCaptionText(e.target.value)}
                    placeholder="Add a caption..."
                    rows={2}
                    className="w-full bg-rvno-elevated border border-rvno-border rounded px-2 py-1 font-body text-sm text-rvno-ink focus:outline-none focus:border-[#C4853A]/50 resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveCaption(photo.id)}
                      disabled={saving}
                      className="px-2 py-1 bg-[#C4853A] hover:bg-[#B37832] text-white font-body text-xs rounded transition-colors disabled:opacity-50"
                    >
                      {saving ? "..." : "Save"}
                    </button>
                    <button
                      onClick={cancelEditCaption}
                      disabled={saving}
                      className="px-2 py-1 text-rvno-ink-dim hover:text-rvno-ink font-body text-xs transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {photo.caption && (
                    <p className="font-body text-xs text-rvno-ink-muted mt-2 line-clamp-2">
                      {photo.caption}
                    </p>
                  )}
                  {isAdmin && (
                    <button
                      onClick={() => startEditCaption(photo)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 bg-black/60 rounded text-white hover:bg-black/80 transition-all"
                      title="Edit caption"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && photos[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors z-10"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Previous button */}
          {lightboxIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}

          {/* Next button */}
          {lightboxIndex < photos.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}

          {/* Image container */}
          <div
            className="max-w-[90vw] max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={photos[lightboxIndex].url}
              alt={photos[lightboxIndex].caption || `Photo ${lightboxIndex + 1}`}
              className="max-w-full max-h-[80vh] object-contain"
            />
            {photos[lightboxIndex].caption && (
              <p className="font-body text-sm text-white/80 mt-4 text-center max-w-lg">
                {photos[lightboxIndex].caption}
              </p>
            )}
            <p className="font-mono text-xs text-white/50 mt-2">
              {lightboxIndex + 1} / {photos.length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
