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
