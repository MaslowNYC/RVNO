"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/members", label: "The Crew" },
  { href: "/events", label: "Events" },
  { href: "/resources", label: "Norton Stuff" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-rvno-bg/92 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-5 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <span className="font-display text-base font-bold text-rvno-ink tracking-tight">
            RVNO
          </span>
          <span className="font-mono text-[8px] text-rvno-teal tracking-[1.5px] uppercase">
            Est. 1986
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-5">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`font-mono text-[10px] tracking-wide no-underline transition-colors ${
                pathname === item.href
                  ? "text-rvno-teal"
                  : "text-rvno-ink-muted hover:text-rvno-teal"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile menu - simple for now */}
        <button className="md:hidden font-mono text-xs text-rvno-ink-muted">
          Menu
        </button>
      </div>
    </header>
  );
}
