import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Droplet,
  Thermometer,
  Droplets,
  Plus,
  Trash2,
  Calendar,
  Activity,
  HeartHandshake,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Disclaimer } from '../components/common/Disclaimer';
import { SeekCareBanner } from '../components/common/SeekCareBanner';
import { useAuth } from '../context/AuthContext';
import { getCycleHistory, type CycleDay, type FlowLevel } from '../mock/cycle';
import { computeStats, type CycleStats } from '../services/cycleService';
import { staggerContainer, fadeUp, easeOut } from '../animations/variants';
import { fertilityEntries as initialFertility, mucusLabels, mucusOptions, type FertilityEntry } from '../mock/fertility';
import {
  symptomOptions,
  redFlagSymptoms,
  moodOptions,
  symptomHistory as mockSymptomHistory,
  type SymptomEntry,
} from '../mock/symptoms';
import { api } from '../services/api';
import { LogPeriodStartModal } from '../components/tracker/LogPeriodStartModal';

const flowColors: Record<FlowLevel, string> = {
  none: 'bg-transparent',
  spotting: 'bg-sand-300 dark:bg-sand-600',
  light: 'bg-clay-200 dark:bg-clay-700',
  medium: 'bg-clay-400 dark:bg-clay-500',
  heavy: 'bg-clay-600 dark:bg-clay-400',
};

const flowLabels: Record<FlowLevel, string> = {
  none: 'No flow',
  spotting: 'Spotting',
  light: 'Light',
  medium: 'Medium',
  heavy: 'Heavy',
};

const moodEmoji: Record<string, string> = {
  calm: '🌿',
  happy: '🙂',
  anxious: '😟',
  sad: '😢',
  irritable: '😠',
  tired: '😴',
};

const flowOrder: FlowLevel[] = ['none', 'spotting', 'light', 'medium', 'heavy'];

