import Image from "next/image";

export default function MissionPage() {
  return (
    <main className="max-w-4xl mx-auto px-5 py-12">
      <h1 className="font-display text-4xl text-rvno-ink mb-12 text-center">
        Mission Statement
      </h1>

      <div className="flex justify-center">
        <Image
          src="/Dumbfuckery.jpeg"
          alt="Mission Statement"
          width={800}
          height={600}
          className="rounded-lg shadow-lg"
        />
      </div>
    </main>
  );
}
