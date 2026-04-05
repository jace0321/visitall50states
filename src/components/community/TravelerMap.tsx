"use client";

import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import US_STATE_PATHS, {
  MAP_VIEWBOX,
  STATE_LABEL_POSITIONS,
} from "@/lib/us-map-paths";
import type { TravelerMapState } from "@/lib/community/types";

const STATUS_FILL: Record<TravelerMapState["status"], string> = {
  visited: "#34d399",
  lived: "#38bdf8",
  want_to_go: "#fbbf24",
  not_visited: "rgba(255,255,255,0.06)",
};
const STATUS_HOVER_FILL: Record<TravelerMapState["status"], string> = {
  visited: "#6ee7b7",
  lived: "#7dd3fc",
  want_to_go: "#fcd34d",
  not_visited: "rgba(255,255,255,0.14)",
};
const STATUS_STROKE: Record<TravelerMapState["status"], string> = {
  visited: "#059669",
  lived: "#0284c7",
  want_to_go: "#d97706",
  not_visited: "rgba(255,255,255,0.10)",
};

const SMALL_STATES = new Set(["CT", "DE", "MA", "MD", "NH", "NJ", "RI", "VT"]);

function statusLabel(s: TravelerMapState["status"]) {
  switch (s) {
    case "visited":
      return "Visited";
    case "lived":
      return "Lived";
    case "want_to_go":
      return "Wishlist";
    default:
      return "Not yet";
  }
}

function stateSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-");
}

function canShowInlineLabel(code: string) {
  return !SMALL_STATES.has(code) && !["MI", "LA", "FL", "CA", "NY", "NC", "SC"].includes(code);
}

