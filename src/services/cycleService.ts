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
      const validLogs = res.logs
        .filter((l): l is typeof l & { date: string; flow: string } => Boolean(l.date && l.flow))
        .map((l) => ({ date: l.date!, flow: l.flow! }));
      return computeStats(validLogs);
    }
  } catch {}
  return computeStats(getCycleHistory(email));
}

export interface InsightTrend {
  date: string;
  mood: string;
  moodLabel: string;
  moodScore: number;
  severity: number;
}

export async function getInsightTrends(email: string): Promise<InsightTrend[]> {
  const moodScoreMap: Record<string, number> = {
    happy: 5, calm: 4, tired: 3, anxious: 2, irritable: 2, sad: 1,
  };

  try {
    const res = await api.symptoms.get(email);
    if (res && Array.isArray(res.logs) && res.logs.length > 0) {
      // Sort chronologically by date (oldest to newest)
      const validLogs = res.logs
        .filter((s: any) => s.date && (s.mood || s.severity))
        .sort((a: any, b: any) => String(a.date).localeCompare(String(b.date)));

      if (validLogs.length > 0) {
        return validLogs.map((s: any) => {
          const m = s.mood ? String(s.mood).toLowerCase() : 'calm';
          const capitalized = m.charAt(0).toUpperCase() + m.slice(1);
          return {
            date: s.date,
            mood: m,
            moodLabel: capitalized,
            moodScore: moodScoreMap[m] ?? 3,
            severity: Number(s.severity) || 3,
          };
        });
      }
    }
  } catch (err) {
    console.error('Error fetching symptom mood trends from PostgreSQL:', err);
  }

  // Fallback if database is completely empty
  return symptomHistory.map((s) => ({
    date: s.date,
    mood: s.mood,
    moodLabel: s.mood.charAt(0).toUpperCase() + s.mood.slice(1),
    moodScore: moodScoreMap[s.mood] ?? 3,
    severity: s.severity,
  }));
}
