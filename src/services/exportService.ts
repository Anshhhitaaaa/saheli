import type { CycleStats } from './cycleService';
import { getCycleHistory, type CycleDay } from '../mock/cycle';
import { symptomHistory, type SymptomEntry } from '../mock/symptoms';

export interface DoctorSummaryData {
  generatedAt: string;
  cycleStats: CycleStats | null;
  cycleHistory: CycleDay[];
  symptomHistory: SymptomEntry[];
  cycleLengths: { label: string; days: number }[];
  notes: string;
}

export function buildDoctorSummary(
  email: string,
  stats: CycleStats | null,
  notes = '',
): DoctorSummaryData {
  const history = getCycleHistory(email);
  const starts: string[] = [];
  let prev = false;
  for (const d of [...history].sort((a, b) => a.date.localeCompare(b.date))) {
    const isFlow = d.flow !== 'none';
    if (isFlow && !prev) starts.push(d.date);
    prev = isFlow;
  }
  const cycleLengths: { label: string; days: number }[] = [];
  for (let i = 1; i < starts.length; i++) {
    const days = Math.round(
      (new Date(starts[i]).getTime() - new Date(starts[i - 1]).getTime()) / 86400000,
    );
    cycleLengths.push({ label: 'Cycle ' + i, days });
  }
  return {
    generatedAt: new Date().toISOString(),
    cycleStats: stats,
    cycleHistory: history,
    symptomHistory,
    cycleLengths,
    notes,
  };
}

/**
 * Opens a print-friendly window with the doctor-visit summary.
 * The browser's print dialog lets the user save as PDF or print.
 */
export function printDoctorSummary(data: DoctorSummaryData, userName: string) {
  const w = window.open('', '_blank', 'width=800,height=900');
  if (!w) return;
  const flowLabel: Record<string, string> = {
    none: '—', spotting: 'Spotting', light: 'Light', medium: 'Medium', heavy: 'Heavy',
  };
  const moodLabel: Record<string, string> = {
    calm: 'Calm', happy: 'Happy', anxious: 'Anxious', sad: 'Sad', irritable: 'Irritable', tired: 'Tired',
  };
  const rows = data.cycleHistory
    .map((d) => `<tr><td>${d.date}</td><td>${flowLabel[d.flow] ?? d.flow}</td></tr>`)
    .join('');
  const symptomRows = data.symptomHistory
    .map(
      (s) =>
        `<tr><td>${s.date}</td><td>${moodLabel[s.mood] ?? s.mood}</td><td>${s.symptoms.join(', ')}</td><td>${s.severity}/5</td><td>${s.redFlag ? 'Flagged' : ''}</td></tr>`,
    )
    .join('');
  const cycleLenRows = data.cycleLengths
    .map((c) => `<tr><td>${c.label}</td><td>${c.days} days</td></tr>`)
    .join('');
  w.document.write(`<!doctype html><html><head><title>Saheli — Doctor Visit Summary</title>
  <style>
    body { font-family: Georgia, serif; color: #3A2F22; max-width: 720px; margin: 2rem auto; padding: 0 1rem; }
    h1 { color: #B84A34; font-size: 1.6rem; margin-bottom: 0.25rem; }
    .sub { color: #735C3E; margin-bottom: 1.5rem; font-size: 0.9rem; }
    h2 { color: #973A28; font-size: 1.15rem; margin-top: 1.5rem; border-bottom: 1px solid #EADFCF; padding-bottom: 0.25rem; }
    table { width: 100%; border-collapse: collapse; font-size: 0.85rem; margin-top: 0.5rem; }
    th { text-align: left; padding: 0.4rem; background: #F5EFE7; font-weight: 600; }
    td { padding: 0.4rem; border-bottom: 1px solid #F5EFE7; }
    .stats { display: flex; gap: 1.5rem; flex-wrap: wrap; margin: 0.5rem 0; }
    .stat { background: #FBF8F4; padding: 0.75rem 1rem; border-radius: 8px; }
    .stat b { display: block; font-size: 1.1rem; color: #B84A34; }
    .stat span { font-size: 0.75rem; color: #735C3E; }
    .note { background: #EEF4F0; border-left: 3px solid #477459; padding: 0.75rem 1rem; border-radius: 4px; margin-top: 0.5rem; font-size: 0.9rem; }
    .footer { margin-top: 2rem; font-size: 0.75rem; color: #B0905F; border-top: 1px solid #EADFCF; padding-top: 0.5rem; }
    @media print { body { margin: 1rem; } }
  </style></head><body>
  <h1>Saheli — Doctor Visit Summary</h1>
  <div class="sub">Prepared for ${userName} · ${new Date(data.generatedAt).toLocaleDateString('en-US', { dateStyle: 'full' })}</div>

  <h2>Cycle overview</h2>
  <div class="stats">
    <div class="stat"><b>${data.cycleStats?.avgLength ?? '—'} days</b><span>Avg cycle length</span></div>
    <div class="stat"><b>${data.cycleStats?.avgPeriod ?? '—'} days</b><span>Avg period length</span></div>
    <div class="stat"><b>${data.cycleStats?.cycleCount ?? 0}</b><span>Cycles tracked</span></div>
    <div class="stat"><b>${data.cycleStats?.nextPredictedStart ?? '—'}</b><span>Next predicted</span></div>
  </div>

  ${cycleLenRows ? `<h2>Cycle length history</h2><table><thead><tr><th>Cycle</th><th>Length</th></tr></thead><tbody>${cycleLenRows}</tbody></table>` : ''}

  <h2>Period history</h2>
  <table><thead><tr><th>Date</th><th>Flow</th></tr></thead><tbody>${rows || '<tr><td colspan="2">No entries logged.</td></tr>'}</tbody></table>

  <h2>Symptom & mood log</h2>
  <table><thead><tr><th>Date</th><th>Mood</th><th>Symptoms</th><th>Severity</th><th>Flag</th></tr></thead><tbody>${symptomRows || '<tr><td colspan="5">No entries logged.</td></tr>'}</tbody></table>

  ${data.notes ? `<h2>Notes for your doctor</h2><div class="note">${data.notes}</div>` : ''}

  <div class="footer">Generated by Saheli. This summary is a record of what you tracked — it is educational, not a diagnosis. Please discuss any concerns with your healthcare provider.</div>
  <script>window.onload = () => window.print();</script>
  </body></html>`);
  w.document.close();
}
