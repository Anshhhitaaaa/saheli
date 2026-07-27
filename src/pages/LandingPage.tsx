import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { CSSProperties } from 'react';
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
        {/* Ambient background blobs */}
        <div className="absolute inset-0 -z-10">
          <motion.div
            className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-clay-100/60 dark:bg-clay-800/20 blur-3xl"
            animate={{ x: [0, 24, 0], y: [0, -16, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute right-0 top-10 h-[500px] w-[500px] rounded-full bg-clay-100/40 dark:bg-clay-800/15 blur-3xl"
            animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            {/* Left — copy */}
            <motion.div variants={staggerContainer} initial="hidden" animate="visible">
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

            {/* Right — flower visual */}
            <HeroFlowerVisual />
          </div>
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
              <Button size="lg" className="bg-white text-clay-700 hover:bg-sand-50 dark:bg-white dark:text-clay-700 dark:hover:bg-sand-100" rightIcon={<ArrowRight className="h-5 w-5" />}>
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

/* ─── Hero flower visual ─────────────────────────────────────────────────── */

const floatingChips = [
  { label: 'PCOS support', emoji: '⚡', top: '10%', left: '-8%', delay: 0.3 },
  { label: 'Ovulation tracker', emoji: '🌱', bottom: '12%', right: '-4%', delay: 0.5 },
  { label: 'Cycle tracking', emoji: '📅', top: '38%', right: '-10%', delay: 0.65 },
  { label: 'Menopause care', emoji: '🌙', bottom: '30%', left: '-6%', delay: 0.45 },
];

function HeroFlowerVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1], delay: 0.15 }}
      className="relative hidden lg:flex items-center justify-center"
    >
      {/* Outer soft ring */}
      <div className="relative flex h-[420px] w-[420px] items-center justify-center">
        {/* Pink circle background */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-clay-100 via-clay-200/70 to-clay-100/40 dark:from-clay-700/30 dark:via-clay-600/20 dark:to-clay-700/10" />

        {/* Soft inner glow */}
        <div className="absolute inset-8 rounded-full bg-white/40 dark:bg-sand-800/20 blur-xl" />

        {/* Main flower — SVG cherry blossom matching the reference */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="relative z-10 drop-shadow-2xl"
        >
          <MainFlowerSVG size={210} />
        </motion.div>

        {/* Small scattered flowers */}
        <SmallFlower size={28} style={{ position: 'absolute', top: '8%', right: '18%' }} delay={0} />
        <SmallFlower size={20} style={{ position: 'absolute', top: '20%', left: '12%' }} delay={0.4} />
        <SmallFlower size={16} style={{ position: 'absolute', bottom: '15%', left: '20%' }} delay={0.8} />
        <SmallFlower size={22} style={{ position: 'absolute', bottom: '20%', right: '14%' }} delay={0.2} />
        <SmallFlower size={13} style={{ position: 'absolute', top: '55%', right: '8%' }} delay={1.0} />
        <SmallFlower size={18} style={{ position: 'absolute', top: '12%', left: '30%' }} delay={0.6} />
      </div>

      {/* Floating feature chips */}
      {floatingChips.map((chip) => (
        <motion.div
          key={chip.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: chip.delay, ease: [0.4, 0, 0.2, 1] }}
          style={{
            position: 'absolute',
            top: chip.top,
            bottom: chip.bottom,
            left: chip.left,
            right: chip.right,
          }}
          className="flex items-center gap-2 whitespace-nowrap rounded-full border border-sand-200/80 bg-white/90 px-3.5 py-2 text-sm font-600 text-sand-800 shadow-card backdrop-blur-sm dark:border-sand-700/80 dark:bg-sand-800/90 dark:text-sand-100"
        >
          <span aria-hidden>{chip.emoji}</span>
          {chip.label}
        </motion.div>
      ))}
    </motion.div>
  );
}

/* Tiny inline SVG cherry blossom for scattered mini-flowers */
function SmallFlower({ size, style, delay }: { size: number; style: CSSProperties; delay: number }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
      animate={{ opacity: 0.8, scale: 1, rotate: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.4, 0, 0.2, 1] }}
      aria-hidden
    >
      <ellipse cx="16" cy="7" rx="4" ry="7" fill="#EBB4A5" transform="rotate(0 16 16)" />
      <ellipse cx="16" cy="7" rx="4" ry="7" fill="#EBB4A5" transform="rotate(72 16 16)" />
      <ellipse cx="16" cy="7" rx="4" ry="7" fill="#DE8B73" transform="rotate(144 16 16)" />
      <ellipse cx="16" cy="7" rx="4" ry="7" fill="#DE8B73" transform="rotate(216 16 16)" />
      <ellipse cx="16" cy="7" rx="4" ry="7" fill="#EBB4A5" transform="rotate(288 16 16)" />
      <circle cx="16" cy="16" r="4" fill="#FBEEEA" />
      <circle cx="16" cy="16" r="2" fill="#CE674E" opacity="0.6" />
    </motion.svg>
  );
}

