import { createFileRoute } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const Experience = lazy(() => import("@/purrfolio/Experience.jsx"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kashish — Tap the Cat" },
      { name: "description", content: "A cozy interactive cat types, crashes, and learns to listen. Kashish's animated portfolio." },
      { property: "og:title", content: "Kashish — Tap the Cat" },
      { property: "og:description", content: "Meet the animated cat behind Kashish's interactive portfolio." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <ClientOnly fallback={<div className="app-bg" />}>
      <Suspense fallback={<div className="app-bg" />}>
        <Experience />
      </Suspense>
    </ClientOnly>
  );
}
