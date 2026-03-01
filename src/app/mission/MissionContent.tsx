"use client";

import Image from "next/image";
import { EditableCaption } from "@/components/EditableCaption";

interface MissionContentProps {
  imageCaption?: string | null;
}

export function MissionContent({ imageCaption }: MissionContentProps) {
  return (
    <main className="max-w-4xl mx-auto px-5 py-12">
      <h1 className="font-display text-4xl text-rvno-ink mb-12 text-center">
        Mission Statement
      </h1>

      <div className="flex flex-col items-center gap-4">
        <Image
          src="/Dumbfuckery.jpeg"
          alt="Mission Statement"
          width={800}
          height={600}
          className="rounded-lg shadow-lg"
        />
        <EditableCaption
          pageKey="mission_image_caption"
          initialContent={imageCaption}
          placeholder="Add a caption for this image..."
          className="max-w-2xl text-center"
          textClassName="font-body text-sm text-rvno-ink-muted italic"
        />
      </div>

      {/* Theme Song */}
      <div className="mt-12 flex flex-col items-center gap-3">
        <h2 className="font-display text-2xl text-rvno-ink">Theme Song</h2>
        <iframe
          src="https://open.spotify.com/embed/track/11OFYsUK9EVJsQ6nutH32M?utm_source=generator&theme=0"
          width="100%"
          height="152"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="rounded-xl max-w-md border-0"
        />
      </div>
    </main>
  );
}
