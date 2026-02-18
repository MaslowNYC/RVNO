import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col">
      {/* Hero image - cinematic full width */}
      <div className="relative w-full flex-1 min-h-[70vh]">
        <Image
          src="/mark_bike.jpeg"
          alt="Norton motorcycle on the Blue Ridge Parkway"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
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
