import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Calendar, ClipboardList, TrendingUp, Printer, Check, Eye } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Disclaimer } from '../components/common/Disclaimer';
import { useAuth } from '../context/AuthContext';
import { getCycleStats, type CycleStats } from '../services/cycleService';
import { buildDoctorSummary, printDoctorSummary, type DoctorSummaryData } from '../services/exportService';
import { downloadICS, type CalendarEvent } from '../services/calendarService';
import { fadeUp, staggerContainer } from '../animations/variants';
import { api } from '../services/api';
import type { CycleDay } from '../mock/cycle';

export function DoctorSummaryPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<CycleStats | null>(null);
  const [cycleLogs, setCycleLogs] = useState<CycleDay[]>([]);
  const [symptomLogs, setSymptomLogs] = useState<any[]>([]);
  const [notes, setNotes] = useState(() => localStorage.getItem('saheli_doctor_notes') || '');
  const [loading, setLoading] = useState(true);
  const [previewData, setPreviewData] = useState<DoctorSummaryData | null>(null);
  const [calendarDownloaded, setCalendarDownloaded] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!user?.email) return;
      try {
        const [s, cycleRes, sympRes] = await Promise.all([
          getCycleStats(user.email),
          api.cycle.get(user.email).catch(() => ({ logs: [] })),
          api.symptoms.get(user.email).catch(() => ({ logs: [] })),
        ]);
        if (active) {
          setStats(s);
          if (cycleRes && Array.isArray(cycleRes.logs)) setCycleLogs(cycleRes.logs);
          if (sympRes && Array.isArray(sympRes.logs)) setSymptomLogs(sympRes.logs);
          setLoading(false);
        }
      } catch {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [user?.email]);

  const handleNotesChange = (val: string) => {
    setNotes(val);
    localStorage.setItem('saheli_doctor_notes', val);
  };

  const handleGenerate = () => {
    if (!user) return;
    const data = buildDoctorSummary(user.email, stats, notes, cycleLogs, symptomLogs);
    setPreviewData(data);
  };

  const handlePrint = () => {
    if (!user || !previewData) return;
    const displayName = user.username ? `@${user.username}` : user.name;
    printDoctorSummary(previewData, displayName);
  };

  const handleCalendar = () => {
    if (!stats?.nextPredictedStart) return;
    const events: CalendarEvent[] = [
      { title: 'Predicted Period (Saheli)', date: stats.nextPredictedStart, allDay: true },
    ];
    downloadICS(events);
    setCalendarDownloaded(true);
    setTimeout(() => setCalendarDownloaded(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-clay-300 border-t-clay-600" />
        <p className="mt-3 text-sm text-sand-500">Preparing doctor summary…</p>
      </div>
    );
  }

  const displayName = user ? (user.username ? `@${user.username}` : user.name) : 'Patient';

  return (
    <div className="mx-auto max-w-3xl">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        <motion.h1 variants={fadeUp} className="font-display text-3xl font-600 text-sand-900 dark:text-sand-100 sm:text-4xl">
          Doctor-visit summary
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-2 text-sand-600 dark:text-sand-300">
          One tap to bring your tracked data to your appointment — as a printable PDF or calendar export.
        </motion.p>
      </motion.div>

      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mt-8 space-y-4">
        {/* Included Data Summary */}
        <motion.div variants={fadeUp}>
          <Card>
            <h2 className="flex items-center gap-2 font-600 text-sand-900 dark:text-sand-100">
              <FileText className="h-5 w-5 text-clay-500" /> Included in Report
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-sand-600 dark:text-sand-400">
              <li className="flex items-center gap-2"><ClipboardList className="h-4 w-4 text-sage-500" /> Cycle history & logged flow intensity ({cycleLogs.length} entries)</li>
              <li className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-sage-500" /> Cycle length averages ({stats?.avgLength ?? 28} days avg)</li>
              <li className="flex items-center gap-2"><ClipboardList className="h-4 w-4 text-sage-500" /> Symptom & mood logs ({symptomLogs.length} entries)</li>
              <li className="flex items-center gap-2"><FileText className="h-4 w-4 text-sage-500" /> Custom notes for your doctor</li>
            </ul>
          </Card>
        </motion.div>

        {/* Doctor Notes Input */}
        <motion.div variants={fadeUp}>
          <Card>
            <label htmlFor="notes" className="mb-1.5 block text-sm font-600 text-sand-800 dark:text-sand-200">
              Notes for your doctor (optional)
            </label>
            <textarea
              id="notes"
              rows={4}
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              className="input-base resize-none text-sm bg-white dark:bg-sand-900 border-sand-200 dark:border-sand-700"
              placeholder="e.g. My cramps have been severe for the last two cycles. I would like to discuss options for PCOS or endometriosis screening."
            />
            <p className="mt-2 text-xs text-sand-500 dark:text-sand-400">
              These notes will appear at the top of your generated PDF summary report.
            </p>
          </Card>
        </motion.div>

        {/* Action Cards */}
        <motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-2">
          <Card className="flex flex-col justify-between gap-3">
            <div>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-clay-50 text-clay-600 dark:bg-clay-800/40 dark:text-clay-200">
                <Printer className="h-5 w-5" />
              </span>
              <h3 className="mt-3 font-600 text-sand-900 dark:text-sand-100">Generate & Print PDF</h3>
              <p className="mt-1 text-sm text-sand-600 dark:text-sand-400">
                Creates a print-ready report. Save as PDF or print directly.
              </p>
            </div>
            <Button onClick={handleGenerate} leftIcon={<Eye className="h-4 w-4" />}>
              Generate Report Preview
            </Button>
          </Card>

          <Card className="flex flex-col justify-between gap-3">
            <div>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sage-50 text-sage-600 dark:bg-sage-800/30 dark:text-sage-200">
                <Calendar className="h-5 w-5" />
              </span>
              <h3 className="mt-3 font-600 text-sand-900 dark:text-sand-100">Add to Calendar</h3>
              <p className="mt-1 text-sm text-sand-600 dark:text-sand-400">
                Export predicted cycle dates as an .ics file for Google or Apple Calendar.
              </p>
            </div>
            <Button variant="outline" onClick={handleCalendar} disabled={!stats?.nextPredictedStart} leftIcon={calendarDownloaded ? <Check className="h-4 w-4" /> : <Calendar className="h-4 w-4" />}>
              {calendarDownloaded ? 'Calendar Exported!' : 'Export .ics Calendar'}
            </Button>
          </Card>
        </motion.div>
      </motion.div>

      {/* Preview & Print Modal */}
      <Modal open={!!previewData} onClose={() => setPreviewData(null)} title="Doctor Visit Summary Preview" size="lg">
        {previewData && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-sand-200 bg-sand-50 p-4 dark:border-sand-700 dark:bg-sand-800/50">
              <div className="flex items-center justify-between border-b border-sand-200/60 pb-3 dark:border-sand-700/60">
                <div>
                  <h3 className="font-display text-xl font-600 text-clay-700 dark:text-clay-300">Saheli Health Summary</h3>
                  <p className="text-xs text-sand-500">Prepared for {displayName} · {new Date(previewData.generatedAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}</p>
                </div>
                <span className="rounded-full bg-clay-100 px-3 py-1 text-xs font-600 text-clay-700 dark:bg-clay-800 dark:text-clay-200">
                  Ready to Print
                </span>
              </div>

              {/* Stats Overview */}
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl bg-white p-3 shadow-xs dark:bg-sand-900">
                  <span className="block text-lg font-700 text-clay-600 dark:text-clay-300">{previewData.cycleStats?.avgLength ?? 28} days</span>
                  <span className="text-xs text-sand-500">Avg Cycle Length</span>
                </div>
                <div className="rounded-xl bg-white p-3 shadow-xs dark:bg-sand-900">
                  <span className="block text-lg font-700 text-clay-600 dark:text-clay-300">{previewData.cycleStats?.avgPeriod ?? 5} days</span>
                  <span className="text-xs text-sand-500">Avg Period Length</span>
                </div>
                <div className="rounded-xl bg-white p-3 shadow-xs dark:bg-sand-900">
                  <span className="block text-lg font-700 text-clay-600 dark:text-clay-300">{previewData.cycleHistory.length}</span>
                  <span className="text-xs text-sand-500">Cycles Tracked</span>
                </div>
                <div className="rounded-xl bg-white p-3 shadow-xs dark:bg-sand-900">
                  <span className="block text-lg font-700 text-clay-600 dark:text-clay-300">{previewData.cycleStats?.nextPredictedStart ?? '—'}</span>
                  <span className="text-xs text-sand-500">Next Predicted</span>
                </div>
              </div>

              {/* Doctor Notes Section */}
              {previewData.notes && (
                <div className="mt-4 rounded-xl border-l-4 border-sage-500 bg-sage-50/80 p-3 text-sm text-sage-900 dark:bg-sage-900/30 dark:text-sage-200">
                  <strong className="block text-xs font-600 uppercase text-sage-700 dark:text-sage-300">Doctor Notes & Questions:</strong>
                  <p className="mt-1 leading-relaxed">{previewData.notes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-sand-200 dark:border-sand-700">
              <Button variant="ghost" onClick={() => setPreviewData(null)}>Cancel</Button>
              <Button variant="primary" leftIcon={<Printer className="h-4 w-4" />} onClick={handlePrint}>
                Print / Save PDF Now
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <div className="mt-8">
        <Disclaimer />
      </div>
    </div>
  );
}
