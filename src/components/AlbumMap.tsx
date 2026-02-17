"use client";

import { useState, useCallback, useMemo } from "react";
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from "@react-google-maps/api";
import type { Album, Photo } from "@/lib/database.types";

type PhotoWithAlbum = Photo & { album?: Album };

const mapContainerStyle = {
  width: "100%",
  height: "500px",
  borderRadius: "6px",
};

const defaultCenter = { lat: 37.27, lng: -79.94 }; // Roanoke Valley

export function AlbumMap({
  albums,
  photos,
}: {
  albums: (Album & { photo_count?: number })[];
  photos: PhotoWithAlbum[];
}) {
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoWithAlbum | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "",
  });

  // Filter photos with coordinates
  const mappablePhotos = useMemo(
    () => photos.filter((p) => p.location_lat && p.location_lng),
    [photos]
  );

  // Calculate bounds and center
  const { center, zoom } = useMemo(() => {
    if (mappablePhotos.length === 0) {
      return { center: defaultCenter, zoom: 6 };
    }

    if (mappablePhotos.length === 1) {
      return {
        center: {
          lat: mappablePhotos[0].location_lat!,
          lng: mappablePhotos[0].location_lng!,
        },
        zoom: 10,
      };
    }

    // Calculate bounds
    const lats = mappablePhotos.map((p) => p.location_lat!);
    const lngs = mappablePhotos.map((p) => p.location_lng!);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    return {
      center: {
        lat: (minLat + maxLat) / 2,
        lng: (minLng + maxLng) / 2,
      },
      zoom: 6, // Will be adjusted by fitBounds in onLoad
    };
  }, [mappablePhotos]);

  const onLoad = useCallback(
    (map: google.maps.Map) => {
      if (mappablePhotos.length > 1) {
        const bounds = new google.maps.LatLngBounds();
        mappablePhotos.forEach((photo) => {
          bounds.extend({ lat: photo.location_lat!, lng: photo.location_lng! });
        });
        map.fitBounds(bounds, 50); // 50px padding
      }
    },
    [mappablePhotos]
  );

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (mappablePhotos.length === 0) {
    return (
      <div className="max-w-[760px] mx-auto bg-rvno-card rounded-md border border-rvno-border p-9 text-center min-h-[360px] flex flex-col items-center justify-center gap-3.5">
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
          options={{
            styles: [
              // Vintage/muted map style
              { featureType: "all", elementType: "all", stylers: [{ saturation: -40 }] },
              { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9d9d9" }] },
              { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#e8e4dc" }] },
              { featureType: "road", elementType: "geometry", stylers: [{ color: "#d4d0c8" }] },
              { featureType: "poi", elementType: "geometry", stylers: [{ color: "#dcd8d0" }] },
            ],
          }}
        >
          {mappablePhotos.map((photo) => (
            <MarkerF
              key={photo.id}
              position={{ lat: photo.location_lat!, lng: photo.location_lng! }}
              onClick={() => setSelectedPhoto(photo)}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: "#D4582A",
                fillOpacity: 1,
                strokeColor: "#1A1A1F",
                strokeWeight: 2,
              }}
            />
          ))}

          {selectedPhoto && (
            <InfoWindowF
              position={{
                lat: selectedPhoto.location_lat!,
                lng: selectedPhoto.location_lng!,
              }}
              onCloseClick={() => setSelectedPhoto(null)}
            >
              <div
                style={{
                  fontFamily: "'Source Serif 4', Georgia, serif",
                  minWidth: "160px",
                  maxWidth: "200px",
                }}
              >
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.caption || "Photo"}
                  style={{
                    width: "100%",
                    height: "100px",
                    objectFit: "cover",
                    borderRadius: "4px",
                    marginBottom: "8px",
                  }}
                />
                {selectedPhoto.caption && (
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#1A1A1F",
                      marginBottom: "4px",
                      fontWeight: 500,
                    }}
                  >
                    {selectedPhoto.caption}
                  </div>
                )}
                {selectedPhoto.taken_at && (
                  <div
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: "10px",
                      color: "#1D7A86",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {formatDate(selectedPhoto.taken_at)}
                  </div>
                )}
                {(() => {
                  const album = albums.find((a) => a.id === selectedPhoto.album_id);
                  return album ? (
                    <a
                      href={`/album/${album.id}`}
                      style={{
                        display: "inline-block",
                        marginTop: "6px",
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: "10px",
                        color: "#6B6760",
                        textDecoration: "none",
                      }}
                    >
                      {album.title} →
                    </a>
                  ) : null;
                })()}
              </div>
            </InfoWindowF>
          )}
        </GoogleMap>
      </div>
      <p className="text-center font-mono text-[9px] text-rvno-ink-dim tracking-wide mt-2">
        {mappablePhotos.length} PHOTO LOCATIONS
      </p>
    </div>
  );
}
