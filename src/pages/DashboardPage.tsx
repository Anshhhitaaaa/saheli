import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarDays, Sparkles, BookOpen, Plus, TrendingUp, ArrowRight, Baby, Heart, LifeBuoy, Droplet, Moon, Zap } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Disclaimer } from '../components/common/Disclaimer';
import { useAuth } from '../context/AuthContext';
import { getCycleStats, type CycleStats } from '../services/cycleService';
import { useCountUp } from '../hooks/useCountUp';
import { staggerContainer, fadeUp } from '../animations/variants';
import { LogPeriodStartModal } from '../components/tracker/LogPeriodStartModal';
import { OnboardingWalkthrough } from '../components/onboarding/OnboardingWalkthrough';
import { api } from '../services/api';

const dashboardMoodToApiMap: Record<string, 'calm' | 'sad' | 'anxious' | 'irritable' | 'happy'> = {
  'Okay': 'calm',
  'A bit low': 'sad',
  'Anxious': 'anxious',
  'Overwhelmed': 'irritable',
  'Doing well': 'happy',
};

const apiMoodToDashboardMap: Record<string, string> = {
  calm: 'Okay',
  sad: 'A bit low',
  anxious: 'Anxious',
  irritable: 'Overwhelmed',
  happy: 'Doing well',
};

