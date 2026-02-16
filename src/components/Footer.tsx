import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-8 px-5">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
          <p className="font-body text-xs text-rvno-ink-dim italic">
            A small core of Norton enthusiasts located in Virginia&apos;s
            Roanoke Valley with members worldwide.
          </p>
        </div>

        <div className="flex gap-5">
          {[
            { href: "/about", label: "About" },
            { href: "/members", label: "The Crew" },
            { href: "/events", label: "Events" },
            { href: "/contact", label: "Contact" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-mono text-[9px] text-rvno-ink-dim hover:text-rvno-teal no-underline transition-colors tracking-wide"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-5 text-center">
        <p className="font-mono text-[8px] text-rvno-ink-dim/50 tracking-[1px]">
          © 2026 ROANOKE VALLEY NORTON OWNERS
        </p>
      </div>
    </footer>
  );
}
