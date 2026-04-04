import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Save `states_visited` for a user without relying on UPSERT / ON CONFLICT.
 * Some databases were created without a UNIQUE constraint on `user_id`, which breaks `.upsert({ onConflict: "user_id" })`.
 */
export async function saveUsersMapStates(
  supabase: SupabaseClient,
  userId: string,
  statesVisited: string[]
): Promise<{ error: { message: string; details?: string; hint?: string; code?: string } | null }> {
  const { data: row, error: selErr } = await supabase.from("users_maps").select("id").eq("user_id", userId).maybeSingle();

  if (selErr) return { error: selErr };

  if (row) {
    const { error } = await supabase.from("users_maps").update({ states_visited: statesVisited }).eq("user_id", userId);
    return { error: error ?? null };
  }

  const { error } = await supabase.from("users_maps").insert({
    user_id: userId,
    states_visited: statesVisited,
  });
  return { error: error ?? null };
}
