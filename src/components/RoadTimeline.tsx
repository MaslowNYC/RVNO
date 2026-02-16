"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { Album } from "@/lib/database.types";

// Colors matching our Tailwind config
const C = {
  paper: "#2C2A26",
  ink: "#E8E4DC",
  inkMuted: "#9A958A",
  inkDim: "#6B6760",
  teal: "#4AABB8",
  tealDark: "#2D8A96",
  tealMuted: "#3A7A84",
  road: "#5C5040",
  roadDark: "#4A3F32",
  roadEdge: "#3A3228",
  roadLine: "#8A7D65",
  dot: "#D4582A",
  dotHover: "#E8703E",
  white: "#F0ECE4",
};

function generateRoadPath(width: number, height: number, numPoints: number) {
  const points: { x: number; y: number }[] = [];
  const padding = 60;
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;
  const segmentHeight = usableHeight / (numPoints + 1);

  for (let i = 0; i <= numPoints + 1; i++) {
    const y = padding + i * segmentHeight;
    const progress = i / (numPoints + 1);
    const amplitude = usableWidth * 0.3;
    const centerX = width / 2;
    const wave = Math.sin(progress * Math.PI * 2.8 + 0.5) * amplitude;
    const wobble = Math.sin(progress * 7.3) * 18 + Math.cos(progress * 11.1) * 12;
    points.push({ x: centerX + wave + wobble, y });
  }

  let d = `M ${points[0].x} ${points[0].y - 30}`;
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    const midY = (curr.y + next.y) / 2;
    // Use seeded-ish values instead of random so the road is stable
    const cp1x = curr.x + Math.sin(i * 3.7) * 20;
    const cp2x = next.x + Math.cos(i * 5.3) * 20;
    d += ` C ${cp1x} ${midY - segmentHeight * 0.2}, ${cp2x} ${midY + segmentHeight * 0.2}, ${next.x} ${next.y}`;
  }
  const last = points[points.length - 1];
  d += ` C ${last.x + 25} ${last.y + 30}, ${last.x + 50} ${last.y + 55}, ${last.x + 40} ${last.y + 90}`;

  return { d, points: points.slice(1, points.length - 1) };
}

type TimelineAlbum = Album & { photo_count?: number };

interface RoadTimelineProps {
  albums: TimelineAlbum[];
}

