"use client";

import { useState, useCallback, useMemo } from "react";
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from "@react-google-maps/api";
import type { Album, Photo } from "@/lib/database.types";
import Link from "next/link";

type AlbumWithPhotos = Album & {
  photo_count?: number;
  photos?: Photo[];
};

const mapContainerStyle = {
  width: "100%",
  height: "500px",
  borderRadius: "6px",
};

const defaultCenter = { lat: 37.27, lng: -79.94 }; // Roanoke Valley

// Dark workshop map style
const mapStyles = [
  { elementType: "geometry", stylers: [{ color: "#2A2A2E" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1C1C1E" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#6B6760" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#3A3A3E" }] },
  { featureType: "administrative.land_parcel", elementType: "labels.text.fill", stylers: [{ color: "#6B6760" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#323236" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#6B6760" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#2A3A2E" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#3A3A3E" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#2A2A2E" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#4A4A4E" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#3A3A3E" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#323236" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#1C2428" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#4AABB8" }] },
];

export function AlbumMap({
  albums,
  photos,
}: {
  albums: (Album & { photo_count?: number })[];
  photos: Photo[];
}) {
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumWithPhotos | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "",
  });

  // Build albums with location data
  // Priority: 1) Album's own location, 2) First photo with location in album
  const mappableAlbums = useMemo(() => {
    const albumsWithLocation: AlbumWithPhotos[] = [];

    for (const album of albums) {
      const albumPhotos = photos.filter((p) => p.album_id === album.id);

      // Check if album has its own location
      if (album.location_lat && album.location_lng) {
        albumsWithLocation.push({
          ...album,
          photos: albumPhotos,
        });
      } else {
        // Fall back to first photo with location
        const photoWithLocation = albumPhotos.find(
          (p) => p.location_lat && p.location_lng
        );
        if (photoWithLocation) {
          albumsWithLocation.push({
            ...album,
            location_lat: photoWithLocation.location_lat,
            location_lng: photoWithLocation.location_lng,
            photos: albumPhotos,
          });
        }
      }
    }

    return albumsWithLocation;
  }, [albums, photos]);

  // Calculate center based on albums
  const { center, zoom } = useMemo(() => {
    if (mappableAlbums.length === 0) {
      return { center: defaultCenter, zoom: 6 };
    }

    if (mappableAlbums.length === 1) {
      return {
        center: {
          lat: mappableAlbums[0].location_lat!,
          lng: mappableAlbums[0].location_lng!,
        },
        zoom: 10,
      };
    }

    const lats = mappableAlbums.map((a) => a.location_lat!);
    const lngs = mappableAlbums.map((a) => a.location_lng!);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    return {
      center: {
        lat: (minLat + maxLat) / 2,
        lng: (minLng + maxLng) / 2,
      },
      zoom: 6,
    };
  }, [mappableAlbums]);

  const onLoad = useCallback(
    (map: google.maps.Map) => {
      if (mappableAlbums.length > 1) {
        const bounds = new google.maps.LatLngBounds();
        mappableAlbums.forEach((album) => {
          bounds.extend({ lat: album.location_lat!, lng: album.location_lng! });
        });
        map.fitBounds(bounds, 50);
      }
    },
    [mappableAlbums]
  );

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (mappableAlbums.length === 0) {
    return (
      <div className="max-w-[760px] mx-auto bg-rvno-card rounded-md border border-rvno-border p-9 text-center min-h-[360px] flex flex-col items-center justify-center gap-3.5">
        <h2 className="font-display text-lg text-rvno-ink">
          The Map Awaits
        </h2>
        <p className="font-mono text-sm text-rvno-ink-muted max-w-xs leading-relaxed">
          No albums with locations yet. Apparently we&apos;ve been too busy
          riding to remember where we&apos;ve been.
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-[760px] mx-auto bg-rvno-card rounded-md border border-rvno-border p-9 text-center">
        <p className="text-rvno-ink-muted">Error loading map</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="max-w-[760px] mx-auto bg-rvno-card rounded-md border border-rvno-border p-9 text-center min-h-[500px] flex items-center justify-center">
        <p className="text-rvno-ink-muted">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[760px] mx-auto">
      <div className="rounded-md overflow-hidden border border-rvno-border">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={zoom}
          onLoad={onLoad}
          options={{ styles: mapStyles }}
        >
          {mappableAlbums.map((album) => (
            <MarkerF
              key={album.id}
              position={{ lat: album.location_lat!, lng: album.location_lng! }}
              onClick={() => setSelectedAlbum(album)}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 12,
                fillColor: "#C4853A",
                fillOpacity: 1,
                strokeColor: "#2A2A2E",
                strokeWeight: 2,
              }}
              label={
                album.photo_count && album.photo_count > 0
                  ? {
                      text: String(album.photo_count),
                      color: "#1C1C1E",
                      fontSize: "10px",
                      fontWeight: "bold",
                      fontFamily: "'IBM Plex Mono', monospace",
                    }
                  : undefined
              }
            />
          ))}

          {selectedAlbum && (
            <InfoWindowF
              position={{
                lat: selectedAlbum.location_lat!,
                lng: selectedAlbum.location_lng!,
              }}
              onCloseClick={() => setSelectedAlbum(null)}
            >
              <div
                style={{
                  fontFamily: "'Atkinson Hyperlegible', system-ui, sans-serif",
                  minWidth: "180px",
                  maxWidth: "240px",
                  background: "#2A2A2E",
                  padding: "10px",
                  borderRadius: "4px",
                }}
              >
                {selectedAlbum.cover_photo_url && (
                  <img
                    src={selectedAlbum.cover_photo_url}
                    alt={selectedAlbum.title}
                    style={{
                      width: "100%",
                      height: "120px",
                      objectFit: "cover",
                      borderRadius: "4px",
                      marginBottom: "10px",
                    }}
                  />
                )}

                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#E8E4DC",
                    marginBottom: "4px",
                  }}
                >
                  {selectedAlbum.title}
                </div>

                {selectedAlbum.location_name && (
                  <div
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: "10px",
                      color: "#6B6760",
                      marginBottom: "4px",
                    }}
                  >
                    {selectedAlbum.location_name}
                  </div>
                )}

                <div
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: "10px",
                    color: "#4AABB8",
                    letterSpacing: "0.5px",
                  }}
                >
                  {formatDate(selectedAlbum.event_date)}
                  {selectedAlbum.photo_count && selectedAlbum.photo_count > 0 && (
                    <span style={{ color: "#6B6760", marginLeft: "8px" }}>
                      {selectedAlbum.photo_count} photos
                    </span>
                  )}
                </div>

                {selectedAlbum.description && (
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#A09A90",
                      marginTop: "8px",
                      lineHeight: 1.4,
                    }}
                  >
                    {selectedAlbum.description}
                  </div>
                )}

                <Link
                  href={`/album/${selectedAlbum.id}`}
                  style={{
                    display: "block",
                    marginTop: "10px",
                    padding: "6px 10px",
                    background: "#C4853A",
                    borderRadius: "4px",
                    color: "#1C1C1E",
                    fontSize: "11px",
                    fontWeight: 600,
                    textAlign: "center",
                    textDecoration: "none",
                  }}
                >
                  View Album →
                </Link>
              </div>
            </InfoWindowF>
          )}
        </GoogleMap>
      </div>

      <p className="text-center font-mono text-[9px] text-rvno-ink-dim tracking-wide mt-2">
        {mappableAlbums.length} ALBUM{mappableAlbums.length !== 1 ? "S" : ""} ON THE MAP
      </p>
    </div>
  );
}
