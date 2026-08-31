import { addBusinessDays, isWeekend } from "date-fns";

/** How long Delvex takes from pickup to delivery, weekends excluded. */
export const SHIPMENT_LEAD_TIME_BUSINESS_DAYS = 5;

/**
 * Delivery is never chosen by hand: it is the pickup date plus the lead time,
 * counted in business days.
 */
export function getEstimatedDelivery(pickup: Date): Date {
  return addBusinessDays(pickup, SHIPMENT_LEAD_TIME_BUSINESS_DAYS);
}

export function isBusinessDay(date: Date): boolean {
  return !isWeekend(date);
}

/** The next business day on or after the given date. */
export function toBusinessDay(date: Date): Date {
  const result = new Date(date);

  while (isWeekend(result)) {
    result.setDate(result.getDate() + 1);
  }

  return result;
}

/**
 * The hour every shipment is scheduled at for now. Times are not chosen in the
 * UI, but the API stores an instant, so a stable midday is sent instead.
 */
export const SHIPMENT_SCHEDULE_HOUR = 12;

/** Turns a `YYYY-MM-DD` form value into an instant at local midday. */
export function toShipmentInstant(date: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);

  if (match === null) {
    throw new TypeError(`Expected a YYYY-MM-DD date, received "${date}"`);
  }

  const [, year, month, day] = match;

  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    SHIPMENT_SCHEDULE_HOUR,
  ).toISOString();
}

/** Formats a date for the `YYYY-MM-DD` form value, in the viewer's own zone. */
export function toDateValue(date: Date): string {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/** Parses a `YYYY-MM-DD` form value into a local date. */
export function fromDateValue(value: string): Date | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (match === null) {
    return undefined;
  }

  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  return date.getFullYear() === Number(year) &&
    date.getMonth() === Number(month) - 1 &&
    date.getDate() === Number(day)
    ? date
    : undefined;
}