export function RoadTimeline({ albums }: RoadTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredAlbum, setHoveredAlbum] = useState<TimelineAlbum | null>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const [hoverSide, setHoverSide] = useState<"left" | "right">("right");
  const [width, setWidth] = useState(700);
  const [roadData, setRoadData] = useState<ReturnType<typeof generateRoadPath> | null>(null);

  const albumCount = albums.length;
  const roadHeight = Math.max(900, albumCount * 95 + 160);

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setWidth(Math.min(containerRef.current.offsetWidth, 760));
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (width > 0) setRoadData(generateRoadPath(width, roadHeight, albumCount));
  }, [width, roadHeight, albumCount]);

  const handleDotHover = useCallback(
    (album: TimelineAlbum, point: { x: number; y: number }) => {
      setHoveredAlbum(album);
      setHoverPos({ x: point.x, y: point.y });
      setHoverSide(point.x > width / 2 ? "left" : "right");
    },
    [width]
  );

  if (!roadData || albums.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="font-mono text-sm text-rvno-ink-dim">
          No rides yet. The road is waiting.
        </p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-[760px] mx-auto">
      <svg
        width={width}
        height={roadHeight + 40}
        viewBox={`0 0 ${width} ${roadHeight + 40}`}
      >
        <defs>
          <linearGradient id="roadFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0.88" stopColor={C.road} stopOpacity="1" />
            <stop offset="1" stopColor={C.road} stopOpacity="0" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background */}
        <rect width={width} height={roadHeight + 40} fill={C.paper} rx="4" />

        {/* Grid lines */}
        {Array.from({ length: Math.floor(width / 70) }).map((_, i) => (
          <line
            key={`v-${i}`}
            x1={i * 70}
            y1="0"
            x2={i * 70}
            y2={roadHeight + 40}
            stroke={C.ink}
            strokeWidth="0.15"
            opacity="0.05"
          />
        ))}
        {Array.from({ length: Math.floor(roadHeight / 70) }).map((_, i) => (
          <line
            key={`h-${i}`}
            x1="0"
            y1={i * 70}
            x2={width}
            y2={i * 70}
            stroke={C.ink}
            strokeWidth="0.15"
            opacity="0.05"
          />
        ))}

        {/* Compass */}
        <g transform={`translate(${width - 44}, 50)`} opacity="0.25">
          <circle r="20" fill="none" stroke={C.ink} strokeWidth="0.5" />
          <circle r="16" fill="none" stroke={C.ink} strokeWidth="0.3" />
          <line x1="0" y1="-14" x2="0" y2="14" stroke={C.ink} strokeWidth="0.4" />
          <line x1="-14" y1="0" x2="14" y2="0" stroke={C.ink} strokeWidth="0.4" />
          <polygon points="0,-13 -2.5,-4 2.5,-4" fill={C.dot} opacity="0.6" />
          <text y="-22" textAnchor="middle" fontSize="6" fontFamily="'Playfair Display', Georgia, serif" fill={C.ink} opacity="0.35">
            N
          </text>
        </g>

        {/* Title */}
        <g transform={`translate(${width / 2}, 30)`}>
          <text textAnchor="middle" fontSize="9" fontFamily="'IBM Plex Mono', monospace" fill={C.teal} letterSpacing="3">
            ROANOKE VALLEY NORTON OWNERS
          </text>
          <text textAnchor="middle" y="15" fontSize="7" fontFamily="'IBM Plex Mono', monospace" fill={C.inkDim} letterSpacing="2">
            THE ROAD SO FAR
          </text>
        </g>

        {/* Road layers */}
        <path d={roadData.d} fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" />
        <path d={roadData.d} fill="none" stroke={C.roadEdge} strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" />
        <path d={roadData.d} fill="none" stroke="url(#roadFade)" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
        <path d={roadData.d} fill="none" stroke={C.roadLine} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="10,8" opacity="0.45" />

        {/* Event dots */}
        {roadData.points.slice(0, albumCount).map((point, idx) => {
          const album = albums[idx];
          const isHovered = hoveredAlbum?.id === album.id;
          const labelSide = point.x > width / 2 ? "left" : "right";
          const labelX = labelSide === "right" ? point.x + 18 : point.x - 18;

          return (
            <g
              key={album.id}
              onMouseEnter={() => handleDotHover(album, point)}
              onMouseLeave={() => setHoveredAlbum(null)}
              onClick={() => window.location.href = `/album/${album.id}`}
              style={{ cursor: "pointer" }}
            >
              <line
                x1={point.x} y1={point.y} x2={labelX} y2={point.y}
                stroke={isHovered ? C.dot : C.inkDim}
                strokeWidth={isHovered ? 1 : 0.4}
                opacity={isHovered ? 0.7 : 0.25}
                strokeDasharray={isHovered ? "none" : "2,2"}
              />

              {isHovered && (
                <circle cx={point.x} cy={point.y} r="14" fill="rgba(212,88,42,0.25)" filter="url(#glow)" />
              )}

              <circle
                cx={point.x} cy={point.y} r={isHovered ? 7 : 5}
                fill={isHovered ? C.dotHover : C.dot}
                stroke={C.paper} strokeWidth="2"
                style={{ transition: "all 0.15s ease" }}
              />
              <circle cx={point.x} cy={point.y} r="1.5" fill={C.white} opacity="0.7" />

              <text
                x={labelX + (labelSide === "right" ? 5 : -5)}
                y={point.y - 5}
                textAnchor={labelSide === "right" ? "start" : "end"}
                fontSize="8"
                fontFamily="'IBM Plex Mono', monospace"
                fontWeight="500"
                fill={isHovered ? C.teal : C.inkDim}
                opacity={isHovered ? 1 : 0.6}
                letterSpacing="0.5"
              >
                {formatDate(album.event_date)}
              </text>

              <text
                x={labelX + (labelSide === "right" ? 5 : -5)}
                y={point.y + 7}
                textAnchor={labelSide === "right" ? "start" : "end"}
                fontSize="10"
                fontFamily="'Playfair Display', Georgia, serif"
                fontWeight={isHovered ? "700" : "400"}
                fill={isHovered ? C.ink : C.inkMuted}
                style={{ transition: "all 0.15s" }}
              >
                {album.title.length > 28 ? album.title.slice(0, 26) + "…" : album.title}
              </text>
            </g>
          );
        })}

        {/* Start label */}
        <g transform={`translate(${roadData.points[0]?.x - 40}, ${roadData.points[0]?.y - 38})`}>
          <text fontSize="6" fontFamily="'IBM Plex Mono', monospace" fill={C.inkDim} letterSpacing="2" opacity="0.4" transform="rotate(-10)">
            WHERE IT BEGAN
          </text>
        </g>

        {/* End — no finish line */}
        <text
          x={(roadData.points[albumCount - 1]?.x || 400) + 30}
          y={roadHeight + 5}
          fontSize="6"
          fontFamily="'IBM Plex Mono', monospace"
          fill={C.inkDim}
          letterSpacing="2"
          opacity="0.25"
        >
          MORE ROAD AHEAD →
        </text>
      </svg>

      {/* Hover popup */}
      {hoveredAlbum && (
        <div
          className="absolute pointer-events-none z-50"
          style={{
            left: hoverPos.x + (hoverSide === "left" ? -256 : 16),
            top: hoverPos.y - 50,
            animation: "fadeIn 0.15s ease-out",
          }}
        >
          <div className="w-60 bg-rvno-elevated rounded-md overflow-hidden border border-white/[0.06] shadow-2xl">
            <div
              className="h-24 flex items-center justify-center relative"
              style={{
                background: `linear-gradient(135deg, ${C.tealDark}, ${C.tealMuted})`,
              }}
            >
              {hoveredAlbum.cover_photo_url ? (
                <img
                  src={hoveredAlbum.cover_photo_url}
                  alt={hoveredAlbum.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-mono text-[10px] text-white/60 tracking-wide uppercase">
                  {hoveredAlbum.photo_count
                    ? `${hoveredAlbum.photo_count} photos`
                    : "Album"}
                </span>
              )}
              <span className="absolute bottom-1.5 right-2 bg-black/35 text-white/80 text-[9px] px-1.5 py-0.5 rounded font-mono">
                {hoveredAlbum.location_name}
              </span>
            </div>
            <div className="p-3">
              <h3 className="font-display text-sm font-semibold text-rvno-ink leading-tight mb-1">
                {hoveredAlbum.title}
              </h3>
              <p className="font-mono text-[10px] text-rvno-teal mb-1.5">
                {formatDate(hoveredAlbum.event_date)}
              </p>
              {hoveredAlbum.description && (
                <p className="font-body text-[11px] text-rvno-ink-muted leading-relaxed">
                  {hoveredAlbum.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}