/* Large rich cherry blossom SVG for the hero */
function MainFlowerSVG({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Saheli cherry blossom"
      role="img"
    >
      <defs>
        <radialGradient id="petal1" cx="50%" cy="20%" r="80%">
          <stop offset="0%" stopColor="#F6D9D0" />
          <stop offset="100%" stopColor="#CE674E" />
        </radialGradient>
        <radialGradient id="petal2" cx="50%" cy="20%" r="80%">
          <stop offset="0%" stopColor="#EBB4A5" />
          <stop offset="100%" stopColor="#B84A34" />
        </radialGradient>
        <radialGradient id="petal3" cx="50%" cy="20%" r="80%">
          <stop offset="0%" stopColor="#F6D9D0" />
          <stop offset="100%" stopColor="#CE674E" />
        </radialGradient>
        <radialGradient id="centre" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#FBF8F4" />
          <stop offset="60%" stopColor="#FBEEEA" />
          <stop offset="100%" stopColor="#F6D9D0" />
        </radialGradient>
        <filter id="petalShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#92754D" floodOpacity="0.18" />
        </filter>
      </defs>

      {/* Petal 1 — top */}
      <ellipse cx="100" cy="44" rx="26" ry="46" fill="url(#petal1)" filter="url(#petalShadow)" />
      {/* Petal 2 — upper right */}
      <ellipse cx="100" cy="44" rx="26" ry="46" fill="url(#petal2)" filter="url(#petalShadow)"
        transform="rotate(72 100 100)" />
      {/* Petal 3 — lower right */}
      <ellipse cx="100" cy="44" rx="26" ry="46" fill="url(#petal3)" filter="url(#petalShadow)"
        transform="rotate(144 100 100)" />
      {/* Petal 4 — lower left */}
      <ellipse cx="100" cy="44" rx="26" ry="46" fill="url(#petal1)" filter="url(#petalShadow)"
        transform="rotate(216 100 100)" />
      {/* Petal 5 — upper left */}
      <ellipse cx="100" cy="44" rx="26" ry="46" fill="url(#petal2)" filter="url(#petalShadow)"
        transform="rotate(288 100 100)" />

      {/* Petal veins */}
      <line x1="100" y1="100" x2="100" y2="20" stroke="#EBB4A5" strokeWidth="1.5" opacity="0.4" />
      <line x1="100" y1="100" x2="100" y2="20" stroke="#EBB4A5" strokeWidth="1.5" opacity="0.4"
        transform="rotate(72 100 100)" />
      <line x1="100" y1="100" x2="100" y2="20" stroke="#EBB4A5" strokeWidth="1.5" opacity="0.4"
        transform="rotate(144 100 100)" />
      <line x1="100" y1="100" x2="100" y2="20" stroke="#EBB4A5" strokeWidth="1.5" opacity="0.4"
        transform="rotate(216 100 100)" />
      <line x1="100" y1="100" x2="100" y2="20" stroke="#EBB4A5" strokeWidth="1.5" opacity="0.4"
        transform="rotate(288 100 100)" />

      {/* Centre disc */}
      <circle cx="100" cy="100" r="28" fill="url(#centre)" filter="url(#petalShadow)" />
      <circle cx="100" cy="100" r="22" fill="#FBEEEA" opacity="0.9" />

      {/* Stamens — dots radiating from centre */}
      {[0, 40, 80, 120, 160, 200, 240, 280, 320].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const r = 14;
        const x = 100 + r * Math.sin(rad);
        const y = 100 - r * Math.cos(rad);
        return <circle key={i} cx={x} cy={y} r="2.5" fill="#CE674E" opacity="0.7" />;
      })}

      {/* Centre dot */}
      <circle cx="100" cy="100" r="6" fill="#B84A34" opacity="0.8" />
      <circle cx="98" cy="98" r="2.5" fill="#FBEEEA" opacity="0.7" />
    </svg>
  );
}
