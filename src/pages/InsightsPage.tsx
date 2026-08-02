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
import { api } from '../services/api';

const moodEmojiMap: Record<string, string> = {
  happy: '🙂',
  calm: '🌿',
  tired: '😴',
  anxious: '😟',
  irritable: '😠',
  sad: '😢',
};

export function InsightsPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [trends, setTrends] = useState<InsightTrend[]>([]);
  const [cycleLengths, setCycleLengths] = useState<{ label: string; days: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!user) return;
      try {
        const [t, cycleRes] = await Promise.all([
          getInsightTrends(user.email),
          api.cycle.get(user.email).catch(() => ({ logs: [] })),
        ]);
        if (!active) return;
        setTrends(t);

        const logs = (cycleRes && Array.isArray(cycleRes.logs) && cycleRes.logs.length > 0)
          ? cycleRes.logs
          : getCycleHistory(user.email);

        const starts: string[] = [];
        let prev = false;
        const sortedLogs = [...logs].sort((a: any, b: any) => a.date.localeCompare(b.date));
        for (const d of sortedLogs) {
          const isFlow = !!(d.flow && d.flow !== 'none');
          if (isFlow && !prev) starts.push(d.date);
          prev = isFlow;
        }
        const lengths: { label: string; days: number }[] = [];
        for (let i = 1; i < starts.length; i++) {
          const days = Math.round((new Date(starts[i]).getTime() - new Date(starts[i - 1]).getTime()) / 86400000);
          if (days > 10 && days < 90) {
            lengths.push({ label: 'Cycle ' + i, days });
          }
        }
        if (starts.length === 1) {
          const currentDays = Math.max(1, Math.floor((Date.now() - new Date(starts[0]).getTime()) / 86400000) + 1);
          lengths.push({ label: 'Current', days: currentDays });
        }
        setCycleLengths(lengths);
      } catch {
        // fallback
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [user]);

  const isDark = theme === 'dark';
  const axisColor = isDark ? '#D8E6DC' : '#735C3E';
  const gridColor = isDark ? 'rgba(216,230,220,0.15)' : 'rgba(115,92,62,0.12)';

  // Limit visual chart view to a rolling window of the last 7 entries (without deleting any DB records)
  const displayTrends = trends.slice(-7);
  const displayCycleLengths = cycleLengths.slice(-7);

  // Format Y-Axis values for Moods (1 = Sad, 2 = Anxious, 3 = Tired, 4 = Calm, 5 = Happy)
  const formatMoodYAxis = (value: number) => {
    switch (value) {
      case 5: return 'Happy';
      case 4: return 'Calm';
      case 3: return 'Tired';
      case 2: return 'Anxious';
      case 1: return 'Sad';
      default: return '';
    }
  };

  // Custom Mood Chart Tooltip showing real database mood & date
  const CustomMoodTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: InsightTrend = payload[0].payload;
      const emoji = moodEmojiMap[data.mood?.toLowerCase()] || '🌿';
      return (
        <div className="rounded-xl bg-sand-900 p-3 text-xs text-sand-50 shadow-lg dark:bg-sand-800 dark:text-sand-100">
          <p className="font-600 border-b border-sand-700 pb-1 mb-1.5">{data.date}</p>
          <div className="flex items-center gap-1.5 font-600 text-rose-300">
            <span>{emoji}</span>
            <span>Mood: {data.moodLabel}</span>
          </div>
          <p className="text-sand-400 mt-1">Symptom Severity: {data.severity}/5</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        <motion.h1 variants={fadeUp} className="font-display text-3xl font-600 text-sand-900 dark:text-sand-100 sm:text-4xl">
          Insights & Analytics
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-2 text-sand-600 dark:text-sand-300">
          Real-time trends generated directly from your logged PostgreSQL database entries.
        </motion.p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Cycle Length Chart */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <Card className="h-full">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-clay-500" />
              <h3 className="font-600 text-sand-900 dark:text-sand-100">Cycle length over time</h3>
            </div>
            <p className="mt-1 text-sm text-sand-500 dark:text-sand-400">
              {displayCycleLengths.length > 1
                ? `Showing your latest ${displayCycleLengths.length} cycle length patterns.`
                : 'Log period dates on the tracker page to calculate your cycle lengths.'}
            </p>
            <div className="mt-4 h-60">
              {displayCycleLengths.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={displayCycleLengths} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
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
                      {displayCycleLengths.map((_, i) => (
                        <Cell key={i} fill={isDark ? '#CE674E' : '#B84A34'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart message="No cycle logs found — log your period dates to view length trends." />
              )}
            </div>
          </Card>
        </motion.div>

        {/* Real-time Mood Across Entries Chart (Rolling 7 Entries) */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <Card className="h-full">
            <div className="flex items-center gap-2">
              <Smile className="h-5 w-5 text-rose-500" />
              <h3 className="font-600 text-sand-900 dark:text-sand-100">Mood across entries</h3>
            </div>
            <p className="mt-1 text-sm text-sand-500 dark:text-sand-400">
              {displayTrends.length > 0
                ? `Showing real-time mood trends across your latest ${displayTrends.length} logged entries.`
                : 'Log your moods on the Symptoms page to track your emotional shifts over time.'}
            </p>
            <div className="mt-4 h-60">
              {displayTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={displayTrends} margin={{ top: 8, right: 12, left: 10, bottom: 0 }}>
                    <CartesianGrid stroke={gridColor} vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: axisColor }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => String(v).slice(5)}
                    />
                    <YAxis
                      domain={[1, 5]}
                      ticks={[1, 2, 3, 4, 5]}
                      tickFormatter={formatMoodYAxis}
                      tick={{ fontSize: 11, fill: axisColor }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomMoodTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="moodScore"
                      stroke={isDark ? '#E58A73' : '#CE674E'}
                      strokeWidth={3}
                      dot={{ r: 4, fill: isDark ? '#E58A73' : '#CE674E', strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                      animationDuration={900}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart message="No mood entries in database yet — log your daily mood on the Symptoms or Tracker page." />
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Takeaway */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mt-6">
        <Card className="flex items-start gap-3 bg-sage-50/60 dark:bg-sage-800/20">
          <TrendingUp className="mt-0.5 h-6 w-6 shrink-0 text-sage-600 dark:text-sage-300" />
          <div>
            <h3 className="font-600 text-sand-900 dark:text-sand-100">Plain-language Takeaway</h3>
            <p className="mt-1 text-sm text-sand-600 dark:text-sand-400">
              Charts show your latest 7 logged entries for optimal clarity, while all historic data remains stored safely in your PostgreSQL database (`symptom_logs` and `cycle_logs`).
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

function EmptyChart({ message }: { message?: string }) {
  return (
    <div className="flex h-full items-center justify-center p-6 text-center text-sm text-sand-400">
      {message || 'Not enough data yet — keep tracking.'}
    </div>
  );
}
