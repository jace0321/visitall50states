import type { SupabaseClient } from "@supabase/supabase-js";
import { compressImageForUpload, extensionForMime } from "@/lib/image-compress";
import { MAX_PHOTOS_PER_STATE_ENTRY, TRAVELER_STATE_MEDIA_BUCKET } from "@/lib/traveler-state-media";
import US_STATE_PATHS from "@/lib/us-map-paths";

const CODE_TO_NAME = new Map(US_STATE_PATHS.map((s) => [s.code, s.name]));

function slugify(value: string) {
  return value.toLowerCase().replace(/\s+/g, "-");
}

export type MapMakerPhotoBlob = { stateCode: string; blob: Blob };

export type SyncMapMakerPhotosResult = {
  uploaded: string[];
  skipped: string[];
  errors: string[];
};

/**
 * Uploads map-maker preview images into `traveler_state_media` (journal cover on the public map).
 * Creates a minimal `traveler_state_entries` row when none exists for that state.
 */
export async function syncMapMakerPhotosToTraveler(
  supabase: SupabaseClient,
  userId: string,
  items: MapMakerPhotoBlob[]
): Promise<SyncMapMakerPhotosResult> {
  const uploaded: string[] = [];
  const skipped: string[] = [];
  const errors: string[] = [];

  if (items.length === 0) {
    return { uploaded, skipped, errors };
  }

  const { data: profile, error: profileError } = await supabase
    .from("traveler_profiles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (profileError || !profile?.id) {
    errors.push("Could not load your traveler profile.");
    return { uploaded, skipped, errors };
  }

  const travelerProfileId = profile.id as string;

  for (const { stateCode, blob } of items) {
    const code = stateCode.trim().toUpperCase();
    const stateName = CODE_TO_NAME.get(code);
    if (!stateName) {
      errors.push(`Unknown state code: ${stateCode}`);
      continue;
    }

    try {
      const file = new File([blob], `map-maker-${code}.jpg`, { type: blob.type || "image/jpeg" });
      const compressed = await compressImageForUpload(file);

      const { data: existingEntry, error: fetchEntryError } = await supabase
        .from("traveler_state_entries")
        .select("id")
        .eq("traveler_profile_id", travelerProfileId)
        .eq("state_code", code)
        .maybeSingle();

      if (fetchEntryError && fetchEntryError.code !== "PGRST116") {
        errors.push(`${stateName}: ${fetchEntryError.message}`);
        continue;
      }

      let stateEntryId = (existingEntry as { id?: string } | null)?.id;

      if (!stateEntryId) {
        const payload = {
          traveler_profile_id: travelerProfileId,
          state_code: code,
          state_name: stateName,
          slug: slugify(stateName),
          status: "visited",
          title: "",
          summary: "",
          story: "",
          favorite_memory: "",
          best_stop: "",
          hidden_gem: "",
          best_food: "",
          rating: 5,
          date_visited: null,
          city_region: "",
          family_friendly: true,
          worth_detour: true,
          photos: [] as unknown[],
          comments: [] as unknown[],
        };

        const { data: inserted, error: insertError } = await supabase
          .from("traveler_state_entries")
          .insert(payload)
          .select("id")
          .single();

        if (insertError || !inserted?.id) {
          errors.push(`${stateName}: ${insertError?.message ?? "Could not create journal entry."}`);
          continue;
        }
        stateEntryId = inserted.id as string;
      }

      const { data: mediaRows } = await supabase
        .from("traveler_state_media")
        .select("id, media_kind, sort_order, is_featured")
        .eq("traveler_state_entry_id", stateEntryId);

      type MediaRow = { media_kind?: string | null; sort_order?: number | null; is_featured?: boolean | null };
      const photos = ((mediaRows as MediaRow[] | null) ?? []).filter((m) => m.media_kind === "photo");

      if (photos.length >= MAX_PHOTOS_PER_STATE_ENTRY) {
        skipped.push(`${stateName} (already has ${MAX_PHOTOS_PER_STATE_ENTRY} photos — remove one in the dashboard to add more)`);
        continue;
      }

      const maxOrder = photos.reduce((acc, m) => Math.max(acc, m.sort_order ?? 0), -1);

      const { data: prevFeatured } = await supabase
        .from("traveler_state_media")
        .select("id")
        .eq("traveler_state_entry_id", stateEntryId)
        .eq("media_kind", "photo")
        .eq("is_featured", true)
        .maybeSingle();

      const prevFeaturedId = (prevFeatured as { id?: string } | null)?.id;

      const { error: demoteError } = await supabase
        .from("traveler_state_media")
        .update({ is_featured: false })
        .eq("traveler_state_entry_id", stateEntryId);

      if (demoteError) {
        errors.push(`${stateName}: ${demoteError.message}`);
        continue;
      }

      const ext = extensionForMime(compressed.mimeType);
      const objectPath = `${userId}/${stateEntryId}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage.from(TRAVELER_STATE_MEDIA_BUCKET).upload(objectPath, compressed.blob, {
        cacheControl: "3600",
        upsert: false,
        contentType: compressed.mimeType,
      });

      if (uploadError) {
        errors.push(`${stateName}: ${uploadError.message}`);
        continue;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(TRAVELER_STATE_MEDIA_BUCKET).getPublicUrl(objectPath);

      const { error: mediaInsertError } = await supabase.from("traveler_state_media").insert({
        traveler_state_entry_id: stateEntryId,
        traveler_profile_id: travelerProfileId,
        media_kind: "photo",
        storage_provider: "supabase",
        storage_bucket: TRAVELER_STATE_MEDIA_BUCKET,
        storage_path: objectPath,
        public_url: publicUrl,
        caption: "From your 50-state photo map",
        alt_text: `${stateName} travel photo`,
        mime_type: compressed.mimeType,
        width: compressed.width,
        height: compressed.height,
        file_bytes: compressed.blob.size,
        sort_order: maxOrder + 1,
        is_featured: true,
      });

      if (mediaInsertError) {
        await supabase.storage.from(TRAVELER_STATE_MEDIA_BUCKET).remove([objectPath]);
        if (prevFeaturedId) {
          await supabase.from("traveler_state_media").update({ is_featured: true }).eq("id", prevFeaturedId);
        }
        errors.push(`${stateName}: ${mediaInsertError.message}`);
        continue;
      }

      uploaded.push(stateName);
    } catch (e) {
      errors.push(`${stateName}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  return { uploaded, skipped, errors };
}
