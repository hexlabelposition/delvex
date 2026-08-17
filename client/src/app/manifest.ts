import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Delvex",
    short_name: "Delvex",
    description: "Manage logistics operations and shipments with Delvex.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f9faf8",
    theme_color: "#0c5b51",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
