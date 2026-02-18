"use client";

import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { EditableSection } from "@/components/EditableSection";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import type { PageContent } from "@/lib/database.types";

interface ContactContentProps {
  joiningContent: PageContent | null;
}

const DEFAULT_JOINING = `RVNO is an informal group with no membership fees or complicated requirements. If you appreciate Norton motorcycles and enjoy good company, you're already qualified.

The best way to get started is to attend one of our monthly meetups. It's casual, friendly, and you'll quickly get a sense of whether we're your kind of people (we probably are).`;

export function ContactContent({ joiningContent }: ContactContentProps) {
  const { isAdmin } = useAuth();
  const router = useRouter();

  const [joining, setJoining] = useState(
    joiningContent?.body || DEFAULT_JOINING
  );
  const [saving, setSaving] = useState(false);

  const mailtoLink = `mailto:finklerrah@gmail.com?cc=iampatrickmay@gmail.com&subject=${encodeURIComponent("RVNO Website Inquiry")}`;

  async function saveContent(pageKey: string, body: string) {
    setSaving(true);
    await supabase
      .from("page_content")
      .upsert(
        { page_key: pageKey, body, updated_at: new Date().toISOString() },
        { onConflict: "page_key" }
      );
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <header className="mb-10">
        <h1 className="font-display text-3xl font-bold text-rvno-ink mb-2">
          Get in Touch
        </h1>
        <p className="font-body text-base text-rvno-ink-muted italic">
          Want to join us? Got a Norton collecting dust? Know a good joke? Drop
          us a line.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-5">
          <div>
            <h3 className="font-mono text-sm text-rvno-teal tracking-wide uppercase mb-3 font-semibold">
              Reach Out
            </h3>
            <a
              href={mailtoLink}
              className="inline-flex items-center gap-2 bg-rvno-teal text-white font-body text-base font-semibold px-6 py-3 rounded-lg hover:bg-rvno-teal-dark transition-colors min-h-[48px]"
            >
              <span>Email Mark</span>
              <span className="text-sm opacity-80">→</span>
            </a>
            <p className="font-body text-sm text-rvno-ink-dim mt-2">
              Opens your email app with subject pre-filled
            </p>
          </div>

          <div>
            <h3 className="font-mono text-sm text-rvno-teal tracking-wide uppercase mb-2 font-semibold">
              Location
            </h3>
            <p className="font-body text-base text-rvno-ink-muted">
              Roanoke Valley, Virginia
              <br />
              Blue Ridge Mountains
            </p>
          </div>
        </div>

        <EditableSection
          isAdmin={isAdmin}
          onSave={() => saveContent("contact_joining", joining)}
          onCancel={() => setJoining(joiningContent?.body || DEFAULT_JOINING)}
          saving={saving}
          editContent={
            <div className="bg-rvno-card rounded-lg border-2 border-rvno-border p-5">
              <h3 className="font-display text-lg font-semibold text-rvno-ink mb-3">
                About Joining
              </h3>
              <textarea
                value={joining}
                onChange={(e) => setJoining(e.target.value)}
                rows={8}
                className="w-full bg-rvno-elevated border border-rvno-border rounded-lg px-4 py-3 font-body text-base text-rvno-ink placeholder:text-rvno-ink-dim focus:outline-none focus:border-[#C4853A]/50 resize-none"
              />
              <p className="font-body text-xs text-rvno-ink-dim mt-2">
                Separate paragraphs with blank lines
              </p>
            </div>
          }
        >
          <div className="bg-rvno-card rounded-lg border-2 border-rvno-border p-5">
            <h3 className="font-display text-lg font-semibold text-rvno-ink mb-3">
              About Joining
            </h3>
            <div className="space-y-3 font-body text-base text-rvno-ink-muted leading-relaxed">
              {joining.split("\n\n").map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </EditableSection>
      </div>
    </div>
  );
}
