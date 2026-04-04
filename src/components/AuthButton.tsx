"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function AuthButton() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [travelerUsername, setTravelerUsername] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const sessionUserId = session?.user?.id;

  useEffect(() => {
    if (!sessionUserId) {
      setTravelerUsername(null);
      return;
    }
    let cancelled = false;
    supabase
      .from("traveler_profiles")
      .select("username")
      .eq("user_id", sessionUserId)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        setTravelerUsername(typeof data?.username === "string" ? data.username : null);
      });
    return () => {
      cancelled = true;
    };
  }, [sessionUserId, supabase]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setMenuOpen(false);
  }

  if (loading) {
    return (
      <div className="rounded-full border border-white/14 bg-white/8 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/60 shadow-[0_10px_24px_rgba(0,0,0,0.14)]">
        Loading
      </div>
    );
  }

  if (!session?.user) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-2 rounded-full border border-amber-200/35 bg-[linear-gradient(135deg,rgba(251,191,36,0.18),rgba(255,255,255,0.1))] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-[0_14px_30px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 hover:border-amber-200/55 hover:bg-[linear-gradient(135deg,rgba(251,191,36,0.24),rgba(255,255,255,0.14))]"
      >
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/14 text-[11px]">↗</span>
        <span>Sign in</span>
      </Link>
    );
  }

  const label = session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "Account";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen((current) => !current)}
        className="inline-flex items-center gap-3 rounded-full border border-amber-200/35 bg-[linear-gradient(135deg,rgba(255,255,255,0.18),rgba(251,191,36,0.12))] px-3 py-2.5 text-left text-white shadow-[0_14px_30px_rgba(0,0,0,0.18)] ring-1 ring-white/8 transition hover:-translate-y-0.5 hover:border-amber-200/55 hover:bg-[linear-gradient(135deg,rgba(255,255,255,0.22),rgba(251,191,36,0.16))] hover:text-white"
        aria-expanded={menuOpen}
        aria-haspopup="menu"
      >
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/14 text-sm font-black uppercase text-white/92 ring-1 ring-white/10">
          {label.slice(0, 1)}
        </span>
        <span className="min-w-0">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-100/72">Account</span>
          <span className="block max-w-[8rem] truncate text-sm font-semibold tracking-[0.01em] text-white">{label}</span>
        </span>
      </button>

      {menuOpen && (
        <div className="absolute right-0 mt-3 w-72 overflow-hidden rounded-3xl border border-white/12 bg-[linear-gradient(180deg,rgba(2,6,23,0.97),rgba(9,14,28,0.95))] p-3 shadow-[0_24px_60px_rgba(0,0,0,0.34)] backdrop-blur-2xl">
          <div className="rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(251,191,36,0.06))] px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/52">Signed in as</p>
            <p className="mt-2 text-sm font-semibold text-white break-all">{session.user.email}</p>
          </div>
          <div className="mt-3 grid gap-2">
            {travelerUsername ? (
              <Link
                href={`/travelers/${travelerUsername}`}
                onClick={() => setMenuOpen(false)}
                className="rounded-2xl border border-amber-300/35 bg-amber-400/10 px-4 py-3 text-sm font-semibold text-amber-100 transition hover:border-amber-200/50 hover:bg-amber-400/15"
              >
                My traveler map
              </Link>
            ) : null}
            <Link
              href="/dashboard"
              onClick={() => setMenuOpen(false)}
              className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/84 transition hover:border-white/20 hover:bg-white/6 hover:text-white"
            >
              Dashboard
            </Link>
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/84 transition hover:border-white/20 hover:bg-white/6 hover:text-white"
            >
              Account settings
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-2xl border border-white/10 px-4 py-3 text-left text-sm text-white/84 transition hover:border-white/20 hover:bg-white/6 hover:text-white"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
