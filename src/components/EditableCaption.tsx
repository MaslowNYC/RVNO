"use client";

import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { EditButton } from "./EditButton";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface EditableCaptionProps {
  pageKey: string;
  initialContent?: string | null;
  placeholder?: string;
  className?: string;
  textClassName?: string;
}

export function EditableCaption({
  pageKey,
  initialContent,
  placeholder = "Add a caption...",
  className = "",
  textClassName = "font-body text-sm text-rvno-ink-muted italic",
}: EditableCaptionProps) {
  const { isAdmin } = useAuth();
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(initialContent || "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await supabase
      .from("page_content")
      .upsert(
        { page_key: pageKey, body: content || null, updated_at: new Date().toISOString() },
        { onConflict: "page_key" }
      );
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  function handleCancel() {
    setContent(initialContent || "");
    setEditing(false);
  }

  // Not admin and no content - render nothing
  if (!isAdmin && !content) {
    return null;
  }

  if (editing) {
    return (
      <div className={`relative ring-1 ring-[#C4853A]/30 rounded-lg p-3 bg-rvno-elevated/50 ${className}`}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className="w-full bg-rvno-elevated border border-rvno-border rounded px-3 py-2 font-body text-sm text-rvno-ink placeholder:text-rvno-ink-dim focus:outline-none focus:border-[#C4853A]/50 resize-none"
          autoFocus
        />
        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={handleCancel}
            disabled={saving}
            className="font-body text-xs text-rvno-ink-dim hover:text-rvno-ink transition-colors px-3 py-1.5 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#C4853A] hover:bg-[#B37832] text-white font-body text-xs font-semibold px-3 py-1.5 rounded transition-colors disabled:opacity-50"
          >
            {saving ? "..." : "Save"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative group ${className}`}>
      {content ? (
        <p className={textClassName}>{content}</p>
      ) : (
        isAdmin && (
          <p className="font-body text-xs text-rvno-ink-dim/50 italic">
            {placeholder}
          </p>
        )
      )}
      {isAdmin && (
        <div className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <EditButton
            onClick={() => setEditing(true)}
            className="!w-8 !h-8"
          />
        </div>
      )}
    </div>
  );
}
