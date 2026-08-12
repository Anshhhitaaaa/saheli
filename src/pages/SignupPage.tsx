import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { useAuth, type OnboardingFocus } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { fadeUp } from '../animations/variants';

import { validatePasswordStrength } from '../utils/security';

const focusOptions: { value: OnboardingFocus; label: string; emoji: string }[] = [
  { value: 'periods', label: 'My periods', emoji: '🩹' },
  { value: 'pcos', label: 'PCOS', emoji: '🌸' },
  { value: 'fertility', label: 'Fertility', emoji: '🌱' },
  { value: 'pregnancy', label: 'Pregnancy', emoji: '🤰' },
  { value: 'menopause', label: 'Menopause', emoji: '🌙' },
  { value: 'general', label: 'Just exploring', emoji: '✨' },
];

const teenOption = { value: 'periods', label: 'Teen (first cycles)', emoji: '🎓' };

export function SignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [focus, setFocus] = useState<OnboardingFocus>('general');
  const [isTeen, setIsTeen] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; username?: string; email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!name.trim()) next.name = 'Tell us what to call you.';
    
    const cleanUser = username.trim().replace(/^@/, '');
    if (!cleanUser) {
      next.username = 'Username is required.';
    } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(cleanUser)) {
      next.username = 'Username must be 3-20 characters (letters, numbers, underscores).';
    }

    if (!email) next.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Enter a valid email.';
    if (!password) {
      next.password = 'Password is required.';
    } else {
      const passCheck = validatePasswordStrength(password);
      if (!passCheck.isValid) {
        next.password = passCheck.feedback.join(' ') || 'Password must be at least 8 characters long and contain both letters and numbers.';
      }
    }
    setErrors(next);
    if (Object.keys(next).length) return;
    setLoading(true);
    try {
      await signUp({ name, username: cleanUser, email, password, focus });
      if (isTeen) {
        navigate('/teen');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('username')) {
        setErrors({ username: msg });
      } else if (msg.toLowerCase().includes('email')) {
        setErrors({ email: msg });
      } else {
        setErrors({ email: msg || 'Could not create account. Try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Start tracking with a calmer kind of health companion.">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Input
          label="Name"
          placeholder="What should we call you?"
          leftIcon={<User className="h-5 w-5" />}
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />
        <Input
          label="Unique Username"
          placeholder="e.g. anshita or @anshita"
          leftIcon={<span className="text-base font-700 text-sand-400">@</span>}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          error={errors.username}
          hint="Your unique handle for posts & community discussions."
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          leftIcon={<Mail className="h-5 w-5" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          success={!errors.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)}
        />
        <Input
          label="Password"
          type="password"
          placeholder="At least 6 characters"
          leftIcon={<Lock className="h-5 w-5" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          hint="We encrypt your data. You can export or delete it anytime."
        />
        <div>
          <p className="mb-2 text-sm font-600 text-sand-800 dark:text-sand-200">
            What brought you to Saheli? <span className="font-400 text-sand-500">(optional — you can change this anytime)</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {focusOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { setFocus(opt.value); setIsTeen(false); }}
                className={`chip ${!isTeen && focus === opt.value ? 'chip-active' : ''}`}
                aria-pressed={!isTeen && focus === opt.value}
              >
                <span aria-hidden>{opt.emoji}</span>
                {opt.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => { setIsTeen(true); setFocus('periods'); }}
              className={`chip ${isTeen ? 'chip-active' : ''}`}
              aria-pressed={isTeen}
            >
              <span aria-hidden>{teenOption.emoji}</span>
              {teenOption.label}
            </button>
          </div>
          <motion.p
            key={focus}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-2 text-xs text-sand-500 dark:text-sand-400"
          >
            This helps personalize your dashboard. It never gates access.
          </motion.p>
        </div>
        <Button type="submit" fullWidth size="lg" loading={loading}>
          Create account
        </Button>
      </form>
      <p className="mt-6 text-sm text-sand-600 dark:text-sand-400">
        Already have an account?{' '}
        <Link to="/login" className="font-600 text-clay-600 hover:underline dark:text-clay-300">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
