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
    </main>
  );
}
