// src/app/manifest.js — Next.js App Router serves this at /manifest.webmanifest
// and auto-injects <link rel="manifest"> into every page. No <head> edits needed.
export default function manifest() {
  return {
    name: "GymTrack — Workout Tracker",
    short_name: "GymTrack",
    description:
      "Log workouts by tapping muscle groups on an interactive anatomy map. Track volume, streaks, and personal records.",
    id: "/",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#07090d",
    theme_color: "#07090d",
    categories: ["health", "fitness", "sports"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
