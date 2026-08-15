import type { Metadata } from "next";
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
  metadataBase: new URL("https://raccoonx.xyz"),

  title: {
    default: "RACCOONX — Stealing Profits. Not Trash.",
    template: "%s | RACCOONX",
  },

  description:
    "RACCOONX is a cyberpunk meme coin built on Solana. Community, speed and pure raccoon energy.",

  applicationName: "RACCOONX",

  keywords: [
    "RACCOONX",
    "RCX",
    "Solana",
    "Solana meme coin",
    "crypto",
    "meme coin",
    "RACCOONX token",
  ],

  alternates: {
    canonical: "https://raccoonx.xyz",
  },

  openGraph: {
    type: "website",
    url: "https://raccoonx.xyz",
    siteName: "RACCOONX",
    title: "RACCOONX — Stealing Profits. Not Trash.",
    description:
      "The next generation Solana meme coin combining community, speed and cyberpunk aesthetics.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "RACCOONX — Stealing Profits. Not Trash.",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "RACCOONX — Stealing Profits. Not Trash.",
    description:
      "The next generation Solana meme coin combining community, speed and cyberpunk aesthetics.",
    images: ["/og-image.png"],
  },

  icons: {
    icon: "/favicon.ico",
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
      <body>{children}</body>
    </html>
  );
}