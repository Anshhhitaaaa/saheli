import { getCycleHistory } from '../mock/cycle';
import { symptomHistory } from '../mock/symptoms';
import { api } from './api';

export interface CycleStats {
  avgLength: number | null;
  avgPeriod: number | null;
  cycleCount: number;
  nextPredictedStart: string | null;
  currentDay: number | null;
}

export function computeStats(history: { date: string; flow: string }[], defaultCycleLength = 28): CycleStats {
  if (!history || history.length === 0) {
    return { avgLength: null, avgPeriod: null, cycleCount: 0, nextPredictedStart: null, currentDay: null };
  }
  const periodDays = history.filter((d) => d.flow && d.flow !== 'none');
  if (periodDays.length === 0) {
    return { avgLength: null, avgPeriod: null, cycleCount: 0, nextPredictedStart: null, currentDay: null };
  }

  const starts: string[] = [];
  let prevWasFlow = false;
  const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));
  for (const d of sorted) {
    const isFlow = !!(d.flow && d.flow !== 'none');
    if (isFlow && !prevWasFlow) starts.push(d.date);
    prevWasFlow = isFlow;
  }

  if (starts.length === 0) {
    return { avgLength: null, avgPeriod: null, cycleCount: 0, nextPredictedStart: null, currentDay: null };
  }

  const lastStart = starts[starts.length - 1];
  const lastStartDate = new Date(lastStart);
  const today = new Date();
  const currentDay = Math.max(1, Math.floor((today.getTime() - lastStartDate.getTime()) / 86400000) + 1);

  if (starts.length < 2) {
    const nextPred = new Date(lastStartDate);
    nextPred.setDate(nextPred.getDate() + defaultCycleLength);
    return {
      avgLength: defaultCycleLength,
      avgPeriod: periodDays.length,
      cycleCount: 1,
      nextPredictedStart: nextPred.toISOString().slice(0, 10),
      currentDay,
    };
  }

  const lengths: number[] = [];
  for (let i = 1; i < starts.length; i++) {
    const diff = Math.round((new Date(starts[i]).getTime() - new Date(starts[i - 1]).getTime()) / 86400000);
    if (diff > 10 && diff < 90) {
      lengths.push(diff);
    }
  }

  const avgLength = lengths.length > 0 ? Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length) : defaultCycleLength;
  const avgPeriod = Math.round(periodDays.length / starts.length);
  const next = new Date(lastStartDate);
  next.setDate(next.getDate() + avgLength);

  return {
    avgLength,
    avgPeriod,
    cycleCount: starts.length,
    nextPredictedStart: next.toISOString().slice(0, 10),
    currentDay,
  };
}

export async function getCycleStats(email: string, history?: { date: string; flow: string }[]): Promise<CycleStats> {
  if (history) {
    return computeStats(history);
  }
  try {
    const res = await api.cycle.get(email);
    if (res && Array.isArray(res.logs)) {
      return computeStats(res.logs);
    }
  } catch {}
  return computeStats(getCycleHistory(email));
}

export interface InsightTrend {
  date: string;
  moodScore: number;
  severity: number;
}

export async function getInsightTrends(email: string): Promise<InsightTrend[]> {
  try {
    const res = await api.symptoms.get(email);
    if (res && Array.isArray(res.logs)) {
      const moodScore: Record<string, number> = {
        calm: 4, happy: 5, anxious: 2, sad: 1, irritable: 2, tired: 2,
      };
      return res.logs.map((s: any) => ({
        date: s.date,
        moodScore: moodScore[s.mood] ?? 3,
        severity: s.severity || 3,
      }));
    }
  } catch {}

  const moodScore: Record<string, number> = {
    calm: 4, happy: 5, anxious: 2, sad: 1, irritable: 2, tired: 2,
  };
  return symptomHistory.map((s) => ({
    date: s.date,
    moodScore: moodScore[s.mood] ?? 3,
    severity: s.severity,
  }));
}
