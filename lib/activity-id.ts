function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

export function buildActivityId(
  scope: string,
  kind: string,
  upstreamId: number | string,
  startTimeSeconds: number,
  name: string,
): string {
  const slug = slugifyName(name) || "item";
  return `${scope}-${kind}-${upstreamId}-${startTimeSeconds}-${slug}`;
}
