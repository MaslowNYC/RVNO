"use client";

import { useState } from "react";
import { RoadTimeline } from "@/components/RoadTimeline";
import { AlbumMap } from "@/components/AlbumMap";
import { CrewMap } from "@/components/CrewMap";
import type { Album, Photo, Member } from "@/lib/database.types";

type AlbumWithCount = Album & { photo_count: number };

interface PhotosContentProps {
  albums: AlbumWithCount[];
  photos: Photo[];
  members: Member[];
}

export function PhotosContent({ albums, photos, members }: PhotosContentProps) {
  const [view, setView] = useState<"road" | "map" | "crew">("crew");

  return (
    <div className="pb-10">
      {/* View toggle - metal file cabinet tabs */}
      <div className="flex justify-center pt-8 pb-6 gap-1">
        {[
          { key: "crew" as const, label: "The Crew" },
          { key: "road" as const, label: "The Road" },
          { key: "map" as const, label: "The Map" },
        ].map((v) => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            className={`px-6 py-3 font-mono text-sm uppercase tracking-widest transition-all min-h-[48px] border-t border-x ${
              view === v.key
                ? "bg-rvno-card text-rvno-ink border-rvno-border -mb-px relative z-10"
                : "bg-rvno-bg text-rvno-ink-dim border-transparent hover:text-rvno-ink-muted"
            }`}
            style={{
              borderRadius: "2px 2px 0 0",
            }}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Content area with subtle top border */}
      <div className="px-3">
        <div className="border-t border-rvno-border -mt-px pt-6">
          {view === "crew" && <CrewMap members={members} />}
          {view === "road" && <RoadTimeline albums={albums} />}
          {view === "map" && <AlbumMap albums={albums} photos={photos} />}
        </div>
      </div>
    </div>
  );
}
