import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pill, Clock, Check, X, Bell } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Disclaimer } from '../components/common/Disclaimer';
import { Modal } from '../components/common/Modal';
import { medications as initialMeds, medicationTypes, type Medication } from '../mock/medications';
import { fadeUp, staggerContainer, easeOut } from '../animations/variants';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export function MedsTrackerPage() {
  const { user } = useAuth();
  const [meds, setMeds] = useState<Medication[]>(initialMeds);
  const [adding, setAdding] = useState(false);
  const [takenToday, setTakenToday] = useState<Record<string, boolean>>({ m1: true, m2: true });
  const [form, setForm] = useState({ name: '', dose: '', schedule: '', type: 'supplement' as Medication['type'], notes: '' });

  useEffect(() => {
    if (user?.email) {
      api.medications.get(user.email).then((res) => {
        if (res.meds && res.meds.length > 0) {
          setMeds(res.meds);
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
      startedAt: new Date().toISOString().slice(0, 10),
      notes: form.notes.trim() || undefined,
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
        if (res.meds) setMeds(res.meds);
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

  return (
    <div className="mx-auto max-w-4xl">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        <motion.h1 variants={fadeUp} className="font-display text-3xl font-600 text-sand-900 dark:text-sand-100 sm:text-4xl">
          Medications & supplements
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-2 text-sand-600 dark:text-sand-300">
          Track birth control, PCOS meds, prenatal vitamins, and supplements with gentle reminders.
        </motion.p>
      </motion.div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-sand-500 dark:text-sand-400">{meds.filter((m) => m.active).length} active</p>
        <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setAdding(true)}>
          Add medication
        </Button>
      </div>

      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mt-4 space-y-3">
        <AnimatePresence>
          {meds.map((m) => {
            const typeLabel = medicationTypes.find((t) => t.value === m.type)?.label ?? m.type;
            const taken = takenToday[m.id];
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
                      <button
                        onClick={() => toggleActive(m.id)}
                        className={`chip text-xs ${m.active ? 'chip-active' : ''}`}
                        aria-pressed={m.active}
                      >
                        {m.active ? 'Active' : 'Paused'}
                      </button>
                      {m.active && (
                        <button
                          onClick={() => setTakenToday((prev) => ({ ...prev, [m.id]: !prev[m.id] }))}
                          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-600 transition-colors ${
                            taken
                              ? 'bg-success/15 text-success'
                              : 'bg-sand-100 text-sand-600 hover:bg-sand-200 dark:bg-sand-700/50 dark:text-sand-300'
                          }`}
                        >
                          {taken ? <Check className="h-3.5 w-3.5" /> : <Bell className="h-3.5 w-3.5" />}
                          {taken ? 'Taken today' : 'Mark taken'}
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
