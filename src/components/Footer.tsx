import Link from "next/link";

const FOOTER_LINKS = [
  {
    title: "Explore",
    links: [
      { href: "/states", label: "All 50 States" },
      { href: "/map-maker", label: "Photo Map Maker" },
      { href: "/about", label: "About Us" },
    ],
  },
  {
    title: "Popular States",
    links: [
      { href: "/states/california", label: "California" },
      { href: "/states/texas", label: "Texas" },
      { href: "/states/florida", label: "Florida" },
      { href: "/states/colorado", label: "Colorado" },
    ],
  },
  {
    title: "Community",
    links: [
      { href: "https://travelwithearps.com", label: "Travel With Earps" },
      { href: "/about", label: "Our Mission" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-night text-white/70">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🗺️</span>
              <span className="text-white font-black tracking-tight text-lg">
                Visit All 50
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              One family. One map. All 50 states. Helping road trippers and
              adventurers track their journey across America.
            </p>
          </div>

          {/* Link columns */}
          {FOOTER_LINKS.map((col) => (
            <div key={col.title}>
              <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
                {col.title}
              </h3>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-amber-brand transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs">
            &copy; {new Date().getFullYear()} Visit All 50 States. Made with
            love from the road.
          </p>
          <p className="text-xs">
            A project by the{" "}
            <a
              href="https://travelwithearps.com"
              className="text-amber-brand hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Earp Family
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
