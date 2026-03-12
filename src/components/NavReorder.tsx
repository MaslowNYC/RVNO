"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import type { NavItem } from "@/lib/database.types";

const DEFAULT_NAV_ITEMS: Omit<NavItem, "id" | "created_at">[] = [
  { href: "/", label: "Home", sort_order: 0 },
  { href: "/about", label: "About", sort_order: 1 },
  { href: "/mission", label: "Mission/Theme Song", sort_order: 2 },
  { href: "/members", label: "The Crew", sort_order: 3 },
  { href: "/photos", label: "Photos", sort_order: 4 },
  { href: "/contact", label: "Contact", sort_order: 5 },
];

type NavItemWithId = {
  id: string;
  href: string;
  label: string;
  sort_order: number;
};

export function NavReorder() {
  const [items, setItems] = useState<NavItemWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  useEffect(() => {
    loadNavItems();
  }, []);

  async function loadNavItems() {
    const { data } = await supabase
      .from("nav_items")
      .select("*")
      .order("sort_order", { ascending: true });

    if (data && data.length > 0) {
      setItems(data);
    } else {
      // Initialize with defaults if no items exist
      setItems(
        DEFAULT_NAV_ITEMS.map((item, i) => ({
          ...item,
          id: `temp-${i}`,
        }))
      );
    }
    setLoading(false);
  }

  async function initializeNavItems() {
    setSaving(true);
    // Insert default items into database
    for (const item of DEFAULT_NAV_ITEMS) {
      await supabase.from("nav_items").insert(item);
    }
    await loadNavItems();
    setSaving(false);
  }

  function handleDragStart(index: number) {
    dragItem.current = index;
  }

  function handleDragEnter(index: number) {
    dragOverItem.current = index;
  }

  function handleDragEnd() {
    if (dragItem.current === null || dragOverItem.current === null) return;
    if (dragItem.current === dragOverItem.current) return;

    const newItems = [...items];
    const draggedItem = newItems[dragItem.current];
    newItems.splice(dragItem.current, 1);
    newItems.splice(dragOverItem.current, 0, draggedItem);

    // Update sort_order values
    const updatedItems = newItems.map((item, index) => ({
      ...item,
      sort_order: index,
    }));

    setItems(updatedItems);
    dragItem.current = null;
    dragOverItem.current = null;
  }

  async function handleSaveOrder() {
    setSaving(true);
    for (const item of items) {
      if (item.id.startsWith("temp-")) {
        // Insert new item
        await supabase.from("nav_items").insert({
          href: item.href,
          label: item.label,
          sort_order: item.sort_order,
        });
      } else {
        // Update existing item
        await supabase
          .from("nav_items")
          .update({ sort_order: item.sort_order })
          .eq("id", item.id);
      }
    }
    await loadNavItems();
    setSaving(false);
  }

  async function handleSaveLabel(id: string) {
    if (!editLabel.trim()) {
      setEditingId(null);
      return;
    }

    setSaving(true);
    if (id.startsWith("temp-")) {
      // Just update local state for temp items
      setItems(
        items.map((item) =>
          item.id === id ? { ...item, label: editLabel } : item
        )
      );
    } else {
      await supabase.from("nav_items").update({ label: editLabel }).eq("id", id);
      await loadNavItems();
    }
    setEditingId(null);
    setSaving(false);
  }

  function startEditing(item: NavItemWithId) {
    setEditingId(item.id);
    setEditLabel(item.label);
  }

  if (loading) {
    return (
      <div className="bg-rvno-card rounded-lg border border-rvno-border p-4">
        <p className="font-mono text-sm text-rvno-ink-dim">Loading...</p>
      </div>
    );
  }

  const hasUnsavedChanges = items.some((item) => item.id.startsWith("temp-"));

  return (
    <div className="bg-rvno-card rounded-lg border border-rvno-border p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-sm font-semibold text-rvno-ink">
            Navigation Order
          </h3>
          <p className="font-body text-sm text-rvno-ink-dim mt-0.5">
            Drag items to reorder. Tap to edit labels.
          </p>
        </div>
        {hasUnsavedChanges && (
          <button
            onClick={initializeNavItems}
            disabled={saving}
            className="bg-[#BB0000] text-gray-100 font-mono text-xs font-semibold px-3 py-1.5 rounded hover:bg-[#9E0000] transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Initialize Nav"}
          </button>
        )}
      </div>

      <div className="space-y-1.5">
        {items.map((item, index) => (
          <div
            key={item.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragEnter={() => handleDragEnter(index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => e.preventDefault()}
            className="flex items-center gap-3 bg-rvno-elevated border border-rvno-border rounded-lg px-3 py-2.5 cursor-grab active:cursor-grabbing hover:border-rvno-teal/30 transition-colors"
          >
            <span className="text-rvno-ink-dim">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="9" cy="6" r="1.5" fill="currentColor" />
                <circle cx="15" cy="6" r="1.5" fill="currentColor" />
                <circle cx="9" cy="12" r="1.5" fill="currentColor" />
                <circle cx="15" cy="12" r="1.5" fill="currentColor" />
                <circle cx="9" cy="18" r="1.5" fill="currentColor" />
                <circle cx="15" cy="18" r="1.5" fill="currentColor" />
              </svg>
            </span>

            <span className="font-mono text-xs text-rvno-ink-dim w-20 truncate">
              {item.href}
            </span>

            {editingId === item.id ? (
              <input
                type="text"
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                onBlur={() => handleSaveLabel(item.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveLabel(item.id);
                  if (e.key === "Escape") setEditingId(null);
                }}
                autoFocus
                className="flex-1 bg-rvno-card border border-rvno-teal/40 rounded px-2 py-1 font-body text-sm text-rvno-ink focus:outline-none"
              />
            ) : (
              <span
                onClick={() => startEditing(item)}
                className="flex-1 font-body text-sm text-rvno-ink cursor-text hover:text-rvno-teal"
              >
                {item.label}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-rvno-border flex justify-end">
        <button
          onClick={handleSaveOrder}
          disabled={saving}
          className="bg-[#BB0000] text-gray-100 font-mono text-xs font-semibold px-4 py-2 rounded hover:bg-[#9E0000] transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Order"}
        </button>
      </div>
    </div>
  );
}
