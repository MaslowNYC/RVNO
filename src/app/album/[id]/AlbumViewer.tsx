"use client";

import { useState } from "react";
import type { Photo } from "@/lib/database.types";

interface AlbumViewerProps {
  photos: Photo[];
  albumTitle: string;
}

export function AlbumViewer({ photos, albumTitle }: AlbumViewerProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = (idx: number) => setLightboxIndex(idx);
  const closeLightbox = () => setLightboxIndex(null);
  const prev = () =>
    setLightboxIndex((i) => (i !== null ? (i - 1 + photos.length) % photos.length : null));
  const next = () =>
    setLightboxIndex((i) => (i !== null ? (i + 1) % photos.length : null));

  return (
    <>
      {/* Photo grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {photos.map((photo, idx) => (
          <button
            key={photo.id}
            onClick={() => openLightbox(idx)}
            className="aspect-square bg-rvno-surface rounded overflow-hidden hover:opacity-90 transition-opacity relative group"
          >
            <img
              src={photo.url}
              alt={photo.caption || `${albumTitle} photo ${idx + 1}`}
              className="w-full h-full object-cover"
            />
            {photo.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="font-body text-[11px] text-white/90 leading-tight">
                  {photo.caption}
                </p>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white/60 hover:text-white font-mono text-sm z-10"
          >
            ✕
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-4 font-mono text-[10px] text-white/40 tracking-wide">
            {lightboxIndex + 1} / {photos.length}
          </div>

          {/* Nav arrows */}
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-2xl z-10"
          >
            ‹
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-2xl z-10"
          >
            ›
          </button>

          {/* Image */}
          <div
            className="max-w-[90vw] max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={photos[lightboxIndex].url}
              alt={photos[lightboxIndex].caption || ""}
              className="max-w-full max-h-[80vh] object-contain rounded"
            />
            {photos[lightboxIndex].caption && (
              <p className="font-body text-sm text-white/70 mt-3 text-center max-w-lg">
                {photos[lightboxIndex].caption}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
