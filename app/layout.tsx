import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import VisitorTracker from "@/components/VisitorTracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.raccoonx.xyz"),

  title: {
    default: "RaccoonX (RCX) — Solana Meme Coin | Official Website",
    template: "%s | RaccoonX",
  },

  description:
    "Official RaccoonX (RCX) website. Discover the RaccoonX Solana meme coin, token details, presale information, roadmap and community.",

  applicationName: "RaccoonX",

  keywords: [
    "RaccoonX",
    "RaccoonX RCX",
    "RCX",
    "RCX token",
    "RaccoonX token",
    "Solana meme coin",
    "Solana token",
    "crypto meme coin",
  ],

  alternates: {
    canonical: "https://www.raccoonx.xyz",
  },

  openGraph: {
    type: "website",
    url: "https://www.raccoonx.xyz",
    siteName: "RaccoonX",
    title: "RaccoonX (RCX) — No Trash. Just Gains.",
    description:
      "RaccoonX is a Solana meme coin powered by community, speed and pure raccoon energy.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "RaccoonX (RCX)",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "RaccoonX (RCX) — No Trash. Just Gains.",
    description:
      "RaccoonX is a Solana meme coin powered by community, speed and pure raccoon energy.",
    images: ["/og-image.png"],
  },

  icons: {
    icon: "/icon.png",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body>
        <VisitorTracker />
        {children}
      </body>
    </html>
  );
}

