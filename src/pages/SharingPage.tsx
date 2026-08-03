import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Eye, EyeOff, Check, X, Shield, Copy, ExternalLink } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Disclaimer } from '../components/common/Disclaimer';
import { fadeUp, staggerContainer, easeOut } from '../animations/variants';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface ShareLink {
  id: string;
  name: string;
  relationship: string;
  permissions: { cycle: boolean; symptoms: boolean; pregnancy: boolean; insights: boolean };
  active: boolean;
}

const initialShares: ShareLink[] = [
  { id: 's1', name: 'Arjun', relationship: 'Partner', permissions: { cycle: true, symptoms: false, pregnancy: true, insights: true }, active: true },
];

export function SharingPage() {
  const { user } = useAuth();
  const [shares, setShares] = useState<ShareLink[]>(initialShares);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', relationship: '', cycle: true, symptoms: false, pregnancy: false, insights: true });
  const [copied, setCopied] = useState<string | null>(null);

  const fetchShares = async () => {
    if (user?.email) {
      try {
        const res = await api.sharing.get(user.email);
        if (res && res.shares && res.shares.length > 0) {
          setShares(res.shares);
        }
      } catch {}
    }
  };

  useEffect(() => {
    fetchShares();
  }, [user?.email]);

  const add = async () => {
    if (!form.name.trim()) return;
    const tempId = 's_' + Date.now();
    const newShare: ShareLink = {
      id: tempId,
      name: form.name.trim(),
      relationship: form.relationship.trim() || 'Caregiver',
      permissions: { cycle: form.cycle, symptoms: form.symptoms, pregnancy: form.pregnancy, insights: form.insights },
      active: true,
    };
    setShares((prev) => [newShare, ...prev]);
    setForm({ name: '', relationship: '', cycle: true, symptoms: false, pregnancy: false, insights: true });
    setAdding(false);

    if (user?.email) {
      try {
        const res = await api.sharing.create(user.email, newShare.name, newShare.relationship, newShare.permissions);
        if (res && res.shares && res.shares.length > 0) setShares(res.shares);
      } catch {}
    }
  };

  const togglePerm = async (id: string, key: keyof ShareLink['permissions']) => {
    const target = shares.find((s) => s.id === id);
    if (!target) return;
    const updatedPerms = { ...target.permissions, [key]: !target.permissions[key] };
    setShares((prev) => prev.map((s) => (s.id === id ? { ...s, permissions: updatedPerms } : s)));

    if (user?.email) {
      try {
        const res = await api.sharing.update(user.email, id, { permissions: updatedPerms });
        if (res && res.shares) setShares(res.shares);
      } catch {}
    }
  };

  const revoke = async (id: string) => {
    setShares((prev) => prev.map((s) => (s.id === id ? { ...s, active: false } : s)));

    if (user?.email) {
      try {
        const res = await api.sharing.update(user.email, id, { active: false });
        if (res && res.shares) setShares(res.shares);
      } catch {}
    }
  };

  const copyLink = (id: string) => {
    const shareUrl = `${window.location.origin}/share/${id}`;
    navigator.clipboard?.writeText(shareUrl).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 1600);
  };

  const permLabels: { key: keyof ShareLink['permissions']; label: string }[] = [
    { key: 'cycle', label: 'Cycle history' },
    { key: 'symptoms', label: 'Symptom & mood log' },
    { key: 'pregnancy', label: 'Pregnancy milestones' },
    { key: 'insights', label: 'Insights & trends' },
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        <motion.h1 variants={fadeUp} className="font-display text-3xl font-600 text-sand-900 dark:text-sand-100 sm:text-4xl">
          Sharing
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-2 text-sand-600 dark:text-sand-300">
          Let a partner or caregiver see a limited view of your tracking — with consent-gated, granular permissions. You are always in control.
        </motion.p>
      </motion.div>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mt-6 flex items-start gap-3 rounded-2xl border border-sage-200/70 bg-sage-50/70 px-4 py-3 dark:border-sage-700/50 dark:bg-sage-800/20"
      >
        <Shield className="mt-0.5 h-5 w-5 shrink-0 text-sage-600 dark:text-sage-300" />
        <p className="text-sm text-sage-700 dark:text-sage-200">
          Shared viewers get a read-only view of only what you allow. They cannot edit, delete, or see your AI assistant conversations. You can revoke access anytime.
        </p>
      </motion.div>

      <div className="mt-6 flex justify-end">
        <Button size="sm" leftIcon={<UserPlus className="h-4 w-4" />} onClick={() => setAdding((a) => !a)}>
          {adding ? 'Cancel' : 'Invite someone'}
        </Button>
      </div>

      <AnimatePresence>
        {adding && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <Card className="mt-4">
              <div className="space-y-4">
                <Input label="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Arjun" />
                <Input label="Relationship" value={form.relationship} onChange={(e) => setForm((f) => ({ ...f, relationship: e.target.value }))} placeholder="e.g. Partner, Parent, Doctor" />
                <div>
                  <p className="mb-2 text-sm font-600 text-sand-800 dark:text-sand-200">What can they see?</p>
                  <div className="space-y-2">
                    {permLabels.map((p) => (
                      <label key={p.key} className="flex items-center justify-between">
                        <span className="text-sm text-sand-700 dark:text-sand-200">{p.label}</span>
                        <button
                          onClick={() => setForm((f) => ({ ...f, [p.key]: !f[p.key] }))}
                          className={`relative h-6 w-11 rounded-full transition-colors ${form[p.key] ? 'bg-clay-500' : 'bg-sand-300 dark:bg-sand-700'}`}
                          role="switch"
                          aria-checked={form[p.key]}
                        >
                          <motion.span layout transition={{ duration: 0.2, ease: easeOut }} className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow" style={{ left: form[p.key] ? '1.375rem' : '0.125rem' }} />
                        </button>
                      </label>
                    ))}
                  </div>
                </div>
                <Button onClick={add} leftIcon={<Check className="h-4 w-4" />}>Create invite link</Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mt-6 space-y-3">
        <AnimatePresence>
          {shares.map((s) => (
            <motion.div key={s.id} variants={fadeUp} initial="hidden" animate="visible" exit={{ opacity: 0 }} layout>
              <Card>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-600 text-sand-900 dark:text-sand-100">{s.name}</h3>
                    <p className="text-sm text-sand-500 dark:text-sand-400">{s.relationship}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-600 ${s.active ? 'bg-success/15 text-success' : 'bg-sand-200 text-sand-500 dark:bg-sand-700/50'}`}>
                    {s.active ? 'Active' : 'Revoked'}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {permLabels.map((p) => {
                    const on = s.permissions[p.key];
                    return (
                      <button
                        key={p.key}
                        onClick={() => togglePerm(s.id, p.key)}
                        disabled={!s.active}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-600 transition-colors ${
                          on ? 'bg-clay-100 text-clay-700 dark:bg-clay-800/40 dark:text-clay-200' : 'bg-sand-100 text-sand-400 dark:bg-sand-700/40'
                        }`}
                      >
                        {on ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        {p.label}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Button size="sm" variant="outline" leftIcon={copied === s.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} onClick={() => copyLink(s.id)} disabled={!s.active}>
                    {copied === s.id ? 'Link copied!' : 'Copy share link'}
                  </Button>
                  <a href={`/share/${s.id}`} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="ghost" leftIcon={<ExternalLink className="h-4 w-4" />}>
                      Preview
                    </Button>
                  </a>
                  {s.active && (
                    <Button size="sm" variant="ghost" leftIcon={<X className="h-4 w-4" />} onClick={() => revoke(s.id)} className="ml-auto text-danger hover:bg-danger/10">
                      Revoke
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <div className="mt-8">
        <Disclaimer variant="inline" />
      </div>
    </div>
  );
}
