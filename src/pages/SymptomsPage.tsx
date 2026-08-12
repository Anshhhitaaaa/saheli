import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Disclaimer } from '../components/common/Disclaimer';
import { SeekCareBanner } from '../components/common/SeekCareBanner';
import {
  symptomOptions,
  redFlagSymptoms,
  moodOptions,
  symptomHistory as mockSymptomHistory,
  type SymptomEntry,
} from '../mock/symptoms';
import { fadeUp, staggerContainer, easeOut } from '../animations/variants';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const moodEmoji: Record<string, string> = {
  calm: '🌿',
  happy: '🙂',
  anxious: '😟',
  sad: '😢',
  irritable: '😠',
  tired: '😴',
};

export function SymptomsPage() {
  const { user } = useAuth();
  const [selected, setSelected] = useState<string[]>([]);
  const [mood, setMood] = useState<SymptomEntry['mood']>('calm');
  const [severity, setSeverity] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [note, setNote] = useState('');
  const [history, setHistory] = useState<SymptomEntry[]>([]);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    if (user?.email) {
      const todayDate = new Date().toISOString().slice(0, 10);
      api.symptoms.get(user.email).then((res) => {
        if (res.logs && res.logs.length > 0) {
          const mappedLogs: SymptomEntry[] = res.logs
            .filter((l): l is typeof l & { date: string } => Boolean(l.date))
            .map((l) => ({
              id: String(l.id ?? `s_${l.date}`),
              date: l.date!,
              mood: (l.mood as SymptomEntry['mood']) || 'calm',
              symptoms: Array.isArray(l.symptoms) ? l.symptoms : [],
              severity: (l.severity as 1 | 2 | 3 | 4 | 5) || 3,
              note: l.notes || l.note,
              redFlag: Array.isArray(l.symptoms) && l.symptoms.some((s) => redFlagSymptoms.includes(s)),
            }));
          setHistory(mappedLogs);
          const todayLog = mappedLogs.find((l) => l.date === todayDate);
          if (todayLog) {
            if (todayLog.mood) setMood(todayLog.mood);
            if (todayLog.symptoms) setSelected(todayLog.symptoms);
            if (todayLog.severity) setSeverity(todayLog.severity);
            if (todayLog.note) setNote(todayLog.note);
          }
        } else {
          setHistory([]);
        }
      }).catch(() => {});
    }
  }, [user?.email]);

  const hasRedFlag = selected.some((s) => redFlagSymptoms.includes(s));

  const toggle = (symptom: string) =>
    setSelected((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom],
    );

  const save = () => {
    const todayDate = new Date().toISOString().slice(0, 10);
    const entry: SymptomEntry = {
      id: 's' + Date.now(),
      date: todayDate,
      symptoms: selected,
      severity,
      mood,
      note: note.trim() || undefined,
      redFlag: hasRedFlag,
    };
    setHistory((prev) => {
      const filtered = prev.filter((s) => s.date !== todayDate);
      return [entry, ...filtered];
    });
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1600);

    if (user?.email) {
      api.symptoms.save(user.email, todayDate, selected, note, mood, severity).catch(() => {});
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        <motion.h1 variants={fadeUp} className="font-display text-3xl font-600 text-sand-900 dark:text-sand-100 sm:text-4xl">
          Symptom & mood log
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-2 text-sand-600 dark:text-sand-300">
          A few notes a day is enough to make patterns visible. This is for you and your doctor — not a diagnosis.
        </motion.p>
      </motion.div>

      <div className="mt-8 space-y-6">
        <Card>
          <h2 className="font-600 text-sand-900 dark:text-sand-100">How are you feeling today?</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {moodOptions.map((m) => (
              <button
                key={m}
                onClick={() => setMood(m)}
                className={`chip capitalize ${mood === m ? 'chip-active' : ''}`}
                aria-pressed={mood === m}
              >
                <span aria-hidden>{moodEmoji[m]}</span>
                {m}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="font-600 text-sand-900 dark:text-sand-100">Symptoms</h2>
          <p className="mt-1 text-sm text-sand-500 dark:text-sand-400">Select all that apply.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {symptomOptions.map((s) => {
              const active = selected.includes(s);
              const isRed = redFlagSymptoms.includes(s);
              return (
                <motion.button
                  key={s}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => toggle(s)}
                  className={`chip ${active ? 'chip-active' : ''} ${
                    isRed ? 'border-warning/40 text-warning' : ''
                  } ${active && isRed ? 'bg-warning/15 border-warning text-warning' : ''}`}
                  aria-pressed={active}
                >
                  {s}
                </motion.button>
              );
            })}
          </div>

          {/* Calm seek-care banner — the most important animation-restraint moment */}
          <div className="mt-5">
            <SeekCareBanner show={hasRedFlag} />
          </div>
        </Card>

        <Card>
          <h2 className="font-600 text-sand-900 dark:text-sand-100">Severity</h2>
          <div className="mt-4 flex items-center gap-3">
            <input
              type="range"
              min={1}
              max={5}
              value={severity}
              onChange={(e) => setSeverity(Number(e.target.value) as 1 | 2 | 3 | 4 | 5)}
              className="flex-1 accent-clay-500"
              aria-label="Severity from 1 to 5"
            />
            <span className="w-8 text-center font-600 text-clay-600 dark:text-clay-200">{severity}</span>
          </div>
          <div className="mt-1 flex justify-between text-xs text-sand-400">
            <span>Mild</span>
            <span>Severe</span>
          </div>
        </Card>

        <Card>
          <label htmlFor="note" className="mb-1.5 block text-sm font-600 text-sand-800 dark:text-sand-200">
            Note (optional)
          </label>
          <textarea
            id="note"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="input-base resize-none"
            placeholder="Anything you want to remember or share with your doctor."
          />
        </Card>

        <div className="flex justify-end">
          <Button size="lg" onClick={save} disabled={selected.length === 0} leftIcon={<Check className="h-4 w-4" />}>
            Save entry
          </Button>
        </div>
      </div>

      {/* History */}
      <div className="mt-12">
        <h2 className="font-display text-2xl font-600 text-sand-900 dark:text-sand-100">History</h2>
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mt-4 space-y-3">
          <AnimatePresence>
            {history.map((entry) => (
              <motion.div key={entry.id} variants={fadeUp} initial="hidden" animate="visible" layout>
                <Card>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg" aria-hidden>{moodEmoji[entry.mood]}</span>
                      <span className="font-600 text-sand-900 dark:text-sand-100">
                        {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-sm text-sand-500 dark:text-sand-400">· severity {entry.severity}/5</span>
                    </div>
                    {entry.redFlag && (
                      <span className="rounded-full bg-warning/15 px-2.5 py-0.5 text-xs font-600 text-warning">
                        Flagged for care
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {entry.symptoms.map((s) => (
                      <span key={s} className="rounded-full bg-sand-100 px-2.5 py-0.5 text-xs text-sand-600 dark:bg-sand-700/50 dark:text-sand-300">
                        {s}
                      </span>
                    ))}
                  </div>
                  {entry.note && <p className="mt-2 text-sm text-sand-600 dark:text-sand-400">{entry.note}</p>}
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        {history.length === 0 && (
          <Card>
            <p className="text-sm text-sand-500 dark:text-sand-400">
              No entries yet. Log your first one above — it only takes a moment.
            </p>
          </Card>
        )}
      </div>

      <AnimatePresence>
        {justSaved && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.4, ease: easeOut }}
            className="fixed bottom-24 left-1/2 z-40 -translate-x-1/2 md:bottom-8"
          >
            <div className="flex items-center gap-2.5 rounded-full bg-sage-500 px-5 py-3 text-sm font-600 text-white shadow-lift">
              <Check className="h-4 w-4" />
              Entry saved.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8">
        <Disclaimer variant="inline" />
      </div>
    </div>
  );
}
