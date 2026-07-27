import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ShieldCheck, Download, Trash2, Bell, User, Focus, GraduationCap, Share2, FileText, Pill } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Disclaimer } from '../components/common/Disclaimer';
import { useAuth, type OnboardingFocus } from '../context/AuthContext';
import { fadeUp, staggerContainer, easeOut } from '../animations/variants';

const focusOptions: { value: OnboardingFocus; label: string }[] = [
  { value: 'periods', label: 'My periods' },
  { value: 'pcos', label: 'PCOS' },
  { value: 'fertility', label: 'Fertility' },
  { value: 'pregnancy', label: 'Pregnancy' },
  { value: 'menopause', label: 'Menopause' },
  { value: 'general', label: 'General' },
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
  const { user, updateUser, signOut } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [focus, setFocus] = useState<OnboardingFocus>(user?.focus ?? 'general');
  const [notifications, setNotifications] = useState({ reminders: true, insights: true, community: false });
  const [openSection, setOpenSection] = useState<number | null>(0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [aiConsented, setAiConsented] = useState(() => localStorage.getItem('saheli-ai-consent') === 'true');

  if (!user) return null;

  const saveIdentity = () => {
    updateUser({ name, focus, pregnancyMode: focus === 'pregnancy' });
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1600);
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
          Your identity, your focus, your notifications — and your data, in plain language.
        </motion.p>
      </motion.div>

      <div className="mt-8 space-y-6">
        {/* Identity */}
        <Card>
          <h2 className="flex items-center gap-2 font-600 text-sand-900 dark:text-sand-100">
            <User className="h-5 w-5 text-clay-500" /> Identity
          </h2>
          <div className="mt-4 space-y-4">
            <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Email" value={user.email} disabled hint="Email cannot be changed in this demo." />
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
              <Button onClick={saveIdentity}>Save changes</Button>
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

        {/* Notifications */}
        <Card>
          <h2 className="flex items-center gap-2 font-600 text-sand-900 dark:text-sand-100">
            <Bell className="h-5 w-5 text-clay-500" /> Notifications
          </h2>
          <div className="mt-4 space-y-3">
            {[
              { key: 'reminders', label: 'Cycle and logging reminders' },
              { key: 'insights', label: 'New insights from your data' },
              { key: 'community', label: 'Community replies' },
            ].map((n) => (
              <label key={n.key} className="flex items-center justify-between">
                <span className="text-sm text-sand-700 dark:text-sand-200">{n.label}</span>
                <button
                  onClick={() => setNotifications((prev) => ({ ...prev, [n.key]: !prev[n.key as keyof typeof prev] }))}
                  className={`relative h-6 w-11 rounded-full transition-colors ${notifications[n.key as keyof typeof notifications] ? 'bg-clay-500' : 'bg-sand-300 dark:bg-sand-700'}`}
                  role="switch"
                  aria-checked={notifications[n.key as keyof typeof notifications]}
                >
                  <motion.span
                    layout
                    transition={{ duration: 0.2, ease: easeOut }}
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow ${notifications[n.key as keyof typeof notifications] ? 'left-5.5' : 'left-0.5'}`}
                    style={{ left: notifications[n.key as keyof typeof notifications] ? '1.375rem' : '0.125rem' }}
                  />
                </button>
              </label>
            ))}
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
