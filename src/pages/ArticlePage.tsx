import { Link, useParams, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, BadgeCheck, BookOpen, Lightbulb, Languages } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Disclaimer } from '../components/common/Disclaimer';
import { getArticle } from '../mock/articles';
import { useAuth } from '../context/AuthContext';
import { staggerContainer, fadeUp } from '../animations/variants';
import { useState } from 'react';

export function ArticlePage() {
  const { articleId } = useParams();
  const { user } = useAuth();
  const article = articleId ? getArticle(articleId) : undefined;
  const [showClinical, setShowClinical] = useState(false);

  if (!article) return <Navigate to="/library" replace />;
  if (article.gated && !user) return <Navigate to="/login" replace />;

  return (
    <div className="mx-auto max-w-3xl">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        <motion.div variants={fadeUp}>
          <Link to="/library" className="inline-flex items-center gap-1.5 text-sm font-600 text-sand-600 hover:text-clay-600 dark:text-sand-300">
            <ArrowLeft className="h-4 w-4" /> Back to library
          </Link>
        </motion.div>

        <motion.span variants={fadeUp} className="mt-6 inline-block rounded-full bg-clay-50 px-3 py-1 text-xs font-600 uppercase tracking-wide text-clay-600 dark:bg-clay-800/40 dark:text-clay-200">
          {article.topic}
        </motion.span>

        <motion.h1 variants={fadeUp} className="mt-3 font-display text-3xl font-600 text-sand-900 dark:text-sand-100 sm:text-4xl">
          {article.title}
        </motion.h1>

        <motion.div variants={fadeUp} className="mt-4 flex flex-wrap items-center gap-4 text-sm text-sand-500 dark:text-sand-400">
          <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {article.readMinutes} min read</span>
          <span className="flex items-center gap-1.5"><BadgeCheck className="h-4 w-4" /> {article.reviewer}</span>
          <span>Reviewed {article.reviewedAt}</span>
        </motion.div>

        {article.clinicalTerms && article.clinicalTerms.length > 0 && (
          <motion.div variants={fadeUp} className="mt-6">
            <button
              onClick={() => setShowClinical((s) => !s)}
              className="inline-flex items-center gap-1.5 rounded-full border border-sand-300 px-3 py-1.5 text-sm font-600 text-sand-700 hover:bg-sand-100 dark:border-sand-700 dark:text-sand-200 dark:hover:bg-sand-800"
            >
              <Languages className="h-4 w-4" />
              {showClinical ? 'Hide clinical terms' : 'Show clinical terms'}
            </button>
          </motion.div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="mt-6 space-y-4"
      >
        {article.body.map((p, i) => (
          <p key={i} className="text-lg leading-relaxed text-sand-700 dark:text-sand-200">
            {p}
          </p>
        ))}
      </motion.div>

      {/* Clinical terms */}
      {article.clinicalTerms && showClinical && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-6 overflow-hidden">
          <Card>
            <h3 className="flex items-center gap-2 font-600 text-sand-900 dark:text-sand-100">
              <BookOpen className="h-5 w-5 text-clay-500" /> Clinical terms in this article
            </h3>
            <dl className="mt-3 space-y-2">
              {article.clinicalTerms.map((t) => (
                <div key={t.term}>
                  <dt className="text-sm font-600 text-clay-600 dark:text-clay-300">{t.term}</dt>
                  <dd className="text-sm text-sand-600 dark:text-sand-400">{t.plain}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </motion.div>
      )}

      {/* Takeaways */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-8"
      >
        <Card className="bg-sage-50/60 dark:bg-sage-800/20">
          <h3 className="flex items-center gap-2 font-600 text-sand-900 dark:text-sand-100">
            <Lightbulb className="h-5 w-5 text-sage-600 dark:text-sage-300" /> Key takeaways
          </h3>
          <ul className="mt-3 space-y-2">
            {article.takeaways.map((t, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-sand-700 dark:text-sand-200">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sage-500" />
                {t}
              </li>
            ))}
          </ul>
        </Card>
      </motion.div>

      <div className="mt-8">
        <Disclaimer />
      </div>
    </div>
  );
}
