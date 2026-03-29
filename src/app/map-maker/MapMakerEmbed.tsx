"use client";

export default function MapMakerEmbed() {
  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-lg border border-gray-200 bg-white">
      <iframe
        src="/map-maker.html"
        className="w-full border-0"
        style={{ height: "85vh", minHeight: "600px" }}
        title="50 State Photo Map Maker"
        allow="clipboard-write"
      />
    </div>
  );
}