export default function TravelerMap({
  username,
  states,
  featuredState,
  mapMakerHref,
}: {
  username: string;
  states: TravelerMapState[];
  featuredState?: string;
  /** When set, shows a secondary CTA to the standalone photo map builder (profile map uses journal photos). */
  mapMakerHref?: string;
}) {
  const router = useRouter();
  const statusByCode = new Map(states.map((s) => [s.code, s]));

  const visitedCount = states.filter((s) => s.status === "visited" || s.status === "lived").length;
  const wishlistCount = states.filter((s) => s.status === "want_to_go").length;
  const storyCount = states.filter((s) => s.hasStory).length;
  const notYetCount = Math.max(50 - visitedCount - wishlistCount, 0);

  const [hovered, setHovered] = useState<string | null>(null);
  /** Brief scale + glow on linked states before client navigation (skipped when reduced motion). */
  const [pulseCode, setPulseCode] = useState<string | null>(null);
  const navTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  /** Per-state bounds in map viewBox space so journal photos fill each state, not the whole US. */
  const [stateImageBbox, setStateImageBbox] = useState<
    Record<string, { x: number; y: number; width: number; height: number }>
  >({});

  useEffect(() => {
    return () => {
      if (navTimerRef.current) clearTimeout(navTimerRef.current);
    };
  }, []);

  useLayoutEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const map: Record<string, { x: number; y: number; width: number; height: number }> = {};
    for (const sp of US_STATE_PATHS) {
      const el = svg.querySelector(`[data-bbox-of="${sp.code}"]`);
      if (el instanceof SVGGraphicsElement) {
        const b = el.getBBox();
        map[sp.code] = { x: b.x, y: b.y, width: b.width, height: b.height };
      }
    }
    setStateImageBbox(map);
  }, []);

  const featuredCode = featuredState
    ? US_STATE_PATHS.find(
        (p) => p.code === featuredState || p.name.toLowerCase() === featuredState.toLowerCase()
      )?.code ?? null
    : null;

  const hoveredState = hovered ? statusByCode.get(hovered) : null;
  const hoveredMeta = hovered ? US_STATE_PATHS.find((p) => p.code === hovered) : null;
  const hoveredHasStory = Boolean(hoveredState?.hasStory);

  const handleLinkedStateClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    code: string,
    href: string
  ) => {
    if (e.defaultPrevented) return;
    if (e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    e.preventDefault();
    if (navTimerRef.current) clearTimeout(navTimerRef.current);

    setPulseCode(code);
    navTimerRef.current = setTimeout(() => {
      navTimerRef.current = null;
      setPulseCode(null);
      router.push(href);
    }, 320);
  };

  return (
    <section
      className="relative overflow-hidden rounded-[2.75rem] border border-white/10 bg-[#050913] text-white shadow-[0_32px_120px_rgba(2,6,23,0.42)]"
      aria-label="Travel map"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.16),transparent_28%),radial-gradient(circle_at_82%_22%,rgba(125,211,252,0.12),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_28%,rgba(255,255,255,0.02))]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />

      <div className="relative p-5 sm:p-6 lg:p-8 xl:px-10 xl:py-9 2xl:px-12 2xl:py-10">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.9fr)_minmax(17rem,0.45fr)] xl:items-start">
          <div>
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-white/45">
                  The map ledger
                </p>
                <h2 className="mt-3 font-heading text-3xl font-extrabold tracking-[-0.04em] text-white sm:text-4xl lg:text-[2.8rem]">
                  The country, marked by memory.
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-white/52">
                  States with journal photos show a glimpse inside the outline. Use the{" "}
                  {mapMakerHref ? (
                    <a href={mapMakerHref} className="font-semibold text-amber-200/95 underline decoration-amber-200/40 underline-offset-4 hover:text-white">
                      photo map maker
                    </a>
                  ) : (
                    "photo map maker"
                  )}{" "}
                  for a printable collage; when you&apos;re signed in you can <span className="text-white/65">sync marked states</span> to this same
                  traveler map.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/56">
                <span className="rounded-full border border-white/10 bg-white/6 px-3 py-2 backdrop-blur-sm">
                  {visitedCount}/50 logged
                </span>
                {featuredCode ? (
                  <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-amber-100 backdrop-blur-sm">
                    Featured: {featuredCode}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/62">
              <LegendDot color="#34d399" label="Visited" />
              <LegendDot color="#38bdf8" label="Lived" />
              <LegendDot color="#fbbf24" label="Wishlist" />
              <LegendDot color="rgba(255,255,255,0.16)" label="Not yet" dimText />
              <LegendDot color="#fbbf24" label="Story linked" ring />
              <span className="flex items-center gap-1.5 rounded-full border border-white/8 bg-white/[0.035] px-3 py-1.5 text-white/55">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-gradient-to-br from-amber-200/90 to-sky-300/80 ring-1 ring-white/25" />
                Photo inside outline = journal cover
              </span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-[1.4rem] border border-white/10 bg-white/[0.045] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/68">
              <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1.5 text-amber-100">
                Amber ring = open story
              </span>
              <span className="text-white/44">Solid fill only = tracked on the map, story still to come</span>
            </div>

            <div className="mt-6 overflow-hidden rounded-[2.55rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.018))] px-2 py-3 sm:px-4 sm:py-5 lg:px-5 lg:py-6 xl:px-7 xl:py-8">
              <div className="rounded-[2.15rem] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_60%)] p-2 sm:p-3 lg:p-4 xl:p-6">
                <svg
                  ref={svgRef}
                  viewBox={MAP_VIEWBOX}
                  xmlns="http://www.w3.org/2000/svg"
                  className="block h-auto min-h-[26rem] w-full sm:min-h-[34rem] lg:min-h-[44rem] xl:min-h-[54rem] 2xl:min-h-[58rem]"
                  role="img"
                  aria-label="Interactive United States travel map showing visited, lived-in, and wishlist states"
                >
                  <g opacity={0} pointerEvents="none" aria-hidden>
                    {US_STATE_PATHS.map((sp) => (
                      <path key={`bbox-${sp.code}`} data-bbox-of={sp.code} d={sp.d} fill="none" stroke="none" />
                    ))}
                  </g>
                  <defs>
                    <filter id="featured-glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="6" result="blur" />
                      <feFlood floodColor="#fbbf24" floodOpacity="0.45" />
                      <feComposite in2="blur" operator="in" />
                      <feMerge>
                        <feMergeNode />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    <filter id="story-glow" x="-40%" y="-40%" width="180%" height="180%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feFlood floodColor="#fbbf24" floodOpacity="0.28" />
                      <feComposite in2="blur" operator="in" />
                      <feMerge>
                        <feMergeNode />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    {US_STATE_PATHS.map((sp) => (
                      <clipPath key={`clip-def-${sp.code}`} id={`state-photo-clip-${sp.code}`}>
                        <path d={sp.d} />
                      </clipPath>
                    ))}
                  </defs>

                  {US_STATE_PATHS.map((sp) => {
                    const entry = statusByCode.get(sp.code);
                    const status = entry?.status ?? "not_visited";
                    const isHovered = hovered === sp.code;
                    const isFeatured = sp.code === featuredCode;
                    const fill = isHovered ? STATUS_HOVER_FILL[status] : STATUS_FILL[status];
                    const stroke = STATUS_STROKE[status];
                    const hasStory = Boolean(entry?.hasStory);
                    const labelPos = STATE_LABEL_POSITIONS[sp.code];
                    const storyAria = hasStory ? "Open linked story" : "Visited state without published story yet";
                    const previewUrl = entry?.previewImageUrl;
                    const bb = stateImageBbox[sp.code];
                    /** Don’t stack semi-transparent “visited” fill on top of photos — that caused the green tint. */
                    const fillOpacity = previewUrl ? 0 : 1;

                    const href = hasStory ? `/travelers/${username}/${entry?.storySlug ?? stateSlug(sp.name)}` : undefined;

                    return (
                      <g
                        key={sp.code}
                        onMouseEnter={() => setHovered(sp.code)}
                        onMouseLeave={() => setHovered(null)}
                        onFocus={() => setHovered(sp.code)}
                        onBlur={() => setHovered(null)}
                        className={[
                          hasStory ? "cursor-pointer outline-none" : "outline-none",
                          pulseCode === sp.code ? "traveler-map-state-pop" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        data-state-name={sp.name}
                        data-state-status={statusLabel(status)}
                        data-has-story={hasStory ? "true" : "false"}
                      >
                        {href ? (
                          <a
                            href={href}
                            aria-label={`${sp.name} — ${statusLabel(status)}. ${storyAria}`}
                            onClick={(e) => handleLinkedStateClick(e, sp.code, href)}
                          >
                            {previewUrl && bb ? (
                              <image
                                clipPath={`url(#state-photo-clip-${sp.code})`}
                                href={previewUrl}
                                x={bb.x}
                                y={bb.y}
                                width={bb.width}
                                height={bb.height}
                                preserveAspectRatio="xMidYMid meet"
                              />
                            ) : null}
                            <path
                              d={sp.d}
                              fill={fill}
                              fillOpacity={fillOpacity}
                              stroke={stroke}
                              strokeWidth={isFeatured ? 2 : 1}
                              filter={isFeatured ? "url(#featured-glow)" : undefined}
                              className="transition-[fill,fill-opacity,stroke] duration-150 ease-out"
                            />
                            <path
                              d={sp.d}
                              fill="none"
                              stroke="#fbbf24"
                              strokeWidth={isHovered ? 3 : 2.15}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              filter="url(#story-glow)"
                              className="transition-[stroke-width] duration-150 ease-out"
                            />
                          </a>
                        ) : (
                          <>
                            {previewUrl && bb ? (
                              <image
                                clipPath={`url(#state-photo-clip-${sp.code})`}
                                href={previewUrl}
                                x={bb.x}
                                y={bb.y}
                                width={bb.width}
                                height={bb.height}
                                preserveAspectRatio="xMidYMid meet"
                              />
                            ) : null}
                            <path
                              d={sp.d}
                              fill={fill}
                              fillOpacity={fillOpacity}
                              stroke={stroke}
                              strokeWidth={isFeatured ? 2 : 1}
                              filter={isFeatured ? "url(#featured-glow)" : undefined}
                              className="transition-[fill,fill-opacity,stroke] duration-150 ease-out"
                            />
                            {hasStory ? (
                              <path
                                d={sp.d}
                                fill="none"
                                stroke="#fbbf24"
                                strokeWidth={isHovered ? 3 : 2.15}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                filter="url(#story-glow)"
                                className="transition-[stroke-width] duration-150 ease-out"
                              />
                            ) : null}
                          </>
                        )}

                        {labelPos && canShowInlineLabel(sp.code) && (
                          <text
                            x={labelPos[0]}
                            y={labelPos[1]}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fill="white"
                            fontSize={10}
                            fontWeight={700}
                            className="pointer-events-none select-none"
                            style={{ textShadow: "0 1px 3px rgba(0,0,0,0.65)" }}
                          >
                            {sp.code}
                          </text>
                        )}

                        {hasStory && labelPos && canShowInlineLabel(sp.code) && (
                          <circle
                            cx={labelPos[0]}
                            cy={labelPos[1] + 11}
                            r={2.8}
                            fill="#fbbf24"
                            className="pointer-events-none"
                          />
                        )}
                      </g>
                    );
                  })}

                  {Array.from(SMALL_STATES).map((code, idx) => {
                    const sp = US_STATE_PATHS.find((p) => p.code === code);
                    if (!sp) return null;
                    const labelPos = STATE_LABEL_POSITIONS[code];
                    if (!labelPos) return null;
                    const entry = statusByCode.get(code);
                    const status = entry?.status ?? "not_visited";
                    const isHovered = hovered === code;
                    const hasStory = Boolean(entry?.hasStory);
                    const fill = isHovered ? STATUS_HOVER_FILL[status] : STATUS_FILL[status];

                    const lx = 920;
                    const ly = 150 + idx * 19;

                    const href = hasStory ? `/travelers/${username}/${entry?.storySlug ?? stateSlug(sp.name)}` : undefined;

                    return (
                      <g
                        key={`label-${code}`}
                        onMouseEnter={() => setHovered(code)}
                        onMouseLeave={() => setHovered(null)}
                        onFocus={() => setHovered(code)}
                        onBlur={() => setHovered(null)}
                        className={[
                          href ? "cursor-pointer outline-none" : "outline-none",
                          pulseCode === code ? "traveler-map-state-pop" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        data-state-name={sp.name}
                        data-state-status={statusLabel(status)}
                      >
                        <line
                          x1={labelPos[0]}
                          y1={labelPos[1]}
                          x2={lx - 24}
                          y2={ly}
                          stroke="rgba(255,255,255,0.12)"
                          strokeWidth={0.5}
                          className="pointer-events-none"
                        />
                        {href ? (
                          <a
                            href={href}
                            aria-label={`${sp.name} — ${statusLabel(status)}. Open linked story`}
                            onClick={(e) => handleLinkedStateClick(e, code, href)}
                          >
                            <circle
                              cx={lx - 17}
                              cy={ly}
                              r={5}
                              fill={fill}
                              stroke={STATUS_STROKE[status]}
                              strokeWidth={0.8}
                              className="transition-[fill] duration-150"
                            />
                            <circle
                              cx={lx - 17}
                              cy={ly}
                              r={7.2}
                              fill="none"
                              stroke="#fbbf24"
                              strokeWidth={isHovered ? 1.8 : 1.35}
                              className="transition-[stroke-width] duration-150"
                            />
                          </a>
                        ) : (
                          <>
                            <circle
                              cx={lx - 17}
                              cy={ly}
                              r={5}
                              fill={fill}
                              stroke={STATUS_STROKE[status]}
                              strokeWidth={0.8}
                              className="transition-[fill] duration-150"
                            />
                            {hasStory ? (
                              <circle
                                cx={lx - 17}
                                cy={ly}
                                r={7.2}
                                fill="none"
                                stroke="#fbbf24"
                                strokeWidth={isHovered ? 1.8 : 1.35}
                                className="transition-[stroke-width] duration-150"
                              />
                            ) : null}
                          </>
                        )}
                        <text
                          x={lx - 9}
                          y={ly}
                          dominantBaseline="central"
                          fill={isHovered ? "white" : "rgba(255,255,255,0.75)"}
                          fontSize={9}
                          fontWeight={600}
                          className="pointer-events-none select-none transition-[fill] duration-150"
                        >
                          {code}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          </div>

          <aside className="grid gap-4 xl:pt-6 xl:max-w-[18rem] xl:justify-self-end">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-md sm:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/44">
                Curator&apos;s note
              </p>
              <p className="mt-4 text-lg leading-8 text-white/74">
                This map stays the centerpiece, but now it reads more like a personal atlas spread than a generic account widget.
              </p>
              <div className="mt-6 space-y-3 text-sm text-white/64">
                <DetailRow label="Map mode" value="Profile overview" />
                <DetailRow label="Interaction" value="Hover + click (states with stories)" />
                <DetailRow label="Story marker" value="Amber outline + pin marker" />
                <DetailRow label="Stories live" value={`${storyCount} states`} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <CountChip label="Stories" value={storyCount} note="clickable" />
              <CountChip label="To go" value={notYetCount} note="unlogged" />
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.025))] p-5 backdrop-blur-md sm:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/44">
                Active state
              </p>
              {hovered && hoveredMeta ? (
                <div className="mt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-heading text-3xl font-extrabold tracking-[-0.04em] text-white">
                        {hoveredMeta.name}
                      </h3>
                      <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/48">
                        {hoveredMeta.code} — {statusLabel(hoveredState?.status ?? "not_visited")}
                      </p>
                    </div>
                    <span
                      className="mt-1 inline-block h-3.5 w-3.5 rounded-full ring-4 ring-white/5"
                      style={{ backgroundColor: STATUS_FILL[hoveredState?.status ?? "not_visited"] }}
                    />
                  </div>

                  <div className="mt-5 space-y-3 text-sm text-white/68">
                    <DetailRow label="Story saved" value={hoveredHasStory ? "Yes" : "No"} />
                    <DetailRow label="Featured" value={hoveredMeta.code === featuredCode ? "Highlighted stop" : "Standard stop"} />
                    <DetailRow label="Click through" value={hoveredHasStory ? "Open state journal" : "Map status only"} />
                  </div>

                  <div className="mt-5 rounded-[1.2rem] border border-white/10 bg-black/20 px-4 py-3 text-sm leading-7 text-white/68">
                    {hoveredHasStory
                      ? "This state has a published story. Click the highlighted state to open the full journal entry."
                      : "This state is logged on the map, but there is not a public story attached yet."}
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-[1.5rem] border border-dashed border-white/12 bg-black/15 px-4 py-5 text-sm leading-7 text-white/58">
                  Hover or tab to any state to see whether it&apos;s just tracked on the map or linked to a public story. Amber-outlined states open journal entries.
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function CountChip({ label, value, note }: { label: string; value: number; note: string }) {
  return (
    <div className="rounded-[1.45rem] border border-white/10 bg-white/[0.045] px-4 py-4 backdrop-blur-sm">
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/42">{label}</p>
      <div className="mt-2 flex items-end gap-3">
        <p className="text-3xl font-black tracking-[-0.05em] text-white">{value}</p>
        <p className="pb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/38">{note}</p>
      </div>
    </div>
  );
}

function LegendDot({
  color,
  label,
  dimText,
  ring,
}: {
  color: string;
  label: string;
  dimText?: boolean;
  ring?: boolean;
}) {
  return (
    <span className="flex items-center gap-1.5 rounded-full border border-white/8 bg-white/[0.035] px-3 py-1.5">
      <span
        className="inline-block h-2.5 w-2.5 rounded-full"
        style={{
          backgroundColor: ring ? "transparent" : color,
          boxShadow: ring ? `inset 0 0 0 2px ${color}` : undefined,
        }}
      />
      <span className={dimText ? "text-white/50" : ""}>{label}</span>
    </span>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[1.2rem] border border-white/8 bg-black/15 px-4 py-3">
      <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/42">{label}</span>
      <span className="text-right font-semibold text-white/86">{value}</span>
    </div>
  );
}
