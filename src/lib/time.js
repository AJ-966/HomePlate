// Turns slot times into words. Dates are local to the student's device.

const timeFormat = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });
const dayFormat = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" });

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** "Today", "Tomorrow" or "Thu, Nov 19" */
export function dayLabel(date, now) {
  if (sameDay(date, now)) return "Today";
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return sameDay(date, tomorrow) ? "Tomorrow" : dayFormat.format(date);
}

/** "2:00 PM to 3:00 PM" */
export function slotRange(startIso) {
  const start = new Date(startIso);
  return `${timeFormat.format(start)} to ${timeFormat.format(new Date(start.getTime() + 60 * 60 * 1000))}`;
}

/** "Today, 2:00 PM to 3:00 PM" */
export function slotLabel(startIso, now) {
  return `${dayLabel(new Date(startIso), now)}, ${slotRange(startIso)}`;
}

/** "Today at 12:00 PM" */
export function timeLabel(iso, now) {
  const date = new Date(iso);
  return `${dayLabel(date, now)} at ${timeFormat.format(date)}`;
}

/** Time left as words: 5400000 -> "1 h 30 min", 610000 -> "10 min 10 s", 4000 -> "4 s". */
export function formatRemaining(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h} h ${m} min`;
  if (m > 0) return `${m} min ${s} s`;
  return `${s} s`;
}
