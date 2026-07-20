import { motion } from 'framer-motion';
import { BookOpen, CalendarDays, Sparkles, Users, ShieldCheck, FileCheck } from 'lucide-react';
import { Card, SectionTitle } from '../components/common/Card';
import { Disclaimer } from '../components/common/Disclaimer';
import { fadeUp, staggerContainer, viewportStagger } from '../animations/variants';

const steps = [
  { icon: CalendarDays, title: 'Track', body: 'Log your cycle, symptoms, and mood in a calm, animated interface.' },
  { icon: BookOpen, title: 'Understand', body: 'Read plain-language, medically-reviewed articles tailored to your focus.' },
  { icon: Sparkles, title: 'Ask', body: 'Get grounded answers from a RAG-powered assistant that cites its sources.' },
  { icon: Users, title: 'Connect', body: 'Find peer support in an anonymous community and real care near you.' },
];

export function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="max-w-3xl">
        <motion.span
          variants={fadeUp}
          className="inline-flex items-center gap-2 rounded-full border border-clay-200 bg-clay-50 px-3 py-1 text-sm font-600 text-clay-600 dark:border-clay-700/50 dark:bg-clay-800/30 dark:text-clay-200"
        >
          About Saheli
        </motion.span>
        <motion.h1 variants={fadeUp} className="mt-5 font-display text-4xl font-600 text-sand-900 dark:text-sand-100 sm:text-5xl">
          A friend for your health, at every stage.
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-5 text-lg text-sand-600 dark:text-sand-300">
          Saheli — <em>friend</em> in Hindi — exists because women’s health has been underserved,
          under-explained, and under-supported for too long. We combine tracking, education, a grounded
          AI assistant, and pathways to real care, with one rule that overrides everything else: we
          never diagnose. We describe patterns, we point to care, and we help you have better
          conversations with your doctor.
        </motion.p>
      </motion.div>

      <div className="mt-16">
        <SectionTitle
          eyebrow="How Saheli supports you"
          title="Track. Understand. Ask. Connect."
          subtitle="Four steps, designed to build a picture worth bringing to your clinician."
          center
        />
        <motion.div {...viewportStagger} className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={s.title} variants={fadeUp}>
                <Card hover className="relative h-full">
                  <span className="absolute right-4 top-4 font-display text-3xl font-600 text-sand-200 dark:text-sand-700">
                    {i + 1}
                  </span>
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-clay-50 text-clay-600 dark:bg-clay-800/40 dark:text-clay-200">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-600 text-sand-900 dark:text-sand-100">{s.title}</h3>
                  <p className="mt-1.5 text-sm text-sand-600 dark:text-sand-400">{s.body}</p>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      <div className="mt-16 grid gap-6 lg:grid-cols-2">
        <motion.div {...{ variants: fadeUp, initial: 'hidden', whileInView: 'visible', viewport: { once: true } }}>
          <Card>
            <ShieldCheck className="h-7 w-7 text-sage-600 dark:text-sage-300" />
            <h3 className="mt-3 font-display text-xl font-600 text-sand-900 dark:text-sand-100">Our privacy commitment</h3>
            <p className="mt-2 text-sm text-sand-600 dark:text-sand-400">
              Your cycle and symptom data is deeply personal. We store it so you can see your patterns,
              not so anyone else can. You can export everything or delete it permanently, in plain
              language, in two clicks from your profile.
            </p>
          </Card>
        </motion.div>
        <motion.div {...{ variants: fadeUp, initial: 'hidden', whileInView: 'visible', viewport: { once: true } }}>
          <Card>
            <FileCheck className="h-7 w-7 text-sage-600 dark:text-sage-300" />
            <h3 className="mt-3 font-display text-xl font-600 text-sand-900 dark:text-sand-100">Editorial & medical-review policy</h3>
            <p className="mt-2 text-sm text-sand-600 dark:text-sand-400">
              Every article in our library is written in plain language, reviewed by a clinician, and
              attributed — you always see who reviewed it and when. Content is updated when the
              understanding changes, not on a fixed schedule. The AI assistant is grounded in this
              reviewed library and clearly flags anything outside it.
            </p>
          </Card>
        </motion.div>
      </div>

      <div className="mt-12">
        <Disclaimer />
      </div>
    </div>
  );
}
