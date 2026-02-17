"use client";

import { useState, useEffect } from "react";
import { RoadTimeline } from "@/components/RoadTimeline";
import { AlbumMap } from "@/components/AlbumMap";
import { CrewMap } from "@/components/CrewMap";
import { supabase } from "@/lib/supabase";
import type { Album, Photo, Member } from "@/lib/database.types";

type AlbumWithCount = Album & { photo_count: number };

interface HomeContentProps {
  albums: AlbumWithCount[];
  photos: Photo[];
  members: Member[];
}

export function HomeContent({ albums, photos, members }: HomeContentProps) {
  const [view, setView] = useState<"road" | "map" | "crew">("crew");
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAdmin(!!session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="pb-10">
      {/* Hero logo */}
      <div className="flex justify-center pt-6 pb-4">
        <img
          src="/RVNO.png"
          alt="Roanoke Valley Norton Owners"
          className="w-1/2 max-w-md h-auto"
        />
      </div>

      {/* View toggle */}
      <div className="flex justify-center pb-2 gap-1">
        {[
          { key: "crew" as const, label: "The Crew", icon: "👥" },
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
        {view === "crew" && <CrewMap members={members} />}
        {view === "road" && <RoadTimeline albums={albums} isAdmin={isAdmin} />}
        {view === "map" && <AlbumMap albums={albums} photos={photos} />}
      </div>
    </div>
  );
}
