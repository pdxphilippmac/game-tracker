"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

export type SectionNavItem = {
  id: string;
  label: string;
};

type SectionNavProps = {
  sections: SectionNavItem[];
  variant: "mobile" | "sidebar";
  className?: string;
};

const HEADER_OFFSET_PX = 62;
const PIN_GAP_PX = 8;

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function useActiveSection(sectionIds: string[]) {
  const [activeId, setActiveId] = useState<string | null>(sectionIds[0] ?? null);
  const sectionKey = sectionIds.join("\u0000");

  useEffect(() => {
    if (sectionIds.length === 0) {
      return;
    }

    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);

    if (elements.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        const nextId = visible[0]?.target.id;
        if (nextId) {
          setActiveId(nextId);
        }
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.15, 0.5, 1] },
    );

    for (const element of elements) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [sectionKey, sectionIds]);

  return activeId;
}

function useScrollPin(variant: "mobile" | "sidebar") {
  const containerRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const [isPinned, setIsPinned] = useState(false);
  const [navHeight, setNavHeight] = useState(0);
  const [pinStyle, setPinStyle] = useState<CSSProperties>({});

  useEffect(() => {
    const update = () => {
      const container = containerRef.current;
      const nav = navRef.current;
      if (!container || !nav) {
        return;
      }

      const height = nav.offsetHeight;
      setNavHeight(height);

      const containerRect = container.getBoundingClientRect();
      const shouldPin = containerRect.top <= HEADER_OFFSET_PX;

      setIsPinned(shouldPin);

      if (shouldPin) {
        if (variant === "mobile") {
          setPinStyle({
            position: "fixed",
            top: HEADER_OFFSET_PX,
            left: 0,
            right: 0,
            width: "100%",
            zIndex: 40,
          });
        } else {
          setPinStyle({
            position: "fixed",
            top: HEADER_OFFSET_PX + PIN_GAP_PX,
            left: containerRect.left,
            width: containerRect.width,
            zIndex: 40,
            maxHeight: `calc(100dvh - ${HEADER_OFFSET_PX + PIN_GAP_PX + 16}px)`,
            overflowY: "auto",
          });
        }
      } else {
        setPinStyle({});
      }
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    const resizeObserver = new ResizeObserver(update);
    if (navRef.current) {
      resizeObserver.observe(navRef.current);
    }
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      resizeObserver.disconnect();
    };
  }, [variant]);

  return { containerRef, navRef, isPinned, navHeight, pinStyle };
}

type SectionNavLinkProps = {
  section: SectionNavItem;
  isActive: boolean;
  onSelect: (id: string) => void;
  layout: "mobile" | "sidebar";
};

function SectionNavLink({ section, isActive, onSelect, layout }: SectionNavLinkProps) {
  if (layout === "sidebar") {
    return (
      <button
        type="button"
        onClick={() => onSelect(section.id)}
        aria-current={isActive ? "true" : undefined}
        className={cn(
          "block w-full border-l-2 py-1.5 pl-3 pr-1 text-left text-sm leading-snug transition-colors",
          isActive
            ? "-ml-px border-[var(--game-accent)] font-medium text-foreground"
            : "-ml-px border-transparent text-muted-foreground hover:text-foreground",
        )}
      >
        {section.label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(section.id)}
      aria-current={isActive ? "true" : undefined}
      className={cn(
        "shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm",
        isActive
          ? "bg-accent text-foreground"
          : "text-muted-foreground hover:bg-accent/70 hover:text-foreground",
      )}
    >
      {section.label}
    </button>
  );
}

function SectionNavLinks({
  sections,
  activeId,
  layout,
}: {
  sections: SectionNavItem[];
  activeId: string | null;
  layout: "mobile" | "sidebar";
}) {
  if (layout === "sidebar") {
    return (
      <ul className="space-y-0.5">
        {sections.map((section) => (
          <li key={section.id}>
            <SectionNavLink
              section={section}
              isActive={activeId === section.id}
              onSelect={scrollToSection}
              layout="sidebar"
            />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="flex gap-1 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {sections.map((section) => (
        <SectionNavLink
          key={section.id}
          section={section}
          isActive={activeId === section.id}
          onSelect={scrollToSection}
          layout="mobile"
        />
      ))}
    </div>
  );
}

export function SectionNav({ sections, variant, className }: SectionNavProps) {
  const activeId = useActiveSection(sections.map((section) => section.id));
  const { containerRef, navRef, isPinned, navHeight, pinStyle } = useScrollPin(variant);

  if (sections.length === 0) {
    return null;
  }

  if (variant === "sidebar") {
    return (
      <div className={cn("section-nav-shell hidden xl:block", className)}>
        <p className="section-title mb-3">On this page</p>
        <div
          ref={containerRef}
          style={{ minHeight: isPinned ? navHeight : undefined }}
        >
          <nav
            ref={navRef}
            aria-label="Page sections"
            style={pinStyle}
            className={cn(
              "section-nav-sidebar-panel",
              !isPinned && "section-nav-sidebar-panel--flow",
            )}
          >
            <SectionNavLinks sections={sections} activeId={activeId} layout="sidebar" />
          </nav>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn("section-nav-shell -mx-4 xl:hidden", className)}
      style={{ minHeight: isPinned ? navHeight : undefined }}
    >
      <nav
        ref={navRef}
        aria-label="Page sections"
        style={pinStyle}
        className={cn("section-nav-bar py-2", isPinned && "section-nav-bar--pinned")}
      >
        <div
          className={cn(
            "px-4",
            isPinned && "container mx-auto max-w-5xl xl:max-w-[76rem]",
          )}
        >
          <SectionNavLinks sections={sections} activeId={activeId} layout="mobile" />
        </div>
      </nav>
    </div>
  );
}
