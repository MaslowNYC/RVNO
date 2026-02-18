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

    // Stadia Stamen Toner Lite - clean minimal style, perfect for vintage treatment
    const tileLayer = L.tileLayer(
      "https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://stamen.com/">Stamen Design</a> &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
        className: "vintage-atlas",
      }
    ).addTo(map);

    // Custom member marker - red dot like classic road atlas city markers
    const createMemberIcon = (initials: string) =>
      L!.divIcon({
        className: "rvno-crew-marker",
        html: `<div style="
          width: 24px; height: 24px;
          background: #C41E3A;
          border: 2px solid #8B0000;
          border-radius: 50%;
          box-shadow: 0 1px 3px rgba(0,0,0,0.4);
          display: flex; align-items: center; justify-content: center;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 8px; font-weight: 700;
          color: #FFFFFF;
          letter-spacing: 0.5px;
        ">${initials}</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -14],
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
          font-family: Georgia, 'Times New Roman', serif;
          min-width: 160px; max-width: 200px;
          background: #F5F0E1;
          padding: 10px;
          border-radius: 4px;
        ">
          ${
            member.photo_url
              ? `<img src="${member.photo_url}" style="
                  width: 50px; height: 50px; object-fit: cover;
                  border-radius: 50%; float: left; margin-right: 10px;
                  border: 2px solid #8B4513;
                " />`
              : ""
          }
          <div style="font-family: Georgia, 'Times New Roman', serif; font-size: 14px; font-weight: 700; color: #3C2415;">
            ${member.name}
          </div>
          ${
            member.title
              ? `<div style="font-family: 'Courier New', monospace; font-size: 9px; color: #8B4513; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px;">
                  ${member.title}
                </div>`
              : ""
          }
          <div style="clear: both;"></div>
          ${
            locationParts
              ? `<div style="font-family: 'Courier New', monospace; font-size: 10px; color: #5C4033; margin-top: 6px;">
                  ${locationParts}
                </div>`
              : ""
          }
          ${
            member.bikes
              ? `<div style="font-size: 11px; color: #5C4033; margin-top: 4px; font-style: italic;">
                  ${member.bikes}
                </div>`
              : ""
          }
          ${
            member.bio
              ? `<div style="font-size: 11px; color: #5C4033; margin-top: 6px; line-height: 1.4;">
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
                    background: #8B4513;
                    border: none;
                    border-radius: 3px;
                    color: #F5F0E1;
                    font-size: 10px;
                    font-family: Georgia, serif;
                    cursor: pointer;
                    width: 100%;
                  "
                >Edit</button>`
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
          background: #F5F0E1;
          border-radius: 4px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          border: 1px solid #D4C9B0;
        }
        .rvno-crew-popup .leaflet-popup-tip {
          background: #F5F0E1;
          border-left: 1px solid #D4C9B0;
          border-bottom: 1px solid #D4C9B0;
        }
        .rvno-crew-popup .leaflet-popup-content {
          margin: 0;
        }
        .vintage-atlas {
          filter: sepia(0.35) saturate(0.8) brightness(1.05) contrast(0.95);
        }
        .leaflet-container {
          background: #F5F0E1 !important;
        }
        .leaflet-control-zoom a {
          background: #F5F0E1 !important;
          color: #5C4033 !important;
          border-color: #D4C9B0 !important;
        }
        .leaflet-control-zoom a:hover {
          background: #EBE4D3 !important;
        }
        .leaflet-control-attribution {
          background: rgba(245, 240, 225, 0.9) !important;
          color: #8B7355 !important;
          font-size: 9px !important;
        }
        .leaflet-control-attribution a {
          color: #5C4033 !important;
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
          <span className="w-3 h-3 rounded-full bg-[#C41E3A] border border-[#8B0000]"></span>
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
