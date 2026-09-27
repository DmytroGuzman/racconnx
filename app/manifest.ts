import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RaccoonX Admin",
    short_name: "RCX Admin",
    description: "RaccoonX administration panel",
    start_url: "/admin",
    scope: "/admin",
    display: "standalone",
    background_color: "#07070a",
    theme_color: "#07070a",
    orientation: "portrait",
    icons: [
      {
        src: "/admin-icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/admin-icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
