"use client";

import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { EditButton } from "@/components/EditButton";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import type { Event, EventInsert } from "@/lib/database.types";

interface EventsContentProps {
  initialEvents: Event[];
}

const DEFAULT_EVENTS = [
  {
    id: "default-1",
    title: "Monthly Meetup",
    event_date: "First Saturday of the Month",
    event_time: "9:00 AM",
    location: "TBD — Check back for location",
    open_to_all: true,
    description:
      "Our regular monthly gathering for coffee, conversation, and Norton talk. Bring your bike if the weather cooperates, or just yourself if it doesn't.",
    sort_order: 0,
    created_at: "",
    updated_at: "",
  },
  {
    id: "default-2",
    title: "Spring Shakedown Ride",
    event_date: "April 15, 2026",
    event_time: "10:00 AM",
    location: "Blue Ridge Parkway — Meeting Point TBD",
    open_to_all: false,
    description:
      "Time to shake off the winter cobwebs with a scenic ride through the Blue Ridge. We'll keep the pace relaxed and the stops frequent. Perfect for getting bikes (and riders) back into riding shape.",
    sort_order: 1,
    created_at: "",
    updated_at: "",
  },
  {
    id: "default-3",
    title: "RVNO Annual BBQ & Bike Show",
    event_date: "June 20, 2026",
    event_time: "12:00 PM",
    location: "Roanoke Valley — Venue TBD",
    open_to_all: true,
    description:
      "Our biggest event of the year! Bring your Norton for show-and-tell, enjoy good food, and swap stories with fellow enthusiasts. Family-friendly and open to all who appreciate classic British motorcycles.",
    sort_order: 2,
    created_at: "",
    updated_at: "",
  },
  {
    id: "default-4",
    title: "Fall Foliage Ride",
    event_date: "October 10, 2026",
    event_time: "10:00 AM",
    location: "Blue Ridge Parkway — Meeting Point TBD",
    open_to_all: false,
    description:
      "Experience the Blue Ridge at its most beautiful. An all-day ride through peak fall colors with lunch stops along the way.",
    sort_order: 3,
    created_at: "",
    updated_at: "",
  },
];

