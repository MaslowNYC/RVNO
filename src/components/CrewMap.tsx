"use client";

import { useEffect, useRef, useState } from "react";
import type { Member } from "@/lib/database.types";

let L: typeof import("leaflet") | null = null;

export function CrewMap({ members }: { members: Member[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [ready, setReady] = useState(false);

  const mappableMembers = members.filter(
    (m) => m.location_lat && m.location_lng
  );

  const memberCount = mappableMembers.filter((m) => m.member_type === "member").length;
  const friendCount = mappableMembers.filter((m) => m.member_type === "friend").length;

  useEffect(() => {
    import("leaflet").then((leaflet) => {
      L = leaflet;
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (!ready || !L || !mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
      minZoom: 2,
      maxZoom: 10,
    });

    // OpenStreetMap tiles with vintage/muted CSS filter for that old Rand McNally feel
    const tileLayer = L.tileLayer(
      "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
        className: "vintage-tiles",
      }
    ).addTo(map);

    // Custom member marker - teal for members, copper/orange for friends
    const createMemberIcon = (initials: string, isFriend: boolean) =>
      L!.divIcon({
        className: "rvno-crew-marker",
        html: `<div style="
          width: 28px; height: 28px;
          background: ${isFriend ? "#D4582A" : "#4AABB8"};
          border: 2px solid #1A1A1F;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
          display: flex; align-items: center; justify-content: center;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 9px; font-weight: 600;
          color: #F0ECE4;
          letter-spacing: 0.5px;
        ">${initials}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -16],
      });

    const markers: any[] = [];
    mappableMembers.forEach((member) => {
      if (!L || !member.location_lat || !member.location_lng) return;

      const initials = member.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2);

      const isFriend = member.member_type === "friend";

      const marker = L.marker(
        [member.location_lat, member.location_lng],
        { icon: createMemberIcon(initials, isFriend) }
      ).addTo(map);

      const locationParts = [member.city, member.state, member.country]
        .filter(Boolean)
        .join(", ");

      const popupContent = `
        <div style="
          font-family: 'Source Serif 4', Georgia, serif;
          min-width: 160px; max-width: 200px;
        ">
          ${
            member.photo_url
              ? `<img src="${member.photo_url}" style="
                  width: 50px; height: 50px; object-fit: cover;
                  border-radius: 50%; float: left; margin-right: 10px;
                  border: 2px solid ${isFriend ? "#D4582A" : "#4AABB8"};
                " />`
              : ""
          }
          <div style="font-family: 'Playfair Display', Georgia, serif; font-size: 14px; font-weight: 600; color: #1A1A1F;">
            ${member.name}
          </div>
          ${
            member.title
              ? `<div style="font-family: 'IBM Plex Mono', monospace; font-size: 9px; color: ${isFriend ? "#D4582A" : "#4AABB8"}; text-transform: uppercase; letter-spacing: 1px; margin-top: 1px;">
                  ${member.title}
                </div>`
              : ""
          }
          <div style="font-family: 'IBM Plex Mono', monospace; font-size: 8px; color: ${isFriend ? "#D4582A" : "#4AABB8"}; margin-top: 2px;">
            ${isFriend ? "FRIEND OF RVNO" : "MEMBER"}
          </div>
          <div style="clear: both;"></div>
          ${
            locationParts
              ? `<div style="font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: #6B6760; margin-top: 6px;">
                  📍 ${locationParts}
                </div>`
              : ""
          }
          ${
            member.bikes
              ? `<div style="font-size: 11px; color: #6B6760; margin-top: 4px;">
                  🏍️ ${member.bikes}
                </div>`
              : ""
          }
          ${
            member.bio
              ? `<div style="font-size: 11px; color: #9A958A; margin-top: 6px; line-height: 1.4;">
                  ${member.bio}
                </div>`
              : ""
          }
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 220,
        className: "rvno-crew-popup",
      });

      markers.push(marker);
    });

    // Fit to markers or show world
    if (markers.length > 1) {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.4));
    } else if (markers.length === 1) {
      map.setView(
        [mappableMembers[0].location_lat!, mappableMembers[0].location_lng!],
        5
      );
    } else {
      map.setView([30, -40], 2); // World view
    }

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [ready, mappableMembers]);

  if (mappableMembers.length === 0) {
    return (
      <div className="max-w-[760px] mx-auto bg-rvno-card rounded-md border border-white/[0.06] p-9 text-center min-h-[360px] flex flex-col items-center justify-center gap-3.5">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-rvno-teal to-rvno-teal-dark flex items-center justify-center text-lg">
          👥
        </div>
        <h2 className="font-display text-base text-rvno-ink">
          Members Map Coming Soon
        </h2>
        <p className="font-body text-xs text-rvno-ink-muted max-w-xs leading-relaxed">
          Once member locations are added, you&apos;ll see everyone pinned across
          the globe.
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
        .rvno-crew-popup .leaflet-popup-content-wrapper {
          border-radius: 6px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }
        .vintage-tiles {
          filter: sepia(0.3) saturate(0.8) brightness(0.95);
        }
      `}</style>
      <div
        ref={mapRef}
        className="w-full rounded-md overflow-hidden border border-white/[0.06]"
        style={{ height: "500px" }}
      />
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-3">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rvno-teal border border-rvno-bg"></span>
          <span className="font-mono text-[9px] text-rvno-ink-dim tracking-wide">
            MEMBERS ({memberCount})
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rvno-dot border border-rvno-bg"></span>
          <span className="font-mono text-[9px] text-rvno-ink-dim tracking-wide">
            FRIENDS ({friendCount})
          </span>
        </div>
      </div>
    </div>
  );
}
