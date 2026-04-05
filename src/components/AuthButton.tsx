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
        <div className="absolute right-0 z-50 mt-3 w-72 overflow-hidden rounded-3xl border border-white/20 bg-[linear-gradient(180deg,#020617,#0f172a)] p-3 shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
          <div className="rounded-2xl border border-white/15 bg-slate-900/90 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-300">Signed in as</p>
            <p className="mt-2 text-sm font-semibold text-zinc-50 break-all">{session.user.email}</p>
          </div>
          <div className="mt-3 grid gap-2">
            {travelerUsername ? (
              <Link
                href={`/travelers/${travelerUsername}`}
                onClick={() => setMenuOpen(false)}
                className="rounded-2xl border border-amber-400/40 bg-amber-500/15 px-4 py-3 text-sm font-semibold text-amber-50 transition hover:border-amber-300/60 hover:bg-amber-500/25"
              >
                My traveler map
              </Link>
            ) : null}
            <Link
              href="/dashboard"
              onClick={() => setMenuOpen(false)}
              className="rounded-2xl border border-white/15 bg-slate-800/80 px-4 py-3 text-sm font-semibold text-zinc-100 transition hover:border-white/25 hover:bg-slate-700/90"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/settings"
              onClick={() => setMenuOpen(false)}
              className="rounded-2xl border border-white/15 bg-slate-800/80 px-4 py-3 text-sm font-semibold text-zinc-100 transition hover:border-white/25 hover:bg-slate-700/90"
            >
              Account settings
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-2xl border border-white/15 bg-slate-800/80 px-4 py-3 text-left text-sm font-semibold text-zinc-100 transition hover:border-white/25 hover:bg-slate-700/90"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
