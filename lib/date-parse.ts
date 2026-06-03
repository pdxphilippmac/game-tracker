export type ParsedDateRange = {
  startTime: number;
  endTime: number;
};

function parseSlashDateTime(
  datePart: string,
  timePart = "00:00",
  utcOffsetHours = 8
): number {
  const [year, month, day] = datePart.split("/").map(Number);
  const [hours, minutes] = timePart.split(":").map(Number);
  const utcMs = Date.UTC(year, month - 1, day, hours - utcOffsetHours, minutes);
  return utcMs;
}

const DATE_RANGE_PATTERNS: Array<{
  regex: RegExp;
  utcOffsetHours: number;
}> = [
  {
    regex:
      /(\d{4}\/\d{1,2}\/\d{1,2})\s+(\d{1,2}:\d{2})\s*(?:\([^)]+\))?\s*[–—-]\s*(\d{4}\/\d{1,2}\/\d{1,2})\s+(\d{1,2}:\d{2})/,
    utcOffsetHours: 8,
  },
  {
    regex:
      /(\d{4}\/\d{1,2}\/\d{1,2})\s*-\s*(\d{4}\/\d{1,2}\/\d{1,2})\s+(\d{1,2}:\d{2})/,
    utcOffsetHours: 8,
  },
  {
    regex:
      /from[^0-9]*(\d{4}\/\d{1,2}\/\d{1,2})\s*-\s*(\d{4}\/\d{1,2}\/\d{1,2})\s+(\d{1,2}:\d{2})/i,
    utcOffsetHours: 8,
  },
];

export function parseDateRangeFromText(text: string): ParsedDateRange | null {
  for (const { regex, utcOffsetHours } of DATE_RANGE_PATTERNS) {
    const match = text.match(regex);
    if (!match) continue;

    if (match.length === 5) {
      return {
        startTime: parseSlashDateTime(match[1], match[2], utcOffsetHours),
        endTime: parseSlashDateTime(match[3], match[4], utcOffsetHours),
      };
    }

    if (match.length === 4) {
      return {
        startTime: parseSlashDateTime(match[1], "00:00", utcOffsetHours),
        endTime: parseSlashDateTime(match[2], match[3], utcOffsetHours),
      };
    }
  }

  return null;
}

export function parseSingleDateFromText(text: string): number | null {
  const updateMatch = text.match(
    /(\d{4}\/\d{1,2}\/\d{1,2})\s+(\d{1,2}:\d{2})\s*\(UTC\+8\)/i
  );
  if (updateMatch) {
    return parseSlashDateTime(updateMatch[1], updateMatch[2], 8);
  }

  const simpleMatch = text.match(/(\d{4}\/\d{1,2}\/\d{1,2})\s+(\d{1,2}:\d{2})/);
  if (simpleMatch) {
    return parseSlashDateTime(simpleMatch[1], simpleMatch[2], 8);
  }

  return null;
}

export function parseLauncherDate(mmDd: string, referenceYear?: number): number {
  const year = referenceYear ?? new Date().getFullYear();
  const [month, day] = mmDd.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}
