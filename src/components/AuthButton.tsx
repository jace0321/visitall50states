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

  async function handleSignOut() {
    await supabase.auth.signOut();
    setMenuOpen(false);
  }

  if (loading) {
    return (
      <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
        Loading
      </div>
    );
  }

  if (!session?.user) {
    return (
      <Link
        href="/login"
        className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/80 transition hover:border-white/30 hover:bg-white/15 hover:text-white"
      >
        Sign in
      </Link>
    );
  }

  const label = session.user.user_metadata?.full_name || session.user.email || "Account";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen((current) => !current)}
        className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/85 transition hover:border-white/30 hover:bg-white/15 hover:text-white"
      >
        {label}
      </button>

      {menuOpen && (
        <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-3xl border border-white/10 bg-night/95 p-3 shadow-2xl backdrop-blur-xl">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Signed in as</p>
            <p className="mt-2 text-sm font-semibold text-white break-all">{session.user.email}</p>
          </div>
          <div className="mt-3 grid gap-2">
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/80 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
            >
              Account settings
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-2xl border border-white/10 px-4 py-3 text-left text-sm text-white/80 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
