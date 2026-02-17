"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import type { Album } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";

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

type Point = { x: number; y: number };

// Generate base positions for dots (before offsets are applied)
function generateBasePositions(width: number, height: number, numPoints: number): Point[] {
  const points: Point[] = [];
  const padding = 60;
  const usableHeight = height - padding * 2;
  const segmentHeight = usableHeight / (numPoints + 1);

  for (let i = 0; i < numPoints; i++) {
    const y = padding + (i + 1) * segmentHeight;
    const progress = (i + 1) / (numPoints + 1);
    const amplitude = (width - padding * 2) * 0.3;
    const centerX = width / 2;
    // Create a nice wave pattern as the default
    const wave = Math.sin(progress * Math.PI * 2.8 + 0.5) * amplitude;
    const wobble = Math.sin(progress * 7.3) * 18 + Math.cos(progress * 11.1) * 12;
    points.push({ x: centerX + wave + wobble, y });
  }

  return points;
}

// Catmull-Rom to Cubic Bezier conversion
// Given 4 points (p0, p1, p2, p3), compute the bezier control points for the segment p1->p2
function catmullRomToBezier(
  p0: Point,
  p1: Point,
  p2: Point,
  p3: Point,
  tension: number = 0.5
): { cp1: Point; cp2: Point } {
  const t = tension;
  return {
    cp1: {
      x: p1.x + (p2.x - p0.x) / (6 * t),
      y: p1.y + (p2.y - p0.y) / (6 * t),
    },
    cp2: {
      x: p2.x - (p3.x - p1.x) / (6 * t),
      y: p2.y - (p3.y - p1.y) / (6 * t),
    },
  };
}

