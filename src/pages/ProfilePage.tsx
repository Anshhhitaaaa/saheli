import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ShieldCheck, Download, Trash2, Bell, User, Focus, GraduationCap, Share2, FileText, Pill, Lock, EyeOff } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Disclaimer } from '../components/common/Disclaimer';
import { useAuth, type OnboardingFocus } from '../context/AuthContext';
import { useNotifications, type NotificationCategories } from '../context/NotificationContext';
import { fadeUp, staggerContainer, easeOut } from '../animations/variants';

const focusOptions: { value: OnboardingFocus; label: string }[] = [
  { value: 'periods', label: 'My periods' },
  { value: 'pcos', label: 'PCOS' },
  { value: 'fertility', label: 'Fertility' },
  { value: 'pregnancy', label: 'Pregnancy' },
  { value: 'menopause', label: 'Menopause' },
  { value: 'general', label: 'General' },
];

const categoryLabels: { key: keyof NotificationCategories; title: string; desc: string }[] = [
  { key: 'cycle', title: 'Cycle & Predictions', desc: 'Period expected soon, fertile window, and predicted ovulation.' },
  { key: 'logging', title: 'Logging & Medications', desc: 'Gentle check-in nudges and medication/supplement reminders.' },
  { key: 'insights', title: 'Insights & Patterns', desc: 'Monthly cycle insight summaries and observational pattern shifts.' },
  { key: 'assistant', title: 'AI Assistant', desc: 'Alerts when AI answers are ready or follow-ups requested.' },
  { key: 'pregnancy', title: 'Pregnancy Mode', desc: 'Weekly pregnancy milestones and relevant trimester guidance.' },
  { key: 'community', title: 'Community Activity', desc: 'Replies and reactions to your pseudonymous forum posts.' },
  { key: 'care', title: 'Care & Appointments', desc: 'Reminders for booked visits and annual checkup check-ins.' },
  { key: 'account', title: 'Account & Security', desc: 'Data export status and security login alerts.' },
];

const privacySections = [
  {
    title: 'What we store',
    body: 'Your cycle entries, symptom logs, mood notes, and AI assistant conversations. We store this so you can see your patterns and history.',
  },
  {
    title: 'Who can see it',
    body: 'Only you. Your data is never shared with third parties or used for advertising. Community posts are pseudonymous and separate from your health data.',
  },
  {
    title: 'AI conversation logging',
    body: 'Flagged AI assistant conversations may be reviewed for safety and content quality. This is separate from your general privacy consent and applies only to assistant chats. You can change this anytime here.',
    toggle: true,
  },
  {
    title: 'Export your data',
    body: 'You can download everything you have logged as a JSON file, anytime.',
    action: 'export',
  },
  {
    title: 'Delete your data',
    body: 'You can permanently delete all your tracked data. This cannot be undone — but it is your right and your choice.',
    action: 'delete',
  },
];

