import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Calendar, Sparkles, Heart, ArrowRight, ArrowLeft } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useAuth, type OnboardingFocus } from '../../context/AuthContext';
import { api } from '../../services/api';
import type { FlowLevel } from '../../mock/cycle';
import { symptomOptions, moodOptions, type SymptomEntry } from '../../mock/symptoms';

const focusOptions: { value: OnboardingFocus; label: string; desc: string; emoji: string }[] = [
  { value: 'periods', label: 'My periods', desc: 'Predict cycles & symptom timing', emoji: '🩹' },
  { value: 'pcos', label: 'PCOS', desc: 'Track irregular cycles & metabolic signs', emoji: '🌸' },
  { value: 'fertility', label: 'Fertility', desc: 'Track ovulation & fertile windows', emoji: '🌱' },
  { value: 'pregnancy', label: 'Pregnancy', desc: 'Week-by-week milestones & symptoms', emoji: '🤰' },
  { value: 'menopause', label: 'Menopause', desc: 'Track transitions & hot flashes', emoji: '🌙' },
  { value: 'general', label: 'Just exploring', desc: 'General holistic health log', emoji: '✨' },
];

const flowLabels: Record<FlowLevel, string> = {
  none: 'No flow',
  spotting: 'Spotting',
  light: 'Light',
  medium: 'Medium',
  heavy: 'Heavy',
};

interface OnboardingWalkthroughProps {
  open: boolean;
  onClose: () => void;
}

