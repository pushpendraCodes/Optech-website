/** Client-side batch timing helpers (Asia/Kolkata). Mirrors backend batch-timing. */

const DAY_ALIAS: Record<string, number> = {
  sun: 0,
  sunday: 0,
  mon: 1,
  monday: 1,
  tue: 2,
  tues: 2,
  tuesday: 2,
  wed: 3,
  wednesday: 3,
  thu: 4,
  thur: 4,
  thurs: 4,
  thursday: 4,
  fri: 5,
  friday: 5,
  sat: 6,
  saturday: 6,
};

export type ParsedBatchTiming = {
  days: number[];
  startMinutes: number;
  endMinutes: number;
  startTime: string;
  endTime: string;
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function minutesToHhmm(total: number) {
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${pad2(h)}:${pad2(m)}`;
}

export function hhmmToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (Number(h) || 0) * 60 + (Number(m) || 0);
}

function toMinutes(hour: number, minute: number, meridiem?: string | null) {
  let h = hour;
  if (meridiem) {
    const mer = meridiem.toUpperCase();
    if (mer === "AM") {
      if (h === 12) h = 0;
    } else if (mer === "PM") {
      if (h !== 12) h += 12;
    }
  }
  return h * 60 + minute;
}

function expandDayRange(from: number, to: number): number[] {
  const days: number[] = [];
  let d = from;
  for (let i = 0; i < 7; i++) {
    days.push(d);
    if (d === to) break;
    d = (d + 1) % 7;
  }
  return days;
}

function parseDays(raw: string): number[] {
  const text = raw.toLowerCase().replace(/[–—]/g, "-");
  const found = new Set<number>();

  const range = text.match(
    /\b(sun|mon|tue|tues|wed|thu|thur|thurs|fri|sat|sunday|monday|tuesday|wednesday|thursday|friday|saturday)\s*-\s*(sun|mon|tue|tues|wed|thu|thur|thurs|fri|sat|sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/,
  );
  if (range) {
    const from = DAY_ALIAS[range[1]];
    const to = DAY_ALIAS[range[2]];
    if (from !== undefined && to !== undefined) {
      for (const d of expandDayRange(from, to)) found.add(d);
    }
  }

  const tokenRe =
    /\b(sun|mon|tue|tues|wed|thu|thur|thurs|fri|sat|sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/g;
  let m: RegExpExecArray | null;
  while ((m = tokenRe.exec(text))) {
    const idx = DAY_ALIAS[m[1]];
    if (idx !== undefined) found.add(idx);
  }

  if (found.size === 0) return [0, 1, 2, 3, 4, 5, 6];
  return [...found].sort((a, b) => a - b);
}

function parseTimeRange(raw: string): { startMinutes: number; endMinutes: number } | null {
  const text = raw
    .replace(/[–—−]/g, "-")
    .replace(/[.\u00B7]/g, (ch) => (ch === "." ? ":" : " "))
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ");

  const match = text.match(
    /(\d{1,2})\s*[:.]\s*(\d{2})\s*(am|pm)?\s*-\s*(\d{1,2})\s*[:.]\s*(\d{2})\s*(am|pm)?/i,
  );
  if (!match) return null;

  const startH = Number(match[1]);
  const startM = Number(match[2]);
  const endH = Number(match[4]);
  const endM = Number(match[5]);
  let startMer = match[3] ?? null;
  let endMer = match[6] ?? null;

  if (!startMer && endMer) {
    startMer = endMer;
    const trialStart = toMinutes(startH, startM, startMer);
    const trialEnd = toMinutes(endH, endM, endMer);
    if (trialEnd <= trialStart && endMer.toUpperCase() === "PM") {
      startMer = "AM";
      endMer = "PM";
    }
  } else if (startMer && !endMer) {
    endMer = startMer;
  }

  let startMinutes = toMinutes(startH, startM, startMer);
  let endMinutes = toMinutes(endH, endM, endMer);

  if (startMer?.toUpperCase() === "AM" && !match[6] && endMinutes <= startMinutes) {
    endMinutes = toMinutes(endH, endM, "PM");
  }

  if (endMinutes <= startMinutes) endMinutes += 24 * 60;
  return { startMinutes, endMinutes };
}

export function parseBatchTiming(timing: string): ParsedBatchTiming | null {
  if (!timing?.trim()) return null;
  const times = parseTimeRange(timing);
  if (!times) return null;
  return {
    days: parseDays(timing),
    startMinutes: times.startMinutes % (24 * 60),
    endMinutes: times.endMinutes,
    startTime: minutesToHhmm(times.startMinutes % (24 * 60)),
    endTime: minutesToHhmm(times.endMinutes % (24 * 60)),
  };
}

export function indiaNowParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";

  const weekday = get("weekday").toLowerCase().slice(0, 3);
  const day = DAY_ALIAS[weekday] ?? 0;
  const hour = Number(get("hour"));
  const minute = Number(get("minute"));
  const second = Number(get("second"));
  return { day, minutes: hour * 60 + minute, second };
}

export function isTimingActiveNow(
  parsed: ParsedBatchTiming,
  now = indiaNowParts(),
): boolean {
  if (!parsed.days.includes(now.day)) return false;
  const start = parsed.startMinutes;
  let end = parsed.endMinutes;
  if (end <= start) end += 24 * 60;
  const cur = now.minutes;
  if (end > 24 * 60) {
    return cur >= start || cur < end % (24 * 60);
  }
  return cur >= start && cur < end;
}

/** Elapsed % for a session window using India time (supports overnight). */
export function progressForWindow(startTime: string, endTime: string, now = indiaNowParts()): number {
  const start = hhmmToMinutes(startTime);
  let end = hhmmToMinutes(endTime);
  if (end <= start) end += 24 * 60;
  let cur = now.minutes + (now.second ?? 0) / 60;
  if (end > 24 * 60 && cur < start) cur += 24 * 60;
  if (cur <= start) return 0;
  if (cur >= end) return 100;
  return Math.max(0, Math.min(100, Math.round(((cur - start) / (end - start)) * 100)));
}

export function formatIndiaWallClock(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h12",
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "00";

  const hour = get("hour").padStart(2, "0");
  const minute = get("minute").padStart(2, "0");
  const second = get("second").padStart(2, "0");
  const dayPeriod = (get("dayPeriod") || "AM").toUpperCase();
  return `${hour}:${minute}:${second} ${dayPeriod}`;
}
