"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

function safeInternalPath(raw: string | null): string | null {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return null;
  if (raw.includes("://")) return null;
  return raw;
}

export default function LoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();

    try {
      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/login` : undefined,
          },
        });

        if (signUpError) throw signUpError;

        setMessage("Account created. Check your email if confirmation is enabled, then sign in.");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        if (signInError) throw signInError;

        const next = safeInternalPath(
          typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("next") : null
        );
        router.push(next ?? "/dashboard");
        router.refresh();
        return;
      }

      setPassword("");
    } catch (caught) {
      const nextError = caught instanceof Error ? caught.message : "Something went sideways while talking to Supabase.";
      setError(nextError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-night px-6 py-24 text-white">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-sm md:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-brand">Visit All 50 account</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Save your map for real.</h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/70">
            Sign in to move beyond browser-only tracking. This is the first step toward a real travel dashboard, saved progress, and shareable maps.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { title: "Persistent progress", body: "Your visited states stop living only in localStorage." },
              { title: "One account, any device", body: "Pick up your map from your phone, laptop, or wherever the road takes you." },
              { title: "Foundation for sharing", body: "This unlocks profile pages, public maps, and family tracking next." },
            ].map((item) => (
              <div key={item.title} className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-amber-brand">{item.title}</p>
                <p className="mt-3 text-sm leading-relaxed text-white/65">{item.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white/80 transition hover:border-white/30 hover:text-white"
            >
              Back home
            </Link>
            <Link
              href="/map-maker"
              className="rounded-full bg-amber-brand px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-night transition hover:bg-amber-deep"
            >
              Open map maker
            </Link>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white p-8 text-asphalt shadow-2xl md:p-10">
          <div className="inline-flex rounded-full border border-slate-200 bg-cloud p-1 text-sm font-semibold">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`rounded-full px-4 py-2 transition ${mode === "signin" ? "bg-night text-white" : "text-asphalt/60"}`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`rounded-full px-4 py-2 transition ${mode === "signup" ? "bg-night text-white" : "text-asphalt/60"}`}
            >
              Create account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold text-asphalt/70">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base outline-none transition focus:border-amber-brand focus:ring-2 focus:ring-amber-brand/30"
                placeholder="you@roadtrip.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-semibold text-asphalt/70">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={6}
                required
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base outline-none transition focus:border-amber-brand focus:ring-2 focus:ring-amber-brand/30"
                placeholder="At least 6 characters"
              />
            </div>

            {message && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {message}
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-night px-5 py-4 text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:bg-night/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Working..." : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="mt-5 text-sm leading-relaxed text-asphalt/55">
            For now this is simple email + password auth. Magic links, profile setup, and public share pages can come right after persistence is locked in.
          </p>
        </section>
      </div>
    </main>
  );
}
