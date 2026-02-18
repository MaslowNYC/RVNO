"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { Member } from "@/lib/database.types";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

let L: typeof import("leaflet") | null = null;

export function CrewMap({ members }: { members: Member[] }) {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [ready, setReady] = useState(false);

  // Editing state
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editForm, setEditForm] = useState({ name: "", title: "" });
  const [saving, setSaving] = useState(false);

  const saveMemberDetails = useCallback(async () => {
    if (!editingMember) return;
    setSaving(true);
    await supabase
      .from("members")
      .update({ name: editForm.name, title: editForm.title || null })
      .eq("id", editingMember.id);
    setSaving(false);
    setEditingMember(null);
    router.refresh();
  }, [editingMember, editForm, router]);

  // Global click handler for edit buttons in popups
  useEffect(() => {
    if (!isAdmin) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains("edit-member-btn")) {
        const memberId = target.dataset.memberId;
        const member = members.find((m) => m.id === memberId);
        if (member) {
          setEditingMember(member);
          setEditForm({ name: member.name, title: member.title || "" });
        }
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [isAdmin, members]);

  const mappableMembers = members.filter(
    (m) => m.location_lat && m.location_lng
  );

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

    // Custom member marker - teal color
    const createMemberIcon = (initials: string) =>
      L!.divIcon({
        className: "rvno-crew-marker",
        html: `<div style="
          width: 28px; height: 28px;
          background: #4AABB8;
          border: 2px solid #1C1C1E;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.5);
          display: flex; align-items: center; justify-content: center;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 9px; font-weight: 600;
          color: #E8E4DC;
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

      const marker = L.marker(
        [member.location_lat, member.location_lng],
        { icon: createMemberIcon(initials) }
      ).addTo(map);

      const locationParts = [member.city, member.state, member.country]
        .filter(Boolean)
        .join(", ");

      const popupContent = `
        <div style="
          font-family: 'Atkinson Hyperlegible', system-ui, sans-serif;
          min-width: 160px; max-width: 200px;
          background: #2A2A2E;
          padding: 10px;
          border-radius: 6px;
        ">
          ${
            member.photo_url
              ? `<img src="${member.photo_url}" style="
                  width: 50px; height: 50px; object-fit: cover;
                  border-radius: 50%; float: left; margin-right: 10px;
                  border: 2px solid #4AABB8;
                " />`
              : ""
          }
          <div style="font-family: 'Playfair Display', Georgia, serif; font-size: 14px; font-weight: 600; color: #E8E4DC;">
            ${member.name}
          </div>
          ${
            member.title
              ? `<div style="font-family: 'IBM Plex Mono', monospace; font-size: 9px; color: #4AABB8; text-transform: uppercase; letter-spacing: 1px; margin-top: 1px;">
                  ${member.title}
                </div>`
              : ""
          }
          <div style="clear: both;"></div>
          ${
            locationParts
              ? `<div style="font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: #9A958A; margin-top: 6px;">
                  📍 ${locationParts}
                </div>`
              : ""
          }
          ${
            member.bikes
              ? `<div style="font-size: 11px; color: #9A958A; margin-top: 4px;">
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
          ${
            isAdmin
              ? `<button
                  class="edit-member-btn"
                  data-member-id="${member.id}"
                  style="
                    margin-top: 8px;
                    padding: 4px 8px;
                    background: transparent;
                    border: 1px solid #C4853A;
                    border-radius: 4px;
                    color: #C4853A;
                    font-size: 10px;
                    font-family: 'Atkinson Hyperlegible', system-ui, sans-serif;
                    cursor: pointer;
                    width: 100%;
                  "
                >Edit name & title</button>`
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
      <div className="max-w-[760px] mx-auto bg-rvno-card rounded-md border border-rvno-border p-9 text-center min-h-[360px] flex flex-col items-center justify-center gap-3.5">
        <h2 className="font-display text-lg text-rvno-ink">
          Location Unknown
        </h2>
        <p className="font-mono text-sm text-rvno-ink-muted max-w-xs leading-relaxed">
          No member locations yet. We know they exist — we see them at meetups.
          They just haven&apos;t told us where they live.
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
          background: #2A2A2E;
          border-radius: 6px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        }
        .rvno-crew-popup .leaflet-popup-tip {
          background: #2A2A2E;
        }
        .rvno-crew-popup .leaflet-popup-content {
          margin: 0;
        }
        .vintage-tiles {
          filter: brightness(0.7) saturate(0.6) contrast(1.1);
        }
        .leaflet-control-zoom a {
          background: #2A2A2E !important;
          color: #E8E4DC !important;
          border-color: #3A3A3E !important;
        }
        .leaflet-control-zoom a:hover {
          background: #3A3A3E !important;
        }
        .leaflet-control-attribution {
          background: rgba(28, 28, 30, 0.8) !important;
          color: #6B6760 !important;
        }
        .leaflet-control-attribution a {
          color: #4AABB8 !important;
        }
      `}</style>
      <div
        ref={mapRef}
        className="w-full rounded-md overflow-hidden border border-rvno-border"
        style={{ height: "500px" }}
      />
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-3">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rvno-teal border border-rvno-bg"></span>
          <span className="font-mono text-[9px] text-rvno-ink-dim tracking-wide">
            MEMBERS ({mappableMembers.length})
          </span>
        </div>
      </div>

      {/* Edit member modal */}
      {editingMember && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
          <div className="bg-rvno-card rounded-lg border border-rvno-border shadow-xl p-5 w-80 max-w-[90vw]">
            <h3 className="font-display text-lg font-semibold text-rvno-ink mb-4">
              Edit Member
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Name"
                className="w-full bg-rvno-elevated border border-rvno-border rounded-lg px-3 py-2 font-body text-sm text-rvno-ink focus:outline-none focus:border-[#C4853A]/50"
              />
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                placeholder="Title (optional)"
                className="w-full bg-rvno-elevated border border-rvno-border rounded-lg px-3 py-2 font-body text-sm text-rvno-ink focus:outline-none focus:border-[#C4853A]/50"
              />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setEditingMember(null)}
                disabled={saving}
                className="font-body text-sm text-rvno-ink-dim hover:text-rvno-ink transition-colors px-3 py-2 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={saveMemberDetails}
                disabled={saving || !editForm.name}
                className="bg-[#C4853A] hover:bg-[#B37832] text-white font-body text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
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
