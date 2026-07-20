import { getCycleHistory } from '../mock/cycle';
import { symptomHistory } from '../mock/symptoms';

const USE_MOCK = true;

export interface CycleStats {
  avgLength: number | null;
  avgPeriod: number | null;
  cycleCount: number;
  nextPredictedStart: string | null;
  currentDay: number | null;
}

function computeStats(history: { date: string; flow: string }[]): CycleStats {
  if (history.length === 0) {
    return { avgLength: null, avgPeriod: null, cycleCount: 0, nextPredictedStart: null, currentDay: null };
  }
  const periodDays = history.filter((d) => d.flow !== 'none');
  const starts: string[] = [];
  let prevWasFlow = false;
  const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));
  for (const d of sorted) {
    const isFlow = d.flow !== 'none';
    if (isFlow && !prevWasFlow) starts.push(d.date);
    prevWasFlow = isFlow;
  }
  if (starts.length < 2) {
    return {
      avgLength: null,
      avgPeriod: periodDays.length ? Math.round(periodDays.length / Math.max(1, starts.length)) : null,
      cycleCount: starts.length,
      nextPredictedStart: null,
      currentDay: starts.length ? 1 : null,
    };
  }
  const lengths: number[] = [];
  for (let i = 1; i < starts.length; i++) {
    lengths.push(
      Math.round((new Date(starts[i]).getTime() - new Date(starts[i - 1]).getTime()) / 86400000),
    );
  }
  const avgLength = Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length);
  const lastStart = starts[starts.length - 1];
  const next = new Date(lastStart);
  next.setDate(next.getDate() + avgLength);
  const currentDay =
    Math.floor((Date.now() - new Date(lastStart).getTime()) / 86400000) + 1;
  return {
    avgLength,
    avgPeriod: periodDays.length ? Math.round(periodDays.length / starts.length) : null,
    cycleCount: starts.length,
    nextPredictedStart: next.toISOString().slice(0, 10),
    currentDay,
  };
}

export async function getCycleStats(email: string): Promise<CycleStats> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return computeStats(getCycleHistory(email));
  }
  return computeStats([]);
}

export interface InsightTrend {
  date: string;
  moodScore: number;
  severity: number;
}

export async function getInsightTrends(email: string): Promise<InsightTrend[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    const moodScore: Record<string, number> = {
      calm: 4, happy: 5, anxious: 2, sad: 1, irritable: 2, tired: 2,
    };
    return symptomHistory.map((s) => ({
      date: s.date,
      moodScore: moodScore[s.mood] ?? 3,
      severity: s.severity,
    }));
  }
  return [];
}
