import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Visit All 50 States — Chase Every State, Make Every Memory",
    template: "%s | Visit All 50 States",
  },
  description:
    "The ultimate community for families and road trippers chasing all 50 states. Free photo map maker, state travel guides, insider tips, and more.",
  metadataBase: new URL("https://visitall50states.com"),
  alternates: {
    canonical: "https://visitall50states.com",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://visitall50states.com",
    siteName: "Visit All 50 States",
    title: "Visit All 50 States — Chase Every State, Make Every Memory",
    description:
      "The ultimate community for families and road trippers chasing all 50 states. Free photo map maker, state travel guides, insider tips, and more.",
    images: [{ url: "/hero-highway.jpg", width: 1920, height: 1080, alt: "Open road highway — Visit All 50 States" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Visit All 50 States — Chase Every State, Make Every Memory",
    description:
      "The ultimate community for families and road trippers chasing all 50 states.",
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
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
