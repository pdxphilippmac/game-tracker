"use client";

import { useEffect, useState } from "react";
import { toolbarButton } from "@/lib/game-config";
import { cn } from "@/lib/utils";

const SHOW_AFTER_PX = 480;

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > SHOW_AFTER_PX);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={cn(
        toolbarButton,
        "fixed bottom-5 right-4 z-50 h-10 w-10 justify-center rounded-full p-0 shadow-[0_4px_16px_oklch(0_0_0/0.35)] transition-[opacity,transform] duration-200 motion-reduce:transition-none xl:bottom-8 xl:right-8",
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0",
      )}
    >
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
    </button>
  );
}
