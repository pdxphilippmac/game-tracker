import type { Metadata } from "next";
import { TimelinePageClient } from "@/components/timeline-page-client";

export const metadata: Metadata = {
  title: "Cross-game Timeline",
  description: "Banner and event timeline across all tracked gacha games.",
};

export default function TimelinePage() {
  return <TimelinePageClient />;
}
