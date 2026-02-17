export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <header className="mb-10">
        <h1 className="font-display text-3xl font-bold text-rvno-ink mb-2">
          About RVNO
        </h1>
        <p className="font-body text-lg text-rvno-teal italic">
          Keeping Nortons alive in the Blue Ridge
        </p>
      </header>

      <section className="mb-10">
        <h2 className="font-display text-xl font-semibold text-rvno-ink mb-4">
          How We Got Started
        </h2>
        <div className="space-y-4 font-body text-base text-rvno-ink-muted leading-relaxed">
          <p>
            When Dave Youngblood moved to Roanoke, Virginia in 1980 with his 750
            Commando, he also brought along his passion for Norton motorcycles. In
            a desire to welcome like-minded people, he formed Roanoke British Iron
            in 1986. This was the initial chapter name in the International Norton
            Owner&apos;s Association (INOA).
          </p>
          <p>
            Seven years later, Dave introduced Nortons to his veterinarian, Mark
            Finkler, who previously had only owned Japanese motorcycles. Dave
            contacted his good friend in Colorado, Todd Blevins, to see if he knew
            of any decent motorcycles for sale. Todd found a 73&apos; 750 Commando
            and arranged to have it shipped to Roanoke. This became Mark&apos;s
            first and only Norton. Mark was hooked!
          </p>
          <p>
            Years later, they decided to change the name to be more
            brand-specific: the Roanoke Valley Norton Owners.
          </p>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="font-display text-xl font-semibold text-rvno-ink mb-4">
          What We&apos;re About
        </h2>
        <div className="font-body text-base text-rvno-ink-muted leading-relaxed mb-4">
          At its heart, RVNO is about three things:
        </div>
        <div className="space-y-3 mb-4">
          {[
            {
              title: "Riding",
              text: "Because these bikes were meant to be ridden, not just admired. We organize regular rides through some of the best motorcycling country in America.",
            },
            {
              title: "Friendship",
              text: "The camaraderie that comes from sharing a passion for machines that require equal parts mechanical skill and blind optimism.",
            },
            {
              title: "Keeping Nortons Alive",
              text: "Through shared knowledge, spare parts, and the occasional emergency roadside repair, we help each other keep these classic bikes on the road.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="border-l-4 border-rvno-teal pl-4 py-1"
            >
              <span className="font-display text-base font-semibold text-rvno-ink">
                {item.title}:
              </span>{" "}
              <span className="font-body text-base text-rvno-ink-muted">
                {item.text}
              </span>
            </div>
          ))}
        </div>
        <p className="font-body text-base text-rvno-ink-muted leading-relaxed">
          We&apos;re a laid-back group that welcomes anyone with an appreciation
          for Norton motorcycles — whether you own one, used to own one, or just
          think they&apos;re pretty neat. No membership dues, no complicated
          rules, just good people who enjoy British bikes and good roads.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="font-display text-xl font-semibold text-rvno-ink mb-4">
          Our Backyard: The Blue Ridge Mountains
        </h2>
        <div className="space-y-4 font-body text-base text-rvno-ink-muted leading-relaxed">
          <p>
            The Roanoke Valley sits right in the heart of Virginia&apos;s Blue
            Ridge Mountains, which means we&apos;re blessed with some of the
            finest motorcycling roads in the country. The Blue Ridge Parkway is
            practically in our backyard, offering 469 miles of scenic, winding
            roads with virtually no commercial traffic.
          </p>
          <p>
            Surrounding Roanoke County are 3 other counties that offer
            spectacular motorcycle roads — Franklin County, Patrick County and
            Craig County. Here are found some &ldquo;twisties&rdquo; that rival
            the famous Route 129 (The Tail of the Dragon) and Ohio Route 555 (The
            Triple Nickel). You can&apos;t beat the sweet sound of a Norton
            coming on full throttle while exiting a mountain curve!
          </p>
        </div>
      </section>

      <section className="bg-rvno-card rounded-lg border-2 border-rvno-border p-6">
        <h2 className="font-display text-xl font-semibold text-rvno-ink mb-3">
          Part of Something Bigger
        </h2>
        <p className="font-body text-base text-rvno-ink-muted leading-relaxed mb-4">
          RVNO is proud to be affiliated with the International Norton Owners
          Association (INOA), a worldwide organization dedicated to the
          preservation and enjoyment of Norton motorcycles. Through INOA, we
          connect with Norton enthusiasts around the globe, access technical
          resources, and participate in events that celebrate these iconic British
          machines. Many of our members are also INOA members, benefiting from
          their excellent magazine, technical library, and international
          community.
        </p>
        <a
          href="https://www.inoanorton.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block font-body text-base font-semibold text-rvno-teal hover:text-rvno-teal-dark transition-colors"
        >
          Visit INOA →
        </a>
      </section>
    </div>
  );
}
