"use client";

import Link from "next/link";
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

export function PhotosContent({ albums }: PhotosContentProps) {
  return (
    <div className="max-w-5xl mx-auto px-5 py-12">
      <header className="mb-10 text-center">
        <h1 className="font-display text-3xl font-bold text-rvno-ink mb-2">
          Photo Albums
        </h1>
        <p className="font-body text-base text-rvno-ink-muted italic">
          Miles traveled, memories captured
        </p>
      </header>

      {albums.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-body text-base text-rvno-ink-dim">
            No albums yet. Check back soon.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {albums.map((album) => (
            <Link
              key={album.id}
              href={`/photos/${album.id}`}
              className="group block bg-rvno-card rounded-lg border-2 border-rvno-border overflow-hidden hover:border-[#C4853A]/50 transition-colors"
            >
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
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
