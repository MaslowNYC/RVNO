"use client";

import { ReactNode, useState } from "react";
import { EditButton } from "./EditButton";

interface EditableSectionProps {
  isAdmin: boolean;
  children: ReactNode;
  editContent: ReactNode;
  onSave: () => Promise<void>;
  onCancel: () => void;
  saving?: boolean;
  className?: string;
}

export function EditableSection({
  isAdmin,
  children,
  editContent,
  onSave,
  onCancel,
  saving = false,
  className = "",
}: EditableSectionProps) {
  const [editing, setEditing] = useState(false);

  async function handleSave() {
    await onSave();
    setEditing(false);
  }

  function handleCancel() {
    onCancel();
    setEditing(false);
  }

  if (!editing) {
    return (
      <div className={`relative group ${className}`}>
        {children}
        {isAdmin && (
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <EditButton onClick={() => setEditing(true)} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ring-1 ring-[#C4853A]/30 rounded-lg p-4 bg-rvno-elevated/50 ${className}`}>
      {editContent}
      <div className="flex justify-end gap-3 mt-4">
        <button
          onClick={handleCancel}
          disabled={saving}
          className="font-body text-sm text-rvno-ink-dim hover:text-rvno-ink transition-colors px-4 py-2 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#C4853A] hover:bg-[#B37832] text-white font-body text-sm font-semibold px-4 py-2 rounded-lg min-h-[44px] transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