export function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<CycleStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  const hasCycleData = Boolean(stats && stats.cycleCount > 0 && stats.currentDay !== null);
  const isNew = !user?.lastPeriodStart && !hasCycleData;

  // Trigger onboarding modal automatically for brand new users
  useEffect(() => {
    if (user && (!user.hasCompletedOnboarding && (!user.lastPeriodStart || user.email === 'new@saheli.app'))) {
      setOnboardingOpen(true);
    }
  }, [user]);

  const todayKey = new Date().toISOString().slice(0, 10);
  const [waterGlasses, setWaterGlasses] = useState<number>(() => {
    const saved = localStorage.getItem('saheli_water_' + todayKey);
    return saved ? parseInt(saved, 10) : 0;
  });
  const [sleepHours, setSleepHours] = useState<string | null>(() => {
    return localStorage.getItem('saheli_sleep_' + todayKey) || null;
  });
  const [energyLevel, setEnergyLevel] = useState<string | null>(() => {
    return localStorage.getItem('saheli_energy_' + todayKey) || null;
  });

  const handleWater = (count: number) => {
    const next = waterGlasses === count ? count - 1 : count;
    setWaterGlasses(next);
    localStorage.setItem('saheli_water_' + todayKey, next.toString());
  };

  const handleSleep = (hrs: string) => {
    setSleepHours(hrs);
    localStorage.setItem('saheli_sleep_' + todayKey, hrs);
  };

  const handleEnergy = (level: string) => {
    setEnergyLevel(level);
    localStorage.setItem('saheli_energy_' + todayKey, level);
  };

  const refreshStats = async () => {
    if (!user) return;
    const s = await getCycleStats(user.email);
    setStats(s);
    setLoading(false);
  };

  useEffect(() => {
    let active = true;
    (async () => {
      if (!user) return;
      const s = await getCycleStats(user.email);
      if (active) {
        setStats(s);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [user]);

  const dayCount = useCountUp(stats?.currentDay ?? 0);
  const [moodToday, setMoodToday] = useState<string | null>(null);
  const [showCrisis, setShowCrisis] = useState(false);

  // Fetch today's mood from database on load
  useEffect(() => {
    if (user?.email) {
      const todayStr = new Date().toISOString().slice(0, 10);
      api.symptoms.get(user.email).then((res) => {
        if (res.logs && Array.isArray(res.logs)) {
          const todayLog = res.logs.find((l: any) => l.date === todayStr);
          if (todayLog && todayLog.mood) {
            const dashMood = apiMoodToDashboardMap[todayLog.mood.toLowerCase()] || todayLog.mood;
            setMoodToday(dashMood);
          }
        }
      }).catch(() => {});
    }
  }, [user?.email]);

  const handleDashboardMoodClick = (m: string) => {
    setMoodToday(m);
    if (m === 'Overwhelmed') setShowCrisis(true);

    if (user?.email) {
      const todayStr = new Date().toISOString().slice(0, 10);
      const apiMood = dashboardMoodToApiMap[m] || 'calm';

      api.symptoms.get(user.email).then((res) => {
        const existing = res.logs?.find((l: any) => l.date === todayStr);
        const existingSymptoms = existing?.symptoms || [];
        const existingNotes = existing?.notes || existing?.note || '';
        const existingSeverity = existing?.severity || 3;

        api.symptoms.save(user.email, todayStr, existingSymptoms, existingNotes, apiMood, existingSeverity).catch(() => {});
      }).catch(() => {
        api.symptoms.save(user.email, todayStr, [], '', apiMood, 3).catch(() => {});
      });
    }
  };

  const focusLabel: Record<string, string> = {
    pcos: 'PCOS focus',
    fertility: 'Fertility focus',
    pregnancy: 'Pregnancy mode',
    menopause: 'Menopause focus',
    periods: 'Cycle tracking',
    general: 'General tracking',
  };

  return (
    <div className="mx-auto max-w-6xl">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        <motion.h1 variants={fadeUp} className="font-display text-3xl font-600 text-sand-900 dark:text-sand-100 sm:text-4xl">
          Hi @{user?.username || user?.name}.
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-2 text-sand-600 dark:text-sand-300">
          {focusLabel[user?.focus ?? 'general'] ?? 'Welcome back.'} Here is your snapshot for today.
        </motion.p>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="mt-8 grid gap-4 lg:grid-cols-3"
      >
        {/* Cycle status card */}
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <Card className="relative h-full overflow-hidden">
            <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-clay-100/50 dark:bg-clay-800/30 blur-2xl" />
            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-8 border-clay-100 dark:border-clay-800/50">
                <div className="text-center">
                  <p className="font-display text-3xl font-700 text-clay-600 dark:text-clay-200">
                    {loading ? '—' : isNew ? '—' : dayCount}
                  </p>
                  <p className="text-xs font-600 uppercase tracking-wide text-sand-500">day</p>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-600 uppercase tracking-wide text-clay-500">Cycle status</p>
                <h2 className="mt-1 font-display text-2xl font-600 text-sand-900 dark:text-sand-100">
                  {isNew
                    ? 'Log your first period to begin'
                    : stats?.currentDay && stats.currentDay <= 5
                      ? 'You may be on your period'
                      : stats?.currentDay && stats.currentDay > 14 && stats.currentDay < 21
                        ? 'Near ovulation'
                        : 'In your cycle'}
                </h2>
                <p className="mt-1.5 text-sm text-sand-600 dark:text-sand-400">
                  {isNew
                    ? 'A few days of tracking is all it takes to start seeing patterns.'
                    : `Average cycle ${stats?.avgLength ?? '—'} days · next period around ${stats?.nextPredictedStart ?? '—'
                    }`}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => setLogModalOpen(true)} leftIcon={<Plus className="h-4 w-4" />}>
                    Log period start
                  </Button>
                  <Link to="/tracker/symptoms">
                    <Button variant="outline" size="sm">
                      Log symptoms
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Quick insight */}
        <motion.div variants={fadeUp}>
          <Card className="h-full bg-sage-50/60 dark:bg-sage-800/20">
            <TrendingUp className="h-6 w-6 text-sage-600 dark:text-sage-300" />
            <h3 className="mt-3 font-600 text-sand-900 dark:text-sand-100">A gentle nudge</h3>
            <p className="mt-1.5 text-sm text-sand-600 dark:text-sand-400">
              {isNew
                ? 'Once you log a couple of cycles, your dashboard will surface patterns in mood, symptoms, and timing.'
                : 'Your last few cycles suggest a stable pattern. Keep tracking to confirm — and bring it to your doctor.'}
            </p>
            <Link to="/insights" className="mt-3 inline-flex items-center gap-1 text-sm font-600 text-sage-700 hover:underline dark:text-sage-200">
              See insights <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>
        </motion.div>
      </motion.div>

      {/* Mental health check-in */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mt-6">
        <Card className="border-sage-200/60 bg-sage-50/50 dark:border-sage-700/50 dark:bg-sage-800/20">
          <div className="flex items-start gap-3">
            <Heart className="mt-0.5 h-6 w-6 shrink-0 text-sage-600 dark:text-sage-300" />
            <div className="flex-1">
              <h3 className="font-600 text-sand-900 dark:text-sand-100">A gentle check-in</h3>
              <p className="mt-1 text-sm text-sand-600 dark:text-sand-400">
                Your mental health matters as much as your physical health. How are you feeling today — really?
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {['Okay', 'A bit low', 'Anxious', 'Overwhelmed', 'Doing well'].map((m) => (
                  <button
                    key={m}
                    onClick={() => handleDashboardMoodClick(m)}
                    className={`chip text-sm ${moodToday === m ? 'chip-active' : ''}`}
                    aria-pressed={moodToday === m}
                  >
                    {m}
                  </button>
                ))}
              </div>
              {moodToday && moodToday !== 'Overwhelmed' && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-sm text-sage-700 dark:text-sage-200">
                  Thank you for checking in. {moodToday === 'Okay' || moodToday === 'Doing well' ? 'Glad to hear it.' : 'Be gentle with yourself today — and consider logging a symptom or talking to someone you trust.'}
                </motion.p>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Daily Lifestyle Widgets */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mt-6">
        <Card>
          <h3 className="font-600 text-sand-900 dark:text-sand-100">Daily habit snapshot</h3>
          <div className="mt-4 grid gap-6 sm:grid-cols-3">
            {/* Water Tracker */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-600">
                <span className="flex items-center gap-1.5 text-sand-700 dark:text-sand-200">
                  <Droplet className="h-4 w-4 text-clay-500" /> Water intake
                </span>
                <span className="text-clay-600 dark:text-clay-300">{waterGlasses}/8 glasses</span>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 8 }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    onClick={() => handleWater(num)}
                    className={`flex h-7 flex-1 items-center justify-center rounded-lg transition-all ${num <= waterGlasses
                        ? 'bg-clay-500 text-white shadow-sm'
                        : 'bg-sand-100 text-sand-400 hover:bg-sand-200 dark:bg-sand-800'
                      }`}
                    title={`Glass ${num}`}
                  >
                    <Droplet className="h-3.5 w-3.5" />
                  </button>
                ))}
              </div>
            </div>

            {/* Sleep Log */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-600">
                <span className="flex items-center gap-1.5 text-sand-700 dark:text-sand-200">
                  <Moon className="h-4 w-4 text-sage-500" /> Sleep last night
                </span>
                <span className="text-sage-600 dark:text-sage-300">{sleepHours || 'Not logged'}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['5h', '6h', '7h', '8h', '9h+'].map((hrs) => (
                  <button
                    key={hrs}
                    onClick={() => handleSleep(hrs)}
                    className={`chip text-xs ${sleepHours === hrs ? 'chip-active' : ''}`}
                    aria-pressed={sleepHours === hrs}
                  >
                    {hrs}
                  </button>
                ))}
              </div>
            </div>

            {/* Energy Level */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-600">
                <span className="flex items-center gap-1.5 text-sand-700 dark:text-sand-200">
                  <Zap className="h-4 w-4 text-warning" /> Energy level
                </span>
                <span className="text-warning">{energyLevel || 'Not logged'}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['Low', 'Medium', 'High'].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => handleEnergy(lvl)}
                    className={`chip text-xs ${energyLevel === lvl ? 'chip-active' : ''}`}
                    aria-pressed={energyLevel === lvl}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Crisis resources */}
      {showCrisis && (
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mt-4">
          <Card className="border-clay-200/70 bg-clay-50/50 dark:border-clay-700/50 dark:bg-clay-800/20">
            <div className="flex items-start gap-3">
              <LifeBuoy className="mt-0.5 h-6 w-6 shrink-0 text-clay-600 dark:text-clay-300" />
              <div>
                <h3 className="font-600 text-sand-900 dark:text-sand-100">If things feel overwhelming</h3>
                <p className="mt-1 text-sm text-sand-600 dark:text-sand-400">You deserve support. These free, confidential resources are available right now:</p>
                <ul className="mt-3 space-y-2 text-sm text-sand-700 dark:text-sand-200">
                  <li className="flex items-center gap-2"><LifeBuoy className="h-4 w-4 text-clay-500" /> iCall (India): +91 9152987821 — Mon–Sat, 8 AM–10 PM</li>
                  <li className="flex items-center gap-2"><LifeBuoy className="h-4 w-4 text-clay-500" /> Aasra: +91 9820466726 — 24/7</li>
                  <li className="flex items-center gap-2"><LifeBuoy className="h-4 w-4 text-clay-500" /> International: findahelpline.com</li>
                </ul>
                <p className="mt-3 text-xs text-sand-500 dark:text-sand-400">If you are in immediate danger, contact your local emergency number.</p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Onboarding Banner for new users */}
      {isNew && (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-6"
        >
          <Card className="border-clay-200/70 bg-clay-50/50 dark:border-clay-700/50 dark:bg-clay-800/20">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="font-display text-lg font-600 text-clay-700 dark:text-clay-200">
                  Welcome — let’s set up your space
                </h3>
                <p className="mt-1 text-sm text-sand-600 dark:text-sand-300">
                  Run the 3-step walkthrough to set your focus area, last period start date, and quick log.
                </p>
              </div>
              <Button onClick={() => setOnboardingOpen(true)} size="sm" leftIcon={<Sparkles className="h-4 w-4" />}>
                Start setup walkthrough
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Quick links */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {[
          { icon: Sparkles, title: 'Ask Saheli', body: 'Get grounded answers to your questions.', to: '/assistant' },
          { icon: BookOpen, title: 'Library', body: 'Read articles tailored to your focus.', to: '/library' },
          { icon: Baby, title: 'Pregnancy mode', body: 'Week-by-week milestones.', to: '/pregnancy', hidden: !user?.pregnancyMode },
          { icon: CalendarDays, title: 'Cycle tracker', body: 'Calendar with animated logging.', to: '/tracker' },
          { icon: BookOpen, title: 'Doctor summary', body: 'Export your data for your visit.', to: '/doctor-summary' },
        ]
          .filter((c) => !c.hidden)
          .map((c) => {
            const Icon = c.icon;
            return (
              <motion.div key={c.to} variants={fadeUp}>
                <Link to={c.to}>
                  <Card hover className="h-full">
                    <Icon className="h-6 w-6 text-clay-500" />
                    <h3 className="mt-3 font-600 text-sand-900 dark:text-sand-100">{c.title}</h3>
                    <p className="mt-1 text-sm text-sand-600 dark:text-sand-400">{c.body}</p>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
      </motion.div>

      {/* Log Period Modal */}
      <LogPeriodStartModal
        open={logModalOpen}
        onClose={() => setLogModalOpen(false)}
        onSuccess={() => {
          refreshStats();
        }}
      />

      {/* Onboarding Walkthrough Modal */}
      <OnboardingWalkthrough
        open={onboardingOpen}
        onClose={() => {
          setOnboardingOpen(false);
          refreshStats();
        }}
      />

      <div className="mt-8">
        <Disclaimer variant="inline" />
      </div>
    </div>
  );
}
