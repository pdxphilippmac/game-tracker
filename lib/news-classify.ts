import type { AnnouncementKind } from "@/lib/types";

export function classifyAnnouncementKind(
  title: string,
  description = ""
): AnnouncementKind {
  const text = `${title} ${description}`.toLowerCase();

  if (
    text.includes("special program") ||
    text.includes("special broadcast") ||
    text.includes("livestream") ||
    text.includes("will officially air")
  ) {
    return "special_program";
  }

  if (
    text.includes("maintenance") ||
    text.includes("pre-installation") ||
    text.includes("pre-install") ||
    text.includes("will not be able to log in")
  ) {
    return "maintenance";
  }

  if (
    text.includes("event warp") ||
    text.includes("limited-time channel") ||
    text.includes("signal search") ||
    text.includes("featured resonator") ||
    text.includes("featured convene") ||
    text.includes("convene:")
  ) {
    return "banner_info";
  }

  if (
    text.includes("version") &&
    (text.includes("update") ||
      text.includes("details") ||
      text.includes("announcement"))
  ) {
    return "patch";
  }

  return "general";
}

export function isAnnouncementKind(kind: AnnouncementKind): boolean {
  return kind !== "general";
}

export const ANNOUNCEMENT_LABELS: Record<AnnouncementKind, string> = {
  patch: "Patch",
  maintenance: "Maintenance",
  special_program: "Special Program",
  banner_info: "Banner Info",
  general: "News",
};
