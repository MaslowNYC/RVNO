export default function EventsPage() {
  const events = [
    {
      title: "Monthly Meetup",
      date: "First Saturday of the Month",
      time: "9:00 AM",
      location: "TBD — Check back for location",
      open: true,
      description:
        "Our regular monthly gathering for coffee, conversation, and Norton talk. Bring your bike if the weather cooperates, or just yourself if it doesn't.",
    },
    {
      title: "Spring Shakedown Ride",
      date: "April 15, 2026",
      time: "10:00 AM",
      location: "Blue Ridge Parkway — Meeting Point TBD",
      open: false,
      description:
        "Time to shake off the winter cobwebs with a scenic ride through the Blue Ridge. We'll keep the pace relaxed and the stops frequent. Perfect for getting bikes (and riders) back into riding shape.",
    },
    {
      title: "RVNO Annual BBQ & Bike Show",
      date: "June 20, 2026",
      time: "12:00 PM",
      location: "Roanoke Valley — Venue TBD",
      open: true,
      description:
        "Our biggest event of the year! Bring your Norton for show-and-tell, enjoy good food, and swap stories with fellow enthusiasts. Family-friendly and open to all who appreciate classic British motorcycles.",
    },
    {
      title: "Fall Foliage Ride",
      date: "October 10, 2026",
      time: "10:00 AM",
      location: "Blue Ridge Parkway — Meeting Point TBD",
      open: false,
      description:
        "Experience the Blue Ridge at its most beautiful. An all-day ride through peak fall colors with lunch stops along the way.",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <header className="mb-10">
        <h1 className="font-display text-3xl font-bold text-rvno-ink mb-2">
          Upcoming Events
        </h1>
        <p className="font-body text-sm text-rvno-ink-muted italic">
          Rides, meetups, and rallies — where Nortons and their people gather
        </p>
      </header>

      <div className="space-y-4 mb-12">
        {events.map((event, i) => (
          <div
            key={i}
            className="bg-rvno-card rounded-lg border border-white/[0.06] p-5"
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h3 className="font-display text-lg font-semibold text-rvno-ink">
                  {event.title}
                </h3>
                <p className="font-mono text-[10px] text-rvno-teal tracking-wide mt-1">
                  {event.date} · {event.time}
                </p>
              </div>
              <span
                className={`font-mono text-[9px] px-2 py-1 rounded tracking-wide flex-shrink-0 ${
                  event.open
                    ? "bg-rvno-teal/10 text-rvno-teal"
                    : "bg-rvno-surface text-rvno-ink-dim"
                }`}
              >
                {event.open ? "Open to All" : "Club Members"}
              </span>
            </div>
            <p className="font-mono text-[10px] text-rvno-ink-dim mb-2">
              📍 {event.location}
            </p>
            <p className="font-body text-sm text-rvno-ink-muted leading-relaxed">
              {event.description}
            </p>
          </div>
        ))}
      </div>

      <section className="bg-rvno-elevated rounded-lg border border-white/[0.06] p-6">
        <h2 className="font-display text-lg font-semibold text-rvno-ink mb-3">
          Want to Join Us?
        </h2>
        <p className="font-body text-sm text-rvno-ink-muted leading-relaxed mb-3">
          Most of our events are open to anyone who appreciates Norton
          motorcycles. Whether you own one, used to own one, or just think
          they&apos;re fascinating, you&apos;re welcome to join us.
        </p>
        <div className="space-y-2">
          <p className="font-body text-sm text-rvno-ink-muted leading-relaxed">
            <span className="text-rvno-ink font-semibold">Open Events:</span>{" "}
            Events marked &ldquo;Open to All&rdquo; welcome anyone interested in
            Norton motorcycles. No membership required — just show up and enjoy!
          </p>
          <p className="font-body text-sm text-rvno-ink-muted leading-relaxed">
            <span className="text-rvno-ink font-semibold">
              Monthly Meetups:
            </span>{" "}
            Our informal monthly gatherings are perfect for newcomers. Drop by
            for coffee and conversation — it&apos;s the easiest way to get to
            know the group.
          </p>
        </div>
      </section>
    </div>
  );
}
