"use client";

import { useEffect, useRef, useState } from "react";

const STATS = [
  { value: "600K+", label: "Community Members" },
  { value: "50", label: "States to Chase" },
  { value: "63", label: "National Parks" },
  { value: "Free", label: "Forever" },
];

function AnimatedValue({ target, suffix }: { target: string; suffix: string }) {
  const [display, setDisplay] = useState("0");
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const num = parseInt(target.replace(/\D/g, ""));
    if (isNaN(num)) {
      setDisplay(target);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 2000;
          const start = performance.now();

          const tick = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(eased * num);
            setDisplay(current.toLocaleString() + suffix);
            if (progress < 1) requestAnimationFrame(tick);
          };

          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, suffix]);

  return <div ref={ref}>{display}</div>;
}

export default function StatBar() {
  return (
    <section className="bg-asphalt py-12 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {STATS.map((stat) => {
          const num = stat.value.replace(/[^0-9]/g, "");
          const suffix = stat.value.replace(/[0-9]/g, "");
          const isNumber = num.length > 0;

          return (
            <div key={stat.label}>
              <div className="text-amber-brand text-4xl sm:text-5xl font-black tracking-tight">
                {isNumber ? (
                  <AnimatedValue target={num} suffix={suffix} />
                ) : (
                  stat.value
                )}
              </div>
              <div className="text-white/60 text-sm font-medium mt-1 uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
