export const APP_LOCALE = "en-US";

export const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "short",
  year: "numeric",
};

export const DATE_TIME_FORMAT: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};

export function formatDate(
  value: number | Date | string,
  options: Intl.DateTimeFormatOptions = DATE_FORMAT,
): string {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString(APP_LOCALE, options);
}

export function formatDateTime(
  value: number | Date | string,
  options: Intl.DateTimeFormatOptions = DATE_TIME_FORMAT,
): string {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleString(APP_LOCALE, options);
}
