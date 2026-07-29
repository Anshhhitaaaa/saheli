import { useState, useEffect } from 'react';
import { Calendar, Droplet, Check, Clock } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import type { FlowLevel } from '../../mock/cycle';

const flowOptions: { level: FlowLevel; label: string; desc: string }[] = [
  { level: 'spotting', label: 'Spotting', desc: 'Very light droplets' },
  { level: 'light', label: 'Light', desc: 'Light flow' },
  { level: 'medium', label: 'Medium', desc: 'Regular flow' },
  { level: 'heavy', label: 'Heavy', desc: 'Heavy / full flow' },
];

const flowColors: Record<FlowLevel, string> = {
  none: 'bg-transparent',
  spotting: 'bg-sand-300 dark:bg-sand-600',
  light: 'bg-clay-200 dark:bg-clay-700',
  medium: 'bg-clay-400 dark:bg-clay-500',
  heavy: 'bg-clay-600 dark:bg-clay-400',
};

interface LogPeriodStartModalProps {
  open: boolean;
  onClose: () => void;
  initialDate?: string;
  onSuccess?: (date: string, flow: FlowLevel, note?: string) => void;
}

export function LogPeriodStartModal({ open, onClose, initialDate, onSuccess }: LogPeriodStartModalProps) {
  const { user, updateUser } = useAuth();
  const todayStr = new Date().toISOString().slice(0, 10);

  const [date, setDate] = useState(initialDate || todayStr);
  const [flow, setFlow] = useState<FlowLevel>('medium');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setDate(initialDate || new Date().toISOString().slice(0, 10));
      setFlow('medium');
      setNote('');
    }
  }, [open, initialDate]);

  const setPresetDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    setDate(d.toISOString().slice(0, 10));
  };

  const handleSave = async () => {
    if (!date) return;
    setLoading(true);

    try {
      if (user?.email) {
        await api.cycle.save(user.email, date, flow, note.trim() || undefined);
      }
      updateUser({ lastPeriodStart: date });
      if (onSuccess) {
        onSuccess(date, flow, note.trim() || undefined);
      }
      onClose();
    } catch {
      // Fallback local update
      updateUser({ lastPeriodStart: date });
      if (onSuccess) {
        onSuccess(date, flow, note.trim() || undefined);
      }
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Log period start" size="md">
      <div className="space-y-5 pt-1">
        <p className="text-sm text-sand-600 dark:text-sand-300">
          Pick the date your period started and select your flow level to update your cycle predictions.
        </p>

        {/* Date picker + presets */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-600 uppercase tracking-wide text-sand-700 dark:text-sand-200">
            <Calendar className="h-4 w-4 text-clay-500" /> Start date
          </label>
          <input
            type="date"
            max={todayStr}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input-base text-sm"
          />

          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="flex items-center gap-1 text-sand-500">
              <Clock className="h-3 w-3" /> Quick pick:
            </span>
            <button
              type="button"
              onClick={() => setPresetDate(0)}
              className={`chip text-xs ${date === todayStr ? 'chip-active' : ''}`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setPresetDate(1)}
              className="chip text-xs"
            >
              Yesterday
            </button>
            <button
              type="button"
              onClick={() => setPresetDate(2)}
              className="chip text-xs"
            >
              2 days ago
            </button>
            <button
              type="button"
              onClick={() => setPresetDate(3)}
              className="chip text-xs"
            >
              3 days ago
            </button>
          </div>
        </div>

        {/* Flow selection */}
        <div>
          <label className="mb-2 flex items-center gap-1.5 text-xs font-600 uppercase tracking-wide text-sand-700 dark:text-sand-200">
            <Droplet className="h-4 w-4 text-clay-500" /> Flow level
          </label>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {flowOptions.map((opt) => (
              <button
                key={opt.level}
                type="button"
                onClick={() => setFlow(opt.level)}
                className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-all ${
                  flow === opt.level
                    ? 'border-clay-400 bg-clay-50/80 text-clay-700 shadow-sm dark:border-clay-500 dark:bg-clay-800/40 dark:text-clay-200'
                    : 'border-sand-200/80 bg-white text-sand-700 hover:border-sand-300 dark:border-sand-700 dark:bg-sand-800 dark:text-sand-300'
                }`}
              >
                <span className={`mb-1.5 h-3.5 w-3.5 rounded-full ${flowColors[opt.level]}`} />
                <span className="text-sm font-600">{opt.label}</span>
                <span className="mt-0.5 text-[11px] text-sand-400 dark:text-sand-500">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Note input */}
        <div>
          <label htmlFor="period-note" className="mb-1.5 block text-xs font-600 uppercase tracking-wide text-sand-700 dark:text-sand-200">
            Notes (optional)
          </label>
          <textarea
            id="period-note"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Started early morning, light cramps..."
            className="input-base text-sm resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-sand-200/60 pt-4 dark:border-sand-700/60">
          <Button variant="ghost" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            loading={loading}
            disabled={!date}
            leftIcon={<Check className="h-4 w-4" />}
          >
            Save period start
          </Button>
        </div>
      </div>
    </Modal>
  );
}
