export type FlowLevel = 'none' | 'spotting' | 'light' | 'medium' | 'heavy';

export interface CycleDay {
  date: string; // ISO yyyy-mm-dd
  flow: FlowLevel;
  note?: string;
}

// A few months of history for an established PCOS-focus user (35-day cycle, 6-day period).
const pcosHistory: CycleDay[] = [];
const pcosStart = new Date('2026-02-20');
for (let cycle = 0; cycle < 5; cycle++) {
  const start = new Date(pcosStart);
  start.setDate(start.getDate() + cycle * 35);
  const levels: FlowLevel[] = ['light', 'medium', 'medium', 'heavy', 'medium', 'light'];
  for (let i = 0; i < 6; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    pcosHistory.push({ date: d.toISOString().slice(0, 10), flow: levels[i] });
  }
}

// Regular 28-day cycle history.
const regularHistory: CycleDay[] = [];
const regStart = new Date('2026-03-01');
for (let cycle = 0; cycle < 6; cycle++) {
  const start = new Date(regStart);
  start.setDate(start.getDate() + cycle * 28);
  const levels: FlowLevel[] = ['light', 'medium', 'medium', 'medium', 'light'];
  for (let i = 0; i < 5; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    regularHistory.push({ date: d.toISOString().slice(0, 10), flow: levels[i] });
  }
}

export const cycleHistoryByPersona: Record<string, CycleDay[]> = {
  'pcos@saheli.app': pcosHistory,
  'pregnant@saheli.app': regularHistory.slice(0, 3),
  'new@saheli.app': [],
};

export function getCycleHistory(email: string): CycleDay[] {
  return cycleHistoryByPersona[email] ?? [];
}