export function TrackerPage() {
  const { user, updateUser } = useAuth();
  const [history, setHistory] = useState<CycleDay[]>(() => (user ? getCycleHistory(user.email) : []));
  const [symptomLogs, setSymptomLogs] = useState<SymptomEntry[]>(() => (user?.email === 'pcos@saheli.app' ? mockSymptomHistory : []));

  const [cursor, setCursor] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [logModalOpen, setLogModalOpen] = useState(false);

  // Day detail edit state
  const [editingFlow, setEditingFlow] = useState<FlowLevel>('none');
  const [editingFlowNote, setEditingFlowNote] = useState('');
  const [editingSymptoms, setEditingSymptoms] = useState<string[]>([]);
  const [editingMood, setEditingMood] = useState<SymptomEntry['mood']>('calm');
  const [editingSeverity, setEditingSeverity] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [editingSymptomNote, setEditingSymptomNote] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [stats, setStats] = useState<CycleStats | null>(() => computeStats(user ? getCycleHistory(user.email) : []));
  const [tab, setTab] = useState<'flow' | 'fertility'>('flow');

  // Fertility tracking
  const [fertility, setFertility] = useState<FertilityEntry[]>(initialFertility);
  const [bbtInput, setBbtInput] = useState('');
  const [mucusInput, setMucusInput] = useState<NonNullable<FertilityEntry['mucus']>>('dry');
  const [opkInput, setOpkInput] = useState<'negative' | 'positive'>('negative');

  // Sync stats whenever history changes
  useEffect(() => {
    setStats(computeStats(history));
  }, [history]);

  // Load history from API / mock
  useEffect(() => {
    if (user?.email) {
      api.cycle.get(user.email).then((res) => {
        if (res.logs && res.logs.length > 0) setHistory(res.logs);
      }).catch(() => { });

      api.symptoms.get(user.email).then((res) => {
        if (res.logs && res.logs.length > 0) setSymptomLogs(res.logs);
      }).catch(() => { });
    }
  }, [user?.email]);

  // Maps for calendar day dot rendering
  const flowByDate = useMemo(() => {
    const map = new Map<string, CycleDay>();
    for (const e of history) map.set(e.date, e);
    return map;
  }, [history]);

  const symptomsByDate = useMemo(() => {
    const map = new Map<string, SymptomEntry>();
    for (const s of symptomLogs) map.set(s.date, s);
    return map;
  }, [symptomLogs]);

  // When selected date changes, populate edit state for day detail panel
  useEffect(() => {
    if (!selectedDate) return;
    const existingCycle = flowByDate.get(selectedDate);
    const existingSymptom = symptomsByDate.get(selectedDate);

    setEditingFlow(existingCycle?.flow || 'none');
    setEditingFlowNote(existingCycle?.note || '');

    if (existingSymptom) {
      setEditingSymptoms(existingSymptom.symptoms || []);
      setEditingMood(existingSymptom.mood || 'calm');
      setEditingSeverity(existingSymptom.severity || 3);
      setEditingSymptomNote(existingSymptom.note || (existingSymptom as any).notes || '');
    } else {
      setEditingSymptoms([]);
      setEditingMood('calm');
      setEditingSeverity(3);
      setEditingSymptomNote('');
    }
  }, [selectedDate, flowByDate, symptomsByDate]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Calendar math
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = firstDay.getDay();
  const monthLabel = cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const cells: (string | null)[] = [
    ...Array.from({ length: startWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) =>
      new Date(year, month, i + 1).toISOString().slice(0, 10),
    ),
  ];

  const goPrev = () => setCursor(new Date(year, month - 1, 1));
  const goNext = () => setCursor(new Date(year, month + 1, 1));
  const today = new Date().toISOString().slice(0, 10);

  // Callback when modal logs period start
  const handlePeriodStartLogged = (date: string, flowLevel: FlowLevel, note?: string) => {
    setHistory((prev) => {
      const exists = prev.find((e) => e.date === date);
      if (exists) return prev.map((e) => (e.date === date ? { ...e, flow: flowLevel, note } : e));
      return [...prev, { date, flow: flowLevel, note }];
    });
    setSelectedDate(date);
    showToast(`Period start logged for ${new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.`);
  };

  // Save changes from Day Detail Panel
  const handleSaveDayLog = async () => {
    if (!selectedDate) return;
    const targetDate = selectedDate;
    const email = user?.email;

    // 1. Update local history for flow
    setHistory((prev) => {
      const exists = prev.find((e) => e.date === targetDate);
      if (editingFlow === 'none') {
        return prev.filter((e) => e.date !== targetDate);
      }
      if (exists) {
        return prev.map((e) => (e.date === targetDate ? { date: targetDate, flow: editingFlow, note: editingFlowNote } : e));
      }
      return [...prev, { date: targetDate, flow: editingFlow, note: editingFlowNote }];
    });

    if (editingFlow !== 'none') {
      updateUser({ lastPeriodStart: targetDate });
    }

    if (email) {
      if (editingFlow === 'none') {
        api.cycle.delete(email, targetDate).catch(() => { });
      } else {
        api.cycle.save(email, targetDate, editingFlow, editingFlowNote).catch(() => { });
      }
    }

    // 2. Update local history for symptoms & mood
    if (editingSymptoms.length > 0 || editingSymptomNote || editingMood) {
      const isRed = editingSymptoms.some((s) => redFlagSymptoms.includes(s));
      const entry: SymptomEntry = {
        id: 's_' + targetDate,
        date: targetDate,
        mood: editingMood,
        symptoms: editingSymptoms,
        severity: editingSeverity,
        note: editingSymptomNote,
        redFlag: isRed,
      };

      setSymptomLogs((prev) => {
        const filtered = prev.filter((s) => s.date !== targetDate);
        return [entry, ...filtered];
      });

      if (email) {
        api.symptoms.save(email, targetDate, editingSymptoms, editingSymptomNote, editingMood, editingSeverity).catch(() => { });
      }
    } else {
      // Clear symptoms if empty
      setSymptomLogs((prev) => prev.filter((s) => s.date !== targetDate));
      if (email) {
        api.symptoms.delete(email, targetDate).catch(() => { });
      }
    }

    showToast(`Saved entry for ${new Date(targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.`);
  };

  // Delete Day Log
  const handleDeleteDayLog = async () => {
    if (!selectedDate) return;
    const targetDate = selectedDate;
    const email = user?.email;

    setHistory((prev) => prev.filter((e) => e.date !== targetDate));
    setSymptomLogs((prev) => prev.filter((s) => s.date !== targetDate));

    if (email) {
      api.cycle.delete(email, targetDate).catch(() => { });
      api.symptoms.delete(email, targetDate).catch(() => { });
    }

    setEditingFlow('none');
    setEditingFlowNote('');
    setEditingSymptoms([]);
    setEditingSymptomNote('');

    showToast(`Log cleared for ${new Date(targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.`);
  };

  const hasSelectedEntry = Boolean(
    selectedDate && (flowByDate.has(selectedDate) || symptomsByDate.has(selectedDate)),
  );

  const hasRedFlagInEdit = editingSymptoms.some((s) => redFlagSymptoms.includes(s));

  const logFertility = () => {
    const bbt = bbtInput ? Number(bbtInput) : null;
    const entry: FertilityEntry = {
      date: today,
      bbt: bbt && !Number.isNaN(bbt) ? bbt : null,
      mucus: mucusInput,
      opk: opkInput,
    };
    setFertility((prev) => {
      const exists = prev.find((f) => f.date === entry.date);
      if (exists) return prev.map((f) => (f.date === entry.date ? { ...f, ...entry } : f));
      return [...prev, entry];
    });
    showToast("Fertility entry saved for today.");
    setBbtInput('');
  };

  return (
    <div className="mx-auto max-w-5xl">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <motion.h1 variants={fadeUp} className="font-display text-3xl font-600 text-sand-900 dark:text-sand-100 sm:text-4xl">
            Cycle tracker
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-1 text-sand-600 dark:text-sand-300">
            Tap any day to view, log, or edit flow and symptoms live.
          </motion.p>
        </div>

        {/* Prominent "+ Log period start" button */}
        <motion.div variants={fadeUp}>
          <Button
            onClick={() => setLogModalOpen(true)}
            size="md"
            leftIcon={<Plus className="h-4 w-4" />}
            className="shadow-sm"
          >
            Log period start
          </Button>
        </motion.div>
      </motion.div>

      {/* Tabs */}
      <div className="mt-6 inline-flex rounded-xl border border-sand-200 p-1 dark:border-sand-700">
        <button
          onClick={() => setTab('flow')}
          className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-600 transition-colors ${tab === 'flow'
              ? 'bg-clay-100 text-clay-700 dark:bg-clay-800/40 dark:text-clay-200'
              : 'text-sand-500'
            }`}
        >
          <Droplet className="h-4 w-4" /> Flow & Symptoms
        </button>
        <button
          onClick={() => setTab('fertility')}
          className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-600 transition-colors ${tab === 'fertility'
              ? 'bg-clay-100 text-clay-700 dark:bg-clay-800/40 dark:text-clay-200'
              : 'text-sand-500'
            }`}
        >
          <Thermometer className="h-4 w-4" /> Fertility (BBT / mucus)
        </button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Main Calendar View */}
        <div className="lg:col-span-2">
          {tab === 'flow' ? (
            <Card>
              <div className="mb-4 flex items-center justify-between">
                <button
                  onClick={goPrev}
                  aria-label="Previous month"
                  className="rounded-lg p-2 text-sand-600 hover:bg-sand-100 dark:text-sand-300 dark:hover:bg-sand-800"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h2 className="font-display text-lg font-600 text-sand-900 dark:text-sand-100">
                  {monthLabel}
                </h2>
                <button
                  onClick={goNext}
                  aria-label="Next month"
                  className="rounded-lg p-2 text-sand-600 hover:bg-sand-100 dark:text-sand-300 dark:hover:bg-sand-800"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={monthLabel}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.3, ease: easeOut }}
                >
                  <div className="grid grid-cols-7 gap-1 text-center text-xs font-600 text-sand-400">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                      <div key={i}>{d}</div>
                    ))}
                  </div>

                  <div className="mt-2 grid grid-cols-7 gap-1">
                    {cells.map((date, i) => {
                      if (!date) return <div key={i} />;
                      const dayNum = Number(date.slice(8));
                      const cycleEntry = flowByDate.get(date);
                      const symptomEntry = symptomsByDate.get(date);
                      const flow = cycleEntry?.flow ?? 'none';
                      const isToday = date === today;
                      const isSelected = date === selectedDate;
                      const hasSymptoms = Boolean(symptomEntry && symptomEntry.symptoms?.length > 0);
                      const hasMood = Boolean(symptomEntry && symptomEntry.mood);

                      return (
                        <button
                          key={i}
                          onClick={() => setSelectedDate(date)}
                          className={`relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm transition-all
                            ${isSelected ? 'ring-2 ring-clay-500 bg-sand-100/70 dark:bg-sand-800' : ''}
                            ${isToday ? 'border border-clay-400 font-700 dark:border-clay-500' : 'border border-transparent'}
                            hover:bg-sand-100 dark:hover:bg-sand-800`}
                          aria-label={`${dayNum} — ${flowLabels[flow]}`}
                        >
                          <span className={flow !== 'none' ? 'font-700 text-sand-900 dark:text-sand-100' : 'text-sand-600 dark:text-sand-300'}>
                            {dayNum}
                          </span>

                          <div className="mt-1 flex items-center justify-center gap-0.5">
                            {/* Flow indicator dot */}
                            {flow !== 'none' && (
                              <span className={`h-2 w-2 rounded-full ${flowColors[flow]}`} title={`Flow: ${flowLabels[flow]}`} />
                            )}
                            {/* Mood indicator dot */}
                            {hasMood && (
                              <span className="h-1.5 w-1.5 rounded-full bg-rose-400 dark:bg-rose-500" title={`Mood: ${symptomEntry?.mood}`} />
                            )}
                            {/* Symptom indicator dot */}
                            {hasSymptoms && (
                              <span className="h-1.5 w-1.5 rounded-full bg-sage-500" title="Symptoms logged" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Legend */}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-sand-200/60 pt-4 dark:border-sand-700/60">
                <div className="flex flex-wrap gap-3 text-xs">
                  {flowOrder.filter((f) => f !== 'none').map((f) => (
                    <span key={f} className="flex items-center gap-1.5 text-sand-500 dark:text-sand-400">
                      <span className={`h-2.5 w-2.5 rounded-full ${flowColors[f]}`} />
                      {flowLabels[f]}
                    </span>
                  ))}
                  <span className="flex items-center gap-1.5 text-sand-500 dark:text-sand-400">
                    <span className="h-2 w-2 rounded-full bg-rose-400 dark:bg-rose-500" />
                    Mood logged
                  </span>
                  <span className="flex items-center gap-1.5 text-sand-500 dark:text-sand-400">
                    <span className="h-2 w-2 rounded-full bg-sage-500" />
                    Symptoms logged
                  </span>
                </div>
              </div>
            </Card>
          ) : (
            /* Fertility tab content */
            <Card>
              <h2 className="font-display text-lg font-600 text-sand-900 dark:text-sand-100">Fertility signs</h2>
              <p className="mt-1 text-sm text-sand-500 dark:text-sand-400">Track BBT and cervical mucus to identify fertile windows.</p>

              <div className="mt-4 rounded-xl bg-sand-50 p-4 dark:bg-sand-700/30">
                <p className="text-sm font-600 text-sand-800 dark:text-sand-100">
                  Today — {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
                <div className="mt-3 space-y-3">
                  <div>
                    <label className="mb-1 flex items-center gap-1.5 text-xs font-600 text-sand-600 dark:text-sand-300">
                      <Thermometer className="h-3.5 w-3.5" /> BBT (°C)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={bbtInput}
                      onChange={(e) => setBbtInput(e.target.value)}
                      placeholder="e.g. 36.65"
                      className="input-base py-2"
                    />
                  </div>

                  <div>
                    <label className="mb-1 flex items-center gap-1.5 text-xs font-600 text-sand-600 dark:text-sand-300">
                      <Droplets className="h-3.5 w-3.5" /> Cervical mucus
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {mucusOptions.map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setMucusInput(m)}
                          className={`chip text-xs ${mucusInput === m ? 'chip-active' : ''}`}
                        >
                          {mucusLabels[m]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-600 text-sand-600 dark:text-sand-300">OPK result</label>
                    <div className="flex gap-1.5">
                      {(['negative', 'positive'] as const).map((o) => (
                        <button
                          key={o}
                          type="button"
                          onClick={() => setOpkInput(o)}
                          className={`chip text-xs capitalize ${opkInput === o ? 'chip-active' : ''}`}
                        >
                          {o}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button size="sm" onClick={logFertility} leftIcon={<Check className="h-4 w-4" />}>
                    Save today's entry
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Side Panel: Interactive Day Detail Panel + Stats */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {selectedDate ? (
              <motion.div key={selectedDate} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <Card className="border-clay-200/80 shadow-md dark:border-clay-700/60">
                  <div className="flex items-center justify-between border-b border-sand-200/80 pb-3 dark:border-sand-700/80">
                    <div>
                      <span className="text-xs font-600 uppercase tracking-wide text-clay-500">Day Detail</span>
                      <h3 className="font-display text-lg font-600 text-sand-900 dark:text-sand-100">
                        {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </h3>
                    </div>

                    {hasSelectedEntry && (
                      <button
                        onClick={handleDeleteDayLog}
                        title="Delete log for this day"
                        className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-600 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    )}
                  </div>

                  {/* Flow level selector */}
                  <div className="mt-4">
                    <label className="mb-2 flex items-center gap-1.5 text-xs font-600 text-sand-800 dark:text-sand-200">
                      <Droplet className="h-3.5 w-3.5 text-clay-500" /> Flow level
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {flowOrder.map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setEditingFlow(f)}
                          className={`chip text-xs ${editingFlow === f ? 'chip-active' : ''}`}
                        >
                          {f !== 'none' && <span className={`mr-1 h-2 w-2 rounded-full ${flowColors[f]}`} />}
                          {flowLabels[f]}
                        </button>
                      ))}
                    </div>

                    {editingFlow !== 'none' && (
                      <input
                        type="text"
                        value={editingFlowNote}
                        onChange={(e) => setEditingFlowNote(e.target.value)}
                        placeholder="Flow notes (e.g. heavy morning)"
                        className="input-base text-xs mt-2 py-1.5"
                      />
                    )}
                  </div>

                  {/* Mood selection */}
                  <div className="mt-4 pt-3 border-t border-sand-200/60 dark:border-sand-700/60">
                    <label className="mb-2 block text-xs font-600 text-sand-800 dark:text-sand-200">Mood</label>
                    <div className="flex flex-wrap gap-1.5">
                      {moodOptions.map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setEditingMood(m)}
                          className={`chip text-xs capitalize ${editingMood === m ? 'chip-active' : ''}`}
                        >
                          <span>{moodEmoji[m]}</span> {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Symptoms selector */}
                  <div className="mt-4 pt-3 border-t border-sand-200/60 dark:border-sand-700/60">
                    <label className="mb-2 block text-xs font-600 text-sand-800 dark:text-sand-200">Symptoms</label>
                    <div className="flex flex-wrap gap-1 max-h-36 overflow-y-auto">
                      {symptomOptions.map((s) => {
                        const active = editingSymptoms.includes(s);
                        const isRed = redFlagSymptoms.includes(s);
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() =>
                              setEditingSymptoms((prev) =>
                                prev.includes(s) ? prev.filter((item) => item !== s) : [...prev, s],
                              )
                            }
                            className={`chip text-xs ${active ? 'chip-active' : ''} ${isRed ? 'border-warning/40 text-warning' : ''
                              }`}
                          >
                            {s}
                          </button>
                        );
                      })}
                    </div>

                    {/* Red flag banner */}
                    {hasRedFlagInEdit && (
                      <div className="mt-3">
                        <SeekCareBanner show={true} />
                      </div>
                    )}
                  </div>

                  {/* Severity slider */}
                  <div className="mt-4 pt-3 border-t border-sand-200/60 dark:border-sand-700/60">
                    <div className="flex items-center justify-between text-xs font-600 text-sand-800 dark:text-sand-200">
                      <span>Symptom severity</span>
                      <span className="text-clay-600 dark:text-clay-300">{editingSeverity}/5</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={editingSeverity}
                      onChange={(e) => setEditingSeverity(Number(e.target.value) as 1 | 2 | 3 | 4 | 5)}
                      className="w-full accent-clay-500 mt-1"
                    />
                  </div>

                  {/* Symptom notes */}
                  <div className="mt-3">
                    <textarea
                      rows={2}
                      value={editingSymptomNote}
                      onChange={(e) => setEditingSymptomNote(e.target.value)}
                      placeholder="Notes for your doctor or yourself..."
                      className="input-base text-xs resize-none"
                    />
                  </div>

                  {/* Save button */}
                  <div className="mt-4 flex items-center gap-2">
                    <Button fullWidth size="sm" onClick={handleSaveDayLog} leftIcon={<Check className="h-4 w-4" />}>
                      Save day log
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedDate(null)}>
                      Close
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <motion.div key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card>
                  <div className="flex items-center gap-2.5 text-sand-700 dark:text-sand-200">
                    <Calendar className="h-5 w-5 text-clay-500" />
                    <h3 className="font-600">Day Detail</h3>
                  </div>
                  <p className="mt-2 text-sm text-sand-500 dark:text-sand-400">
                    Click any day in the calendar to view what was logged, edit symptoms/flow, or delete an entry.
                  </p>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cycle Stats Card */}
          <Card>
            <h3 className="font-600 text-sand-900 dark:text-sand-100">Cycle stats</h3>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-sand-500 dark:text-sand-400">Avg cycle length</dt>
                <dd className="font-600 text-sand-800 dark:text-sand-100">
                  {stats?.avgLength ? `${stats.avgLength} days` : '—'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sand-500 dark:text-sand-400">Avg period length</dt>
                <dd className="font-600 text-sand-800 dark:text-sand-100">
                  {stats?.avgPeriod ? `${stats.avgPeriod} days` : '—'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sand-500 dark:text-sand-400">Cycles tracked</dt>
                <dd className="font-600 text-sand-800 dark:text-sand-100">{stats?.cycleCount ?? 0}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sand-500 dark:text-sand-400">Next predicted</dt>
                <dd className="font-600 text-sand-800 dark:text-sand-100">{stats?.nextPredictedStart ?? '—'}</dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>

      {/* Date Picker Modal for "+ Log period start" */}
      <LogPeriodStartModal
        open={logModalOpen}
        onClose={() => setLogModalOpen(false)}
        onSuccess={handlePeriodStartLogged}
      />

      {/* Calm Toast Confirmation */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.4, ease: easeOut }}
            className="fixed bottom-24 left-1/2 z-40 -translate-x-1/2 md:bottom-8"
          >
            <div className="flex items-center gap-2.5 rounded-full bg-sage-600 px-5 py-3 text-sm font-600 text-white shadow-lift">
              <Check className="h-4 w-4" />
              {toastMessage}
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
