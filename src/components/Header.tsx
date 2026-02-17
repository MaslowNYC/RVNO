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
    <header className="sticky top-0 z-50 border-b border-rvno-border bg-rvno-bg/95 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <span className="font-display text-xl font-bold text-rvno-ink tracking-tight">
            RVNO
          </span>
          <span className="font-mono text-xs text-rvno-copper tracking-widest uppercase">
            Est. 1986
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`font-body text-base no-underline transition-colors min-h-[44px] flex items-center ${
                pathname === item.href
                  ? "text-rvno-teal"
                  : "text-rvno-ink-muted hover:text-rvno-ink"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button className="md:hidden font-body text-base text-rvno-ink-muted min-h-[44px] px-3">
          Menu
        </button>
      </div>
    </header>
  );
}