// Generate a smooth SVG path through all points using Catmull-Rom splines
function generateSmoothPath(points: Point[], tension: number = 0.4): string {
  if (points.length < 2) return "";

  // Add virtual points at start and end for smooth curves
  const extended = [
    { x: points[0].x, y: points[0].y - 60 }, // Virtual start point above first
    ...points,
    { x: points[points.length - 1].x + 30, y: points[points.length - 1].y + 80 }, // Virtual end point below last
  ];

  // Start path at the virtual start point (above first dot)
  let d = `M ${extended[0].x} ${extended[0].y - 30}`;

  // Generate bezier curves for each segment
  for (let i = 0; i < extended.length - 1; i++) {
    const p0 = extended[Math.max(0, i - 1)];
    const p1 = extended[i];
    const p2 = extended[i + 1];
    const p3 = extended[Math.min(extended.length - 1, i + 2)];

    const { cp1, cp2 } = catmullRomToBezier(p0, p1, p2, p3, tension);

    d += ` C ${cp1.x.toFixed(1)} ${cp1.y.toFixed(1)}, ${cp2.x.toFixed(1)} ${cp2.y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  return d;
}

type TimelineAlbum = Album & { photo_count?: number };

interface RoadTimelineProps {
  albums: TimelineAlbum[];
  isAdmin?: boolean;
}

// Track offsets per album for draggable dots
type OffsetMap = Record<string, { x: number; y: number }>;

export function RoadTimeline({ albums, isAdmin = false }: RoadTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredAlbum, setHoveredAlbum] = useState<TimelineAlbum | null>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const [hoverSide, setHoverSide] = useState<"left" | "right">("right");
  const [width, setWidth] = useState(700);

  // Admin drag state
  const [offsets, setOffsets] = useState<OffsetMap>({});
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragStartRef = useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null);

  const albumCount = albums.length;
  const roadHeight = Math.max(900, albumCount * 95 + 160);

  // Initialize offsets from album data
  useEffect(() => {
    const initial: OffsetMap = {};
    albums.forEach((a) => {
      initial[a.id] = { x: a.offset_x ?? 0, y: a.offset_y ?? 0 };
    });
    setOffsets(initial);
  }, [albums]);

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

  // Save offset to Supabase
  const saveOffset = useCallback(async (albumId: string, offsetX: number, offsetY: number) => {
    await supabase
      .from("albums")
      .update({ offset_x: offsetX, offset_y: offsetY })
      .eq("id", albumId);
  }, []);

  // Drag handlers
  const handleDragStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent, albumId: string) => {
      if (!isAdmin) return;
      e.preventDefault();
      e.stopPropagation();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      const current = offsets[albumId] || { x: 0, y: 0 };
      dragStartRef.current = { x: clientX, y: clientY, offsetX: current.x, offsetY: current.y };
      setDraggingId(albumId);
    },
    [isAdmin, offsets]
  );

  const handleDragMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!draggingId || !dragStartRef.current) return;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      const dx = clientX - dragStartRef.current.x;
      const dy = clientY - dragStartRef.current.y;
      // Clamp to keep dots within SVG bounds (with padding)
      const maxOffsetX = width * 0.4;
      const maxOffsetY = roadHeight * 0.1;
      setOffsets((prev) => ({
        ...prev,
        [draggingId]: {
          x: Math.max(-maxOffsetX, Math.min(maxOffsetX, dragStartRef.current!.offsetX + dx)),
          y: Math.max(-maxOffsetY, Math.min(maxOffsetY, dragStartRef.current!.offsetY + dy)),
        },
      }));
    },
    [draggingId, width, roadHeight]
  );

  const handleDragEnd = useCallback(() => {
    if (draggingId && offsets[draggingId]) {
      saveOffset(draggingId, offsets[draggingId].x, offsets[draggingId].y);
    }
    setDraggingId(null);
    dragStartRef.current = null;
  }, [draggingId, offsets, saveOffset]);

  // Global drag listeners
  useEffect(() => {
    if (!draggingId) return;
    window.addEventListener("mousemove", handleDragMove);
    window.addEventListener("mouseup", handleDragEnd);
    window.addEventListener("touchmove", handleDragMove);
    window.addEventListener("touchend", handleDragEnd);
    return () => {
      window.removeEventListener("mousemove", handleDragMove);
      window.removeEventListener("mouseup", handleDragEnd);
      window.removeEventListener("touchmove", handleDragMove);
      window.removeEventListener("touchend", handleDragEnd);
    };
  }, [draggingId, handleDragMove, handleDragEnd]);

  // Compute base positions (without offsets)
  const basePositions = useMemo(() => {
    if (width <= 0 || albumCount === 0) return [];
    return generateBasePositions(width, roadHeight, albumCount);
  }, [width, roadHeight, albumCount]);

  // Compute actual dot positions (base + offset) - recalculates on every drag
  const dotPositions = useMemo(() => {
    const padding = 30;
    return basePositions.map((base, idx) => {
      const album = albums[idx];
      const offset = offsets[album?.id] || { x: 0, y: 0 };
      // Clamp final position to stay within SVG bounds
      return {
        x: Math.max(padding, Math.min(width - padding, base.x + offset.x)),
        y: Math.max(padding, Math.min(roadHeight - padding, base.y + offset.y)),
      };
    });
  }, [basePositions, albums, offsets, width, roadHeight]);

  // Generate the road path through all dot positions - updates in real-time during drag
  const roadPath = useMemo(() => {
    if (dotPositions.length === 0) return "";
    return generateSmoothPath(dotPositions, 0.4);
  }, [dotPositions]);

  const handleDotHover = useCallback(
    (album: TimelineAlbum, point: { x: number; y: number }) => {
      setHoveredAlbum(album);
      setHoverPos({ x: point.x, y: point.y });
      setHoverSide(point.x > width / 2 ? "left" : "right");
    },
    [width]
  );

  if (albums.length === 0) {
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

  // Get first and last dot positions for labels
  const firstDot = dotPositions[0];
  const lastDot = dotPositions[dotPositions.length - 1];

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

        {/* Road layers - path now passes through dot positions */}
        {roadPath && (
          <>
            <path d={roadPath} fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" />
            <path d={roadPath} fill="none" stroke={C.roadEdge} strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" />
            <path d={roadPath} fill="none" stroke="url(#roadFade)" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
            <path d={roadPath} fill="none" stroke={C.roadLine} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="10,8" opacity="0.45" />
          </>
        )}

        {/* Event dots */}
        {dotPositions.map((pos, idx) => {
          const album = albums[idx];
          if (!album) return null;
          const isHovered = hoveredAlbum?.id === album.id;
          const isDragging = draggingId === album.id;
          const dotX = pos.x;
          const dotY = pos.y;
          const labelSide = dotX > width / 2 ? "left" : "right";
          const labelX = labelSide === "right" ? dotX + 18 : dotX - 18;

          return (
            <g
              key={album.id}
              onMouseEnter={() => !isDragging && handleDotHover(album, { x: dotX, y: dotY })}
              onMouseLeave={() => !isDragging && setHoveredAlbum(null)}
              onClick={() => {
                if (isAdmin && !isDragging) {
                  // Admin click without drag: still navigate
                  const offset = offsets[album.id] || { x: 0, y: 0 };
                  const moved = dragStartRef.current
                    ? Math.abs(offset.x - dragStartRef.current.offsetX) > 3 ||
                      Math.abs(offset.y - dragStartRef.current.offsetY) > 3
                    : false;
                  if (!moved) window.location.href = `/album/${album.id}`;
                } else if (!isAdmin) {
                  window.location.href = `/album/${album.id}`;
                }
              }}
              onMouseDown={(e) => isAdmin && handleDragStart(e, album.id)}
              onTouchStart={(e) => isAdmin && handleDragStart(e, album.id)}
              style={{ cursor: isAdmin ? (isDragging ? "grabbing" : "grab") : "pointer" }}
            >
              <line
                x1={dotX} y1={dotY} x2={labelX} y2={dotY}
                stroke={isHovered || isDragging ? C.dot : C.inkDim}
                strokeWidth={isHovered || isDragging ? 1 : 0.4}
                opacity={isHovered || isDragging ? 0.7 : 0.25}
                strokeDasharray={isHovered || isDragging ? "none" : "2,2"}
              />

              {/* Admin mode indicator ring */}
              {isAdmin && (
                <circle
                  cx={dotX} cy={dotY} r="10"
                  fill="none"
                  stroke={C.teal}
                  strokeWidth="1"
                  strokeDasharray="3,2"
                  opacity={isDragging ? 0.8 : 0.3}
                />
              )}

              <circle
                cx={dotX} cy={dotY} r="5"
                fill={isDragging ? C.teal : C.dot}
                stroke={C.paper} strokeWidth="2"
              />
              <circle cx={dotX} cy={dotY} r="1.5" fill={C.white} opacity="0.7" />

              <text
                x={labelX + (labelSide === "right" ? 5 : -5)}
                y={dotY - 5}
                textAnchor={labelSide === "right" ? "start" : "end"}
                fontSize="8"
                fontFamily="'IBM Plex Mono', monospace"
                fontWeight="500"
                fill={isHovered || isDragging ? C.teal : C.inkDim}
                opacity={isHovered || isDragging ? 1 : 0.6}
                letterSpacing="0.5"
              >
                {formatDate(album.event_date)}
              </text>

              <text
                x={labelX + (labelSide === "right" ? 5 : -5)}
                y={dotY + 7}
                textAnchor={labelSide === "right" ? "start" : "end"}
                fontSize="10"
                fontFamily="'Playfair Display', Georgia, serif"
                fontWeight={isHovered || isDragging ? "700" : "400"}
                fill={isHovered || isDragging ? C.ink : C.inkMuted}
                style={{ transition: isDragging ? "none" : "all 0.15s" }}
              >
                {album.title.length > 28 ? album.title.slice(0, 26) + "…" : album.title}
              </text>
            </g>
          );
        })}

        {/* Start label */}
        {firstDot && (
          <g transform={`translate(${firstDot.x - 40}, ${firstDot.y - 38})`}>
            <text fontSize="6" fontFamily="'IBM Plex Mono', monospace" fill={C.inkDim} letterSpacing="2" opacity="0.4" transform="rotate(-10)">
              WHERE IT BEGAN
            </text>
          </g>
        )}

        {/* End — no finish line */}
        {lastDot && (
          <text
            x={lastDot.x + 30}
            y={roadHeight + 5}
            fontSize="6"
            fontFamily="'IBM Plex Mono', monospace"
            fill={C.inkDim}
            letterSpacing="2"
            opacity="0.25"
          >
            MORE ROAD AHEAD →
          </text>
        )}
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
