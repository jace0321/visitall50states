"use client";

export default function MapMakerEmbed() {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg sm:rounded-2xl">
      <iframe
        src="/map-maker.html"
        className="block h-[calc(100dvh-8.5rem)] min-h-[420px] w-full border-0 sm:h-[78dvh] sm:min-h-[600px] lg:h-[82dvh] xl:h-[85dvh] xl:max-h-[1100px]"
        title="50 State Photo Map Maker"
        allow="clipboard-write"
      />
    </div>
  );
}
