import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check, Droplet, Thermometer, Droplets } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Disclaimer } from '../components/common/Disclaimer';
import { useAuth } from '../context/AuthContext';
import { getCycleHistory } from '../mock/cycle';
import { computeStats, type CycleStats } from '../services/cycleService';
import { staggerContainer, fadeUp, easeOut } from '../animations/variants';
import type { FlowLevel } from '../mock/cycle';
import { fertilityEntries as initialFertility, mucusLabels, mucusOptions, type FertilityEntry } from '../mock/fertility';
import { api } from '../services/api';

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

const flowOrder: FlowLevel[] = ['none', 'spotting', 'light', 'medium', 'heavy'];

export function TrackerPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState(() => (user ? getCycleHistory(user.email) : []));
  const [cursor, setCursor] = useState(() => new Date());
  const [selected, setSelected] = useState<string | null>(null);
  const [pendingFlow, setPendingFlow] = useState<FlowLevel>('medium');
  const [justLogged, setJustLogged] = useState(false);
  const [stats, setStats] = useState<CycleStats | null>(() => computeStats(user ? getCycleHistory(user.email) : []));
  const [tab, setTab] = useState<'flow' | 'fertility'>('flow');
  const [fertility, setFertility] = useState<FertilityEntry[]>(initialFertility);
  const [bbtInput, setBbtInput] = useState('');
  const [mucusInput, setMucusInput] = useState<NonNullable<FertilityEntry['mucus']>>('dry');
  const [opkInput, setOpkInput] = useState<'negative' | 'positive'>('negative');

  // Recalculate stats live whenever history changes
  useEffect(() => {
    setStats(computeStats(history));
  }, [history]);

  const entriesByDate = useMemo(() => {
    const map = new Map<string, FlowLevel>();
    for (const e of history) map.set(e.date, e.flow);
    return map;
  }, [history]);

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

  useEffect(() => {
    if (user?.email) {
      api.cycle.get(user.email).then((res) => {
        if (res.logs) {
          setHistory(res.logs);
        }
      }).catch(() => {});
    }
  }, [user?.email]);

  const logFlow = () => {
    if (!selected) return;
    const targetDate = selected;
    const targetFlow = pendingFlow;
    setHistory((prev) => {
      const exists = prev.find((e) => e.date === targetDate);
      if (exists) return prev.map((e) => (e.date === targetDate ? { ...e, flow: targetFlow } : e));
      return [...prev, { date: targetDate, flow: targetFlow }];
    });
    setJustLogged(true);
    setTimeout(() => setJustLogged(false), 1600);
    setSelected(null);

    if (user?.email) {
      api.cycle.save(user.email, targetDate, targetFlow).catch(() => {});
    }
  };

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayEntry = fertility.find((f) => f.date === todayStr);

  const logFertility = () => {
    const bbt = bbtInput ? Number(bbtInput) : null;
    const entry: FertilityEntry = {
      date: todayStr,
      bbt: bbt && !Number.isNaN(bbt) ? bbt : null,
      mucus: mucusInput,
      opk: opkInput,
    };
    setFertility((prev) => {
      const exists = prev.find((f) => f.date === entry.date);
      if (exists) return prev.map((f) => (f.date === entry.date ? { ...f, ...entry } : f));
      return [...prev, entry];
    });
    setJustLogged(true);
    setTimeout(() => setJustLogged(false), 1600);
    setBbtInput('');
  };

  return (
    <div className="mx-auto max-w-5xl">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        <motion.h1 variants={fadeUp} className="font-display text-3xl font-600 text-sand-900 dark:text-sand-100 sm:text-4xl">
          Cycle tracker
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-2 text-sand-600 dark:text-sand-300">
          Tap a day to log flow. Your history builds the picture you bring to your doctor.
        </motion.p>
      </motion.div>

      {/* Tabs */}
      <div className="mt-6 inline-flex rounded-xl border border-sand-200 p-1 dark:border-sand-700">
        <button
          onClick={() => setTab('flow')}
          className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-600 transition-colors ${tab === 'flow' ? 'bg-clay-100 text-clay-700 dark:bg-clay-800/40 dark:text-clay-200' : 'text-sand-500'}`}
        >
          <Droplet className="h-4 w-4" /> Flow
        </button>
        <button
          onClick={() => setTab('fertility')}
          className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-600 transition-colors ${tab === 'fertility' ? 'bg-clay-100 text-clay-700 dark:bg-clay-800/40 dark:text-clay-200' : 'text-sand-500'}`}
        >
          <Thermometer className="h-4 w-4" /> Fertility (BBT / mucus)
        </button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {tab === 'flow' ? (
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <button onClick={goPrev} aria-label="Previous month" className="rounded-lg p-2 text-sand-600 hover:bg-sand-100 dark:text-sand-300 dark:hover:bg-sand-800">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h2 className="font-display text-lg font-600 text-sand-900 dark:text-sand-100">{monthLabel}</h2>
              <button onClick={goNext} aria-label="Next month" className="rounded-lg p-2 text-sand-600 hover:bg-sand-100 dark:text-sand-300 dark:hover:bg-sand-800">
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
                    const day = Number(date.slice(8));
                    const flow = entriesByDate.get(date) ?? 'none';
                    const isToday = date === today;
                    const isSelected = date === selected;
                    return (
                      <button
                        key={i}
                        onClick={() => { setSelected(date); setPendingFlow(flow === 'none' ? 'medium' : flow); }}
                        className={`relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm transition-colors
                          ${isSelected ? 'ring-2 ring-clay-400' : ''}
                          ${isToday ? 'border border-clay-300 dark:border-clay-600' : 'border border-transparent'}
                          hover:bg-sand-100 dark:hover:bg-sand-800`}
                        aria-label={`${day} — ${flowLabels[flow]}`}
                      >
                        <span className={flow !== 'none' ? 'font-700 text-sand-900 dark:text-sand-100' : 'text-sand-600 dark:text-sand-300'}>
                          {day}
                        </span>
                        {flow !== 'none' && (
                          <span className={`mt-0.5 h-1.5 w-1.5 rounded-full ${flowColors[flow]}`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-3 border-t border-sand-200/60 pt-4 dark:border-sand-700/60">
              {flowOrder.filter((f) => f !== 'none').map((f) => (
                <span key={f} className="flex items-center gap-1.5 text-xs text-sand-500 dark:text-sand-400">
                  <span className={`h-2.5 w-2.5 rounded-full ${flowColors[f]}`} />
                  {flowLabels[f]}
                </span>
              ))}
            </div>
          </Card>
          ) : (
          <Card>
            <h2 className="font-display text-lg font-600 text-sand-900 dark:text-sand-100">Fertility signs</h2>
            <p className="mt-1 text-sm text-sand-500 dark:text-sand-400">Track basal body temperature and cervical mucus to identify your fertile window. Combine signals for reliability.</p>

            {/* Today's entry */}
            <div className="mt-4 rounded-xl bg-sand-50 p-4 dark:bg-sand-700/30">
              <p className="text-sm font-600 text-sand-800 dark:text-sand-100">Today — {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
              <div className="mt-3 space-y-3">
                <div>
                  <label className="mb-1 flex items-center gap-1.5 text-xs font-600 text-sand-600 dark:text-sand-300"><Thermometer className="h-3.5 w-3.5" /> BBT (°C)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={bbtInput}
                    onChange={(e) => setBbtInput(e.target.value)}
                    placeholder={todayEntry?.bbt ? String(todayEntry.bbt) : 'e.g. 36.65'}
                    className="input-base py-2"
                  />
                </div>
                <div>
                  <label className="mb-1 flex items-center gap-1.5 text-xs font-600 text-sand-600 dark:text-sand-300"><Droplets className="h-3.5 w-3.5" /> Cervical mucus</label>
                  <div className="flex flex-wrap gap-1.5">
                    {mucusOptions.map((m) => (
                      <button key={m} onClick={() => setMucusInput(m)} className={`chip text-xs ${mucusInput === m ? 'chip-active' : ''}`} aria-pressed={mucusInput === m}>
                        {mucusLabels[m]}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-600 text-sand-600 dark:text-sand-300">OPK result</label>
                  <div className="flex gap-1.5">
                    {(['negative', 'positive'] as const).map((o) => (
                      <button key={o} onClick={() => setOpkInput(o)} className={`chip text-xs capitalize ${opkInput === o ? 'chip-active' : ''}`} aria-pressed={opkInput === o}>
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
                <Button size="sm" onClick={logFertility} leftIcon={<Check className="h-4 w-4" />}>Save today's entry</Button>
              </div>
            </div>

            {/* Recent entries */}
            <div className="mt-4">
              <h3 className="text-sm font-600 text-sand-800 dark:text-sand-100">Recent entries</h3>
              <div className="mt-2 space-y-1.5">
                {[...fertility].reverse().slice(0, 7).map((f) => (
                  <div key={f.date} className="flex items-center justify-between rounded-lg bg-sand-50 px-3 py-2 text-sm dark:bg-sand-700/30">
                    <span className="text-sand-600 dark:text-sand-300">{f.date.slice(5)}</span>
                    <span className="flex items-center gap-3 text-xs text-sand-500 dark:text-sand-400">
                      {f.bbt != null && <span className="flex items-center gap-1"><Thermometer className="h-3 w-3" /> {f.bbt}°C</span>}
                      {f.mucus && <span>{mucusLabels[f.mucus]}</span>}
                      {f.opk === 'positive' && <span className="font-600 text-clay-500">OPK+</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
          )}
        </div>

        {/* Side panel: log entry + stats */}
        <div className="space-y-4">
          {tab === 'flow' && (
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div key="log" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <Card>
                  <h3 className="font-600 text-sand-900 dark:text-sand-100">
                    {new Date(selected).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </h3>
                  <p className="mt-1 text-sm text-sand-500 dark:text-sand-400">Log your flow for this day.</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {flowOrder.filter((f) => f !== 'none').map((f) => (
                      <button
                        key={f}
                        onClick={() => setPendingFlow(f)}
                        className={`chip ${pendingFlow === f ? 'chip-active' : ''}`}
                        aria-pressed={pendingFlow === f}
                      >
                        <Droplet className="h-3.5 w-3.5" />
                        {flowLabels[f]}
                      </button>
                    ))}
                  </div>
                  <Button className="mt-4" fullWidth onClick={logFlow} leftIcon={<Check className="h-4 w-4" />}>
                    Save entry
                  </Button>
                </Card>
              </motion.div>
            ) : (
              <motion.div key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Card>
                  <p className="text-sm text-sand-500 dark:text-sand-400">
                    Tap any day to log or edit a flow entry. Your logged days appear as colored dots.
                  </p>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
          )}

          <Card>
            <h3 className="font-600 text-sand-900 dark:text-sand-100">Cycle history</h3>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-sand-500 dark:text-sand-400">Avg cycle length</dt>
                <dd className="font-600 text-sand-800 dark:text-sand-100">{stats?.avgLength ? `${stats.avgLength} days` : '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sand-500 dark:text-sand-400">Avg period length</dt>
                <dd className="font-600 text-sand-800 dark:text-sand-100">{stats?.avgPeriod ? `${stats.avgPeriod} days` : '—'}</dd>
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

      {/* Calm confirmation */}
      <AnimatePresence>
        {justLogged && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.4, ease: easeOut }}
            className="fixed bottom-24 left-1/2 z-40 -translate-x-1/2 md:bottom-8"
          >
            <div className="flex items-center gap-2.5 rounded-full bg-sage-500 px-5 py-3 text-sm font-600 text-white shadow-lift">
              <Check className="h-4 w-4" />
              Entry saved. Thank you for tracking.
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
