import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ShieldAlert, Calendar, Heart, Baby, TrendingUp, Check, ExternalLink } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Disclaimer } from '../components/common/Disclaimer';
import { Logo } from '../components/common/Logo';
import { api } from '../services/api';
import { fadeUp, staggerContainer } from '../animations/variants';

export function ShareViewPage() {
  const { shareId } = useParams<{ shareId: string }>();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (shareId) {
      api.sharing
        .getPublicView(shareId)
        .then((res) => {
          setData(res);
        })
        .catch(() => {
          setData({ active: false, message: 'Share link not found or invalid.' });
        })
        .finally(() => setLoading(false));
    }
  }, [shareId]);

  return (
    <div className="min-h-screen bg-sand-50/90 text-sand-900 dark:bg-sand-900 dark:text-sand-100">
      {/* Header */}
      <header className="border-b border-sand-200/60 bg-white/70 px-6 py-4 backdrop-blur-md dark:border-sand-700/60 dark:bg-sand-800/70">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link to="/" aria-label="Saheli home">
            <Logo />
          </Link>
          <span className="flex items-center gap-1.5 rounded-full bg-sage-100 px-3 py-1 text-xs font-600 text-sage-800 dark:bg-sage-900/40 dark:text-sage-200">
            <Shield className="h-3.5 w-3.5" /> Read-Only Shared View
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <svg className="h-8 w-8 animate-spin text-clay-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" />
            </svg>
            <p className="mt-3 text-sm text-sand-500">Loading shared wellness view…</p>
          </div>
        ) : !data || !data.active ? (
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="py-8 text-center">
            <Card className="mx-auto max-w-lg border-danger/30 bg-danger/5 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <h2 className="mt-4 font-display text-xl font-600 text-sand-900 dark:text-sand-100">Access Unavailable</h2>
              <p className="mt-2 text-sm text-sand-600 dark:text-sand-300">
                {data?.message || 'This share link has been revoked or paused by the account owner.'}
              </p>
              <div className="mt-6">
                <Link to="/">
                  <Button variant="outline" size="sm">Go to Saheli Homepage</Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
            {/* Owner banner */}
            <motion.div variants={fadeUp}>
              <Card className="bg-gradient-to-r from-clay-50/80 to-sand-50/80 dark:from-clay-900/30 dark:to-sand-800/40">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="font-display text-2xl font-600 text-sand-900 dark:text-sand-100">
                      Shared Health Summary
                    </h1>
                    <p className="mt-1 text-sm text-sand-600 dark:text-sand-300">
                      Shared by <strong className="text-clay-600 dark:text-clay-300">{data.userName}</strong> for{' '}
                      <strong>{data.share?.name}</strong> ({data.share?.relationship || 'Caregiver'}).
                    </p>
                  </div>
                  <span className="rounded-full bg-clay-100 px-3 py-1 text-xs font-600 text-clay-700 dark:bg-clay-800 dark:text-clay-200">
                    Active Share
                  </span>
                </div>

                {/* Granted permissions chips */}
                <div className="mt-4 flex flex-wrap gap-2 border-t border-sand-200/60 pt-3 dark:border-sand-700/60">
                  <span className="text-xs font-600 text-sand-500">Granted Views:</span>
                  {data.share?.permissions?.cycle && (
                    <span className="chip chip-active text-xs">Cycle History</span>
                  )}
                  {data.share?.permissions?.symptoms && (
                    <span className="chip chip-active text-xs">Symptom & Mood Log</span>
                  )}
                  {data.share?.permissions?.pregnancy && (
                    <span className="chip chip-active text-xs">Pregnancy Updates</span>
                  )}
                  {data.share?.permissions?.insights && (
                    <span className="chip chip-active text-xs">Insights & Trends</span>
                  )}
                </div>
              </Card>
            </motion.div>

            {/* Cycle History Section */}
            {data.share?.permissions?.cycle && (
              <motion.div variants={fadeUp}>
                <Card>
                  <h2 className="flex items-center gap-2 font-display text-lg font-600 text-sand-900 dark:text-sand-100">
                    <Calendar className="h-5 w-5 text-clay-500" /> Cycle History
                  </h2>
                  {data.cycleData && data.cycleData.length > 0 ? (
                    <div className="mt-4 space-y-3">
                      {data.cycleData.map((c: any) => (
                        <div key={c.id || c.date} className="flex items-center justify-between rounded-xl bg-sand-50 p-3 dark:bg-sand-800/50">
                          <div>
                            <p className="text-sm font-600 text-sand-800 dark:text-sand-100">{c.date}</p>
                            {c.note && <p className="mt-0.5 text-xs text-sand-500">{c.note}</p>}
                          </div>
                          {c.flow && (
                            <span className="rounded-full bg-clay-100 px-2.5 py-0.5 text-xs font-600 capitalize text-clay-700 dark:bg-clay-800 dark:text-clay-200">
                              Flow: {c.flow}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-sand-500">No cycle entries logged yet.</p>
                  )}
                </Card>
              </motion.div>
            )}

            {/* Symptoms & Mood Section */}
            {data.share?.permissions?.symptoms && (
              <motion.div variants={fadeUp}>
                <Card>
                  <h2 className="flex items-center gap-2 font-display text-lg font-600 text-sand-900 dark:text-sand-100">
                    <Heart className="h-5 w-5 text-rose-400" /> Symptom & Mood Log
                  </h2>
                  {data.symptomData && data.symptomData.length > 0 ? (
                    <div className="mt-4 space-y-3">
                      {data.symptomData.map((s: any) => (
                        <div key={s.id || s.date} className="rounded-xl bg-sand-50 p-3 dark:bg-sand-800/50">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-600 text-sand-800 dark:text-sand-100">{s.date}</span>
                            {s.mood && (
                              <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-600 capitalize text-rose-700 dark:bg-rose-900/40 dark:text-rose-200">
                                Mood: {s.mood}
                              </span>
                            )}
                          </div>
                          {s.symptoms && s.symptoms.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {s.symptoms.map((sym: string) => (
                                <span key={sym} className="rounded-md bg-white px-2 py-0.5 text-xs text-sand-600 dark:bg-sand-800 dark:text-sand-300">
                                  {sym}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-sand-500">No recent symptom entries shared.</p>
                  )}
                </Card>
              </motion.div>
            )}

            {/* Pregnancy Section */}
            {data.share?.permissions?.pregnancy && data.pregnancyData && (
              <motion.div variants={fadeUp}>
                <Card className="bg-sage-50/50 dark:bg-sage-900/20 border-sage-200">
                  <h2 className="flex items-center gap-2 font-display text-lg font-600 text-sand-900 dark:text-sand-100">
                    <Baby className="h-5 w-5 text-sage-600 dark:text-sage-300" /> Pregnancy Milestones
                  </h2>
                  <p className="mt-2 text-sm text-sand-700 dark:text-sand-200">
                    Currently tracking pregnancy at <strong>Week {data.pregnancyData.pregnancyWeek}</strong>.
                  </p>
                </Card>
              </motion.div>
            )}

            {/* Insights Section */}
            {data.share?.permissions?.insights && (
              <motion.div variants={fadeUp}>
                <Card>
                  <h2 className="flex items-center gap-2 font-display text-lg font-600 text-sand-900 dark:text-sand-100">
                    <TrendingUp className="h-5 w-5 text-sage-500" /> Insights & Trends
                  </h2>
                  <p className="mt-2 text-sm text-sand-600 dark:text-sand-300">
                    Tracking Focus: <strong className="capitalize">{data.insightsData?.focus || 'General'}</strong>
                  </p>
                </Card>
              </motion.div>
            )}

            <div className="mt-8">
              <Disclaimer variant="inline" />
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
