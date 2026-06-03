"use client";

export type SectionNavItem = {
  id: string;
  label: string;
};

type SectionNavProps = {
  sections: SectionNavItem[];
};

export function SectionNav({ sections }: SectionNavProps) {
  if (sections.length === 0) {
    return null;
  }

  function scrollToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <nav
      aria-label="Page sections"
      className="sticky top-[4.25rem] z-40 -mx-4 border-b border-border/40 bg-background/80 px-4 py-2 backdrop-blur-md sm:-mx-0 sm:rounded-xl sm:border sm:px-3"
    >
      <div className="flex gap-1 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => scrollToSection(section.id)}
            className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm"
          >
            {section.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
