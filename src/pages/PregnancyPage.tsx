import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Baby, ChevronLeft, ChevronRight, BookOpen, HeartPulse } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Disclaimer } from '../components/common/Disclaimer';
import { useAuth } from '../context/AuthContext';
import { articleSummaries } from '../mock/articles';
import { fadeUp, staggerContainer, easeOut } from '../animations/variants';

const weekInfo: { range: string; title: string; body: string }[] = [
  { range: 'Weeks 1–4', title: 'Setting the stage', body: 'You may not know yet. Your body is quietly doing extraordinary work — implantation and the earliest cell divisions.' },
  { range: 'Weeks 5–8', title: 'Early changes', body: 'Fatigue and nausea often begin. Your first prenatal visit is usually booked between weeks 8 and 12.' },
  { range: 'Weeks 9–12', title: 'End of trimester one', body: 'Tiny movements begin, though you will not feel them yet. Many find fatigue eases near week 12.' },
  { range: 'Weeks 13–16', title: 'Second trimester begins', body: 'Energy often returns. Some begin to feel fluttery movements ("quickening") in the coming weeks.' },
  { range: 'Weeks 17–20', title: 'Halfway there', body: 'An anatomy scan typically happens around weeks 18–22. Movements may become more noticeable.' },
  { range: 'Weeks 21–24', title: 'Growing steadily', body: 'Sleep positions and comfort start to matter. Gentle movement and hydration help.' },
  { range: 'Weeks 25–28', title: 'Third trimester approaches', body: 'A glucose screening is common around weeks 24–28. Kick counts often begin.' },
  { range: 'Weeks 29–40', title: 'Final stretch', body: 'Visits become more frequent. Pack a bag, finalize your plan, and rest when you can.' },
];

export function PregnancyPage() {
  const { user } = useAuth();
  const [week, setWeek] = useState(user?.pregnancyWeek ?? 8);

  const stageIndex = week <= 4 ? 0 : week <= 8 ? 1 : week <= 12 ? 2 : week <= 16 ? 3 : week <= 20 ? 4 : week <= 24 ? 5 : week <= 28 ? 6 : 7;
  const stage = weekInfo[stageIndex];
  const progress = Math.min(100, Math.round((week / 40) * 100));

  const related = articleSummaries.filter((a) => a.topic === 'pregnancy').slice(0, 3);

  return (
    <div className="mx-auto max-w-5xl">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        <motion.h1 variants={fadeUp} className="font-display text-3xl font-600 text-sand-900 dark:text-sand-100 sm:text-4xl">
          Pregnancy mode
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-2 text-sand-600 dark:text-sand-300">
          Week-by-week support, with your symptoms carried over from your cycle log.
        </motion.p>
      </motion.div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between">
              <button onClick={() => setWeek((w) => Math.max(1, w - 1))} aria-label="Previous week" className="rounded-lg p-2 text-sand-600 hover:bg-sand-100 dark:text-sand-300 dark:hover:bg-sand-800">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="text-center">
                <p className="text-xs font-600 uppercase tracking-wide text-clay-500">Week</p>
                <p className="font-display text-5xl font-700 text-clay-600 dark:text-clay-200">{week}</p>
              </div>
              <button onClick={() => setWeek((w) => Math.min(40, w + 1))} aria-label="Next week" className="rounded-lg p-2 text-sand-600 hover:bg-sand-100 dark:text-sand-300 dark:hover:bg-sand-800">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="h-2 w-full overflow-hidden rounded-full bg-sand-200 dark:bg-sand-700">
                <motion.div
                  className="h-full rounded-full bg-clay-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: easeOut }}
                />
              </div>
              <p className="mt-1.5 text-xs text-sand-500 dark:text-sand-400">{progress}% of the way there</p>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={stage.range}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: easeOut }}
                className="mt-6"
              >
                <span className="flex items-center gap-2 text-sm font-600 text-clay-500">
                  <Baby className="h-4 w-4" /> {stage.range}
                </span>
                <h2 className="mt-2 font-display text-2xl font-600 text-sand-900 dark:text-sand-100">{stage.title}</h2>
                <p className="mt-2 text-sand-600 dark:text-sand-300">{stage.body}</p>
              </motion.div>
            </AnimatePresence>
          </Card>

          <Card className="mt-4">
            <h3 className="flex items-center gap-2 font-600 text-sand-900 dark:text-sand-100">
              <HeartPulse className="h-5 w-5 text-clay-500" /> Milestones this stage
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-sand-600 dark:text-sand-400">
              <li>• Keep logging symptoms — your cycle data carries over here.</li>
              <li>• Note any changes to share at your next prenatal visit.</li>
              <li>• If anything feels off (pain, bleeding, reduced movement later on), call your doctor the same day.</li>
            </ul>
            <Link to="/tracker/symptoms" className="mt-3 inline-flex text-sm font-600 text-clay-600 hover:underline dark:text-clay-300">
              Log a symptom →
            </Link>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <h3 className="flex items-center gap-2 font-600 text-sand-900 dark:text-sand-100">
              <BookOpen className="h-5 w-5 text-clay-500" /> Relevant reading
            </h3>
            <ul className="mt-3 space-y-2">
              {related.map((a) => (
                <li key={a.id}>
                  <Link to={`/library/${a.id}`} className="block rounded-lg p-2 text-sm text-sand-700 hover:bg-sand-100 dark:text-sand-200 dark:hover:bg-sand-700/50">
                    {a.title}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <div className="mt-8">
        <Disclaimer />
      </div>
    </div>
  );
}
