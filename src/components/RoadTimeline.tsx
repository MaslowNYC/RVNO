"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import type { Album } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";

// Vintage Rand McNally paper map colors
const C = {
  paper: "#ebe3cd",        // Warm paper background
  paperDark: "#dfd2ae",    // Slightly darker paper
  ink: "#523735",          // Brown ink
  inkMuted: "#93817c",     // Muted brown
  inkDim: "#ae9e90",       // Dim text
  teal: "#447530",         // Dark green accent
  road: "#f5f1e6",         // Light road
  roadHighway: "#f8c967",  // Golden highway
  roadStroke: "#e9bc62",   // Highway stroke
  roadEdge: "#c9b2a6",     // Road edge
  roadLine: "#806b63",     // Center line
  dot: "#C4853A",          // Brass rivet copper
  dotHover: "#D4954A",     // Hover copper
  water: "#b9d3c2",        // Sage water
  white: "#f5f1e6",
};

type Point = { x: number; y: number };

// Generate base positions for year dots
function generateYearPositions(width: number, height: number, numYears: number): Point[] {
  const points: Point[] = [];
  const padding = 80;
  const usableHeight = height - padding * 2;
  const segmentHeight = usableHeight / (numYears + 1);

  for (let i = 0; i < numYears; i++) {
    const y = padding + (i + 1) * segmentHeight;
    const progress = (i + 1) / (numYears + 1);
    const amplitude = (width - padding * 2) * 0.25;
    const centerX = width / 2;
    const wave = Math.sin(progress * Math.PI * 2.5 + 0.3) * amplitude;
    const wobble = Math.sin(progress * 5.7) * 15 + Math.cos(progress * 8.3) * 10;
    points.push({ x: centerX + wave + wobble, y });
  }

  return points;
}

// Catmull-Rom to Cubic Bezier conversion
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

// Generate a smooth SVG path through all points
function generateSmoothPath(points: Point[], tension: number = 0.4): string {
  if (points.length < 2) return "";

  const extended = [
    { x: points[0].x, y: points[0].y - 60 },
    ...points,
    { x: points[points.length - 1].x + 30, y: points[points.length - 1].y + 80 },
  ];

  let d = `M ${extended[0].x} ${extended[0].y - 30}`;

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
}

type YearData = {
  year: number;
  albums: TimelineAlbum[];
};

type OffsetMap = Record<string, { x: number; y: number }>;

