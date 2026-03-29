import { STATE_NAMES } from "@/lib/states";

export default function Marquee() {
  const text = STATE_NAMES.join("  \u2022  ");
  // Duplicate for seamless loop
  const doubled = text + "  \u2022  " + text;

  return (
    <div className="bg-night py-4 overflow-hidden border-y border-white/5">
      <div className="animate-marquee whitespace-nowrap">
        <span className="text-amber-brand/80 text-sm font-bold tracking-widest uppercase">
          {doubled}
        </span>
      </div>
    </div>
  );
}
