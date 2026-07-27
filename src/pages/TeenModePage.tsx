import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, BookOpen, Heart, ShieldCheck, Sparkles, ArrowRight, Check } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Disclaimer } from '../components/common/Disclaimer';
import { useAuth, type OnboardingFocus } from '../context/AuthContext';
import { fadeUp, staggerContainer, easeOut } from '../animations/variants';

const lessons = [
  { title: 'What is a period, really?', body: 'A friendly, plain-language explanation of what happens in your body each month — and why it is completely normal.' },
  { title: 'Tracking your first cycles', body: 'How to use Saheli to log your period, notice patterns, and feel more in tune with your body.' },
  { title: 'Mood and your cycle', body: 'Why you might feel different before your period, and simple things that can help.' },
  { title: 'When to talk to a trusted adult', body: 'Some signs worth a conversation with a parent, school nurse, or doctor — and how to start that talk.' },
];

const trustedAdults = ['Parent or guardian', 'School nurse', 'Family doctor', 'Older sibling', 'School counselor'];

export function TeenModePage() {
  const { user, updateUser } = useAuth();
  const [enabled, setEnabled] = useState(user?.focus === 'periods' && (user?.name?.length ?? 0) > 0);
  const [consentGiven, setConsentGiven] = useState(false);
  const [completed, setCompleted] = useState<string[]>([]);

  const enableTeenMode = () => {
    setEnabled(true);
    updateUser({ focus: 'periods' as OnboardingFocus });
  };

  const markComplete = (title: string) =>
    setCompleted((prev) => (prev.includes(title) ? prev : [...prev, title]));

  return (
    <div className="mx-auto max-w-3xl">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        <motion.span
          variants={fadeUp}
          className="inline-flex items-center gap-2 rounded-full border border-sage-200 bg-sage-50 px-3 py-1 text-sm font-600 text-sage-700 dark:border-sage-700/50 dark:bg-sage-800/30 dark:text-sage-200"
        >
          <GraduationCap className="h-3.5 w-3.5" /> Teen mode
        </motion.span>
        <motion.h1 variants={fadeUp} className="mt-4 font-display text-3xl font-600 text-sand-900 dark:text-sand-100 sm:text-4xl">
          A gentler start, with more scaffolding
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-3 text-lg text-sand-600 dark:text-sand-300">
          If you are navigating your first cycles, Saheli meets you where you are — with more educational guidance, a warmer tone, and optional parental-consent support.
        </motion.p>
      </motion.div>

      {!enabled ? (
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mt-8">
          <Card className="border-sage-200/70 bg-sage-50/50 dark:border-sage-700/50 dark:bg-sage-800/20">
            <h2 className="flex items-center gap-2 font-600 text-sand-900 dark:text-sand-100">
              <ShieldCheck className="h-5 w-5 text-sage-600 dark:text-sage-300" /> Before you begin
            </h2>
            <p className="mt-2 text-sm text-sand-600 dark:text-sand-400">
              Teen mode adds extra educational scaffolding and an optional parental-consent flow. Your tracking stays private — consent is about onboarding support, not data access.
            </p>
            <label className="mt-4 flex items-start gap-2.5">
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded accent-clay-500"
              />
              <span className="text-sm text-sand-700 dark:text-sand-200">
                I understand this is an educational tool, not a replacement for talking to a trusted adult or doctor. (You can ask a parent or guardian to help with this step.)
              </span>
            </label>
            <Button className="mt-4" onClick={enableTeenMode} disabled={!consentGiven} leftIcon={<Check className="h-4 w-4" />}>
              Enable teen mode
            </Button>
          </Card>
        </motion.div>
      ) : (
        <>
          {/* Onboarding lessons */}
          <div className="mt-8">
            <h2 className="font-display text-xl font-600 text-sand-900 dark:text-sand-100">Start here: four short lessons</h2>
            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mt-4 space-y-3">
              {lessons.map((lesson, i) => {
                const done = completed.includes(lesson.title);
                return (
                  <motion.div key={lesson.title} variants={fadeUp} initial="hidden" animate="visible">
                    <Card>
                      <div className="flex items-start gap-3">
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-700 ${done ? 'bg-success/15 text-success' : 'bg-clay-50 text-clay-600 dark:bg-clay-800/40 dark:text-clay-200'}`}>
                          {done ? <Check className="h-4 w-4" /> : i + 1}
                        </span>
                        <div className="flex-1">
                          <h3 className="font-600 text-sand-900 dark:text-sand-100">{lesson.title}</h3>
                          <p className="mt-1 text-sm text-sand-600 dark:text-sand-400">{lesson.body}</p>
                          <div className="mt-3 flex gap-2">
                            <Button size="sm" variant="outline" leftIcon={<BookOpen className="h-4 w-4" />} onClick={() => markComplete(lesson.title)}>
                              {done ? 'Completed' : 'Read'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* Trusted adults */}
          <div className="mt-8">
            <Card className="bg-clay-50/50 dark:bg-clay-800/20">
              <h2 className="flex items-center gap-2 font-600 text-sand-900 dark:text-sand-100">
                <Heart className="h-5 w-5 text-clay-500" /> Who can you talk to?
              </h2>
              <p className="mt-2 text-sm text-sand-600 dark:text-sand-400">
                If something feels off or you have a question you are not sure about, these people are good starting points:
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {trustedAdults.map((a) => (
                  <span key={a} className="chip">{a}</span>
                ))}
              </div>
            </Card>
          </div>

          {/* Quick links */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Link to="/tracker">
              <Card hover className="h-full">
                <Sparkles className="h-6 w-6 text-clay-500" />
                <h3 className="mt-3 font-600 text-sand-900 dark:text-sand-100">Log your first period</h3>
                <p className="mt-1 text-sm text-sand-600 dark:text-sand-400">It only takes a tap. You are doing great.</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-600 text-clay-600 dark:text-clay-300">
                  Start <ArrowRight className="h-4 w-4" />
                </span>
              </Card>
            </Link>
            <Link to="/assistant">
              <Card hover className="h-full">
                <Sparkles className="h-6 w-6 text-clay-500" />
                <h3 className="mt-3 font-600 text-sand-900 dark:text-sand-100">Ask Saheli a question</h3>
                <p className="mt-1 text-sm text-sand-600 dark:text-sand-400">No question is too small or silly.</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-600 text-clay-600 dark:text-clay-300">
                  Ask <ArrowRight className="h-4 w-4" />
                </span>
              </Card>
            </Link>
          </div>
        </>
      )}

      <div className="mt-8">
        <Disclaimer />
      </div>
    </div>
  );
}
