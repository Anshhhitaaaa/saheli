import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, BadgeCheck, Lock, ArrowRight, Users, Search } from 'lucide-react';
import { Card } from '../components/common/Card';
import { SectionTitle } from '../components/common/Card';
import { Disclaimer } from '../components/common/Disclaimer';
import { useAuth } from '../context/AuthContext';
import { articleSummaries } from '../mock/articles';
import { partnerArticles } from '../mock/communityInsights';
import { fadeUp, staggerContainer, viewportStagger } from '../animations/variants';

const topics = ['all', 'periods', 'pcos', 'fertility', 'pregnancy', 'menopause', 'general'] as const;

export function LibraryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [topic, setTopic] = useState<(typeof topics)[number]>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = articleSummaries.filter((a) => {
    const matchTopic = topic === 'all' || a.topic === topic;
    const matchSearch =
      !searchQuery.trim() ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.topic.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTopic && matchSearch;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <SectionTitle
        eyebrow="Health library"
        title="Reviewed, plain-language articles"
        subtitle="Every article is written in plain language and reviewed by a clinician. Full access is free with an account."
        center
      />

      <div className="mt-8 mx-auto max-w-md">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-sand-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles by keyword (e.g. PCOS, cramps, fertility)..."
            className="input-base pl-11 shadow-sm"
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {topics.map((t) => (
          <button
            key={t}
            onClick={() => setTopic(t)}
            className={`chip capitalize ${topic === t ? 'chip-active' : ''}`}
            aria-pressed={topic === t}
          >
            {t}
          </button>
        ))}
      </div>

      <motion.div {...viewportStagger} className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((a) => {
          const locked = a.gated && !user;
          return (
            <motion.div key={a.id} variants={fadeUp}>
              <Card hover className="group relative h-full overflow-hidden">
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-full bg-clay-50 px-2.5 py-1 text-xs font-600 uppercase tracking-wide text-clay-600 dark:bg-clay-800/40 dark:text-clay-200">
                    {a.topic}
                  </span>
                  {locked && (
                    <span className="flex items-center gap-1 text-xs text-sand-400">
                      <Lock className="h-3.5 w-3.5" /> Members
                    </span>
                  )}
                </div>
                <h3 className="font-display text-lg font-600 text-sand-900 dark:text-sand-100">
                  {a.title}
                </h3>
                <p className="mt-2 text-sm text-sand-600 dark:text-sand-400">{a.excerpt}</p>
                <div className="mt-4 flex items-center gap-3 text-xs text-sand-500 dark:text-sand-400">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {a.readMinutes} min
                  </span>
                  <span className="flex items-center gap-1">
                    <BadgeCheck className="h-3.5 w-3.5" /> {a.reviewer}
                  </span>
                </div>
                <div className="mt-4">
                  {locked ? (
                    <motion.button
                      whileHover={{ x: 2 }}
                      onClick={() => navigate('/signup')}
                      className="inline-flex items-center gap-1 text-sm font-600 text-clay-600 hover:underline dark:text-clay-300"
                    >
                      Sign up to read <ArrowRight className="h-4 w-4" />
                    </motion.button>
                  ) : (
                    <Link
                      to={user ? `/library/${a.id}` : '/login'}
                      className="inline-flex items-center gap-1 text-sm font-600 text-clay-600 hover:underline dark:text-clay-300"
                    >
                      Read article <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="mt-12">
        <Disclaimer />
      </div>

      {/* For partners */}
      <section className="mt-16">
        <SectionTitle
          eyebrow="For partners"
          title="Helping someone you care about"
          subtitle="Short, plain-language guides for partners and caregivers who want to understand PCOS, pregnancy, and menopause — and offer support that actually helps."
          center
        />
        <motion.div {...viewportStagger} className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {partnerArticles.map((a) => (
            <motion.div key={a.id} variants={fadeUp}>
              <Card hover className="h-full">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sage-50 text-sage-600 dark:bg-sage-800/30 dark:text-sage-200">
                  <Users className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-lg font-600 text-sand-900 dark:text-sand-100">{a.title}</h3>
                <p className="mt-1.5 text-sm text-sand-600 dark:text-sand-400">{a.excerpt}</p>
                <div className="mt-3 flex items-center gap-1 text-xs text-sand-500 dark:text-sand-400">
                  <Clock className="h-3.5 w-3.5" /> {a.readMinutes} min read
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <div className="mt-12">
        <Disclaimer variant="inline" />
      </div>
    </div>
  );
}
