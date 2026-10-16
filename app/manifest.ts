import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Intervue — Mock Interview Preparation",
    short_name: "Intervue",
    description: "Practice interviews by voice or text and get candid AI feedback.",
    start_url: "/",
    display: "standalone",
    background_color: "#23382B",
    theme_color: "#1C2E23",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
