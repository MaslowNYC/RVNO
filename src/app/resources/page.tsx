const SECTIONS = [
  {
    title: "Norton Community & Resources",
    links: [
      {
        name: "International Norton Owners Association (INOA)",
        url: "https://www.inoanorton.com/",
        desc: "The premier worldwide organization for Norton enthusiasts. Excellent magazine, technical library, and events.",
      },
      {
        name: "Norton Owners Club",
        url: "https://www.nortonownersclub.org/",
        desc: "UK-based Norton owners club with sections worldwide. Great technical resources and forum.",
      },
      {
        name: "Access Norton Forum",
        url: "https://www.accessnorton.com/",
        desc: "Active online community with extensive technical discussions, restoration advice, and Norton knowledge.",
      },
    ],
  },
  {
    title: "Parts & Service",
    links: [
      {
        name: "Andover Norton",
        url: "https://www.andover-norton.co.uk/",
        desc: "Official parts supplier for Norton motorcycles. Comprehensive catalog of genuine and replacement parts.",
      },
      {
        name: "Old Britts",
        url: "https://www.oldbritts.com/",
        desc: "Specialist in Norton Commando parts and upgrades. Known for quality parts and technical expertise.",
      },
      {
        name: "RGM Motors",
        url: "https://www.rgmmotors.co.uk/",
        desc: "UK supplier of Norton parts and engine components. Good source for hard-to-find items.",
      },
    ],
  },
  {
    title: "Riding & Local Information",
    links: [
      {
        name: "Blue Ridge Parkway",
        url: "https://www.nps.gov/blri/",
        desc: "Official site for America's favorite drive — 469 miles of scenic mountain roads. Our backyard playground.",
      },
      {
        name: "Virginia Scenic Byways",
        url: "https://www.virginiadot.org/programs/faq-byways.asp",
        desc: "Guide to Virginia's most beautiful roads. Plenty of Norton-friendly routes to explore.",
      },
      {
        name: "Roanoke Valley Visitor Information",
        url: "https://www.visitroanokeva.com/",
        desc: "Local attractions, dining, and lodging information for visitors to the Roanoke Valley area.",
      },
    ],
  },
];

export default function ResourcesPage() {
  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <header className="mb-10">
        <h1 className="font-display text-3xl font-bold text-rvno-ink mb-2">
          Norton Stuff
        </h1>
        <p className="font-body text-base text-rvno-ink-muted italic">
          Helpful resources we&apos;ve gathered over the years — parts,
          knowledge, and places to ride
        </p>
      </header>

      <div className="space-y-8">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="font-display text-xl font-semibold text-rvno-ink mb-3">
              {section.title}
            </h2>
            <div className="space-y-2">
              {section.links.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-rvno-card rounded-lg border-2 border-rvno-border p-4 hover:border-rvno-teal transition-colors no-underline group min-h-[44px]"
                >
                  <h3 className="font-display text-base font-semibold text-rvno-ink group-hover:text-rvno-teal transition-colors">
                    {link.name}{" "}
                    <span className="text-rvno-teal text-sm">↗</span>
                  </h3>
                  <p className="font-body text-base text-rvno-ink-muted mt-1 leading-relaxed">
                    {link.desc}
                  </p>
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="mt-10 bg-rvno-card rounded-lg border-2 border-rvno-border p-6">
        <h2 className="font-display text-lg font-semibold text-rvno-ink mb-2">
          Local Shops & Services
        </h2>
        <p className="font-body text-base text-rvno-ink-muted leading-relaxed mb-4">
          Contact us for recommendations on local shops familiar with vintage
          British motorcycles and Norton-specific work.
        </p>
        <h2 className="font-display text-lg font-semibold text-rvno-ink mb-2">
          Know a Great Resource?
        </h2>
        <p className="font-body text-base text-rvno-ink-muted leading-relaxed">
          We&apos;re always looking to add helpful links and resources. If you
          know of a great Norton-related website, parts supplier, or local
          service we should list, let us know!
        </p>
      </section>
    </div>
  );
}
