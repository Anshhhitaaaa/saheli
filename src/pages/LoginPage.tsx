import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!email) next.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Enter a valid email.';
    if (!password) next.password = 'Password is required.';
    else if (password.length < 6) next.password = 'At least 6 characters.';
    setErrors(next);
    if (Object.keys(next).length) return;
    setLoading(true);
    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch {
      setErrors({ password: 'Could not sign in. Try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to continue your tracking.">
      <form onSubmit={submit} className="space-y-4" noValidate>
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
          placeholder="Your password"
          leftIcon={<Lock className="h-5 w-5" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          hint="Your data stays private — we never share it."
        />
        <Button type="submit" fullWidth size="lg" loading={loading}>
          Log in
        </Button>
      </form>
      <p className="mt-6 text-sm text-sand-600 dark:text-sand-400">
        New to Saheli?{' '}
        <Link to="/signup" className="font-600 text-clay-600 hover:underline dark:text-clay-300">
          Create an account
        </Link>
      </p>
      <p className="mt-3 rounded-lg bg-sand-100/70 px-3 py-2 text-xs text-sand-500 dark:bg-sand-800/50 dark:text-sand-400">
        Demo: use <code className="font-600">pcos@saheli.app</code>,{' '}
        <code className="font-600">pregnant@saheli.app</code>, or any email.
      </p>
    </AuthLayout>
  );
}
