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
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ usernameOrEmail?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!usernameOrEmail.trim()) next.usernameOrEmail = 'Username or Email is required.';
    if (!password) next.password = 'Password is required.';
    else if (password.length < 6) next.password = 'At least 6 characters.';
    setErrors(next);
    if (Object.keys(next).length) return;
    setLoading(true);
    try {
      await signIn(usernameOrEmail.trim(), password);
      navigate('/dashboard');
    } catch (err: any) {
      setErrors({ password: err.message || 'Could not sign in. Please check your credentials.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to continue your tracking.">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Input
          label="Username or Email"
          placeholder="e.g. @anshita or you@example.com"
          leftIcon={<span className="text-base font-700 text-sand-400">@</span>}
          value={usernameOrEmail}
          onChange={(e) => setUsernameOrEmail(e.target.value)}
          error={errors.usernameOrEmail}
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
        Demo accounts: <code className="font-600">@meera_pcos</code>,{' '}
        <code className="font-600">@ishita_preg</code>, or your unique username.
      </p>
    </AuthLayout>
  );
}
