const USE_MOCK = true;

export interface CalendarEvent {
  title: string;
  date: string; // ISO yyyy-mm-dd
  allDay: boolean;
}

/**
 * Generates an ICS file for importing predicted periods / fertile windows into
 * Google Calendar, Apple Calendar, or any CalDAV client.
 */
export function generateICS(events: CalendarEvent[], calendarName = 'Saheli'): string {
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Saheli//Health Calendar//EN',
    `X-WR-CALNAME:${calendarName}`,
  ];
  for (const ev of events) {
    const day = ev.date.replace(/-/g, '');
    const next = new Date(ev.date);
    next.setDate(next.getDate() + 1);
    const nextDay = next.toISOString().slice(0, 10).replace(/-/g, '');
    lines.push(
      'BEGIN:VEVENT',
      `UID:${ev.date}@saheli`,
      `DTSTAMP:${now}`,
      `DTSTART;VALUE=DATE:${day}`,
      `DTEND;VALUE=DATE:${nextDay}`,
      `SUMMARY:${ev.title}`,
      'END:VEVENT',
    );
  }
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export function downloadICS(events: CalendarEvent[], filename = 'saheli-calendar.ics') {
  const ics = generateICS(events);
  const blob = new Blob([ics], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export interface WearableDataPoint {
  date: string;
  restingHeartRate?: number;
  sleepHours?: number;
  skinTempC?: number;
  steps?: number;
}

/**
 * Wearable integration stub. In production this would connect to Apple HealthKit /
 * Google Fit via native bridges or OAuth. Mock returns simulated data.
 */
export async function getWearableData(days = 14): Promise<WearableDataPoint[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    const out: WearableDataPoint[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      out.push({
        date: d.toISOString().slice(0, 10),
        restingHeartRate: 62 + Math.round(Math.sin(i / 2) * 3 + Math.random() * 2),
        sleepHours: Number((7 + Math.sin(i / 3) * 1.2 + Math.random() * 0.5).toFixed(1)),
        skinTempC: Number((36.4 + Math.sin(i / 4) * 0.15).toFixed(2)),
        steps: 4000 + Math.round(Math.random() * 6000),
      });
    }
    return out;
  }
  return [];
}

export const wearableConnected = false; // stub toggle