export function OnboardingWalkthrough({ open, onClose }: OnboardingWalkthroughProps) {
  const { user, updateUser } = useAuth();
  const todayStr = new Date().toISOString().slice(0, 10);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [focus, setFocus] = useState<OnboardingFocus>(user?.focus || 'general');
  const [lastPeriodDate, setLastPeriodDate] = useState<string>('');
  const [hasPeriodDate, setHasPeriodDate] = useState<boolean>(true);

  // Quick log
  const [flow, setFlow] = useState<FlowLevel>('none');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [mood, setMood] = useState<SymptomEntry['mood']>('calm');
  const [loading, setLoading] = useState(false);

  const handleNextStep = () => {
    if (step === 1) setStep(2);
    else if (step === 2) setStep(3);
  };

  const handlePrevStep = () => {
    if (step === 3) setStep(2);
    else if (step === 2) setStep(1);
  };

  const toggleSymptom = (s: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(s) ? prev.filter((item) => item !== s) : [...prev, s],
    );
  };

  const setPresetDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    setLastPeriodDate(d.toISOString().slice(0, 10));
    setHasPeriodDate(true);
  };

  const handleComplete = async () => {
    setLoading(true);
    const email = user?.email;

    try {
      // 1. If period date was entered, save cycle log
      if (email && hasPeriodDate && lastPeriodDate) {
        await api.cycle.save(email, lastPeriodDate, 'medium', 'Logged during onboarding').catch(() => {});
      }

      // 2. If quick log had flow or symptoms today, save them
      if (email && (flow !== 'none' || selectedSymptoms.length > 0)) {
        if (flow !== 'none') {
          await api.cycle.save(email, todayStr, flow, 'Logged during onboarding').catch(() => {});
        }
        if (selectedSymptoms.length > 0) {
          await api.symptoms.save(email, todayStr, selectedSymptoms, 'Logged during onboarding', mood, 3).catch(() => {});
        }
      }

      // 3. Update user profile
      updateUser({
        focus,
        lastPeriodStart: hasPeriodDate && lastPeriodDate ? lastPeriodDate : user?.lastPeriodStart,
        hasCompletedOnboarding: true,
      });

      onClose();
    } catch {
      updateUser({
        focus,
        lastPeriodStart: hasPeriodDate && lastPeriodDate ? lastPeriodDate : user?.lastPeriodStart,
        hasCompletedOnboarding: true,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <div className="py-2">
        {/* Progress Bar */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-clay-100 text-xs font-700 text-clay-600 dark:bg-clay-800 dark:text-clay-200">
              {step}
            </span>
            <span className="text-xs font-600 uppercase tracking-wide text-sand-500">
              Step {step} of 3
            </span>
          </div>
          <div className="flex h-1.5 w-36 overflow-hidden rounded-full bg-sand-200 dark:bg-sand-700">
            <div
              className="bg-clay-500 transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: CONFIRM FOCUS AREA */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="text-center sm:text-left">
                <h2 className="font-display text-2xl font-600 text-sand-900 dark:text-sand-100">
                  Welcome to Saheli, {user?.name.split(' ')[0]} 👋
                </h2>
                <p className="mt-1 text-sm text-sand-600 dark:text-sand-300">
                  What is your main focus right now? We use this to surface personalized insights.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 pt-2">
                {focusOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFocus(opt.value)}
                    className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                      focus === opt.value
                        ? 'border-clay-500 bg-clay-50/80 ring-1 ring-clay-500 dark:border-clay-500 dark:bg-clay-800/40'
                        : 'border-sand-200 bg-white hover:border-sand-300 dark:border-sand-700 dark:bg-sand-800'
                    }`}
                  >
                    <span className="text-2xl" aria-hidden>{opt.emoji}</span>
                    <div className="flex-1">
                      <p className="font-600 text-sand-900 dark:text-sand-100">{opt.label}</p>
                      <p className="mt-0.5 text-xs text-sand-500 dark:text-sand-400">{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 flex justify-end pt-4 border-t border-sand-200/60 dark:border-sand-700/60">
                <Button onClick={handleNextStep} rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Continue to period setup
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: OPTIONAL LAST PERIOD DATE */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <h2 className="font-display text-2xl font-600 text-sand-900 dark:text-sand-100">
                  When did your last period start?
                </h2>
                <p className="mt-1 text-sm text-sand-600 dark:text-sand-300">
                  This helps calculate cycle day and predict your next cycle. You can always change or skip this.
                </p>
              </div>

              <div className="rounded-xl border border-sand-200 bg-sand-50 p-4 dark:border-sand-700 dark:bg-sand-800/40 space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="has-date"
                    checked={hasPeriodDate}
                    onChange={(e) => setHasPeriodDate(e.target.checked)}
                    className="h-4 w-4 accent-clay-500 rounded"
                  />
                  <label htmlFor="has-date" className="text-sm font-600 text-sand-800 dark:text-sand-100">
                    I remember when my last period started
                  </label>
                </div>

                {hasPeriodDate && (
                  <div className="space-y-3 pt-2">
                    <label className="block text-xs font-600 uppercase text-sand-600 dark:text-sand-300">
                      Select date
                    </label>
                    <input
                      type="date"
                      max={todayStr}
                      value={lastPeriodDate}
                      onChange={(e) => setLastPeriodDate(e.target.value)}
                      className="input-base text-sm"
                    />

                    <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1">
                      <span className="text-sand-500">Quick options:</span>
                      <button type="button" onClick={() => setPresetDate(0)} className="chip text-xs">Today</button>
                      <button type="button" onClick={() => setPresetDate(3)} className="chip text-xs">3 days ago</button>
                      <button type="button" onClick={() => setPresetDate(7)} className="chip text-xs">1 week ago</button>
                      <button type="button" onClick={() => setPresetDate(14)} className="chip text-xs">2 weeks ago</button>
                    </div>
                  </div>
                )}

                {!hasPeriodDate && (
                  <p className="text-xs text-sand-500 dark:text-sand-400">
                    No worries! You can log your period anytime from your dashboard when it starts.
                  </p>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between pt-4 border-t border-sand-200/60 dark:border-sand-700/60">
                <Button variant="ghost" onClick={handlePrevStep} leftIcon={<ArrowLeft className="h-4 w-4" />}>
                  Back
                </Button>
                <Button onClick={handleNextStep} rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Continue to quick log
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: FIRST QUICK LOG */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <h2 className="font-display text-2xl font-600 text-sand-900 dark:text-sand-100">
                  How are you feeling today?
                </h2>
                <p className="mt-1 text-sm text-sand-600 dark:text-sand-300">
                  Log your first entry to kickstart your dashboard analytics. (Optional)
                </p>
              </div>

              {/* Today's flow */}
              <div>
                <label className="mb-2 block text-xs font-600 uppercase text-sand-700 dark:text-sand-200">
                  Period Flow Today
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['none', 'spotting', 'light', 'medium', 'heavy'] as FlowLevel[]).map((fl) => (
                    <button
                      key={fl}
                      type="button"
                      onClick={() => setFlow(fl)}
                      className={`chip text-sm capitalize ${flow === fl ? 'chip-active' : ''}`}
                    >
                      {flowLabels[fl]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mood */}
              <div>
                <label className="mb-2 block text-xs font-600 uppercase text-sand-700 dark:text-sand-200">
                  Mood
                </label>
                <div className="flex flex-wrap gap-2">
                  {moodOptions.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMood(m)}
                      className={`chip text-sm capitalize ${mood === m ? 'chip-active' : ''}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Key symptoms */}
              <div>
                <label className="mb-2 block text-xs font-600 uppercase text-sand-700 dark:text-sand-200">
                  Symptoms (Select any)
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1">
                  {symptomOptions.slice(0, 10).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSymptom(s)}
                      className={`chip text-xs ${selectedSymptoms.includes(s) ? 'chip-active' : ''}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between pt-4 border-t border-sand-200/60 dark:border-sand-700/60">
                <Button variant="ghost" onClick={handlePrevStep} leftIcon={<ArrowLeft className="h-4 w-4" />}>
                  Back
                </Button>
                <Button
                  onClick={handleComplete}
                  loading={loading}
                  leftIcon={<Check className="h-4 w-4" />}
                >
                  Complete setup & open dashboard
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
}
