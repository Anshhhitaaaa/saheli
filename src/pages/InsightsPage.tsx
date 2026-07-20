import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts';
import { TrendingUp, Calendar, Smile } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Disclaimer } from '../components/common/Disclaimer';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getInsightTrends, type InsightTrend } from '../services/cycleService';
import { getCycleHistory } from '../mock/cycle';
import { fadeUp, staggerContainer } from '../animations/variants';

export function InsightsPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [trends, setTrends] = useState<InsightTrend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!user) return;
      const [t, h] = await Promise.all([
        getInsightTrends(user.email),
        Promise.resolve(getCycleHistory(user.email)),
      ]);
      if (!active) return;
      setTrends(t);
      // cycle length per period start
      const starts: string[] = [];
      let prev = false;
      for (const d of [...h].sort((a, b) => a.date.localeCompare(b.date))) {
        const isFlow = d.flow !== 'none';
        if (isFlow && !prev) starts.push(d.date);
        prev = isFlow;
      }
      const lengths: { label: string; days: number }[] = [];
      for (let i = 1; i < starts.length; i++) {
        const days = Math.round((new Date(starts[i]).getTime() - new Date(starts[i - 1]).getTime()) / 86400000);
        lengths.push({ label: 'C' + i, days });
      }
      setCycleLengths(lengths);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [user]);

  const [cycleLengths, setCycleLengths] = useState<{ label: string; days: number }[]>([]);

  const isDark = theme === 'dark';
  const axisColor = isDark ? '#D8E6DC' : '#735C3E';
  const gridColor = isDark ? 'rgba(216,230,220,0.15)' : 'rgba(115,92,62,0.12)';

  return (
    <div className="mx-auto max-w-5xl">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        <motion.h1 variants={fadeUp} className="font-display text-3xl font-600 text-sand-900 dark:text-sand-100 sm:text-4xl">
          Insights
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-2 text-sand-600 dark:text-sand-300">
          Patterns from your own data — in plain language. Bring these to your doctor.
        </motion.p>
      </motion.div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <Card className="h-full">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-clay-500" />
              <h3 className="font-600 text-sand-900 dark:text-sand-100">Cycle length over time</h3>
            </div>
            <p className="mt-1 text-sm text-sand-500 dark:text-sand-400">
              {cycleLengths.length > 1
                ? 'Your cycle length has been fairly stable — a useful pattern to share with your doctor.'
                : 'Log a couple more cycles to see your length pattern.'}
            </p>
            <div className="mt-4 h-56">
              {cycleLengths.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cycleLengths} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke={gridColor} vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 12, fill: axisColor }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: axisColor }} axisLine={false} tickLine={false} domain={[0, 'dataMax + 5']} />
                    <Tooltip
                      contentStyle={{
                        background: isDark ? '#544432' : '#FBF8F4',
                        border: 'none',
                        borderRadius: 12,
                        fontSize: 12,
                        color: isDark ? '#F5EFE7' : '#3A2F22',
                      }}
                      cursor={{ fill: gridColor }}
                    />
                    <Bar dataKey="days" radius={[6, 6, 0, 0]} animationDuration={800}>
                      {cycleLengths.map((_, i) => (
                        <Cell key={i} fill={isDark ? '#CE674E' : '#B84A34'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart />
              )}
            </div>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <Card className="h-full">
            <div className="flex items-center gap-2">
              <Smile className="h-5 w-5 text-clay-500" />
              <h3 className="font-600 text-sand-900 dark:text-sand-100">Mood across entries</h3>
            </div>
            <p className="mt-1 text-sm text-sand-500 dark:text-sand-400">
              {trends.length > 2
                ? 'Your mood tends to dip in the days before your period — a common pattern worth mentioning to your doctor.'
                : 'Log more moods to see how they shift across your cycle.'}
            </p>
            <div className="mt-4 h-56">
              {trends.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke={gridColor} vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} tickFormatter={(v) => v.slice(5)} />
                    <YAxis domain={[0, 5]} tick={{ fontSize: 12, fill: axisColor }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: isDark ? '#544432' : '#FBF8F4', border: 'none', borderRadius: 12, fontSize: 12, color: isDark ? '#F5EFE7' : '#3A2F22' }}
                    />
                    <Line type="monotone" dataKey="moodScore" stroke={isDark ? '#8BAE97' : '#477459'} strokeWidth={2.5} dot={{ r: 3, fill: isDark ? '#8BAE97' : '#477459' }} animationDuration={900} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart />
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mt-6">
        <Card className="flex items-start gap-3 bg-sage-50/60 dark:bg-sage-800/20">
          <TrendingUp className="mt-0.5 h-6 w-6 shrink-0 text-sage-600 dark:text-sage-300" />
          <div>
            <h3 className="font-600 text-sand-900 dark:text-sand-100">A plain-language takeaway</h3>
            <p className="mt-1 text-sm text-sand-600 dark:text-sand-400">
              Charts show patterns, not diagnoses. If something looks unusual or concerning, the most
              useful next step is to bring your tracked data to your clinician.
            </p>
          </div>
        </Card>
      </motion.div>

      <div className="mt-8">
        <Disclaimer variant="inline" />
      </div>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-full items-center justify-center text-sm text-sand-400">
      Not enough data yet — keep tracking.
    </div>
  );
}
