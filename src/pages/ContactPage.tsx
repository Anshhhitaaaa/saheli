import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, MessageSquare, MapPin, Phone, AlertTriangle, CheckCircle2, Send, User } from 'lucide-react';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { fadeUp } from '../animations/variants';

export function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!name) next.name = 'Please tell us your name.';
    if (!email) next.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Enter a valid email.';
    if (!message) next.message = 'Please write a message.';
    else if (message.length < 10) next.message = 'A little more detail helps us help you.';
    setErrors(next);
    if (Object.keys(next).length) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 900));
    setSending(false);
    setSent(true);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="max-w-2xl">
        <h1 className="font-display text-4xl font-600 text-sand-900 dark:text-sand-100 sm:text-5xl">
          Contact us
        </h1>
        <p className="mt-4 text-lg text-sand-600 dark:text-sand-300">
          Questions, feedback, or partnership ideas — we would love to hear from you. We read everything.
        </p>
      </motion.div>

      <div className="mt-10 grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Card>
            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-3 py-10 text-center"
                >
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 14 }}
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success"
                  >
                    <CheckCircle2 className="h-7 w-7" />
                  </motion.span>
                  <h2 className="font-display text-2xl font-600 text-sand-900 dark:text-sand-100">
                    Thank you, {name.split(' ')[0]}.
                  </h2>
                  <p className="max-w-sm text-sm text-sand-600 dark:text-sand-400">
                    Your message is on its way. We will reply to {email} within two business days.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => { setSent(false); setName(''); setEmail(''); setMessage(''); }}>
                    Send another
                  </Button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={submit}
                  className="space-y-4"
                  noValidate
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Input
                    label="Name"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={errors.name}
                  />
                  <Input
                    label="Email"
                    type="email"
                    placeholder="your.email@example.com"
                    leftIcon={<Mail className="h-5 w-5" />}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={errors.email}
                  />
                  <div>
                    <label htmlFor="message" className="mb-1.5 block text-sm font-600 text-sand-800 dark:text-sand-200">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="input-base resize-none"
                      placeholder="How can we help?"
                    />
                    {errors.message && <p className="mt-1.5 text-sm text-danger">{errors.message}</p>}
                  </div>
                  <Button type="submit" size="lg" loading={sending} leftIcon={<Send className="h-4 w-4" />}>
                    Send message
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </Card>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <Card>
            <h3 className="font-600 text-sand-900 dark:text-sand-100">Other ways to reach us</h3>
            <ul className="mt-3 space-y-3 text-sm text-sand-600 dark:text-sand-400">
              <li className="flex items-center gap-2.5">
                <User className="h-4 w-4 text-clay-500" /> Anshita Agrawal
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-clay-500" /> agrawal.anshita07@gmail.com
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-clay-500" /> +91 9315298434
              </li>
              <li className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 text-clay-500" /> India
              </li>
              <li className="flex items-center gap-2.5">
                <MessageSquare className="h-4 w-4 text-clay-500" /> Mon–Fri, 9 AM – 6 PM IST
              </li>
            </ul>
          </Card>
          <div className="rounded-2xl border border-warning/30 bg-warning/10 px-4 py-4">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
              <div>
                <p className="font-600 text-sand-900 dark:text-sand-100">This form is not for emergencies</p>
                <p className="mt-1 text-sm text-sand-600 dark:text-sand-400">
                  If you are in a medical emergency, contact your local emergency number or go to the
                  nearest emergency room. We do not monitor this form for urgent symptoms.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
