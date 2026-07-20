import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CalendarDays,
  BookOpen,
  Sparkles,
  Users,
  Stethoscope,
  ShieldCheck,
  HeartPulse,
  Baby,
  Flower2,
  Moon,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { SectionTitle } from '../components/common/Card';
import { Disclaimer } from '../components/common/Disclaimer';
import {
  fadeUp,
  staggerContainer,
  staggerContainerSlow,
  viewportStagger,
  viewportFade,
} from '../animations/variants';

const features = [
  { icon: CalendarDays, title: 'Cycle tracking', body: 'Log your period, flow, and notes with a calm, animated calendar.' },
  { icon: HeartPulse, title: 'Symptom & mood log', body: 'Gentle multi-select tags and a red-flag-aware safety layer.' },
  { icon: Sparkles, title: 'AI health assistant', body: 'A grounded, RAG-powered assistant that cites its sources — never diagnoses.' },
  { icon: Flower2, title: 'PCOS & fertility hubs', body: 'Condition-focused tracking and reviewed content tailored to your focus.' },
  { icon: Baby, title: 'Pregnancy mode', body: 'Week-by-week milestones with your symptom log carried over.' },
  { icon: Moon, title: 'Menopause support', body: 'Track the transition, understand the changes, find your community.' },
  { icon: Users, title: 'Community', body: 'Anonymous, pseudonymous, peer support — never a substitute for care.' },
  { icon: Stethoscope, title: 'Care directory', body: 'Find a clinician near you with availability and a one-tap booking stub.' },
  { icon: ShieldCheck, title: 'Privacy-first', body: 'Your data is yours — export or delete it, anytime, in plain language.' },
];

const personas = [
  { title: 'Teens', body: 'Navigating first cycles with plain-language answers and no judgment.' },
  { title: 'Adults with PCOS', body: 'Tracking irregular cycles and building a picture to bring to your doctor.' },
  { title: 'Anyone trying', body: 'Understanding your fertile window without pressure or guesswork.' },
  { title: 'Pregnant', body: 'Week-by-week support with symptoms carried over from your cycle.' },
  { title: 'In perimenopause', body: 'Making sense of changing cycles, sleep, and mood.' },
];

