import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Gacha Tracker",
    short_name: "Gacha Tracker",
    description:
      "Track active banners, events, and news for HoYoverse, Kuro, Gryphline, Yostar, and Nexon gacha games.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0f1419",
    theme_color: "#0f1419",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
