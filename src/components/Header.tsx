"use client";

import Link from "next/link";
import { useState } from "react";
import AuthButton from "@/components/AuthButton";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/map-maker", label: "Map Maker" },
  { href: "/states", label: "States" },
  { href: "/about", label: "About" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-night/75 backdrop-blur-xl">
      <nav className="mx-auto flex w-full max-w-[1800px] items-center justify-between px-4 py-4 sm:px-6 xl:px-8">
        <Link href="/" className="group flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 shadow-lg shadow-black/10 transition-all hover:border-amber-brand/40 hover:bg-white/10">
          <span className="text-2xl float-slow">🗺️</span>
          <span className="bg-gradient-to-r from-white via-amber-100 to-sky-100 bg-clip-text text-lg font-black tracking-tight text-transparent transition-all group-hover:from-white group-hover:to-amber-brand">
            Visit All 50
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-5">
          <div className="flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-transparent px-4 py-2 text-sm font-medium uppercase tracking-wide text-white/72 transition-all hover:border-white/10 hover:bg-white/8 hover:text-amber-brand"
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
              className="block py-3 text-white/70 hover:text-amber-brand transition-colors text-sm font-medium tracking-wide uppercase"
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
