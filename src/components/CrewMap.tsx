"use client";

import { useState, useCallback, useMemo } from "react";
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from "@react-google-maps/api";
import type { Member } from "@/lib/database.types";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const mapContainerStyle = {
  width: "100%",
  height: "500px",
  borderRadius: "6px",
};

// Default center: Roanoke Valley
const defaultCenter = { lat: 37.27, lng: -79.94 };

// Faded printed road map style - like an old folded paper atlas
const mapStyles = [
  // Base paper color - aged cream/off-white
  { featureType: "all", elementType: "geometry", stylers: [{ color: "#f5f0e6" }] },
  // Labels - muted brown ink
  { featureType: "all", elementType: "labels.text.fill", stylers: [{ color: "#5c5248" }] },
  { featureType: "all", elementType: "labels.text.stroke", stylers: [{ color: "#f5f0e6" }, { weight: 2 }] },
  { featureType: "all", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  // Land - subtle cream with slight variation
  { featureType: "landscape", elementType: "geometry.fill", stylers: [{ color: "#f0ebe0" }] },
  { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#e8e3d8" }] },
  // Parks and green areas - faded sage green
  { featureType: "poi.park", elementType: "geometry.fill", stylers: [{ color: "#d4dcc4" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#e5e0d5" }] },
  // Roads - subtle gray/brown lines like printed ink
  { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#ffffff" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#c5bfb5" }] },
  { featureType: "road.highway", elementType: "geometry.fill", stylers: [{ color: "#e8dcc8" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#b5a898" }] },
  { featureType: "road.arterial", elementType: "geometry.stroke", stylers: [{ color: "#d5cfc5" }] },
  // Water - muted dusty blue like old atlas printing
  { featureType: "water", elementType: "geometry.fill", stylers: [{ color: "#c4d4dc" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#7a8a92" }] },
  // Administrative boundaries - faint dotted appearance
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#c5bfb5" }, { weight: 0.5 }] },
  // Transit - hide most transit features for cleaner look
  { featureType: "transit", elementType: "all", stylers: [{ visibility: "off" }] },
];

export function CrewMap({ members }: { members: Member[] }) {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Editing state
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editForm, setEditForm] = useState({ name: "", title: "" });
  const [saving, setSaving] = useState(false);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "",
  });

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

  const mappableMembers = useMemo(
    () => members.filter((m) => m.location_lat && m.location_lng),
    [members]
  );

  // Separate crew from other members
  const crewMembers = useMemo(
    () => mappableMembers.filter((m) => m.is_crew),
    [mappableMembers]
  );
  const otherMembers = useMemo(
    () => mappableMembers.filter((m) => !m.is_crew),
    [mappableMembers]
  );

  // Find Mark Finker for centering, fall back to default
  const center = useMemo(() => {
    const mark = members.find(
      (m) => m.name.toLowerCase().includes("mark finker") && m.location_lat && m.location_lng
    );
    if (mark) {
      return { lat: mark.location_lat!, lng: mark.location_lng! };
    }
    return defaultCenter;
  }, [members]);

  const onLoad = useCallback(
    (map: google.maps.Map) => {
      if (mappableMembers.length > 1) {
        const bounds = new google.maps.LatLngBounds();
        mappableMembers.forEach((member) => {
          bounds.extend({ lat: member.location_lat!, lng: member.location_lng! });
        });
        map.fitBounds(bounds, 50);
      }
    },
    [mappableMembers]
  );

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
          zoom={6}
          onLoad={onLoad}
          options={{ styles: mapStyles }}
        >
          {/* Crew members - red markers */}
          {crewMembers.map((member) => (
            <MarkerF
              key={member.id}
              position={{ lat: member.location_lat!, lng: member.location_lng! }}
              onClick={() => setSelectedMember(member)}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: "#C41E3A",
                fillOpacity: 1,
                strokeColor: "#8B0000",
                strokeWeight: 2,
              }}
              label={{
                text: member.name.split(" ").map((n) => n[0]).join("").slice(0, 2),
                color: "#FFFFFF",
                fontSize: "9px",
                fontWeight: "bold",
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            />
          ))}

          {/* Other members - teal markers */}
          {otherMembers.map((member) => (
            <MarkerF
              key={member.id}
              position={{ lat: member.location_lat!, lng: member.location_lng! }}
              onClick={() => setSelectedMember(member)}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: "#4AABB8",
                fillOpacity: 1,
                strokeColor: "#2A7A85",
                strokeWeight: 2,
              }}
              label={{
                text: member.name.split(" ").map((n) => n[0]).join("").slice(0, 2),
                color: "#FFFFFF",
                fontSize: "9px",
                fontWeight: "bold",
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            />
          ))}

          {selectedMember && (
            <InfoWindowF
              position={{
                lat: selectedMember.location_lat!,
                lng: selectedMember.location_lng!,
              }}
              onCloseClick={() => setSelectedMember(null)}
            >
              <div
                style={{
                  fontFamily: "'Atkinson Hyperlegible', system-ui, sans-serif",
                  minWidth: "160px",
                  maxWidth: "220px",
                  background: "#2A2A2E",
                  padding: "10px",
                  borderRadius: "4px",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  {selectedMember.photo_url && (
                    <img
                      src={selectedMember.photo_url}
                      alt={selectedMember.name}
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                        borderRadius: "50%",
                        border: "2px solid #C4853A",
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <div>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "#E8E4DC",
                      }}
                    >
                      {selectedMember.name}
                    </div>
                    {selectedMember.title && (
                      <div
                        style={{
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontSize: "9px",
                          color: "#C4853A",
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                          marginTop: "2px",
                        }}
                      >
                        {selectedMember.title}
                      </div>
                    )}
                  </div>
                </div>

                {(selectedMember.city || selectedMember.state || selectedMember.country) && (
                  <div
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: "10px",
                      color: "#6B6760",
                      marginTop: "8px",
                    }}
                  >
                    {[selectedMember.city, selectedMember.state, selectedMember.country]
                      .filter(Boolean)
                      .join(", ")}
                  </div>
                )}

                {selectedMember.bikes && (
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#4AABB8",
                      marginTop: "6px",
                      fontStyle: "italic",
                    }}
                  >
                    {selectedMember.bikes}
                  </div>
                )}

                {selectedMember.bio && (
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#A09A90",
                      marginTop: "6px",
                      lineHeight: 1.4,
                    }}
                  >
                    {selectedMember.bio}
                  </div>
                )}

                {isAdmin && (
                  <button
                    onClick={() => {
                      setEditingMember(selectedMember);
                      setEditForm({
                        name: selectedMember.name,
                        title: selectedMember.title || "",
                      });
                      setSelectedMember(null);
                    }}
                    style={{
                      marginTop: "8px",
                      padding: "4px 8px",
                      background: "#C4853A",
                      border: "none",
                      borderRadius: "3px",
                      color: "#1C1C1E",
                      fontSize: "10px",
                      fontWeight: 600,
                      cursor: "pointer",
                      width: "100%",
                    }}
                  >
                    Edit
                  </button>
                )}
              </div>
            </InfoWindowF>
          )}
        </GoogleMap>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-3">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#C41E3A] border border-[#8B0000]"></span>
          <span className="font-mono text-[9px] text-rvno-ink-dim tracking-wide">
            THE CREW ({crewMembers.length})
          </span>
        </div>
        {otherMembers.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#4AABB8] border border-[#2A7A85]"></span>
            <span className="font-mono text-[9px] text-rvno-ink-dim tracking-wide">
              MEMBERS ({otherMembers.length})
            </span>
          </div>
        )}
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
