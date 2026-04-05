"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { fetchTravelerDashboardBundle } from "@/lib/community/data";
import type { TravelerMapState, TravelerProfile } from "@/lib/community/types";

export type DashboardBundleState =
  | { status: "loading" }
  | { status: "unauthenticated" }
  | { status: "no_profile" }
  | { status: "missing_env" }
  | { status: "error"; message: string }
  | { status: "ready"; profile: TravelerProfile; mapStates: TravelerMapState[] };

export function useDashboardBundle(): DashboardBundleState {
  const [state, setState] = useState<DashboardBundleState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseAnonKey) {
          if (!cancelled) setState({ status: "missing_env" });
          return;
        }

        const supabase = createSupabaseBrowserClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          if (!cancelled) setState({ status: "unauthenticated" });
          return;
        }

        const bundle = await fetchTravelerDashboardBundle(supabase, session.user.id);
        if (cancelled) return;

        if (!bundle) {
          setState({ status: "no_profile" });
          return;
        }

        setState({ status: "ready", profile: bundle.profile, mapStates: bundle.mapStates });
      } catch (e) {
        if (!cancelled) {
          const message = e instanceof Error ? e.message : "Something went wrong";
          setState({ status: "error", message });
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