export function RoadTimeline({ albums }: RoadTimelineProps) {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredAlbum, setHoveredAlbum] = useState<TimelineAlbum | null>(null);
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const [hoverSide, setHoverSide] = useState<"left" | "right">("right");
  const [width, setWidth] = useState(700);
  const [expandedYear, setExpandedYear] = useState<number | null>(null);

  // Editing state
  const [editingAlbum, setEditingAlbum] = useState<TimelineAlbum | null>(null);
  const [editForm, setEditForm] = useState({ title: "", description: "" });
  const [saving, setSaving] = useState(false);

  // Admin drag state for year dots
  const [offsets, setOffsets] = useState<OffsetMap>({});
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragStartRef = useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null);

  // Group albums by year
  const yearData = useMemo(() => {
    const grouped: Record<number, TimelineAlbum[]> = {};
    albums.forEach((album) => {
      const year = new Date(album.event_date + "T00:00:00").getFullYear();
      if (!grouped[year]) grouped[year] = [];
      grouped[year].push(album);
    });

    // Sort years ascending and sort albums within each year by date
    const years = Object.keys(grouped)
      .map(Number)
      .sort((a, b) => a - b);

    return years.map((year) => ({
      year,
      albums: grouped[year].sort(
        (a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
      ),
    }));
  }, [albums]);

  const yearCount = yearData.length;
  const roadHeight = Math.max(600, yearCount * 120 + 200);

  // Initialize offsets for year dots
  useEffect(() => {
    const initial: OffsetMap = {};
    yearData.forEach((yd) => {
      // Use year as the key
      initial[`year-${yd.year}`] = { x: 0, y: 0 };
    });
    setOffsets(initial);
  }, [yearData]);

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

  // Save album title/description
  const saveAlbumDetails = useCallback(async () => {
    if (!editingAlbum) return;
    setSaving(true);
    await supabase
      .from("albums")
      .update({ title: editForm.title, description: editForm.description || null })
      .eq("id", editingAlbum.id);
    setSaving(false);
    setEditingAlbum(null);
    router.refresh();
  }, [editingAlbum, editForm, router]);

  const startEditAlbum = useCallback((album: TimelineAlbum) => {
    setEditingAlbum(album);
    setEditForm({ title: album.title, description: album.description || "" });
    setHoveredAlbum(null);
  }, []);

  const cancelEditAlbum = useCallback(() => {
    setEditingAlbum(null);
    setEditForm({ title: "", description: "" });
  }, []);

  // Drag handlers for year dots (admin only)
  const handleDragStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent, yearKey: string) => {
      if (!isAdmin) return;
      e.preventDefault();
      e.stopPropagation();

      let clientX: number;
      let clientY: number;
      if ("touches" in e && e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ("clientX" in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      } else {
        return;
      }

      const current = offsets[yearKey] || { x: 0, y: 0 };
      dragStartRef.current = { x: clientX, y: clientY, offsetX: current.x, offsetY: current.y };
      setDraggingId(yearKey);
    },
    [isAdmin, offsets]
  );

  const handleDragMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      const dragStart = dragStartRef.current;
      if (!draggingId || !dragStart) return;

      let clientX: number;
      let clientY: number;
      if ("touches" in e && e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ("clientX" in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      } else {
        return;
      }

      const dx = clientX - dragStart.x;
      const dy = clientY - dragStart.y;
      const maxOffsetX = width * 0.35;
      const maxOffsetY = roadHeight * 0.08;

      setOffsets((prev) => ({
        ...prev,
        [draggingId]: {
          x: Math.max(-maxOffsetX, Math.min(maxOffsetX, dragStart.offsetX + dx)),
          y: Math.max(-maxOffsetY, Math.min(maxOffsetY, dragStart.offsetY + dy)),
        },
      }));
    },
    [draggingId, width, roadHeight]
  );

  const handleDragEnd = useCallback(() => {
    setDraggingId(null);
    dragStartRef.current = null;
  }, []);

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

  // Compute base positions for year dots
  const basePositions = useMemo(() => {
    if (width <= 0 || yearCount === 0) return [];
    return generateYearPositions(width, roadHeight, yearCount);
  }, [width, roadHeight, yearCount]);

  // Compute actual year dot positions (base + offset)
  const yearPositions = useMemo(() => {
    const padding = 40;
    return basePositions.map((base, idx) => {
      const yd = yearData[idx];
      const offset = offsets[`year-${yd?.year}`] || { x: 0, y: 0 };
      return {
        x: Math.max(padding, Math.min(width - padding, base.x + offset.x)),
        y: Math.max(padding, Math.min(roadHeight - padding, base.y + offset.y)),
      };
    });
  }, [basePositions, yearData, offsets, width, roadHeight]);

  // Generate the road path through year positions
  const roadPath = useMemo(() => {
    if (yearPositions.length === 0) return "";
    return generateSmoothPath(yearPositions, 0.4);
  }, [yearPositions]);

  // Calculate album dot positions for expanded year
  const getAlbumPositions = useCallback(
    (yearIndex: number, yearPos: Point, albumCount: number): Point[] => {
      const positions: Point[] = [];
      const baseRadius = 45;
      const radiusIncrement = 25;
      const startAngle = yearPos.x > width / 2 ? Math.PI * 0.6 : Math.PI * 0.4;
      const endAngle = yearPos.x > width / 2 ? Math.PI * 1.4 : -Math.PI * 0.4;

      for (let i = 0; i < albumCount; i++) {
        const t = albumCount === 1 ? 0.5 : i / (albumCount - 1);
        const angle = startAngle + t * (endAngle - startAngle);
        const radius = baseRadius + (i % 2) * radiusIncrement;
        positions.push({
          x: yearPos.x + Math.cos(angle) * radius,
          y: yearPos.y + Math.sin(angle) * radius,
        });
      }

      return positions;
    },
    [width]
  );

  const handleYearClick = useCallback(
    (year: number) => {
      setExpandedYear((prev) => (prev === year ? null : year));
      setHoveredYear(null);
    },
    []
  );

  const handleAlbumClick = useCallback((albumId: string) => {
    window.location.href = `/album/${albumId}`;
  }, []);

  if (albums.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="font-mono text-sm" style={{ color: C.inkMuted }}>
          No rides yet. The road is waiting.
        </p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const firstDot = yearPositions[0];
  const lastDot = yearPositions[yearPositions.length - 1];

  return (
    <div ref={containerRef} className="relative w-full max-w-[760px] mx-auto">
      <svg
        width={width}
        height={roadHeight + 40}
        viewBox={`0 0 ${width} ${roadHeight + 40}`}
        style={{ background: C.paper, borderRadius: "6px" }}
      >
        <defs>
          <linearGradient id="roadFadeVintage" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0.88" stopColor={C.roadHighway} stopOpacity="1" />
            <stop offset="1" stopColor={C.roadHighway} stopOpacity="0" />
          </linearGradient>
          <filter id="paperTexture">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" result="noise" />
            <feDiffuseLighting in="noise" lightingColor={C.paper} surfaceScale="1.5" result="diffLight">
              <feDistantLight azimuth="45" elevation="60" />
            </feDiffuseLighting>
          </filter>
        </defs>

        {/* Paper background with subtle texture */}
        <rect width={width} height={roadHeight + 40} fill={C.paper} rx="6" />

        {/* Grid lines - like map grid */}
        {Array.from({ length: Math.floor(width / 80) }).map((_, i) => (
          <line
            key={`v-${i}`}
            x1={i * 80}
            y1="0"
            x2={i * 80}
            y2={roadHeight + 40}
            stroke={C.roadEdge}
            strokeWidth="0.3"
            opacity="0.3"
          />
        ))}
        {Array.from({ length: Math.floor(roadHeight / 80) }).map((_, i) => (
          <line
            key={`h-${i}`}
            x1="0"
            y1={i * 80}
            x2={width}
            y2={i * 80}
            stroke={C.roadEdge}
            strokeWidth="0.3"
            opacity="0.3"
          />
        ))}

        {/* Compass rose */}
        <g transform={`translate(${width - 50}, 55)`} opacity="0.5">
          <circle r="22" fill="none" stroke={C.ink} strokeWidth="0.8" />
          <circle r="18" fill="none" stroke={C.ink} strokeWidth="0.4" />
          <line x1="0" y1="-16" x2="0" y2="16" stroke={C.ink} strokeWidth="0.5" />
          <line x1="-16" y1="0" x2="16" y2="0" stroke={C.ink} strokeWidth="0.5" />
          <polygon points="0,-15 -3,-5 3,-5" fill={C.dot} />
          <text y="-26" textAnchor="middle" fontSize="8" fontFamily="'Playfair Display', Georgia, serif" fill={C.ink} fontWeight="600">
            N
          </text>
          <text y="32" textAnchor="middle" fontSize="6" fontFamily="'Playfair Display', Georgia, serif" fill={C.inkDim}>
            S
          </text>
          <text x="-28" y="3" textAnchor="middle" fontSize="6" fontFamily="'Playfair Display', Georgia, serif" fill={C.inkDim}>
            W
          </text>
          <text x="28" y="3" textAnchor="middle" fontSize="6" fontFamily="'Playfair Display', Georgia, serif" fill={C.inkDim}>
            E
          </text>
        </g>

        {/* Title */}
        <g transform={`translate(${width / 2}, 35)`}>
          <text textAnchor="middle" fontSize="11" fontFamily="'Playfair Display', Georgia, serif" fill={C.ink} fontWeight="600" letterSpacing="2">
            ROANOKE VALLEY NORTON OWNERS
          </text>
          <text textAnchor="middle" y="18" fontSize="8" fontFamily="'IBM Plex Mono', monospace" fill={C.inkMuted} letterSpacing="3">
            THE ROAD SO FAR
          </text>
        </g>

        {/* Road layers */}
        {roadPath && (
          <>
            <path d={roadPath} fill="none" stroke={C.roadEdge} strokeWidth="26" strokeLinecap="round" strokeLinejoin="round" />
            <path d={roadPath} fill="none" stroke={C.road} strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" />
            <path d={roadPath} fill="none" stroke="url(#roadFadeVintage)" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" />
            <path d={roadPath} fill="none" stroke={C.roadLine} strokeWidth="2" strokeLinecap="round" strokeDasharray="12,10" opacity="0.5" />
          </>
        )}

        {/* Year dots */}
        {yearPositions.map((pos, idx) => {
          const yd = yearData[idx];
          if (!yd) return null;
          const isExpanded = expandedYear === yd.year;
          const isHovered = hoveredYear === yd.year;
          const isDragging = draggingId === `year-${yd.year}`;
          const yearKey = `year-${yd.year}`;
          const dotX = pos.x;
          const dotY = pos.y;
          const labelSide = dotX > width / 2 ? "left" : "right";
          const labelX = labelSide === "right" ? dotX + 22 : dotX - 22;

          // Album positions for expanded year
          const albumPositions = isExpanded ? getAlbumPositions(idx, pos, yd.albums.length) : [];

          return (
            <g key={yd.year}>
              {/* Branch lines to albums when expanded */}
              {isExpanded &&
                albumPositions.map((albumPos, albumIdx) => (
                  <line
                    key={`branch-${albumIdx}`}
                    x1={dotX}
                    y1={dotY}
                    x2={albumPos.x}
                    y2={albumPos.y}
                    stroke={C.roadEdge}
                    strokeWidth="2"
                    strokeDasharray="4,3"
                    opacity="0.6"
                  />
                ))}

              {/* Album dots when expanded */}
              {isExpanded &&
                yd.albums.map((album, albumIdx) => {
                  const albumPos = albumPositions[albumIdx];
                  if (!albumPos) return null;
                  const isAlbumHovered = hoveredAlbum?.id === album.id;

                  return (
                    <g
                      key={album.id}
                      onMouseEnter={() => {
                        setHoveredAlbum(album);
                        setHoverPos(albumPos);
                        setHoverSide(albumPos.x > width / 2 ? "left" : "right");
                      }}
                      onMouseLeave={() => setHoveredAlbum(null)}
                      onClick={() => handleAlbumClick(album.id)}
                      style={{ cursor: "pointer" }}
                    >
                      <circle
                        cx={albumPos.x}
                        cy={albumPos.y}
                        r={isAlbumHovered ? 10 : 8}
                        fill={isAlbumHovered ? C.dotHover : C.dot}
                        stroke={C.paper}
                        strokeWidth="2"
                        style={{ transition: "all 0.15s" }}
                      />
                      <circle cx={albumPos.x} cy={albumPos.y} r="2" fill={C.white} opacity="0.8" />
                      <text
                        x={albumPos.x}
                        y={albumPos.y + 22}
                        textAnchor="middle"
                        fontSize="8"
                        fontFamily="'IBM Plex Mono', monospace"
                        fill={isAlbumHovered ? C.ink : C.inkMuted}
                        fontWeight={isAlbumHovered ? "600" : "400"}
                      >
                        {formatDate(album.event_date)}
                      </text>
                    </g>
                  );
                })}

              {/* Year dot */}
              <g
                onMouseEnter={() => !isDragging && !isExpanded && setHoveredYear(yd.year)}
                onMouseLeave={() => setHoveredYear(null)}
                onClick={() => {
                  if (!isDragging) {
                    const offset = offsets[yearKey] || { x: 0, y: 0 };
                    const moved = dragStartRef.current
                      ? Math.abs(offset.x - dragStartRef.current.offsetX) > 3 ||
                        Math.abs(offset.y - dragStartRef.current.offsetY) > 3
                      : false;
                    if (!moved) handleYearClick(yd.year);
                  }
                }}
                onMouseDown={(e) => isAdmin && handleDragStart(e, yearKey)}
                onTouchStart={(e) => isAdmin && handleDragStart(e, yearKey)}
                style={{ cursor: isAdmin ? (isDragging ? "grabbing" : "grab") : "pointer" }}
              >
                {/* Connection line to label */}
                <line
                  x1={dotX}
                  y1={dotY}
                  x2={labelX}
                  y2={dotY}
                  stroke={isHovered || isExpanded || isDragging ? C.dot : C.inkDim}
                  strokeWidth={isHovered || isExpanded || isDragging ? 1.5 : 0.6}
                  opacity={isHovered || isExpanded || isDragging ? 0.8 : 0.3}
                  strokeDasharray={isHovered || isExpanded || isDragging ? "none" : "3,3"}
                />

                {/* Admin drag indicator */}
                {isAdmin && (
                  <circle
                    cx={dotX}
                    cy={dotY}
                    r="14"
                    fill="none"
                    stroke={C.teal}
                    strokeWidth="1"
                    strokeDasharray="4,3"
                    opacity={isDragging ? 0.9 : 0.4}
                  />
                )}

                {/* Main year dot */}
                <circle
                  cx={dotX}
                  cy={dotY}
                  r={isExpanded ? 10 : 8}
                  fill={isDragging ? C.teal : isExpanded ? C.dotHover : C.dot}
                  stroke={C.paper}
                  strokeWidth="3"
                  style={{ transition: isDragging ? "none" : "all 0.2s" }}
                />
                <circle cx={dotX} cy={dotY} r="2.5" fill={C.white} opacity="0.8" />

                {/* Album count badge */}
                {yd.albums.length > 1 && !isExpanded && (
                  <g transform={`translate(${dotX + 8}, ${dotY - 8})`}>
                    <circle r="7" fill={C.ink} />
                    <text
                      textAnchor="middle"
                      y="3"
                      fontSize="8"
                      fontFamily="'IBM Plex Mono', monospace"
                      fill={C.paper}
                      fontWeight="600"
                    >
                      {yd.albums.length}
                    </text>
                  </g>
                )}

                {/* Year label */}
                <text
                  x={labelX + (labelSide === "right" ? 8 : -8)}
                  y={dotY + 5}
                  textAnchor={labelSide === "right" ? "start" : "end"}
                  fontSize="16"
                  fontFamily="'Playfair Display', Georgia, serif"
                  fontWeight={isHovered || isExpanded || isDragging ? "700" : "500"}
                  fill={isHovered || isExpanded || isDragging ? C.ink : C.inkMuted}
                  style={{ transition: isDragging ? "none" : "all 0.15s" }}
                >
                  {yd.year}
                </text>

                {/* Album count text */}
                <text
                  x={labelX + (labelSide === "right" ? 8 : -8)}
                  y={dotY + 20}
                  textAnchor={labelSide === "right" ? "start" : "end"}
                  fontSize="9"
                  fontFamily="'IBM Plex Mono', monospace"
                  fill={C.inkDim}
                >
                  {yd.albums.length} {yd.albums.length === 1 ? "ride" : "rides"}
                </text>
              </g>
            </g>
          );
        })}

        {/* Start label */}
        {firstDot && (
          <g transform={`translate(${firstDot.x - 45}, ${firstDot.y - 42})`}>
            <text
              fontSize="7"
              fontFamily="'IBM Plex Mono', monospace"
              fill={C.inkDim}
              letterSpacing="2"
              opacity="0.5"
              transform="rotate(-8)"
            >
              WHERE IT BEGAN
            </text>
          </g>
        )}

        {/* End label */}
        {lastDot && (
          <text
            x={lastDot.x + 35}
            y={roadHeight + 10}
            fontSize="7"
            fontFamily="'IBM Plex Mono', monospace"
            fill={C.inkDim}
            letterSpacing="2"
            opacity="0.35"
          >
            MORE ROAD AHEAD →
          </text>
        )}

        {/* Legend */}
        <g transform={`translate(20, ${roadHeight + 20})`}>
          <text fontSize="7" fontFamily="'IBM Plex Mono', monospace" fill={C.inkDim} letterSpacing="1">
            CLICK A YEAR TO EXPAND • {yearData.length} YEARS • {albums.length} RIDES
          </text>
        </g>
      </svg>

      {/* Hover popup for albums */}
      {hoveredAlbum && !editingAlbum && (
        <div
          className={`absolute z-50 ${isAdmin ? "pointer-events-auto" : "pointer-events-none"}`}
          style={{
            left: hoverPos.x + (hoverSide === "left" ? -256 : 16),
            top: hoverPos.y - 50,
            animation: "fadeIn 0.15s ease-out",
          }}
        >
          <div
            className="w-60 rounded-md overflow-hidden shadow-xl"
            style={{ background: C.paper, border: `1px solid ${C.roadEdge}` }}
          >
            <div
              className="h-24 flex items-center justify-center relative"
              style={{ background: C.paperDark }}
            >
              {hoveredAlbum.cover_photo_url ? (
                <img
                  src={hoveredAlbum.cover_photo_url}
                  alt={hoveredAlbum.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-mono text-[10px] tracking-wide uppercase" style={{ color: C.inkMuted }}>
                  {hoveredAlbum.photo_count ? `${hoveredAlbum.photo_count} photos` : "Album"}
                </span>
              )}
              <span
                className="absolute bottom-1.5 right-2 text-[9px] px-1.5 py-0.5 rounded font-mono"
                style={{ background: "rgba(0,0,0,0.35)", color: C.white }}
              >
                {hoveredAlbum.location_name}
              </span>
            </div>
            <div className="p-3">
              <h3 className="font-display text-sm font-semibold leading-tight mb-1" style={{ color: C.ink }}>
                {hoveredAlbum.title}
              </h3>
              <p className="font-mono text-[10px] mb-1.5" style={{ color: C.dot }}>
                {formatDate(hoveredAlbum.event_date)}
              </p>
              {hoveredAlbum.description && (
                <p className="font-body text-[11px] leading-relaxed" style={{ color: C.inkMuted }}>
                  {hoveredAlbum.description}
                </p>
              )}
              {isAdmin && (
                <button
                  onClick={() => startEditAlbum(hoveredAlbum)}
                  className="mt-2 w-full text-center font-body text-xs transition-colors"
                  style={{ color: C.dot }}
                >
                  Edit title & description
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit album modal */}
      {editingAlbum && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div
            className="rounded-lg shadow-xl p-5 w-80 max-w-[90vw]"
            style={{ background: C.paper, border: `1px solid ${C.roadEdge}` }}
          >
            <h3 className="font-display text-lg font-semibold mb-4" style={{ color: C.ink }}>
              Edit Album
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                placeholder="Album title"
                className="w-full rounded-lg px-3 py-2 font-body text-sm focus:outline-none"
                style={{
                  background: C.road,
                  border: `1px solid ${C.roadEdge}`,
                  color: C.ink,
                }}
              />
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Description (optional)"
                rows={3}
                className="w-full rounded-lg px-3 py-2 font-body text-sm focus:outline-none resize-none"
                style={{
                  background: C.road,
                  border: `1px solid ${C.roadEdge}`,
                  color: C.ink,
                }}
              />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={cancelEditAlbum}
                disabled={saving}
                className="font-body text-sm transition-colors px-3 py-2 disabled:opacity-50"
                style={{ color: C.inkMuted }}
              >
                Cancel
              </button>
              <button
                onClick={saveAlbumDetails}
                disabled={saving || !editForm.title}
                className="font-body text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                style={{ background: C.dot, color: C.paper }}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
