import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, Calendar, Check, Stethoscope, Navigation, PhoneCall, Building2 } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Disclaimer } from '../components/common/Disclaimer';
import { clinics, type Clinic } from '../mock/clinics';
import { fadeUp, staggerContainer } from '../animations/variants';

const specialties = ['all', 'Gynecology', 'Fertility', 'PCOS', 'Maternity', 'Menopause'] as const;
const cities = [
  { id: 'delhi', label: 'Delhi (NCR)' },
  { id: 'bengaluru', label: 'Bengaluru' },
  { id: 'mumbai', label: 'Mumbai' },
] as const;

export function FindCarePage() {
  const [specialty, setSpecialty] = useState<(typeof specialties)[number]>('all');
  const [selectedCity, setSelectedCity] = useState<(typeof cities)[number]['id']>('delhi');
  const [locEnabled, setLocEnabled] = useState(false);
  const [locating, setLocating] = useState(false);
  const [consultModal, setConsultModal] = useState<Clinic | null>(null);
  const [bookedClinic, setBookedClinic] = useState<Clinic | null>(null);

  const handleEnableLocation = () => {
    setLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocating(false);
          setLocEnabled(true);
          const lat = pos.coords.latitude;
          // Auto-detect city from latitude
          if (lat > 25 && lat < 31) {
            setSelectedCity('delhi');
          } else if (lat >= 15 && lat <= 21) {
            setSelectedCity('mumbai');
          } else {
            setSelectedCity('bengaluru');
          }
        },
        () => {
          setLocating(false);
          setLocEnabled(true);
          // Default to Delhi if browser location is mocked or blocked
          setSelectedCity('delhi');
        },
        { timeout: 4000 }
      );
    } else {
      setLocating(false);
      setLocEnabled(true);
      setSelectedCity('delhi');
    }
  };

  const cityClinics = clinics.filter((c) => c.city === selectedCity);
  const filtered = specialty === 'all' ? cityClinics : cityClinics.filter((c) => c.specialty === specialty);

  const cityLabelMap: Record<string, string> = {
    delhi: 'Delhi (NCR)',
    bengaluru: 'Bengaluru',
    mumbai: 'Mumbai',
  };

  return (
    <div className="mx-auto max-w-5xl">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        <motion.h1 variants={fadeUp} className="font-display text-3xl font-600 text-sand-900 dark:text-sand-100 sm:text-4xl">
          Find care
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-2 text-sand-600 dark:text-sand-300">
          Real care is one tap away. Enable location or choose your city to find nearby gynecologists.
        </motion.p>
      </motion.div>

      {/* Enable Location & City Selector Banner */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mt-6">
        <Card className="bg-gradient-to-r from-sage-50/80 via-sand-50/60 to-clay-50/60 dark:from-sage-900/30 dark:via-sand-800/40 dark:to-clay-900/30 border-sage-200/80 dark:border-sage-800/60">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sage-100 text-sage-700 dark:bg-sage-800 dark:text-sage-200">
                <Navigation className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-lg font-600 text-sand-900 dark:text-sand-100">
                  {locEnabled ? `Location Active — ${cityLabelMap[selectedCity]}` : 'Enable Location & Select City'}
                </h3>
                <p className="mt-0.5 text-sm text-sand-600 dark:text-sand-300">
                  Showing top available gynecologists, maternity hospitals, and women's health clinics in{' '}
                  <strong className="text-clay-600 dark:text-clay-300">{cityLabelMap[selectedCity]}</strong>.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={locEnabled ? 'secondary' : 'primary'}
                size="sm"
                leftIcon={<Navigation className="h-4 w-4" />}
                loading={locating}
                onClick={handleEnableLocation}
                className="shrink-0"
              >
                {locEnabled ? 'Re-Detect Location' : 'Detect My Location'}
              </Button>
            </div>
          </div>

          {/* City Selection Chips */}
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-sand-200/60 pt-3 dark:border-sand-700/60">
            <span className="text-xs font-600 text-sand-500 flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5 text-clay-500" /> City:
            </span>
            {cities.map((city) => (
              <button
                key={city.id}
                onClick={() => setSelectedCity(city.id)}
                className={`chip text-xs ${selectedCity === city.id ? 'chip-active' : ''}`}
                aria-pressed={selectedCity === city.id}
              >
                {city.label}
              </button>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Specialty Filter Chips */}
      <div className="mt-6 flex flex-wrap gap-2">
        {specialties.map((s) => (
          <button key={s} onClick={() => setSpecialty(s)} className={`chip capitalize ${specialty === s ? 'chip-active' : ''}`} aria-pressed={specialty === s}>
            {s}
          </button>
        ))}
      </div>

      {/* Clinics Grid */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mt-6 grid gap-4 sm:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {filtered.map((c) => (
            <ClinicCard
              key={c.id}
              clinic={c}
              onConsult={() => setConsultModal(c)}
              onBook={() => setBookedClinic(c)}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Talk / Consult Modal */}
      <Modal open={!!consultModal} onClose={() => setConsultModal(null)} title="Talk to Gynecologist" size="md">
        {consultModal && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-sage-50/80 p-4 dark:bg-sage-900/30 border border-sage-200/80 dark:border-sage-800">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-display text-lg font-600 text-sand-900 dark:text-sand-100">{consultModal.name}</h4>
                  <p className="text-sm font-600 text-clay-600 dark:text-clay-300">{consultModal.gynoName || 'Senior Gynecologist'}</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-success/20 px-2.5 py-0.5 text-xs font-600 text-success">
                  🟢 On Duty Now
                </span>
              </div>
              <p className="mt-2 text-xs text-sand-600 dark:text-sand-300">
                {consultModal.address} · <strong className="text-clay-600 dark:text-clay-300">{consultModal.distanceKm} km away</strong>
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-sand-700 dark:text-sand-200">
                Connect directly for an immediate phone consultation regarding your symptoms or cycle log:
              </p>
              <a href={`tel:${consultModal.phone}`} className="block w-full">
                <Button fullWidth variant="primary" size="md" leftIcon={<PhoneCall className="h-4 w-4" />}>
                  Call {consultModal.phone} Now
                </Button>
              </a>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-sand-200/60 dark:border-sand-700/60">
              <Button variant="ghost" onClick={() => setConsultModal(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Book Visit Modal */}
      <Modal open={!!bookedClinic} onClose={() => setBookedClinic(null)} title="Appointment Request Sent" size="sm">
        {bookedClinic && (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sage-100 text-sage-600 dark:bg-sage-800 dark:text-sage-200">
              <Check className="h-6 w-6" />
            </div>
            <h3 className="font-display text-lg font-600 text-sand-900 dark:text-sand-100">{bookedClinic.name}</h3>
            <p className="text-sm text-sand-600 dark:text-sand-300">
              Your appointment request for <strong>{bookedClinic.nextAvailability}</strong> has been submitted. The clinic will confirm via phone at <strong>{bookedClinic.phone}</strong>.
            </p>
            <Button fullWidth onClick={() => setBookedClinic(null)}>Done</Button>
          </div>
        )}
      </Modal>

      <div className="mt-8">
        <Disclaimer variant="inline" />
      </div>
    </div>
  );
}

function ClinicCard({ clinic, onConsult, onBook }: { clinic: Clinic; onConsult: () => void; onBook: () => void }) {
  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" exit={{ opacity: 0, scale: 0.96 }} layout>
      <Card hover className="h-full flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-display text-lg font-600 text-sand-900 dark:text-sand-100">{clinic.name}</h3>
              <span className="mt-1 inline-block rounded-full bg-clay-50 px-2.5 py-0.5 text-xs font-600 text-clay-600 dark:bg-clay-800/40 dark:text-clay-200">
                {clinic.specialty}
              </span>
            </div>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sage-50 text-sage-600 dark:bg-sage-800/30 dark:text-sage-200">
              <Stethoscope className="h-5 w-5" />
            </span>
          </div>

          <ul className="mt-4 space-y-1.5 text-sm text-sand-600 dark:text-sand-400">
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-sand-400" /> {clinic.address} · <strong className="text-sand-700 dark:text-sand-200">{clinic.distanceKm} km</strong>
            </li>
            <li className="flex items-center gap-2">
              <Calendar className="h-4 w-4 shrink-0 text-sand-400" /> Next: {clinic.nextAvailability}
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-sand-400" /> {clinic.phone}
            </li>
          </ul>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-sand-100 pt-3 dark:border-sand-800">
          <span className={`text-xs font-600 ${clinic.acceptsNewPatients ? 'text-success' : 'text-sand-400'}`}>
            {clinic.acceptsNewPatients ? 'Accepting new patients' : 'Currently full'}
          </span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" leftIcon={<PhoneCall className="h-3.5 w-3.5" />} onClick={onConsult}>
              Talk
            </Button>
            <Button size="sm" variant="primary" onClick={onBook} disabled={!clinic.acceptsNewPatients}>
              Book
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
