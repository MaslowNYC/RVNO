import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-rvno-border bg-rvno-card py-10 px-5">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
          <p className="font-body text-base text-rvno-ink-muted">
            A small core of Norton enthusiasts headquartered in Virginia&apos;s Roanoke Valley,
            <br />
            <span className="text-rvno-ink-dim">with members throughout the US and the world.</span>
          </p>
        </div>

        <div className="flex gap-8">
          {[
            { href: "/about", label: "About" },
            { href: "/members", label: "The Crew" },
            { href: "/events", label: "Events" },
            { href: "/contact", label: "Contact" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-body text-base text-rvno-ink-dim hover:text-rvno-ink no-underline transition-colors min-h-[44px] flex items-center"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-8 pt-6 border-t border-rvno-border text-center">
        <p className="font-mono text-sm text-rvno-ink-dim tracking-widest">
          RVNO &middot; EST. 1988
        </p>
      </div>
    </footer>
  );
}
