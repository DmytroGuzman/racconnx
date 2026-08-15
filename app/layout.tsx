import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "RACCOONX — Cyberpunk Solana Meme Coin",
    template: "%s | RACCOONX",
  },

  description:
    "RACCOONX is a cyberpunk community-driven meme coin built on Solana. Fast, transparent and designed for the long run.",

  keywords: [
    "RACCOONX",
    "RCX",
    "Solana",
    "Solana meme coin",
    "crypto",
    "meme coin",
  ],

  openGraph: {
    title: "RACCOONX — Cyberpunk Solana Meme Coin",
    description:
      "Stealing Profits. Not Trash. The next generation Solana meme coin.",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "RACCOONX — Cyberpunk Solana Meme Coin",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "RACCOONX — Cyberpunk Solana Meme Coin",
    description:
      "Stealing Profits. Not Trash. The next generation Solana meme coin.",
    images: ["/og-image.png"],
  },

  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
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
      <body className="min-h-full">
        {children}
      </body>
    </html>
  );
}