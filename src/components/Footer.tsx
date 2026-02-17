import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-rvno-border bg-rvno-surface py-10 px-5">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
          <p className="font-body text-base text-rvno-ink-muted italic">
            A small core of Norton enthusiasts located in Virginia&apos;s
            Roanoke Valley with members worldwide.
          </p>
        </div>

        <div className="flex gap-6">
          {[
            { href: "/about", label: "About" },
            { href: "/members", label: "The Crew" },
            { href: "/events", label: "Events" },
            { href: "/contact", label: "Contact" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-body text-base text-rvno-ink-muted hover:text-rvno-teal no-underline transition-colors min-h-[44px] flex items-center"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-6 text-center">
        <p className="font-mono text-sm text-rvno-ink-dim tracking-wide">
          &copy; 2026 ROANOKE VALLEY NORTON OWNERS
        </p>
      </div>
    </footer>
  );
}