export function EventsContent({ initialEvents }: EventsContentProps) {
  const { isAdmin } = useAuth();
  const router = useRouter();

  const events = initialEvents.length > 0 ? initialEvents : DEFAULT_EVENTS;

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Event>>({});
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: "",
    event_date: "",
    event_time: "",
    location: "",
    description: "",
    open_to_all: true,
  });

  function startEdit(event: Event) {
    setEditingId(event.id);
    setEditForm({ ...event });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
  }

  async function saveEvent() {
    if (!editForm.id) return;
    setSaving(true);

    // If editing a default item, insert it as a new entry
    if (editForm.id.startsWith("default-")) {
      const insertData: EventInsert = {
        title: editForm.title!,
        event_date: editForm.event_date!,
        event_time: editForm.event_time || null,
        location: editForm.location || null,
        description: editForm.description || null,
        open_to_all: editForm.open_to_all ?? true,
        sort_order: editForm.sort_order ?? 0,
      };
      await supabase.from("events").insert(insertData);
    } else {
      await supabase
        .from("events")
        .update({
          title: editForm.title,
          event_date: editForm.event_date,
          event_time: editForm.event_time,
          location: editForm.location,
          description: editForm.description,
          open_to_all: editForm.open_to_all,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editForm.id);
    }
    setSaving(false);
    setEditingId(null);
    router.refresh();
  }

  async function deleteEvent(id: string) {
    if (!confirm("Delete this event?")) return;
    await supabase.from("events").delete().eq("id", id);
    router.refresh();
  }

  async function addEvent() {
    if (!newEvent.title || !newEvent.event_date) return;
    setSaving(true);
    await supabase.from("events").insert({
      title: newEvent.title,
      event_date: newEvent.event_date,
      event_time: newEvent.event_time || null,
      location: newEvent.location || null,
      description: newEvent.description || null,
      open_to_all: newEvent.open_to_all ?? true,
      sort_order: events.length,
    });
    setSaving(false);
    setShowAddForm(false);
    setNewEvent({
      title: "",
      event_date: "",
      event_time: "",
      location: "",
      description: "",
      open_to_all: true,
    });
    router.refresh();
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <header className="mb-10">
        <h1 className="font-display text-3xl font-bold text-rvno-ink mb-2">
          Upcoming Events
        </h1>
        <p className="font-body text-base text-rvno-ink-muted italic">
          Rides, meetups, and rallies — where Nortons and their people gather
        </p>
      </header>

      <div className="space-y-4 mb-12">
        {events.map((event) => (
          <div key={event.id} className="relative group">
            {editingId === event.id ? (
              <div className="bg-rvno-card rounded-lg border-2 border-[#C4853A]/30 p-5 ring-1 ring-[#C4853A]/30">
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editForm.title || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, title: e.target.value })
                    }
                    placeholder="Event title"
                    className="w-full bg-rvno-elevated border border-rvno-border rounded-lg px-4 py-3 font-display text-xl font-semibold text-rvno-ink focus:outline-none focus:border-[#C4853A]/50"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={editForm.event_date || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, event_date: e.target.value })
                      }
                      placeholder="Date (e.g., April 15, 2026)"
                      className="w-full bg-rvno-elevated border border-rvno-border rounded-lg px-4 py-3 font-body text-base text-rvno-ink focus:outline-none focus:border-[#C4853A]/50"
                    />
                    <input
                      type="text"
                      value={editForm.event_time || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, event_time: e.target.value })
                      }
                      placeholder="Time (e.g., 10:00 AM)"
                      className="w-full bg-rvno-elevated border border-rvno-border rounded-lg px-4 py-3 font-body text-base text-rvno-ink focus:outline-none focus:border-[#C4853A]/50"
                    />
                  </div>
                  <input
                    type="text"
                    value={editForm.location || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, location: e.target.value })
                    }
                    placeholder="Location"
                    className="w-full bg-rvno-elevated border border-rvno-border rounded-lg px-4 py-3 font-body text-base text-rvno-ink focus:outline-none focus:border-[#C4853A]/50"
                  />
                  <textarea
                    value={editForm.description || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                    placeholder="Description"
                    rows={3}
                    className="w-full bg-rvno-elevated border border-rvno-border rounded-lg px-4 py-3 font-body text-base text-rvno-ink focus:outline-none focus:border-[#C4853A]/50 resize-none"
                  />
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.open_to_all ?? true}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          open_to_all: e.target.checked,
                        })
                      }
                      className="w-5 h-5 rounded border-rvno-border bg-rvno-elevated text-rvno-teal focus:ring-[#C4853A]/50"
                    />
                    <span className="font-body text-base text-rvno-ink">
                      Open to all (non-members welcome)
                    </span>
                  </label>
                </div>
                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => deleteEvent(event.id)}
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
                      onClick={saveEvent}
                      disabled={saving}
                      className="bg-[#C4853A] hover:bg-[#B37832] text-white font-body text-sm font-semibold px-4 py-2 rounded-lg min-h-[44px] transition-colors disabled:opacity-50"
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-rvno-card rounded-lg border-2 border-rvno-border p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="font-display text-xl font-semibold text-rvno-ink">
                      {event.title}
                    </h3>
                    <p className="font-mono text-sm text-rvno-teal tracking-wide mt-1 font-medium">
                      {event.event_date}
                      {event.event_time && ` · ${event.event_time}`}
                    </p>
                  </div>
                  <span
                    className={`font-body text-sm px-3 py-1.5 rounded-lg tracking-wide flex-shrink-0 font-semibold ${
                      event.open_to_all
                        ? "bg-rvno-teal text-white"
                        : "bg-rvno-surface text-rvno-ink-muted border border-rvno-border"
                    }`}
                  >
                    {event.open_to_all ? "Open to All" : "Club Members"}
                  </span>
                </div>
                {event.location && (
                  <p className="font-body text-base text-rvno-ink-dim mb-2">
                    📍 {event.location}
                  </p>
                )}
                <p className="font-body text-base text-rvno-ink-muted leading-relaxed">
                  {event.description}
                </p>
                {isAdmin && (
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <EditButton onClick={() => startEdit(event)} />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {isAdmin && !showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full border-2 border-dashed border-rvno-border rounded-lg p-5 text-center font-body text-base text-rvno-ink-dim hover:text-rvno-ink hover:border-[#C4853A]/50 transition-colors"
          >
            + Add Event
          </button>
        )}

        {showAddForm && (
          <div className="bg-rvno-card rounded-lg border-2 border-[#C4853A]/30 p-5 ring-1 ring-[#C4853A]/30">
            <h3 className="font-display text-lg font-semibold text-rvno-ink mb-4">
              New Event
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                value={newEvent.title || ""}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, title: e.target.value })
                }
                placeholder="Event title"
                className="w-full bg-rvno-elevated border border-rvno-border rounded-lg px-4 py-3 font-display text-xl font-semibold text-rvno-ink focus:outline-none focus:border-[#C4853A]/50"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  value={newEvent.event_date || ""}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, event_date: e.target.value })
                  }
                  placeholder="Date (e.g., April 15, 2026)"
                  className="w-full bg-rvno-elevated border border-rvno-border rounded-lg px-4 py-3 font-body text-base text-rvno-ink focus:outline-none focus:border-[#C4853A]/50"
                />
                <input
                  type="text"
                  value={newEvent.event_time || ""}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, event_time: e.target.value })
                  }
                  placeholder="Time (e.g., 10:00 AM)"
                  className="w-full bg-rvno-elevated border border-rvno-border rounded-lg px-4 py-3 font-body text-base text-rvno-ink focus:outline-none focus:border-[#C4853A]/50"
                />
              </div>
              <input
                type="text"
                value={newEvent.location || ""}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, location: e.target.value })
                }
                placeholder="Location"
                className="w-full bg-rvno-elevated border border-rvno-border rounded-lg px-4 py-3 font-body text-base text-rvno-ink focus:outline-none focus:border-[#C4853A]/50"
              />
              <textarea
                value={newEvent.description || ""}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, description: e.target.value })
                }
                placeholder="Description"
                rows={3}
                className="w-full bg-rvno-elevated border border-rvno-border rounded-lg px-4 py-3 font-body text-base text-rvno-ink focus:outline-none focus:border-[#C4853A]/50 resize-none"
              />
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newEvent.open_to_all ?? true}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, open_to_all: e.target.checked })
                  }
                  className="w-5 h-5 rounded border-rvno-border bg-rvno-elevated text-rvno-teal focus:ring-[#C4853A]/50"
                />
                <span className="font-body text-base text-rvno-ink">
                  Open to all (non-members welcome)
                </span>
              </label>
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
                onClick={addEvent}
                disabled={saving || !newEvent.title || !newEvent.event_date}
                className="bg-[#C4853A] hover:bg-[#B37832] text-white font-body text-sm font-semibold px-4 py-2 rounded-lg min-h-[44px] transition-colors disabled:opacity-50"
              >
                {saving ? "Adding..." : "Add Event"}
              </button>
            </div>
          </div>
        )}
      </div>

      <section className="bg-rvno-card rounded-lg border-2 border-rvno-border p-6">
        <h2 className="font-display text-xl font-semibold text-rvno-ink mb-3">
          Want to Join Us?
        </h2>
        <p className="font-body text-base text-rvno-ink-muted leading-relaxed mb-3">
          Most of our events are open to anyone who appreciates Norton
          motorcycles. Whether you own one, used to own one, or just think
          they&apos;re fascinating, you&apos;re welcome to join us.
        </p>
        <div className="space-y-3">
          <p className="font-body text-base text-rvno-ink-muted leading-relaxed">
            <span className="text-rvno-ink font-semibold">Open Events:</span>{" "}
            Events marked &ldquo;Open to All&rdquo; welcome anyone interested in
            Norton motorcycles. No membership required — just show up and enjoy!
          </p>
          <p className="font-body text-base text-rvno-ink-muted leading-relaxed">
            <span className="text-rvno-ink font-semibold">Monthly Meetups:</span>{" "}
            Our informal monthly gatherings are perfect for newcomers. Drop by
            for coffee and conversation — it&apos;s the easiest way to get to
            know the group.
          </p>
        </div>
      </section>
    </div>
  );
}
