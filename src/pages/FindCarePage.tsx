import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, Calendar, Check, Stethoscope } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Disclaimer } from '../components/common/Disclaimer';
import { clinics, type Clinic } from '../mock/clinics';
import { fadeUp, staggerContainer, easeOut } from '../animations/variants';

const specialties = ['all', 'Gynecology', 'Fertility', 'PCOS', 'Maternity', 'Menopause', 'General'] as const;

export function FindCarePage() {
  const [specialty, setSpecialty] = useState<(typeof specialties)[number]>('all');
  const [booked, setBooked] = useState<string | null>(null);

  const filtered = specialty === 'all' ? clinics : clinics.filter((c) => c.specialty === specialty);

  const book = (id: string) => {
    setBooked(id);
    setTimeout(() => setBooked(null), 2000);
  };

  return (
    <div className="mx-auto max-w-5xl">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        <motion.h1 variants={fadeUp} className="font-display text-3xl font-600 text-sand-900 dark:text-sand-100 sm:text-4xl">
          Find care
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-2 text-sand-600 dark:text-sand-300">
          Real care is one tap away. Filter by specialty to find a clinician near you.
        </motion.p>
      </motion.div>

      <div className="mt-6 flex flex-wrap gap-2">
        {specialties.map((s) => (
          <button key={s} onClick={() => setSpecialty(s)} className={`chip ${specialty === s ? 'chip-active' : ''}`} aria-pressed={specialty === s}>
            {s}
          </button>
        ))}
      </div>

      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mt-6 grid gap-4 sm:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {filtered.map((c) => (
            <ClinicCard key={c.id} clinic={c} booked={booked === c.id} onBook={() => book(c.id)} />
          ))}
        </AnimatePresence>
      </motion.div>

      <div className="mt-8">
        <Disclaimer variant="inline" />
      </div>
    </div>
  );
}

function ClinicCard({ clinic, booked, onBook }: { clinic: Clinic; booked: boolean; onBook: () => void }) {
  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" exit={{ opacity: 0, scale: 0.96 }} layout>
      <Card hover className="h-full">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-display text-lg font-600 text-sand-900 dark:text-sand-100">{clinic.name}</h3>
            <span className="mt-1 inline-block rounded-full bg-clay-50 px-2.5 py-0.5 text-xs font-600 text-clay-600 dark:bg-clay-800/40 dark:text-clay-200">
              {clinic.specialty}
            </span>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sage-50 text-sage-600 dark:bg-sage-800/30 dark:text-sage-200">
            <Stethoscope className="h-5 w-5" />
          </span>
        </div>
        <ul className="mt-4 space-y-1.5 text-sm text-sand-600 dark:text-sand-400">
          <li className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0" /> {clinic.address} · {clinic.distanceKm} km</li>
          <li className="flex items-center gap-2"><Calendar className="h-4 w-4 shrink-0" /> Next: {clinic.nextAvailability}</li>
          <li className="flex items-center gap-2"><Phone className="h-4 w-4 shrink-0" /> {clinic.phone}</li>
        </ul>
        <div className="mt-4 flex items-center justify-between">
          <span className={`text-xs font-600 ${clinic.acceptsNewPatients ? 'text-success' : 'text-sand-400'}`}>
            {clinic.acceptsNewPatients ? 'Accepting new patients' : 'Currently full'}
          </span>
          <Button size="sm" onClick={onBook} disabled={!clinic.acceptsNewPatients} loading={booked}>
            {booked ? 'Booked!' : 'Book'}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