export function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <motion.div
            className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-clay-100/60 dark:bg-clay-800/20 blur-3xl"
            animate={{ x: [0, 24, 0], y: [0, -16, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute right-0 top-20 h-80 w-80 rounded-full bg-sage-100/60 dark:bg-sage-800/20 blur-3xl"
            animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
        <div className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="max-w-3xl">
            <motion.span
              variants={fadeUp}
              className="inline-flex items-center gap-2 rounded-full border border-clay-200 bg-clay-50 px-3 py-1 text-sm font-600 text-clay-600 dark:border-clay-700/50 dark:bg-clay-800/30 dark:text-clay-200"
            >
              <Sparkles className="h-3.5 w-3.5" />
              For every stage — from first cycles to menopause
            </motion.span>
            <motion.h1
              variants={fadeUp}
              className="mt-5 font-display text-4xl font-600 leading-tight text-sand-900 dark:text-sand-100 sm:text-6xl"
            >
              Your body, your questions,{' '}
              <span className="text-clay-600 dark:text-clay-300">answered with care.</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-5 text-lg text-sand-600 dark:text-sand-300 sm:text-xl">
              Saheli is a warm, judgment-free companion for menstrual, PCOS, fertility, pregnancy, and
              menopause health — tracking, a medically-reviewed library, a grounded AI assistant, and
              real care, one tap away.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
              <Link to="/signup">
                <Button size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
                  Start tracking
                </Button>
              </Link>
              <Link to="/library">
                <Button variant="outline" size="lg" leftIcon={<BookOpen className="h-5 w-5" />}>
                  Explore the library
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* What is Saheli */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <motion.div {...viewportFade} className="max-w-3xl">
          <h2 className="font-display text-3xl font-600 text-sand-900 dark:text-sand-100 sm:text-4xl">
            What is Saheli?
          </h2>
          <p className="mt-4 text-lg text-sand-600 dark:text-sand-300">
            Saheli means <em>friend</em> — and that is the whole idea. It is tracking that helps you
            notice your own patterns, education written in plain language and reviewed by clinicians,
            and a judgment-free place to ask the questions you might not say out loud. Real care is
            always one tap away, because nothing here replaces your doctor.
          </p>
        </motion.div>
      </section>

      {/* Feature grid */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <SectionTitle
          eyebrow="What you get"
          title="Everything in one calm place"
          subtitle="Tracking, education, a grounded assistant, and pathways to real care — designed to feel supportive, not clinical."
          center
        />
        <motion.div
          {...viewportStagger}
          className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <motion.div key={f.title} variants={fadeUp}>
                <Card hover className="h-full">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-clay-50 text-clay-600 dark:bg-clay-800/40 dark:text-clay-200">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-600 text-sand-900 dark:text-sand-100">
                    {f.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-sand-600 dark:text-sand-400">{f.body}</p>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Who it's for */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <SectionTitle
          eyebrow="Who it is for"
          title="Built for every stage"
          subtitle="Saheli grows with you — whatever stage you are in, whatever you are navigating."
          center
        />
        <motion.div
          {...viewportStagger}
          className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {personas.map((p) => (
            <motion.div key={p.title} variants={fadeUp}>
              <Card hover className="h-full">
                <h3 className="font-display text-xl font-600 text-clay-700 dark:text-clay-200">{p.title}</h3>
                <p className="mt-2 text-sm text-sand-600 dark:text-sand-400">{p.body}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Trust */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <motion.div {...viewportFade}>
          <Card className="border-sage-200/60 bg-sage-50/60 dark:border-sage-700/40 dark:bg-sage-800/20">
            <div className="grid gap-6 sm:grid-cols-3">
              <div>
                <ShieldCheck className="h-7 w-7 text-sage-600 dark:text-sage-300" />
                <h3 className="mt-3 font-600 text-sand-900 dark:text-sand-100">Privacy-first</h3>
                <p className="mt-1 text-sm text-sand-600 dark:text-sand-400">
                  Your cycle and symptom data is sensitive. It is yours to export or delete, in plain
                  language, in two clicks.
                </p>
              </div>
              <div>
                <BookOpen className="h-7 w-7 text-sage-600 dark:text-sage-300" />
                <h3 className="mt-3 font-600 text-sand-900 dark:text-sand-100">Medically reviewed</h3>
                <p className="mt-1 text-sm text-sand-600 dark:text-sand-400">
                  Every library article is reviewed and attributed. You always know who reviewed it and
                  when.
                </p>
              </div>
              <div>
                <Stethoscope className="h-7 w-7 text-sage-600 dark:text-sage-300" />
                <h3 className="mt-3 font-600 text-sand-900 dark:text-sand-100">Not your doctor</h3>
                <p className="mt-1 text-sm text-sand-600 dark:text-sand-400">
                  Saheli is educational. It describes patterns and points to care — it never diagnoses.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <motion.div
          variants={staggerContainerSlow}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-clay-500 to-clay-700 px-6 py-16 text-center shadow-lift sm:px-12"
        >
          <motion.h2 variants={fadeUp} className="font-display text-3xl font-600 text-white sm:text-4xl">
            Start with one cycle. Build a picture worth bringing to your doctor.
          </motion.h2>
          <motion.p variants={fadeUp} className="mx-auto mt-4 max-w-xl text-clay-100">
            Free to start. No judgment, no jargon — just a calmer way to understand your body.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-8 flex justify-center">
            <Link to="/signup">
              <Button size="lg" className="bg-white text-clay-700 hover:bg-sand-50" rightIcon={<ArrowRight className="h-5 w-5" />}>
                Get started
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <div className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
        <Disclaimer variant="inline" />
      </div>
    </div>
  );
}
