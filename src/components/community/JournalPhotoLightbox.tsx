"use client";

import type { JournalGalleryItem } from "@/lib/community/entry-gallery";
import { useCallback, useEffect, useId, useState } from "react";

type Props = {
  items: JournalGalleryItem[];
  stateName: string;
};

export default function JournalPhotoLightbox({ items, stateName }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const titleId = useId();

  const close = useCallback(() => setOpenIndex(null), []);

  const goPrev = useCallback(() => {
    setOpenIndex((i) => {
      if (i === null || items.length === 0) return i;
      return (i - 1 + items.length) % items.length;
    });
  }, [items.length]);

  const goNext = useCallback(() => {
    setOpenIndex((i) => {
      if (i === null || items.length === 0) return i;
      return (i + 1) % items.length;
    });
  }, [items.length]);

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [openIndex, close, goPrev, goNext]);

  if (items.length === 0) return null;

  const active = openIndex !== null ? items[openIndex] : null;
  const lead = items[0];

  const tileBackground = (item: JournalGalleryItem) =>
    item.mediaKind === "photo" ? item.url : item.posterUrl;

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        <button
          type="button"
          onClick={() => setOpenIndex(0)}
          className="group relative min-h-[25rem] overflow-hidden rounded-[2rem] border border-slate-200 text-left outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-amber-400"
          aria-label={`Open large view: lead media from ${stateName}`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105"
            style={{ backgroundImage: `url(${tileBackground(lead)})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/18 to-transparent" />
          {lead.mediaKind === "video" ? (
            <div className="absolute right-5 top-5 rounded-full bg-black/55 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white">
              Video
            </div>
          ) : null}
          <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">Lead frame · tap to expand</p>
            <p className="mt-2 max-w-2xl text-2xl font-bold leading-tight sm:text-3xl">
              {lead.caption || `A frame from ${stateName}`}
            </p>
          </div>
        </button>

        <div className="grid gap-4">
          {items.length > 1 ? (
            items.slice(1).map((item, index) => (
              <button
                key={`${item.mediaKind}-${item.url}-${index}`}
                type="button"
                onClick={() => setOpenIndex(index + 1)}
                className="group relative min-h-[12rem] overflow-hidden rounded-[1.75rem] border border-slate-200 text-left outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-amber-400"
                aria-label={`Open large view: media ${index + 2} from ${stateName}`}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url(${tileBackground(item)})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                {item.mediaKind === "video" ? (
                  <div className="absolute right-4 top-4 rounded-full bg-black/50 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-white">
                    Video
                  </div>
                ) : null}
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">
                    Frame {String(index + 2).padStart(2, "0")} · tap to expand
                  </p>
                  <p className="mt-2 text-lg font-semibold leading-snug">
                    {item.caption || `Along the road in ${stateName}`}
                  </p>
                </div>
              </button>
            ))
          ) : (
            <div className="rounded-[1.75rem] border border-slate-200 bg-cloud p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-asphalt/45">Media note</p>
              <p className="mt-3 text-lg font-bold text-asphalt">One strong frame can still carry the whole stop.</p>
              <p className="mt-3 leading-relaxed text-asphalt/68">
                The layout stays journal-first even when a traveler only has one clip or photo for a state.
              </p>
            </div>
          )}
        </div>
      </div>

      {active && openIndex !== null ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-night/92 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onClick={close}
        >
          <div
            className="relative flex max-h-[min(92vh,900px)] w-full max-w-5xl flex-col overflow-hidden rounded-[1.5rem] border border-white/15 bg-night shadow-[0_40px_120px_rgba(0,0,0,0.55)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-5">
              <p id={titleId} className="min-w-0 pt-1 text-sm font-semibold text-white/90">
                {active.caption || `${stateName} · ${active.mediaKind} ${openIndex + 1} of ${items.length}`}
              </p>
              <button
                type="button"
                onClick={close}
                className="shrink-0 rounded-full border border-white/20 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-white/80 transition hover:bg-white/10"
              >
                Close
              </button>
            </div>
            <div className="relative min-h-0 flex-1 bg-black/40">
              {active.mediaKind === "photo" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={active.url}
                  alt={active.caption || `Photo from ${stateName}`}
                  className="mx-auto max-h-[min(78vh,820px)] w-full object-contain"
                />
              ) : (
                <video
                  src={active.url}
                  poster={active.posterUrl}
                  controls
                  playsInline
                  className="mx-auto max-h-[min(78vh,820px)] w-full object-contain"
                />
              )}
            </div>
            {items.length > 1 ? (
              <div className="flex items-center justify-between gap-3 border-t border-white/10 px-4 py-3 sm:px-5">
                <button
                  type="button"
                  onClick={goPrev}
                  className="rounded-full border border-white/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white/85 hover:bg-white/10"
                >
                  Previous
                </button>
                <span className="text-xs font-semibold text-white/50">
                  {openIndex + 1} / {items.length}
                </span>
                <button
                  type="button"
                  onClick={goNext}
                  className="rounded-full border border-white/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white/85 hover:bg-white/10"
                >
                  Next
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