export function ProfilePage() {
  const { user, updateUser, refreshUser, signOut } = useAuth();
  const { settings, updateSettings } = useNotifications();
  const [name, setName] = useState(user?.name ?? '');
  const [username, setUsername] = useState(user?.username ?? '');
  const [focus, setFocus] = useState<OnboardingFocus>(user?.focus ?? 'general');
  const [openSection, setOpenSection] = useState<number | null>(0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [notifSavedFlash, setNotifSavedFlash] = useState(false);
  const [aiConsented, setAiConsented] = useState(() => localStorage.getItem('saheli-ai-consent') === 'true');

  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    refreshUser();
  }, []);

  useEffect(() => {
    if (user) {
      setName(user.name ?? '');
      setUsername(user.username ?? '');
      setFocus(user.focus ?? 'general');
    }
  }, [user]);

  if (!user) return null;

  const saveIdentity = async () => {
    setUsernameError(null);
    const cleanUser = username.trim().replace(/^@/, '');
    if (!cleanUser) {
      setUsernameError('Username is required.');
      return;
    }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(cleanUser)) {
      setUsernameError('Username must be 3-20 characters long (letters, numbers, or underscores).');
      return;
    }
    setSaving(true);
    try {
      await updateUser({ name, username: cleanUser, focus, pregnancyMode: focus === 'pregnancy' });
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1600);
    } catch (err: any) {
      setUsernameError(err.message || 'Could not update username.');
    } finally {
      setSaving(false);
    }
  };

  const toggleCategory = (catKey: keyof NotificationCategories) => {
    const nextCategories = { ...settings.categories, [catKey]: !settings.categories[catKey] };
    updateSettings(settings.discreetMode, nextCategories);
    setNotifSavedFlash(true);
    setTimeout(() => setNotifSavedFlash(false), 1400);
  };

  const toggleDiscreetMode = () => {
    const nextDiscreet = !settings.discreetMode;
    updateSettings(nextDiscreet, settings.categories);
    setNotifSavedFlash(true);
    setTimeout(() => setNotifSavedFlash(false), 1400);
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ user }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'saheli-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        <motion.h1 variants={fadeUp} className="font-display text-3xl font-600 text-sand-900 dark:text-sand-100 sm:text-4xl">
          Profile & privacy
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-2 text-sand-600 dark:text-sand-300">
          Your identity, discreet notifications, and granular privacy controls.
        </motion.p>
      </motion.div>

      <div className="mt-8 space-y-6">
        {/* Identity */}
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-600 text-sand-900 dark:text-sand-100">
              <User className="h-5 w-5 text-clay-500" /> Identity
            </h2>
            <Button size="sm" variant="outline" onClick={() => refreshUser()}>
              Sync with Database
            </Button>
          </div>
          <div className="mt-4 space-y-4">
            <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input
              label="Username Handle"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setUsernameError(null); }}
              error={usernameError || undefined}
              hint="Your unique public handle for community posts & profile."
            />
            <Input label="Email" value={user.email} disabled hint="Email cannot be changed." />
            <div>
              <p className="mb-2 flex items-center gap-2 text-sm font-600 text-sand-800 dark:text-sand-200">
                <Focus className="h-4 w-4" /> Your focus
              </p>
              <div className="flex flex-wrap gap-2">
                {focusOptions.map((o) => (
                  <button key={o.value} onClick={() => setFocus(o.value)} className={`chip ${focus === o.value ? 'chip-active' : ''}`} aria-pressed={focus === o.value}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={saveIdentity} loading={saving}>Save changes</Button>
              <AnimatePresence>
                {savedFlash && (
                  <motion.span initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-sm font-600 text-success">
                    Saved
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Card>

        {/* Notifications & Discreet Mode */}
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-600 text-sand-900 dark:text-sand-100">
              <Bell className="h-5 w-5 text-clay-500" /> Privacy-First Notifications
            </h2>
            <AnimatePresence>
              {notifSavedFlash && (
                <motion.span initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-xs font-600 text-success">
                  Preferences updated
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Discreet Notification Mode */}
          <div className="mt-4 rounded-xl border border-clay-200/60 bg-clay-50/50 p-4 dark:border-clay-700/60 dark:bg-clay-950/20">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-clay-100 text-clay-600 dark:bg-clay-800/60 dark:text-clay-200">
                  <EyeOff className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-600 text-sand-900 dark:text-sand-100">Discreet Preview Mode</h3>
                  <p className="mt-0.5 text-xs text-sand-600 dark:text-sand-400">
                    Replaces sensitive lock-screen text (e.g. "Period expected tomorrow") with neutral phrasing ("You have an update in Saheli") for complete privacy on shared devices.
                  </p>
                </div>
              </div>
              <button
                onClick={toggleDiscreetMode}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${settings.discreetMode ? 'bg-clay-500' : 'bg-sand-300 dark:bg-sand-700'}`}
                role="switch"
                aria-checked={settings.discreetMode}
              >
                <motion.span
                  layout
                  transition={{ duration: 0.2, ease: easeOut }}
                  className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow"
                  style={{ left: settings.discreetMode ? '1.375rem' : '0.125rem' }}
                />
              </button>
            </div>
          </div>

          {/* Granular Category Preferences */}
          <div className="mt-5 space-y-4">
            <h3 className="text-xs font-600 uppercase tracking-wider text-sand-500 dark:text-sand-400">Granular Category Preferences</h3>
            <div className="divide-y divide-sand-200/60 dark:divide-sand-700/60">
              {categoryLabels.map((cat) => {
                const active = settings.categories[cat.key];
                return (
                  <div key={cat.key} className="flex items-center justify-between py-3">
                    <div className="pr-4">
                      <p className="text-sm font-600 text-sand-800 dark:text-sand-200">{cat.title}</p>
                      <p className="text-xs text-sand-500 dark:text-sand-400">{cat.desc}</p>
                    </div>
                    <button
                      onClick={() => toggleCategory(cat.key)}
                      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${active ? 'bg-clay-500' : 'bg-sand-300 dark:bg-sand-700'}`}
                      role="switch"
                      aria-checked={active}
                    >
                      <motion.span
                        layout
                        transition={{ duration: 0.2, ease: easeOut }}
                        className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow"
                        style={{ left: active ? '1.375rem' : '0.125rem' }}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Quick links */}
        <Card className="bg-sand-50/50 dark:bg-sand-700/20">
          <h2 className="font-600 text-sand-900 dark:text-sand-100">More in your space</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Link to="/teen" className="flex items-center gap-3 rounded-xl bg-white p-3 transition-shadow hover:shadow-card dark:bg-sand-800">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sage-50 text-sage-600 dark:bg-sage-800/30 dark:text-sage-200"><GraduationCap className="h-5 w-5" /></span>
              <span className="text-sm font-600 text-sand-800 dark:text-sand-100">Teen mode</span>
            </Link>
            <Link to="/sharing" className="flex items-center gap-3 rounded-xl bg-white p-3 transition-shadow hover:shadow-card dark:bg-sand-800">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-clay-50 text-clay-600 dark:bg-clay-800/40 dark:text-clay-200"><Share2 className="h-5 w-5" /></span>
              <span className="text-sm font-600 text-sand-800 dark:text-sand-100">Sharing & caregivers</span>
            </Link>
            <Link to="/doctor-summary" className="flex items-center gap-3 rounded-xl bg-white p-3 transition-shadow hover:shadow-card dark:bg-sand-800">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-clay-50 text-clay-600 dark:bg-clay-800/40 dark:text-clay-200"><FileText className="h-5 w-5" /></span>
              <span className="text-sm font-600 text-sand-800 dark:text-sand-100">Doctor-visit summary</span>
            </Link>
            <Link to="/meds" className="flex items-center gap-3 rounded-xl bg-white p-3 transition-shadow hover:shadow-card dark:bg-sand-800">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sage-50 text-sage-600 dark:bg-sage-800/30 dark:text-sage-200"><Pill className="h-5 w-5" /></span>
              <span className="text-sm font-600 text-sand-800 dark:text-sand-100">Medications</span>
            </Link>
          </div>
        </Card>

        {/* Privacy */}
        <Card>
          <h2 className="flex items-center gap-2 font-600 text-sand-900 dark:text-sand-100">
            <ShieldCheck className="h-5 w-5 text-sage-600 dark:text-sage-300" /> Privacy & your data
          </h2>
          <p className="mt-2 text-sm text-sand-500 dark:text-sand-400">
            Your data is yours. Here is exactly what we store, who can see it, and how to export or delete it.
          </p>
          <div className="mt-4 divide-y divide-sand-200/60 dark:divide-sand-700/60">
            {privacySections.map((s, i) => (
              <div key={s.title}>
                <button
                  onClick={() => setOpenSection((prev) => (prev === i ? null : i))}
                  className="flex w-full items-center justify-between py-3 text-left"
                  aria-expanded={openSection === i}
                >
                  <span className="font-600 text-sand-800 dark:text-sand-100">{s.title}</span>
                  <motion.span animate={{ rotate: openSection === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="h-4 w-4 text-sand-400" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {openSection === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: easeOut }}
                      className="overflow-hidden"
                    >
                      <div className="pb-4">
                        <p className="text-sm text-sand-600 dark:text-sand-400">{s.body}</p>
                        {s.toggle && (
                          <label className="mt-3 flex items-center justify-between rounded-lg bg-sand-50 px-3 py-2 dark:bg-sand-700/30">
                            <span className="text-sm font-600 text-sand-700 dark:text-sand-200">Allow AI conversation logging</span>
                            <button
                              onClick={() => {
                                const next = !aiConsented;
                                setAiConsented(next);
                                localStorage.setItem('saheli-ai-consent', String(next));
                              }}
                              className={`relative h-6 w-11 rounded-full transition-colors ${aiConsented ? 'bg-clay-500' : 'bg-sand-300 dark:bg-sand-700'}`}
                              role="switch"
                              aria-checked={aiConsented}
                            >
                              <motion.span layout transition={{ duration: 0.2, ease: easeOut }} className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow" style={{ left: aiConsented ? '1.375rem' : '0.125rem' }} />
                            </button>
                          </label>
                        )}
                        {s.action === 'export' && (
                          <Button size="sm" variant="outline" className="mt-3" leftIcon={<Download className="h-4 w-4" />} onClick={exportData}>
                            Download my data
                          </Button>
                        )}
                        {s.action === 'delete' && (
                          <div className="mt-3">
                            {!confirmDelete ? (
                              <Button size="sm" variant="outline" className="border-danger/40 text-danger hover:bg-danger/10" leftIcon={<Trash2 className="h-4 w-4" />} onClick={() => setConfirmDelete(true)}>
                                Delete my data
                              </Button>
                            ) : (
                              <div className="rounded-xl border border-danger/30 bg-danger/10 p-3">
                                <p className="text-sm font-600 text-sand-900 dark:text-sand-100">This will permanently delete everything. Are you sure?</p>
                                <div className="mt-2 flex gap-2">
                                  <Button size="sm" className="bg-danger hover:bg-danger/90" onClick={() => { signOut(); }}>
                                    Yes, delete
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>Cancel</Button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </Card>

        <div>
          <Disclaimer variant="inline" />
        </div>
      </div>
    </div>
  );
}
