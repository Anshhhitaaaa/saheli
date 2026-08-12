import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pill, Clock, Check, Bell, Trash2, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Flame, CheckCircle2, AlertCircle, ListTodo } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Disclaimer } from '../components/common/Disclaimer';
import { Modal } from '../components/common/Modal';
import { medicationTypes, type Medication } from '../mock/medications';
import { fadeUp, staggerContainer } from '../animations/variants';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export function MedsTrackerPage() {
  const { user } = useAuth();
  const [meds, setMeds] = useState<Medication[]>([]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', dose: '', schedule: '', type: 'supplement' as Medication['type'], notes: '' });

  // Tab Switcher State ('checklist' vs 'calendar')
  const [activeTab, setActiveTab] = useState<'checklist' | 'calendar'>('checklist');

  // Calendar State
  const [currentMonthDate, setCurrentMonthDate] = useState(() => new Date());
  const [selectedDayStr, setSelectedDayStr] = useState<string | null>(null);

  const todayStr = new Date().toISOString().slice(0, 10);

  const mapApiMeds = (rawMeds: any[]): Medication[] =>
    rawMeds.map((m) => ({
      id: String(m.id),
      name: m.name || 'Medication',
      type: m.type || 'supplement',
      dose: m.dose || '',
      schedule: m.schedule || '',
      active: m.active ?? true,
      startedAt: m.startedAt || m.started_at || todayStr,
      notes: m.notes,
      takenDates: Array.isArray(m.takenDates) ? m.takenDates : (Array.isArray(m.taken_dates) ? m.taken_dates : []),
    }));

  // Fetch real data from PostgreSQL backend
  useEffect(() => {
    if (user?.email) {
      api.medications.get(user.email).then((res) => {
        if (res.meds) {
          setMeds(mapApiMeds(res.meds));
        }
      }).catch(() => {});
    }
  }, [user?.email]);

  const add = async () => {
    if (!form.name.trim()) return;
    const m: Medication = {
      id: 'm' + Date.now(),
      name: form.name,
      type: form.type,
      dose: form.dose,
      schedule: form.schedule,
      active: true,
      startedAt: todayStr,
      notes: form.notes.trim() || undefined,
      takenDates: [],
    };

    setMeds((prev) => [...prev, m]);
    setForm({ name: '', dose: '', schedule: '', type: 'supplement', notes: '' });
    setAdding(false);

    if (user?.email) {
      try {
        const res = await api.medications.create(user.email, {
          name: m.name,
          type: m.type,
          dose: m.dose,
          schedule: m.schedule,
          notes: m.notes,
        });
        if (res.meds) setMeds(mapApiMeds(res.meds));
      } catch {}
    }
  };

  const toggleActive = (id: string) => {
    const updatedMeds = meds.map((m) => (m.id === id ? { ...m, active: !m.active } : m));
    setMeds(updatedMeds);
    const target = updatedMeds.find((m) => m.id === id);
    if (user?.email && target) {
      api.medications.update(user.email, id, { active: target.active }).catch(() => {});
    }
  };

  const toggleTakenOnDate = (m: Medication, dateStr: string) => {
    const currentDates = m.takenDates || [];
    const taken = currentDates.includes(dateStr);
    const nextDates = taken
      ? currentDates.filter((d) => d !== dateStr)
      : [...currentDates, dateStr];

    setMeds((prev) =>
      prev.map((item) => (item.id === m.id ? { ...item, takenDates: nextDates } : item))
    );

    if (user?.email) {
      api.medications.update(user.email, m.id, { takenDates: nextDates }).catch(() => {});
    }
  };

  const deleteMed = async (id: string) => {
    setMeds((prev) => prev.filter((m) => m.id !== id));
    if (user?.email) {
      try {
        const res = await api.medications.delete(user.email, id);
        if (res.meds) setMeds(mapApiMeds(res.meds));
      } catch {}
    }
  };

  // Calendar Calculations based on real database records
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const monthName = currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentMonthDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonthDate(new Date(year, month + 1, 1));

  const activeMeds = meds.filter((m) => m.active);

  // Calculate Streak from PostgreSQL data
  let streak = 0;
  const checkDate = new Date();
  while (true) {
    const dStr = checkDate.toISOString().slice(0, 10);
    const takenCount = activeMeds.filter((m) => (m.takenDates || []).includes(dStr)).length;
    if (activeMeds.length > 0 && takenCount === activeMeds.length) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Calculate Monthly Adherence from PostgreSQL data
  let monthTakenDays = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const takenCount = activeMeds.filter((m) => (m.takenDates || []).includes(dStr)).length;
    if (takenCount > 0) monthTakenDays++;
  }
  const monthlyAdherence = daysInMonth > 0 ? Math.round((monthTakenDays / daysInMonth) * 100) : 0;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        <motion.h1 variants={fadeUp} className="font-display text-3xl font-600 text-sand-900 dark:text-sand-100 sm:text-4xl">
          Medications & supplements
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-1.5 text-sand-600 dark:text-sand-300">
          Track birth control, PCOS meds, prenatal vitamins, and supplements with gentle reminders and visual calendar logs.
        </motion.p>
      </motion.div>

      {/* ========================================================================= */}
      {/* LEFT-ALIGNED SEGMENTED TAB SWITCHER BAR                                   */}
      {/* ========================================================================= */}
      <div className="flex justify-start pt-1">
        <div className="inline-flex items-center rounded-full border border-sand-300/70 bg-sand-100/60 p-1 shadow-sm dark:border-sand-700 dark:bg-sand-800/60">
          <button
            onClick={() => setActiveTab('checklist')}
            className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs sm:text-sm font-600 transition-all ${
              activeTab === 'checklist'
                ? 'bg-rose-200/60 text-rose-900 shadow-sm dark:bg-rose-900/50 dark:text-rose-100'
                : 'text-sand-600 hover:text-sand-900 dark:text-sand-300 dark:hover:text-sand-100'
            }`}
          >
            <ListTodo className="h-4 w-4" />
            <span>Daily Meds Checklist</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs sm:text-sm font-600 transition-all ${
              activeTab === 'calendar'
                ? 'bg-rose-200/60 text-rose-900 shadow-sm dark:bg-rose-900/50 dark:text-rose-100'
                : 'text-sand-600 hover:text-sand-900 dark:text-sand-300 dark:hover:text-sand-100'
            }`}
          >
            <CalendarIcon className="h-4 w-4" />
            <span>Medication Calendar</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB CONTENT 1: DAILY MEDICATION CHECKLIST                                 */}
      {/* ========================================================================= */}
      {activeTab === 'checklist' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-4">
          <div className="flex items-center justify-between border-b border-sand-200/60 pb-3 dark:border-sand-800">
            <div>
              <h2 className="font-display text-lg font-600 text-sand-900 dark:text-sand-100">
                Daily Medications ({activeMeds.length} active)
              </h2>
              <p className="text-xs text-sand-500 dark:text-sand-400">
                Mark your medications taken today or manage your active prescriptions
              </p>
            </div>
            <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setAdding(true)}>
              Add medication
            </Button>
          </div>

          {meds.length === 0 ? (
            <Card className="flex flex-col items-center justify-center py-12 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-clay-50 text-clay-600 dark:bg-clay-800/40 dark:text-clay-200">
                <Pill className="h-7 w-7" />
              </span>
              <h3 className="mt-4 font-display text-lg font-600 text-sand-900 dark:text-sand-100">
                No medications added yet
              </h3>
              <p className="mt-1 max-w-sm text-sm text-sand-600 dark:text-sand-400">
                Add your prescriptions, PCOS supplements, or vitamins to track them daily and mark them as taken.
              </p>
              <Button size="sm" className="mt-4" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setAdding(true)}>
                Add medication
              </Button>
            </Card>
          ) : (
            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-3">
              <AnimatePresence>
                {meds.map((m) => {
                  const typeLabel = medicationTypes.find((t) => t.value === m.type)?.label ?? m.type;
                  const takenToday = (m.takenDates || []).includes(todayStr);
                  return (
                    <motion.div key={m.id} variants={fadeUp} initial="hidden" animate="visible" exit={{ opacity: 0 }} layout>
                      <Card>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${m.active ? 'bg-clay-50 text-clay-600 dark:bg-clay-800/40 dark:text-clay-200' : 'bg-sand-100 text-sand-400 dark:bg-sand-700/50'}`}>
                              <Pill className="h-5 w-5" />
                            </span>
                            <div>
                              <h3 className="font-600 text-sand-900 dark:text-sand-100">{m.name}</h3>
                              <p className="text-sm text-sand-500 dark:text-sand-400">
                                {m.dose} · {typeLabel} · since {m.startedAt}
                              </p>
                              <p className="mt-1 flex items-center gap-1.5 text-sm text-sand-600 dark:text-sand-300">
                                <Clock className="h-3.5 w-3.5" /> {m.schedule}
                              </p>
                              {m.notes && <p className="mt-1 text-xs text-sand-500 dark:text-sand-400">{m.notes}</p>}
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleActive(m.id)}
                                className={`chip text-xs ${m.active ? 'chip-active' : ''}`}
                                aria-pressed={m.active}
                              >
                                {m.active ? 'Active' : 'Paused'}
                              </button>
                              <button
                                onClick={() => deleteMed(m.id)}
                                className="rounded-lg p-1.5 text-sand-400 hover:bg-sand-100 hover:text-danger dark:hover:bg-sand-800"
                                title="Delete medication"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                            {m.active && (
                              <button
                                onClick={() => toggleTakenOnDate(m, todayStr)}
                                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-600 transition-all ${
                                  takenToday
                                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                                    : 'bg-rose-500 text-white hover:bg-rose-600 shadow-sm'
                                }`}
                              >
                                {takenToday ? <Check className="h-3.5 w-3.5" /> : <Bell className="h-3.5 w-3.5" />}
                                {takenToday ? 'Taken Today' : 'Mark as Taken'}
                              </button>
                            )}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* TAB CONTENT 2: MEDICATION CALENDAR & HISTORY                              */}
      {/* ========================================================================= */}
      {activeTab === 'calendar' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-5">
          {/* COMPACT STATS SUMMARY BOXES */}
          {meds.length > 0 && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Card className="flex items-center gap-3 p-3.5 bg-gradient-to-br from-rose-50/50 to-clay-50/50 dark:from-rose-950/20 dark:to-clay-950/20">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-clay-500/10 text-clay-600 dark:text-clay-300">
                  <Pill className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[10px] font-600 uppercase tracking-wider text-sand-500 dark:text-sand-400">Active Prescriptions</p>
                  <h4 className="text-sm sm:text-base font-700 text-sand-900 dark:text-sand-100">{activeMeds.length} Meds</h4>
                </div>
              </Card>

              <Card className="flex items-center gap-3 p-3.5 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Flame className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[10px] font-600 uppercase tracking-wider text-sand-500 dark:text-sand-400">Current Streak</p>
                  <h4 className="text-sm sm:text-base font-700 text-sand-900 dark:text-sand-100">{streak} Day{streak !== 1 ? 's' : ''} Streak</h4>
                </div>
              </Card>

              <Card className="flex items-center gap-3 p-3.5 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[10px] font-600 uppercase tracking-wider text-sand-500 dark:text-sand-400">Monthly Adherence</p>
                  <h4 className="text-sm sm:text-base font-700 text-sand-900 dark:text-sand-100">{monthlyAdherence}% Logged</h4>
                </div>
              </Card>
            </div>
          )}

          {/* Database Calendar View */}
          <Card className="p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300">
                  <CalendarIcon className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-display text-base font-600 text-sand-900 dark:text-sand-100">Live Database Calendar</h3>
                  <p className="text-xs text-sand-500 dark:text-sand-400">Click any day to view or edit saved logs</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={prevMonth}
                  className="rounded-lg p-1.5 text-sand-600 hover:bg-sand-100 dark:text-sand-300 dark:hover:bg-sand-800"
                  title="Previous Month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="min-w-[120px] text-center font-display text-sm font-600 text-sand-900 dark:text-sand-100">
                  {monthName}
                </span>
                <button
                  onClick={nextMonth}
                  className="rounded-lg p-1.5 text-sand-600 hover:bg-sand-100 dark:text-sand-300 dark:hover:bg-sand-800"
                  title="Next Month"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Days Header */}
            <div className="mt-5 grid grid-cols-7 text-center text-xs font-600 text-sand-500 dark:text-sand-400">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="py-1">{d}</div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1.5 text-center">
              {/* Empty leading cells */}
              {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                <div key={`empty-${idx}`} className="h-14 rounded-xl bg-sand-50/40 dark:bg-sand-900/10" />
              ))}

              {/* Days of Month rendered dynamically from PostgreSQL records */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const isToday = dateStr === todayStr;

                const takenMedsForDay = activeMeds.filter((m) => (m.takenDates || []).includes(dateStr));
                const takenCount = takenMedsForDay.length;

                let bgStyle = 'hover:bg-sand-100 dark:hover:bg-sand-800/60 border border-transparent';
                if (activeMeds.length > 0) {
                  if (takenCount === activeMeds.length) {
                    bgStyle = 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-500/25';
                  } else if (takenCount > 0) {
                    bgStyle = 'bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 hover:bg-amber-500/25';
                  }
                }

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDayStr(dateStr)}
                    className={`relative flex h-14 flex-col items-center justify-between rounded-xl p-1.5 transition-all ${bgStyle} ${
                      isToday ? 'ring-2 ring-rose-500 ring-offset-2 dark:ring-offset-sand-900' : ''
                    }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className={`text-xs font-600 ${isToday ? 'text-rose-600 dark:text-rose-400 font-700' : 'text-sand-700 dark:text-sand-300'}`}>
                        {dayNum}
                      </span>
                      {takenCount === activeMeds.length && activeMeds.length > 0 && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      )}
                      {takenCount > 0 && takenCount < activeMeds.length && (
                        <AlertCircle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                      )}
                    </div>

                    {/* Micro Pill Badges */}
                    <div className="flex flex-wrap items-center justify-center gap-0.5 max-w-full">
                      {takenMedsForDay.slice(0, 3).map((m) => (
                        <span
                          key={m.id}
                          title={`${m.name} taken on ${dateStr}`}
                          className="inline-block h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400"
                        />
                      ))}
                      {takenMedsForDay.length > 3 && (
                        <span className="text-[9px] font-600 text-sand-500 dark:text-sand-400">
                          +{takenMedsForDay.length - 3}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Calendar Legend */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-sand-200/60 dark:border-sand-800 pt-3 text-xs text-sand-600 dark:text-sand-400">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
                  <span>All Meds Taken</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500/20 border border-amber-500/50" />
                  <span>Partially Taken</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full border border-sand-300 dark:border-sand-700" />
                  <span>Not Taken / Missed</span>
                </div>
              </div>

              <p className="text-sand-500 dark:text-sand-400">
                Synced & securely saved
              </p>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Selected Day Detail Modal */}
      <Modal
        open={Boolean(selectedDayStr)}
        onClose={() => setSelectedDayStr(null)}
        title={`Database Log for ${selectedDayStr}`}
        size="md"
      >
        {selectedDayStr && (
          <div className="space-y-4">
            <p className="text-sm text-sand-600 dark:text-sand-400">
              Toggle checkmarks below to record which medications you took on <strong>{selectedDayStr}</strong>:
            </p>

            {activeMeds.length === 0 ? (
              <p className="text-sm text-sand-500 dark:text-sand-400 italic py-4 text-center">
                No active medications to log for this day.
              </p>
            ) : (
              <div className="space-y-2">
                {activeMeds.map((m) => {
                  const taken = (m.takenDates || []).includes(selectedDayStr);
                  return (
                    <div
                      key={m.id}
                      onClick={() => toggleTakenOnDate(m, selectedDayStr)}
                      className={`flex items-center justify-between rounded-xl p-3 border transition-all cursor-pointer ${
                        taken
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-900 dark:text-emerald-200'
                          : 'bg-sand-50 dark:bg-sand-800/40 border-sand-200 dark:border-sand-700 hover:bg-sand-100 dark:hover:bg-sand-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${taken ? 'bg-emerald-500 text-white' : 'bg-sand-200 text-sand-600 dark:bg-sand-700 dark:text-sand-300'}`}>
                          <Pill className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="font-600 text-sm text-sand-900 dark:text-sand-100">{m.name}</p>
                          <p className="text-xs text-sand-500 dark:text-sand-400">{m.dose} · {m.schedule}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-600 ${
                          taken ? 'bg-emerald-600 text-white' : 'bg-sand-200 text-sand-700 dark:bg-sand-700 dark:text-sand-200'
                        }`}
                      >
                        {taken ? <Check className="h-3.5 w-3.5" /> : null}
                        {taken ? 'Taken' : 'Mark Taken'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button onClick={() => setSelectedDayStr(null)}>Done</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Medication Modal */}
      <Modal open={adding} onClose={() => setAdding(false)} title="Add medication" size="md">
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Metformin" />
          <Input label="Dose" value={form.dose} onChange={(e) => setForm((f) => ({ ...f, dose: e.target.value }))} placeholder="e.g. 500 mg" />
          <Input label="Schedule" value={form.schedule} onChange={(e) => setForm((f) => ({ ...f, schedule: e.target.value }))} placeholder="e.g. Daily, with breakfast" />
          <div>
            <p className="mb-2 text-sm font-600 text-sand-800 dark:text-sand-200">Type</p>
            <div className="flex flex-wrap gap-2">
              {medicationTypes.map((t) => (
                <button key={t.value} onClick={() => setForm((f) => ({ ...f, type: t.value }))} className={`chip ${form.type === t.value ? 'chip-active' : ''}`} aria-pressed={form.type === t.value}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <Input label="Notes (optional)" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="e.g. Discussed with Dr. Nair" />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
            <Button onClick={add} leftIcon={<Check className="h-4 w-4" />}>Add</Button>
          </div>
        </div>
      </Modal>

      <div className="mt-8">
        <Disclaimer variant="inline" />
      </div>
    </div>
  );
}
