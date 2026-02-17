"use client";

import { useEffect, useRef, useState } from "react";
import type { Album, Photo } from "@/lib/database.types";

type PhotoWithAlbum = Photo & { album?: Album };

// Dynamically import Leaflet (it needs window)
let L: typeof import("leaflet") | null = null;

export function AlbumMap({
  albums,
  photos,
}: {
  albums: (Album & { photo_count?: number })[];
  photos: PhotoWithAlbum[];
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [ready, setReady] = useState(false);

  // Filter photos with coordinates
  const mappablePhotos = photos.filter((p) => p.location_lat && p.location_lng);

  useEffect(() => {
    // Dynamic import for SSR safety
    import("leaflet").then((leaflet) => {
      L = leaflet;
      // Fix default marker icons
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (!ready || !L || !mapRef.current || mapInstance.current) return;

    // Create map
    const map = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    });

    // Vintage-style tiles from Stadia (Stamen Watercolor successor)
    L.tileLayer(
      "https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg",
      {
        attribution:
          '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://stamen.com/">Stamen Design</a>',
        maxZoom: 18,
      }
    ).addTo(map);

    // Add a subtle label overlay so you can still read place names
    L.tileLayer(
      "https://tiles.stadiamaps.com/tiles/stamen_toner_labels/{z}/{x}/{y}{r}.png",
      {
        maxZoom: 18,
        opacity: 0.5,
      }
    ).addTo(map);

    // Custom marker icon for photos
    const photoIcon = L.divIcon({
      className: "rvno-photo-marker",
      html: `<div style="
        width: 12px; height: 12px;
        background: #D4582A;
        border: 2px solid #2C2A26;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,0.4);
      "></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6],
      popupAnchor: [0, -8],
    });

    // Add photo markers
    const markers: any[] = [];
    mappablePhotos.forEach((photo) => {
      if (!L || !photo.location_lat || !photo.location_lng) return;

      const marker = L.marker([photo.location_lat, photo.location_lng], {
        icon: photoIcon,
      }).addTo(map);

      const album = albums.find((a) => a.id === photo.album_id);
      const takenDate = photo.taken_at
        ? new Date(photo.taken_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : null;

      const popupContent = `
        <div style="
          font-family: 'Source Serif 4', Georgia, serif;
          min-width: 160px;
          max-width: 200px;
        ">
          <img src="${photo.url}" style="
            width: 100%; height: 100px; object-fit: cover;
            border-radius: 4px 4px 0 0; margin: -12px -12px 8px -12px;
            width: calc(100% + 24px);
          " />
          ${
            photo.caption
              ? `<div style="font-size: 12px; color: #1A1A1F; margin-bottom: 4px; font-weight: 500;">
                  ${photo.caption}
                </div>`
              : ""
          }
          ${
            takenDate
              ? `<div style="font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: #4AABB8; letter-spacing: 0.5px;">
                  ${takenDate}
                </div>`
              : ""
          }
          ${
            album
              ? `<a href="/album/${album.id}" style="
                  display: inline-block; margin-top: 6px;
                  font-family: 'IBM Plex Mono', monospace; font-size: 10px;
                  color: #6B6760; text-decoration: none;
                ">${album.title} →</a>`
              : ""
          }
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 220,
        className: "rvno-popup",
      });

      markers.push(marker);
    });

    // Fit map to markers, or default to Roanoke Valley
    if (markers.length > 0) {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.3));
    } else {
      map.setView([37.27, -79.94], 6); // Roanoke Valley default
    }

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [ready, mappablePhotos, albums]);

  if (mappablePhotos.length === 0) {
    return (
      <div className="max-w-[760px] mx-auto bg-rvno-card rounded-md border border-white/[0.06] p-9 text-center min-h-[360px] flex flex-col items-center justify-center gap-3.5">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-rvno-teal to-rvno-teal-dark flex items-center justify-center text-lg">
          🗺️
        </div>
        <h2 className="font-display text-base text-rvno-ink">
          No Mapped Photos Yet
        </h2>
        <p className="font-body text-xs text-rvno-ink-muted max-w-xs leading-relaxed">
          Photos with GPS coordinates will appear here as pins on the map.
          Upload photos with location data to see them mapped.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[760px] mx-auto">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
      />
      <style>{`
        .rvno-popup .leaflet-popup-content-wrapper {
          border-radius: 6px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }
        .rvno-popup .leaflet-popup-tip {
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
      `}</style>
      <div
        ref={mapRef}
        className="w-full rounded-md overflow-hidden border border-white/[0.06]"
        style={{ height: "500px" }}
      />
      <p className="text-center font-mono text-[9px] text-rvno-ink-dim tracking-wide mt-2">
        {mappablePhotos.length} PHOTO LOCATIONS
      </p>
    </div>
  );
}
