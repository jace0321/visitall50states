"use client";

import Link from "next/link";
import { useState } from "react";
import AuthButton from "@/components/AuthButton";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/map-maker", label: "Map Maker" },
  { href: "/travelers", label: "Travelers" },
  { href: "/states", label: "States" },
  { href: "/search", label: "Explore" },
  { href: "/about", label: "About" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/12 bg-[linear-gradient(180deg,rgba(2,6,23,0.96),rgba(5,9,19,0.88))] shadow-[0_18px_45px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      <nav className="mx-auto flex w-full max-w-[1800px] items-center justify-between px-4 py-4 sm:px-6 xl:px-8">
        <Link
          href="/"
          className="group flex items-center gap-3 rounded-full border border-white/14 bg-[linear-gradient(135deg,rgba(255,255,255,0.14),rgba(255,255,255,0.05))] px-4 py-2.5 shadow-[0_14px_32px_rgba(0,0,0,0.18)] ring-1 ring-white/8 transition-all hover:-translate-y-0.5 hover:border-amber-brand/45 hover:bg-[linear-gradient(135deg,rgba(255,255,255,0.18),rgba(255,255,255,0.07))]"
        >
          <span className="text-2xl drop-shadow-[0_3px_10px_rgba(251,191,36,0.3)] float-slow">🗺️</span>
          <span>
            <span className="block bg-gradient-to-r from-white via-amber-100 to-sky-100 bg-clip-text font-heading text-lg font-extrabold tracking-tight text-transparent transition-all group-hover:from-white group-hover:to-amber-brand">
              Visit All 50
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-white/52">
              Travel atlas
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-5">
          <div className="flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-transparent px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white shadow-[0_1px_0_rgba(0,0,0,0.35)] transition-all hover:border-white/25 hover:bg-white/12 hover:text-amber-200"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <AuthButton />
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-white p-2"
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {open ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-night/95 border-t border-white/10 px-6 pb-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:text-amber-200"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3">
            <AuthButton />
          </div>
        </div>
      )}
    </header>
  );
}
