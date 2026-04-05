import JournalPhotoLightbox from "@/components/community/JournalPhotoLightbox";
import { entryVideoCount, resolveJournalGallery } from "@/lib/community/entry-gallery";
import type { TravelerStateEntry } from "@/lib/community/types";

function splitStory(story: string) {
  return story
    .split(/(?<=[.!?])\s+/)
    .reduce<string[]>((chunks, sentence, index) => {
      if (index % 2 === 0) {
        chunks.push(sentence);
      } else {
        chunks[chunks.length - 1] = `${chunks[chunks.length - 1]} ${sentence}`;
      }
      return chunks;
    }, [])
    .filter(Boolean);
}

export default function TravelerStateStory({ entry }: { entry: TravelerStateEntry }) {
  const storyParagraphs = splitStory(entry.story);
  const gallery = resolveJournalGallery(entry);
  const videoCount = entryVideoCount(entry);
  const photoCount = gallery.filter((g) => g.mediaKind === "photo").length;

  return (
    <section className="rounded-[2.2rem] border border-slate-200 bg-white p-6 shadow-[0_14px_36px_rgba(15,23,42,0.06)] lg:p-8 xl:p-10">
      {gallery.length > 0 ? (
        <div className="mb-10 space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-deep">Photos &amp; videos</p>
              <h2 className="mt-2 font-heading text-2xl font-extrabold tracking-tight text-asphalt sm:text-3xl">
                {entry.stateName} through your lens
              </h2>
            </div>
            <p className="text-sm text-asphalt/55">
              {photoCount} photo{photoCount === 1 ? "" : "s"}
              {videoCount > 0 ? ` · ${videoCount} video${videoCount === 1 ? "" : "s"}` : ""} · tap to enlarge
            </p>
          </div>

          <JournalPhotoLightbox items={gallery} stateName={entry.stateName} />
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr] xl:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-deep">Journal</p>
          <h3 className="mt-2 font-heading text-2xl font-extrabold tracking-tight text-asphalt sm:text-3xl">The full story</h3>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-asphalt/68">{entry.summary}</p>

          <div className="mt-8 max-w-3xl space-y-6 text-lg leading-9 text-asphalt/76">
            {storyParagraphs.map((paragraph, index) => (
              <p
                key={`${paragraph}-${index}`}
                className={
                  index === 0
                    ? "first-letter:mr-2 first-letter:float-left first-letter:font-heading first-letter:text-6xl first-letter:font-extrabold first-letter:leading-[0.9] first-letter:text-asphalt"
                    : ""
                }
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        <div className="rounded-[1.8rem] border border-slate-200 bg-[linear-gradient(180deg,#fff,rgba(245,247,250,0.9))] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-asphalt/45">Trip readout</p>
          <div className="mt-4 grid gap-3 text-sm text-asphalt/68">
            <div className="flex items-center justify-between gap-4 rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
              <span>Region</span>
              <span className="font-semibold text-asphalt">{entry.cityRegion}</span>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
              <span>Date</span>
              <span className="font-semibold text-asphalt">{entry.dateVisited}</span>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
              <span>Rating</span>
              <span className="font-semibold text-asphalt">{entry.rating}/5</span>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
              <span>Worth detour</span>
              <span className="font-semibold text-asphalt">{entry.worthDetour ? "Absolutely" : "Maybe not"}</span>
            </div>
          </div>

          <div className="mt-5 rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-800">Favorite memory</p>
            <p className="mt-3 leading-relaxed text-asphalt/76">{entry.favoriteMemory}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
