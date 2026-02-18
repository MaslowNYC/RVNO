import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col">
      {/* Hero logo - 15% larger than header */}
      <div className="flex justify-center pt-12 pb-8">
        <img
          src="/RVNO.png"
          alt="Roanoke Valley Norton Owners"
          className="w-[60%] max-w-lg h-auto"
        />
      </div>

      {/* Hero image - cinematic full width */}
      <div className="relative w-full flex-1 min-h-[60vh]">
        <Image
          src="/mark_bike.jpeg"
          alt="Norton motorcycle on the Blue Ridge Parkway"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        {/* Subtle gradient overlay at top for blending */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-rvno-bg to-transparent" />
      </div>

      {/* Subtle tagline */}
      <div className="text-center py-6 bg-rvno-bg">
        <p className="font-mono text-xs text-rvno-ink-dim tracking-[0.3em] uppercase">
          Virginia&apos;s Roanoke Valley &middot; Since 1988
        </p>
      </div>
    </div>
  );
}
