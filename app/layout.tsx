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
  metadataBase: new URL("https://raccoonx.xyz"),

  title: {
    default: "RaccoonX — No Trash. Just Gains.",
    template: "%s | RaccoonX",
  },

  description:
    "RaccoonX is a cyberpunk meme coin built on Solana. Community, speed and pure raccoon energy.",

  applicationName: "RaccoonX",

  keywords: [
    "RaccoonX",
    "RCX",
    "Solana",
    "Solana meme coin",
    "crypto",
    "meme coin",
    "RaccoonX token",
  ],

  alternates: {
    canonical: "https://raccoonx.xyz",
  },

  openGraph: {
    type: "website",
    url: "https://raccoonx.xyz",
    siteName: "RaccoonX",
    title: "RaccoonX — No Trash. Just Gains.",
    description:
      "The next generation Solana meme coin combining community, speed and cyberpunk aesthetics.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "RaccoonX — No Trash. Just Gains.",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "RaccoonX — No Trash. Just Gains.",
    description:
      "The next generation Solana meme coin combining community, speed and cyberpunk aesthetics.",
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
