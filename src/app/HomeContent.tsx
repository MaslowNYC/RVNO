"use client";

import { useState } from "react";
import { RoadTimeline } from "@/components/RoadTimeline";
import type { Album } from "@/lib/database.types";

type AlbumWithCount = Album & { photo_count: number };

export function HomeContent({ albums }: { albums: AlbumWithCount[] }) {
  const [view, setView] = useState<"road" | "map">("road");

  return (
    <div className="pb-10">
      {/* View toggle */}
      <div className="flex justify-center pt-5 pb-2 gap-1">
        {[
          { key: "road" as const, label: "The Road", icon: "⟿" },
          { key: "map" as const, label: "The Map", icon: "◎" },
        ].map((v) => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            className={`px-4 py-1.5 rounded font-mono text-[10px] tracking-wide transition-all border ${
              view === v.key
                ? "bg-rvno-teal-dark text-rvno-white border-rvno-teal"
                : "bg-transparent text-rvno-ink-dim border-transparent hover:text-rvno-ink-muted"
            }`}
          >
            {v.icon} {v.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="px-3">
        {view === "road" ? (
          <RoadTimeline albums={albums} />
        ) : (
          <div className="max-w-[760px] mx-auto bg-rvno-card rounded-md border border-white/[0.06] p-9 text-center min-h-[360px] flex flex-col items-center justify-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-rvno-teal to-rvno-teal-dark flex items-center justify-center text-lg">
              🗺️
            </div>
            <h2 className="font-display text-base text-rvno-ink">Map View</h2>
            <p className="font-body text-xs text-rvno-ink-muted max-w-xs leading-relaxed">
              Interactive map with album pins at ride locations. Click a pin to
              view the album. Coming soon.
            </p>
            <p className="font-mono text-[9px] text-rvno-teal tracking-wide mt-1.5">
              {albums.length} LOCATIONS ·{" "}
              {albums.reduce((s, a) => s + a.photo_count, 0)} PHOTOS
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
