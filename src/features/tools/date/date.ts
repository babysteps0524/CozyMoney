const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

function toCalendarDay(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

export function calculateDateDifference(start: Date, end: Date): number | null {
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;

  // Compare calendar dates, not elapsed milliseconds, so daylight-saving changes do not shift the day count.
  return Math.round(
    Math.abs(toCalendarDay(end) - toCalendarDay(start)) / MILLISECONDS_PER_DAY,
  );
}
