import US_STATE_PATHS, { MAP_VIEWBOX } from "@/lib/us-map-paths";

/** Sample states to suggest a “filled” map — static preview only. */
const DEMO_HIGHLIGHT = new Set(["CA", "TX", "CO", "WA", "FL", "NY", "AZ", "ME", "TN", "OR"]);

export default function HomeMapPreview() {
  return (
    <div className="relative mx-auto w-full max-w-xl lg:max-w-2xl">
      <div className="rounded-2xl border border-white/20 bg-[#070b12]/95 p-3 shadow-[0_28px_70px_rgba(0,0,0,0.5)] ring-1 ring-amber-400/20 sm:p-4">
        <svg
          viewBox={MAP_VIEWBOX}
          className="h-auto w-full"
          role="img"
          aria-label="Example United States map with sample states highlighted"
        >
          <title>Example 50-state map preview</title>
          <defs>
            <linearGradient id="homeMapDemoFill" x1="0" y1="0" x2="960" y2="600" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.92" />
              <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.88" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          {US_STATE_PATHS.map((sp) => {
            const on = DEMO_HIGHLIGHT.has(sp.code);
            return (
              <path
                key={sp.code}
                d={sp.d}
                fill={on ? "url(#homeMapDemoFill)" : "rgba(255,255,255,0.06)"}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth={0.55}
              />
            );
          })}
        </svg>
      </div>
      <p className="mt-3 text-center text-xs leading-relaxed text-white/50 sm:text-sm">
        Example look — build yours with real trip photos in the map maker.
      </p>
    </div>
  );
}
