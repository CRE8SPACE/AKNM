import type { Metadata, Viewport } from "next";

import { Inter, Poppins } from "next/font/google";

import { MusicPlayerProvider } from "@/components/MusicPlayer/MusicPlayerProvider";
import GlobalMusicPlayer from "@/components/MusicPlayer/GlobalMusicPlayer";
import AnalyticsTracker from "@/components/Analytics/AnalyticsTracker";

import "./globals.css";

/* =========================================================
   FONTS
   ========================================================= */

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/* =========================================================
   METADATA
   ========================================================= */

export const metadata: Metadata = {
  title: "Akonam — Founder, Entrepreneur & Creator",

  description:
    "The official website of Akonam — entrepreneur, founder, CEO, author, music artist and builder.",
};

/* =========================================================
   VIEWPORT
   =========================================================
   Global viewport configuration for both the public website
   and Studio.

   We intentionally do NOT disable user scaling globally.
   Public pages should remain accessible to users who need
   browser zoom.
   ========================================================= */

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/* =========================================================
   ROOT LAYOUT
   ========================================================= */

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${poppins.variable}`}
    >
      <body>
        {/* =================================================
            ANALYTICS
            Records public website page views.
            The tracker renders nothing visually.
            ================================================= */}

        <AnalyticsTracker />

        {/* =================================================
            MUSIC SYSTEM
            ================================================= */}

        <MusicPlayerProvider>
          {children}

          <GlobalMusicPlayer />
        </MusicPlayerProvider>
      </body>
    </html>
  );
}