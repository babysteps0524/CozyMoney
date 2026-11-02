export interface AgeParts {
  years: number;
  months: number;
  days: number;
}

export function calculateAge(birth: Date, asOf: Date): AgeParts | null {
  if (
    Number.isNaN(birth.getTime()) ||
    Number.isNaN(asOf.getTime()) ||
    birth > asOf
  ) {
    return null;
  }

  let years = asOf.getFullYear() - birth.getFullYear();
  let months = asOf.getMonth() - birth.getMonth();
  let days = asOf.getDate() - birth.getDate();

  if (days < 0) {
    months--;
    days += new Date(asOf.getFullYear(), asOf.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  return { years, months, days };
}
