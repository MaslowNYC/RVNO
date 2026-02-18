"use client";

import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export function AdminToolbar() {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();

  if (loading || !isAdmin) return null;

  async function handleLogout() {
    await supabase.auth.signOut();
    router.refresh();
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 bg-rvno-card border border-rvno-border rounded-lg px-4 py-2 shadow-lg">
      <span className="font-mono text-xs text-[#C4853A] font-semibold tracking-wide">
        Admin
      </span>
      <button
        onClick={handleLogout}
        className="font-body text-sm text-rvno-ink-dim hover:text-rvno-ink transition-colors"
      >
        Log out
      </button>
    </div>
  );
}
