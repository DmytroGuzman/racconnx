import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: {
    default: "RaccoonX Admin",
    template: "%s | RaccoonX Admin",
  },

  description: "RaccoonX administration panel",

  icons: {
    icon: "/admin-icon-192.png",
  },

  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#07070a",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}