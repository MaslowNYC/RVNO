"use client";

import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { EditButton } from "@/components/EditButton";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import type { Resource, ResourceInsert } from "@/lib/database.types";

interface ResourcesContentProps {
  initialResources: Resource[];
}

const DEFAULT_RESOURCES: Resource[] = [
  {
    id: "default-1",
    section: "Norton Community & Resources",
    name: "International Norton Owners Association (INOA)",
    url: "https://www.inoanorton.com/",
    description:
      "The premier worldwide organization for Norton enthusiasts. Excellent magazine, technical library, and events.",
    sort_order: 0,
    created_at: "",
  },
  {
    id: "default-2",
    section: "Norton Community & Resources",
    name: "Norton Owners Club",
    url: "https://www.nortonownersclub.org/",
    description:
      "UK-based Norton owners club with sections worldwide. Great technical resources and forum.",
    sort_order: 1,
    created_at: "",
  },
  {
    id: "default-3",
    section: "Norton Community & Resources",
    name: "Access Norton Forum",
    url: "https://www.accessnorton.com/",
    description:
      "Active online community with extensive technical discussions, restoration advice, and Norton knowledge.",
    sort_order: 2,
    created_at: "",
  },
  {
    id: "default-4",
    section: "Parts & Service",
    name: "Andover Norton",
    url: "https://www.andover-norton.co.uk/",
    description:
      "Official parts supplier for Norton motorcycles. Comprehensive catalog of genuine and replacement parts.",
    sort_order: 3,
    created_at: "",
  },
  {
    id: "default-5",
    section: "Parts & Service",
    name: "Old Britts",
    url: "https://www.oldbritts.com/",
    description:
      "Specialist in Norton Commando parts and upgrades. Known for quality parts and technical expertise.",
    sort_order: 4,
    created_at: "",
  },
  {
    id: "default-6",
    section: "Parts & Service",
    name: "RGM Motors",
    url: "https://www.rgmmotors.co.uk/",
    description:
      "UK supplier of Norton parts and engine components. Good source for hard-to-find items.",
    sort_order: 5,
    created_at: "",
  },
  {
    id: "default-7",
    section: "Riding & Local Information",
    name: "Blue Ridge Parkway",
    url: "https://www.nps.gov/blri/",
    description:
      "Official site for America's favorite drive — 469 miles of scenic mountain roads. Our backyard playground.",
    sort_order: 6,
    created_at: "",
  },
  {
    id: "default-8",
    section: "Riding & Local Information",
    name: "Virginia Scenic Byways",
    url: "https://www.virginiadot.org/programs/faq-byways.asp",
    description:
      "Guide to Virginia's most beautiful roads. Plenty of Norton-friendly routes to explore.",
    sort_order: 7,
    created_at: "",
  },
  {
    id: "default-9",
    section: "Riding & Local Information",
    name: "Roanoke Valley Visitor Information",
    url: "https://www.visitroanokeva.com/",
    description:
      "Local attractions, dining, and lodging information for visitors to the Roanoke Valley area.",
    sort_order: 8,
    created_at: "",
  },
];

const SECTION_ORDER = [
  "Norton Community & Resources",
  "Parts & Service",
  "Riding & Local Information",
];

