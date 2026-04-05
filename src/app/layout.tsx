import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fontHeading = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default:
      "Visit All 50 States — Interactive Photo Map, Traveler Pages & State-by-State Stories",
    template: "%s | Visit All 50 States",
  },
  description:
    "Free 50 states photo map maker and shareable traveler pages. Build a U.S. map with your trip photos, then open any state to see stories, memories, pictures, and videos from that stop — plus guides for all 50 states.",
  keywords: [
    "visit all 50 states",
    "50 states map",
    "photo map maker",
    "US travel map",
    "road trip journal",
    "state travel stories",
    "interactive state map",
  ],
  metadataBase: new URL("https://visitall50states.com"),
  alternates: {
    canonical: "https://visitall50states.com",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://visitall50states.com",
    siteName: "Visit All 50 States",
    title:
      "Visit All 50 States — Interactive Photo Map & Travel Journal by State",
    description:
      "Make a photo map of the U.S., save a traveler page you can share, and click any state for photos, videos, and stories from the road. Free map maker + 50 state guides.",
    images: [{ url: "/hero-highway.jpg", width: 1920, height: 1080, alt: "Open road highway — Visit All 50 States" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Visit All 50 States — Photo map & stories for every state",
    description:
      "Interactive U.S. map maker, traveler pages, and state journals with photos and videos — built for road trippers and families.",
    images: ["/hero-highway.jpg"],
  },
  verification: {
    google: "5Sqj9a3jl12mQD3TtXXIB5N7Sp_VVjZyCxQ8a5TjDp0",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontSans.variable} ${fontHeading.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
