import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReelCheck — Know if the reel is real",
  description:
    "AI-powered analysis of social media reels. Detect misleading claims, fake screenshots, engagement bait, and hidden resources instantly.",
  openGraph: {
    title: "ReelCheck",
    description: "Know if the reel is real.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
