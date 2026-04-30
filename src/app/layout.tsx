import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PageShell } from "@/components/page-shell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteDescription =
  "Nightlife music culture — mixes, video, and events. Dark room energy, sharp sound.";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://thelisteningroomatl.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "The Listening Room",
    template: "%s · The Listening Room",
  },
  description: siteDescription,
  openGraph: {
    title: "The Listening Room",
    description: siteDescription,
    url: siteUrl,
    siteName: "The Listening Room",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 819,
        height: 1024,
        alt: "The Listening Room",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "The Listening Room",
    description: siteDescription,
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-black font-sans antialiased`}
      >
        <PageShell>{children}</PageShell>
      </body>
    </html>
  );
}
