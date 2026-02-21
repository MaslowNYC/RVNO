"use client";

import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { EditButton } from "@/components/EditButton";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import type { Member } from "@/lib/database.types";
import { geocodeLocation } from "@/lib/geocode";

interface MembersContentProps {
  initialMembers: Member[];
}

export function MembersContent({ initialMembers }: MembersContentProps) {
  const { isAdmin } = useAuth();
  const router = useRouter();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Member>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMember, setNewMember] = useState<Partial<Member>>({
    name: "",
    title: "",
    bio: "",
    bikes: "",
    photo_url: "",
    city: "",
    state: "",
    country: "",
  });

  async function uploadPhoto(
    file: File,
    memberId?: string
  ): Promise<string | null> {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const fileName = `${memberId || "new"}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("member-photos")
      .upload(fileName, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      setUploading(false);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from("member-photos")
      .getPublicUrl(fileName);

    setUploading(false);
    return urlData.publicUrl;
  }

  async function handleEditPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editForm.id) return;

    const url = await uploadPhoto(file, editForm.id);
    if (url) {
      setEditForm({ ...editForm, photo_url: url });
      // Save immediately so photo persists
      await supabase
        .from("members")
        .update({ photo_url: url })
        .eq("id", editForm.id);
    }
  }

  async function handleNewPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadPhoto(file);
    if (url) {
      setNewMember({ ...newMember, photo_url: url });
    }
  }

  function startEdit(member: Member) {
    setEditingId(member.id);
    setEditForm({ ...member });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
  }

  async function saveMember() {
    if (!editForm.id) return;
    setSaving(true);

    // Geocode the location
    const coords = await geocodeLocation(
      editForm.city,
      editForm.state,
      editForm.country
    );

    await supabase
      .from("members")
      .update({
        name: editForm.name,
        title: editForm.title || null,
        bio: editForm.bio || null,
        bikes: editForm.bikes || null,
        city: editForm.city || null,
        state: editForm.state || null,
        country: editForm.country || null,
        location_lat: coords?.lat ?? null,
        location_lng: coords?.lng ?? null,
      })
      .eq("id", editForm.id);
    setSaving(false);
    setEditingId(null);
    router.refresh();
  }

  async function deleteMember(id: string) {
    if (!confirm("Delete this member?")) return;
    await supabase.from("members").delete().eq("id", id);
    router.refresh();
  }

  async function moveMember(memberId: string, direction: "up" | "down") {
    const currentIndex = initialMembers.findIndex((m) => m.id === memberId);
    if (currentIndex === -1) return;

    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= initialMembers.length) return;

    const currentMember = initialMembers[currentIndex];
    const targetMember = initialMembers[targetIndex];

    // Swap sort_order values
    await Promise.all([
      supabase
        .from("members")
        .update({ sort_order: targetMember.sort_order })
        .eq("id", currentMember.id),
      supabase
        .from("members")
        .update({ sort_order: currentMember.sort_order })
        .eq("id", targetMember.id),
    ]);

    router.refresh();
  }

  async function addMember() {
    if (!newMember.name) return;
    setSaving(true);

    // Geocode the location
    const coords = await geocodeLocation(
      newMember.city,
      newMember.state,
      newMember.country
    );

    await supabase.from("members").insert({
      name: newMember.name,
      title: newMember.title || null,
      bio: newMember.bio || null,
      bikes: newMember.bikes || null,
      photo_url: newMember.photo_url || null,
      city: newMember.city || null,
      state: newMember.state || null,
      country: newMember.country || null,
      location_lat: coords?.lat ?? null,
      location_lng: coords?.lng ?? null,
      sort_order: initialMembers.length,
      is_crew: true,
    });
    setSaving(false);
    setShowAddForm(false);
    setNewMember({
      name: "",
      title: "",
      bio: "",
      bikes: "",
      photo_url: "",
      city: "",
      state: "",
      country: "",
    });
    router.refresh();
  }

  function getLocationDisplay(member: Partial<Member>) {
    const parts = [member.city, member.state, member.country].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : null;
  }

  return (
    <div className="max-w-4xl mx-auto px-5 py-12">
      <header className="mb-10 text-center">
        <h1 className="font-display text-3xl font-bold text-rvno-ink mb-2">
          The Usual Suspects
        </h1>
        <p className="font-body text-base text-rvno-ink-muted italic">
          The people behind the Nortons
        </p>
      </header>

      {initialMembers.length === 0 && !showAddForm ? (
        <div className="text-center">
          <p className="font-body text-base text-rvno-ink-dim mb-4">
            Member profiles coming soon. We&apos;re still finding our good sides.
          </p>
          {isAdmin && (
            <button
              onClick={() => setShowAddForm(true)}
              className="font-body text-base text-[#C4853A] hover:text-[#B37832] transition-colors"
            >
              + Add the first member
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {initialMembers.map((member) => (
            <div key={member.id} className="relative group">
              {editingId === member.id ? (
                <div className="bg-rvno-card rounded-lg border-2 border-[#C4853A]/30 p-5 ring-1 ring-[#C4853A]/30">
                  <div className="space-y-3">
                    {/* Photo upload */}
                    <div className="flex items-center gap-4 mb-2">
                      <label className="cursor-pointer group">
                        <div className="w-20 h-20 rounded-full bg-rvno-surface flex items-center justify-center overflow-hidden border-2 border-dashed border-rvno-border group-hover:border-[#C4853A]/50 transition-colors">
                          {uploading ? (
                            <span className="font-mono text-xs text-rvno-ink-dim">...</span>
                          ) : editForm.photo_url ? (
                            <img
                              src={editForm.photo_url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="font-mono text-xs text-rvno-ink-dim text-center px-1">
                              + Photo
                            </span>
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleEditPhotoChange}
                          className="hidden"
                          disabled={uploading}
                        />
                      </label>
                      <p className="font-body text-xs text-rvno-ink-dim">
                        Click to upload a photo
                      </p>
                    </div>
                    <input
                      type="text"
                      value={editForm.name || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      placeholder="Name"
                      className="w-full bg-rvno-elevated border border-rvno-border rounded-lg px-4 py-3 font-display text-lg font-semibold text-rvno-ink focus:outline-none focus:border-[#C4853A]/50"
                    />
                    <input
                      type="text"
                      value={editForm.title || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, title: e.target.value })
                      }
                      placeholder="Title (e.g., Founder, Treasurer)"
                      className="w-full bg-rvno-elevated border border-rvno-border rounded-lg px-4 py-3 font-body text-base text-rvno-ink focus:outline-none focus:border-[#C4853A]/50"
                    />
                    <textarea
                      value={editForm.bio || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, bio: e.target.value })
                      }
                      placeholder="Bio"
                      rows={3}
                      className="w-full bg-rvno-elevated border border-rvno-border rounded-lg px-4 py-3 font-body text-base text-rvno-ink focus:outline-none focus:border-[#C4853A]/50 resize-none"
                    />
                    <input
                      type="text"
                      value={editForm.bikes || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, bikes: e.target.value })
                      }
                      placeholder="Bikes"
                      className="w-full bg-rvno-elevated border border-rvno-border rounded-lg px-4 py-3 font-body text-base text-rvno-ink focus:outline-none focus:border-[#C4853A]/50"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={editForm.city || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, city: e.target.value })
                        }
                        placeholder="City"
                        className="w-full bg-rvno-elevated border border-rvno-border rounded-lg px-3 py-2 font-body text-sm text-rvno-ink focus:outline-none focus:border-[#C4853A]/50"
                      />
                      <input
                        type="text"
                        value={editForm.state || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, state: e.target.value })
                        }
                        placeholder="State"
                        className="w-full bg-rvno-elevated border border-rvno-border rounded-lg px-3 py-2 font-body text-sm text-rvno-ink focus:outline-none focus:border-[#C4853A]/50"
                      />
                      <input
                        type="text"
                        value={editForm.country || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, country: e.target.value })
                        }
                        placeholder="Country"
                        className="w-full bg-rvno-elevated border border-rvno-border rounded-lg px-3 py-2 font-body text-sm text-rvno-ink focus:outline-none focus:border-[#C4853A]/50"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between mt-4">
                    <button
                      onClick={() => deleteMember(member.id)}
                      className="font-body text-sm text-red-400 hover:text-red-300 transition-colors"
                    >
                      Delete
                    </button>
                    <div className="flex gap-3">
                      <button
                        onClick={cancelEdit}
                        disabled={saving}
                        className="font-body text-sm text-rvno-ink-dim hover:text-rvno-ink transition-colors px-4 py-2 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveMember}
                        disabled={saving}
                        className="bg-[#C4853A] hover:bg-[#B37832] text-white font-body text-sm font-semibold px-4 py-2 rounded-lg min-h-[44px] transition-colors disabled:opacity-50"
                      >
                        {saving ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-rvno-card rounded-lg border-2 border-rvno-border p-5 flex gap-4 items-start">
                  <div className="w-16 h-16 rounded-full bg-rvno-surface flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {member.photo_url ? (
                      <img
                        src={member.photo_url}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="font-display text-lg text-rvno-ink-dim">
                        {member.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-lg font-semibold text-rvno-ink">
                      {member.name}
                    </h3>
                    {member.title && (
                      <p className="font-mono text-sm text-rvno-teal tracking-wide uppercase mt-0.5 font-medium">
                        {member.title}
                      </p>
                    )}
                    {member.bio && (
                      <p className="font-body text-base text-rvno-ink-muted mt-2 leading-relaxed">
                        {member.bio}
                      </p>
                    )}
                    {member.bikes && (
                      <p className="font-body text-sm text-rvno-ink-dim mt-2">
                        🏍️ {member.bikes}
                      </p>
                    )}
                    {getLocationDisplay(member) && (
                      <p className="font-body text-sm text-rvno-ink-dim mt-1">
                        📍 {getLocationDisplay(member)}
                      </p>
                    )}
                  </div>

                  {isAdmin && (
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <div className="flex flex-col">
                        <button
                          onClick={() => moveMember(member.id, "up")}
                          disabled={
                            initialMembers.findIndex((m) => m.id === member.id) === 0
                          }
                          className="p-1 text-rvno-ink-dim hover:text-rvno-ink disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Move up"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="18 15 12 9 6 15" />
                          </svg>
                        </button>
                        <button
                          onClick={() => moveMember(member.id, "down")}
                          disabled={
                            initialMembers.findIndex((m) => m.id === member.id) ===
                            initialMembers.length - 1
                          }
                          className="p-1 text-rvno-ink-dim hover:text-rvno-ink disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Move down"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </button>
                      </div>
                      <EditButton onClick={() => startEdit(member)} />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {isAdmin && !showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-rvno-card rounded-lg border-2 border-dashed border-rvno-border p-5 text-center font-body text-base text-rvno-ink-dim hover:text-rvno-ink hover:border-[#C4853A]/50 transition-colors min-h-[120px] flex items-center justify-center"
            >
              + Add Member
            </button>
          )}

          {showAddForm && (
            <div className="bg-rvno-card rounded-lg border-2 border-[#C4853A]/30 p-5 ring-1 ring-[#C4853A]/30 sm:col-span-2">
              <h3 className="font-display text-lg font-semibold text-rvno-ink mb-4">
                New Member
              </h3>
              {/* Photo upload */}
              <div className="flex items-center gap-4 mb-4">
                <label className="cursor-pointer group">
                  <div className="w-20 h-20 rounded-full bg-rvno-surface flex items-center justify-center overflow-hidden border-2 border-dashed border-rvno-border group-hover:border-[#C4853A]/50 transition-colors">
                    {uploading ? (
                      <span className="font-mono text-xs text-rvno-ink-dim">...</span>
                    ) : newMember.photo_url ? (
                      <img
                        src={newMember.photo_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="font-mono text-xs text-rvno-ink-dim text-center px-1">
                        + Photo
                      </span>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleNewPhotoChange}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
                <p className="font-body text-xs text-rvno-ink-dim">
                  Click to upload a photo (optional)
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newMember.name || ""}
                    onChange={(e) =>
                      setNewMember({ ...newMember, name: e.target.value })
                    }
                    placeholder="Name *"
                    className="w-full bg-rvno-elevated border border-rvno-border rounded-lg px-4 py-3 font-display text-lg font-semibold text-rvno-ink focus:outline-none focus:border-[#C4853A]/50"
                  />
                  <input
                    type="text"
                    value={newMember.title || ""}
                    onChange={(e) =>
                      setNewMember({ ...newMember, title: e.target.value })
                    }
                    placeholder="Title (e.g., Founder, Treasurer)"
                    className="w-full bg-rvno-elevated border border-rvno-border rounded-lg px-4 py-3 font-body text-base text-rvno-ink focus:outline-none focus:border-[#C4853A]/50"
                  />
                  <input
                    type="text"
                    value={newMember.bikes || ""}
                    onChange={(e) =>
                      setNewMember({ ...newMember, bikes: e.target.value })
                    }
                    placeholder="Bikes"
                    className="w-full bg-rvno-elevated border border-rvno-border rounded-lg px-4 py-3 font-body text-base text-rvno-ink focus:outline-none focus:border-[#C4853A]/50"
                  />
                </div>
                <div className="space-y-3">
                  <textarea
                    value={newMember.bio || ""}
                    onChange={(e) =>
                      setNewMember({ ...newMember, bio: e.target.value })
                    }
                    placeholder="Bio"
                    rows={3}
                    className="w-full bg-rvno-elevated border border-rvno-border rounded-lg px-4 py-3 font-body text-base text-rvno-ink focus:outline-none focus:border-[#C4853A]/50 resize-none"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={newMember.city || ""}
                      onChange={(e) =>
                        setNewMember({ ...newMember, city: e.target.value })
                      }
                      placeholder="City"
                      className="w-full bg-rvno-elevated border border-rvno-border rounded-lg px-3 py-2 font-body text-sm text-rvno-ink focus:outline-none focus:border-[#C4853A]/50"
                    />
                    <input
                      type="text"
                      value={newMember.state || ""}
                      onChange={(e) =>
                        setNewMember({ ...newMember, state: e.target.value })
                      }
                      placeholder="State"
                      className="w-full bg-rvno-elevated border border-rvno-border rounded-lg px-3 py-2 font-body text-sm text-rvno-ink focus:outline-none focus:border-[#C4853A]/50"
                    />
                    <input
                      type="text"
                      value={newMember.country || ""}
                      onChange={(e) =>
                        setNewMember({ ...newMember, country: e.target.value })
                      }
                      placeholder="Country"
                      className="w-full bg-rvno-elevated border border-rvno-border rounded-lg px-3 py-2 font-body text-sm text-rvno-ink focus:outline-none focus:border-[#C4853A]/50"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setShowAddForm(false)}
                  disabled={saving}
                  className="font-body text-sm text-rvno-ink-dim hover:text-rvno-ink transition-colors px-4 py-2 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={addMember}
                  disabled={saving || !newMember.name}
                  className="bg-[#C4853A] hover:bg-[#B37832] text-white font-body text-sm font-semibold px-4 py-2 rounded-lg min-h-[44px] transition-colors disabled:opacity-50"
                >
                  {saving ? "Adding..." : "Add Member"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
