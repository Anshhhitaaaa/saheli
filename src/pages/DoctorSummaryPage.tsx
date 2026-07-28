import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Calendar, ClipboardList, TrendingUp, Printer } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Disclaimer } from '../components/common/Disclaimer';
import { useAuth } from '../context/AuthContext';
import { getCycleStats, type CycleStats } from '../services/cycleService';
import { buildDoctorSummary, printDoctorSummary } from '../services/exportService';
import { downloadICS, type CalendarEvent } from '../services/calendarService';
import { fadeUp, staggerContainer } from '../animations/variants';

import { api } from '../services/api';
import type { CycleDay } from '../mock/cycle';

export function DoctorSummaryPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<CycleStats | null>(null);
  const [cycleLogs, setCycleLogs] = useState<CycleDay[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!user) return;
      try {
        const [s, res] = await Promise.all([
          getCycleStats(user.email),
          api.cycle.get(user.email).catch(() => ({ logs: [] })),
        ]);
        if (active) {
          setStats(s);
          if (res && Array.isArray(res.logs)) setCycleLogs(res.logs);
          setLoading(false);
        }
      } catch {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [user]);

  const handlePrint = () => {
    if (!user) return;
    const data = buildDoctorSummary(user.email, stats, notes, cycleLogs);
    printDoctorSummary(data, user.name);
  };

  const handleCalendar = () => {
    if (!stats?.nextPredictedStart) return;
    const events: CalendarEvent[] = [
      { title: 'Predicted period (Saheli)', date: stats.nextPredictedStart, allDay: true },
    ];
    downloadICS(events);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-clay-300 border-t-clay-600" />
      </div>
    );
  }

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
        <motion.div variants={fadeUp}>
          <Card>
            <h2 className="flex items-center gap-2 font-600 text-sand-900 dark:text-sand-100">
              <FileText className="h-5 w-5 text-clay-500" /> What is included
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-sand-600 dark:text-sand-400">
              <li className="flex items-center gap-2"><ClipboardList className="h-4 w-4 text-sage-500" /> Cycle history and flow entries</li>
              <li className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-sage-500" /> Cycle length trends and averages</li>
              <li className="flex items-center gap-2"><ClipboardList className="h-4 w-4 text-sage-500" /> Symptom and mood log</li>
              <li className="flex items-center gap-2"><FileText className="h-4 w-4 text-sage-500" /> Any notes you add below</li>
            </ul>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card>
            <label htmlFor="notes" className="mb-1.5 block text-sm font-600 text-sand-800 dark:text-sand-200">
              Notes for your doctor (optional)
            </label>
            <textarea
              id="notes"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-base resize-none"
              placeholder="e.g. My cramps have been worse the last two cycles. I would like to discuss options."
            />
            <p className="mt-2 text-xs text-sand-500 dark:text-sand-400">
              These notes appear in a dedicated section of your printed summary.
            </p>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-2">
          <Card className="flex flex-col items-start gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-clay-50 text-clay-600 dark:bg-clay-800/40 dark:text-clay-200">
              <Printer className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-600 text-sand-900 dark:text-sand-100">Print / save as PDF</h3>
              <p className="mt-1 text-sm text-sand-600 dark:text-sand-400">
                Opens a print-friendly summary. Use your browser's "Save as PDF" option.
              </p>
            </div>
            <Button onClick={handlePrint} leftIcon={<Download className="h-4 w-4" />}>
              Generate summary
            </Button>
          </Card>

          <Card className="flex flex-col items-start gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sage-50 text-sage-600 dark:bg-sage-800/30 dark:text-sage-200">
              <Calendar className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-600 text-sand-900 dark:text-sand-100">Add to your calendar</h3>
              <p className="mt-1 text-sm text-sand-600 dark:text-sand-400">
                Export your predicted next period as an .ics file for Google or Apple Calendar.
              </p>
            </div>
            <Button variant="outline" onClick={handleCalendar} disabled={!stats?.nextPredictedStart} leftIcon={<Calendar className="h-4 w-4" />}>
              Export calendar
            </Button>
          </Card>
        </motion.div>
      </motion.div>

      <div className="mt-8">
        <Disclaimer />
      </div>
    </div>
  );
}
