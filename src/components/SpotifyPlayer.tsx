"use client";

import { useEffect, useRef, useState } from "react";
import { spotifyEmbedUrl } from "@/lib/spotify";

interface SpotifyPlayerProps {
  trackId: string;
  /** Compact (152px) is the small bar; full (352px) shows the album art. */
  variant?: "compact" | "full";
  className?: string;
  title?: string;
}

/**
 * A Spotify embed that doesn't mount its iframe until it scrolls into view.
 * Each embed is a full web app, so loading 25 of them at once would crawl.
 */
export function SpotifyPlayer({
  trackId,
  variant = "compact",
  className = "",
  title,
}: SpotifyPlayerProps) {
  const height = variant === "compact" ? 152 : 352;
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // No IntersectionObserver (very old browser) — just show it.
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ minHeight: height }}
    >
      {visible ? (
        <iframe
          src={spotifyEmbedUrl(trackId, variant === "compact")}
          width="100%"
          height={height}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="rounded-xl border-0"
          title={title ? `Spotify player: ${title}` : "Spotify player"}
        />
      ) : (
        <div
          className="rounded-xl bg-rvno-surface animate-pulse"
          style={{ height }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