export function ResourcesContent({ initialResources }: ResourcesContentProps) {
  const { isAdmin } = useAuth();
  const router = useRouter();

  const resources =
    initialResources.length > 0 ? initialResources : DEFAULT_RESOURCES;

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Resource>>({});
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newResource, setNewResource] = useState<Partial<Resource>>({
    section: SECTION_ORDER[0],
    name: "",
    url: "",
    description: "",
  });

  const groupedResources = SECTION_ORDER.map((section) => ({
    title: section,
    links: resources.filter((r) => r.section === section),
  }));

  function startEdit(resource: Resource) {
    setEditingId(resource.id);
    setEditForm({ ...resource });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
  }

  async function saveResource() {
    if (!editForm.id) return;
    setSaving(true);

    // If editing a default item, insert it as a new entry
    if (editForm.id.startsWith("default-")) {
      const insertData: ResourceInsert = {
        section: editForm.section!,
        name: editForm.name!,
        url: editForm.url!,
        description: editForm.description || null,
        sort_order: editForm.sort_order ?? 0,
      };
      await supabase.from("resources").insert(insertData);
    } else {
      await supabase
        .from("resources")
        .update({
          section: editForm.section,
          name: editForm.name,
          url: editForm.url,
          description: editForm.description,
        })
        .eq("id", editForm.id);
    }
    setSaving(false);
    setEditingId(null);
    router.refresh();
  }

  async function deleteResource(id: string) {
    if (!confirm("Delete this resource?")) return;
    await supabase.from("resources").delete().eq("id", id);
    router.refresh();
  }

  async function addResource() {
    if (!newResource.name || !newResource.url || !newResource.section) return;
    setSaving(true);
    await supabase.from("resources").insert({
      section: newResource.section,
      name: newResource.name,
      url: newResource.url,
      description: newResource.description || null,
      sort_order: resources.length,
    });
    setSaving(false);
    setShowAddForm(false);
    setNewResource({
      section: SECTION_ORDER[0],
      name: "",
      url: "",
      description: "",
    });
    router.refresh();
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <header className="mb-10">
        <h1 className="font-display text-3xl font-bold text-rvno-ink mb-2">
          Norton Stuff
        </h1>
        <p className="font-body text-base text-rvno-ink-muted italic">
          Helpful resources we&apos;ve gathered over the years — parts,
          knowledge, and places to ride
        </p>
      </header>

      <div className="space-y-8">
        {groupedResources.map((section) => (
          <section key={section.title}>
            <h2 className="font-display text-xl font-semibold text-rvno-ink mb-3">
              {section.title}
            </h2>
            <div className="space-y-2">
              {section.links.map((link) => (
                <div key={link.id} className="relative group">
                  {editingId === link.id ? (
                    <div className="bg-rvno-card rounded-lg border-2 border-[#C4853A]/30 p-4 ring-1 ring-[#C4853A]/30">
                      <div className="space-y-3">
                        <select
                          value={editForm.section || ""}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              section: e.target.value,
                            })
                          }
                          className="w-full bg-rvno-elevated border border-rvno-border rounded-lg px-4 py-3 font-body text-base text-rvno-ink focus:outline-none focus:border-[#C4853A]/50"
                        >
                          {SECTION_ORDER.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={editForm.name || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, name: e.target.value })
                          }
                          placeholder="Resource name"
                          className="w-full bg-rvno-elevated border border-rvno-border rounded-lg px-4 py-3 font-display text-base font-semibold text-rvno-ink focus:outline-none focus:border-[#C4853A]/50"
                        />
                        <input
                          type="url"
                          value={editForm.url || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, url: e.target.value })
                          }
                          placeholder="URL"
                          className="w-full bg-rvno-elevated border border-rvno-border rounded-lg px-4 py-3 font-mono text-sm text-rvno-ink focus:outline-none focus:border-[#C4853A]/50"
                        />
                        <textarea
                          value={editForm.description || ""}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              description: e.target.value,
                            })
                          }
                          placeholder="Description"
                          rows={2}
                          className="w-full bg-rvno-elevated border border-rvno-border rounded-lg px-4 py-3 font-body text-base text-rvno-ink focus:outline-none focus:border-[#C4853A]/50 resize-none"
                        />
                      </div>
                      <div className="flex justify-between mt-4">
                        <button
                          onClick={() => deleteResource(link.id)}
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
                            onClick={saveResource}
                            disabled={saving}
                            className="bg-[#C4853A] hover:bg-[#B37832] text-white font-body text-sm font-semibold px-4 py-2 rounded-lg min-h-[44px] transition-colors disabled:opacity-50"
                          >
                            {saving ? "Saving..." : "Save"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-rvno-card rounded-lg border-2 border-rvno-border p-4 hover:border-rvno-teal transition-colors no-underline group/link min-h-[44px]"
                    >
                      <h3 className="font-display text-base font-semibold text-rvno-ink group-hover/link:text-rvno-teal transition-colors">
                        {link.name}{" "}
                        <span className="text-rvno-teal text-sm">↗</span>
                      </h3>
                      <p className="font-body text-base text-rvno-ink-muted mt-1 leading-relaxed">
                        {link.description}
                      </p>
                    </a>
                  )}
                  {isAdmin && editingId !== link.id && (
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <EditButton onClick={() => startEdit(link)} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}

        {isAdmin && !showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full border-2 border-dashed border-rvno-border rounded-lg p-5 text-center font-body text-base text-rvno-ink-dim hover:text-rvno-ink hover:border-[#C4853A]/50 transition-colors"
          >
            + Add Resource
          </button>
        )}

        {showAddForm && (
          <div className="bg-rvno-card rounded-lg border-2 border-[#C4853A]/30 p-5 ring-1 ring-[#C4853A]/30">
            <h3 className="font-display text-lg font-semibold text-rvno-ink mb-4">
              New Resource
            </h3>
            <div className="space-y-3">
              <select
                value={newResource.section || ""}
                onChange={(e) =>
                  setNewResource({ ...newResource, section: e.target.value })
                }
                className="w-full bg-rvno-elevated border border-rvno-border rounded-lg px-4 py-3 font-body text-base text-rvno-ink focus:outline-none focus:border-[#C4853A]/50"
              >
                {SECTION_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={newResource.name || ""}
                onChange={(e) =>
                  setNewResource({ ...newResource, name: e.target.value })
                }
                placeholder="Resource name"
                className="w-full bg-rvno-elevated border border-rvno-border rounded-lg px-4 py-3 font-display text-base font-semibold text-rvno-ink focus:outline-none focus:border-[#C4853A]/50"
              />
              <input
                type="url"
                value={newResource.url || ""}
                onChange={(e) =>
                  setNewResource({ ...newResource, url: e.target.value })
                }
                placeholder="URL (https://...)"
                className="w-full bg-rvno-elevated border border-rvno-border rounded-lg px-4 py-3 font-mono text-sm text-rvno-ink focus:outline-none focus:border-[#C4853A]/50"
              />
              <textarea
                value={newResource.description || ""}
                onChange={(e) =>
                  setNewResource({ ...newResource, description: e.target.value })
                }
                placeholder="Description"
                rows={2}
                className="w-full bg-rvno-elevated border border-rvno-border rounded-lg px-4 py-3 font-body text-base text-rvno-ink focus:outline-none focus:border-[#C4853A]/50 resize-none"
              />
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
                onClick={addResource}
                disabled={
                  saving || !newResource.name || !newResource.url
                }
                className="bg-[#C4853A] hover:bg-[#B37832] text-white font-body text-sm font-semibold px-4 py-2 rounded-lg min-h-[44px] transition-colors disabled:opacity-50"
              >
                {saving ? "Adding..." : "Add Resource"}
              </button>
            </div>
          </div>
        )}
      </div>

      <section className="mt-10 bg-rvno-card rounded-lg border-2 border-rvno-border p-6">
        <h2 className="font-display text-lg font-semibold text-rvno-ink mb-2">
          Local Shops & Services
        </h2>
        <p className="font-body text-base text-rvno-ink-muted leading-relaxed mb-4">
          Contact us for recommendations on local shops familiar with vintage
          British motorcycles and Norton-specific work.
        </p>
        <h2 className="font-display text-lg font-semibold text-rvno-ink mb-2">
          Know a Great Resource?
        </h2>
        <p className="font-body text-base text-rvno-ink-muted leading-relaxed">
          We&apos;re always looking to add helpful links and resources. If you
          know of a great Norton-related website, parts supplier, or local
          service we should list, let us know!
        </p>
      </section>
    </div>
  );
}
