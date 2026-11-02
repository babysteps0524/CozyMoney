const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

function toCalendarDay(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

export function calculateDday(target: Date, today: Date): number | null {
  if (Number.isNaN(target.getTime()) || Number.isNaN(today.getTime()))
    return null;

  return (toCalendarDay(target) - toCalendarDay(today)) / MILLISECONDS_PER_DAY;
}
