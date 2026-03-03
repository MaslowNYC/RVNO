"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/mission", label: "Mission" },
  { href: "/members", label: "The Crew" },
  { href: "/photos", label: "Photos" },
  { href: "/events", label: "Events" },
  { href: "/resources", label: "Norton Stuff" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-rvno-border bg-rvno-bg/95 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <img
            src="/RVNO.png"
            alt="Roanoke Valley Norton Owners"
            className="h-10 w-auto"
          />
          <span className="font-mono text-xs text-rvno-copper tracking-widest uppercase">
            Est. 1988
          </span>
        </Link>

        {/* Desktop navigation */}
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

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden font-body text-base text-rvno-ink-muted min-h-[44px] px-3 flex items-center gap-2"
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <>
              <span>Close</span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </>
          ) : (
            <>
              <span>Menu</span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </>
          )}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 top-[73px] bg-black/50 md:hidden z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile menu drawer */}
      <nav
        className={`fixed top-[73px] right-0 h-[calc(100vh-73px)] w-64 bg-rvno-bg border-l border-rvno-border transform transition-transform duration-200 ease-out md:hidden z-50 ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col py-4">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`font-body text-lg no-underline transition-colors min-h-[52px] px-6 flex items-center border-b border-rvno-border ${
                pathname === item.href
                  ? "text-rvno-teal bg-rvno-card"
                  : "text-rvno-ink-muted hover:text-rvno-ink hover:bg-rvno-card/50"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
