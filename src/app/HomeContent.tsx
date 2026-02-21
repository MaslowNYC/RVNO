"use client";

import Image from "next/image";
import { EditableCaption } from "@/components/EditableCaption";

interface HomeContentProps {
  heroCaption?: string | null;
}

export function HomeContent({ heroCaption }: HomeContentProps) {
  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col">
      {/* Hero image - cinematic full width */}
      <div className="relative w-full flex-1 min-h-[70vh]">
        <Image
          src="/hero_image.jpeg"
          alt="RVNO hero image"
          fill
          priority
          className="object-contain"
          sizes="100vw"
        />
      </div>

      {/* Caption area */}
      <div className="text-center py-6 bg-rvno-bg space-y-3">
        <EditableCaption
          pageKey="home_hero_caption"
          initialContent={heroCaption}
          placeholder="Add a caption for the hero image..."
          className="max-w-2xl mx-auto px-5"
          textClassName="font-body text-sm text-rvno-ink-muted italic"
        />
        <p className="font-mono text-xs text-rvno-ink-dim tracking-[0.3em] uppercase">
          Virginia&apos;s Roanoke Valley &middot; Since 1988
        </p>
      </div>
    </div>
  );
}
