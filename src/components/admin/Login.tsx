import { useState } from 'react';
import { Sparkles, Lock, Mail } from 'lucide-react';
import { Logo } from '../public/Logo';
import { IMG } from '../../lib/images';

interface LoginProps {
  onSubmit: (email: string, password: string) => Promise<string | null>;
}

export function Login({ onSubmit }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const err = await onSubmit(email, password);
    setLoading(false);
    if (err) setError(err);
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-md">
          <Logo />
          <div className="mt-12">
            <div className="eyebrow">
              <Sparkles size={12} />
              Team workspace
            </div>
            <h1 className="display-heading mt-4 text-3xl sm:text-4xl">Welcome back.</h1>
            <p className="mt-2 text-sm text-ink-500">
              Sign in with your admin account to manage appointments, services, and your cleaning
              company settings.
            </p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@cleaningco.com"
                  className="input pl-10"
                  required
                />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input pl-10"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="mt-8 text-xs text-ink-400">
            This area is restricted to authorized team members of the cleaning company.
          </div>
        </div>
      </div>

      <div className="relative hidden lg:block">
        <img
          src={IMG.aboutTeam}
          alt="Bright clean home interior"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-ink-900/60 via-ink-900/20 to-transparent" />
        <div className="absolute bottom-10 left-10 right-10 max-w-md text-white">
          <div className="text-xs uppercase tracking-widest opacity-80">Cleaning team workspace</div>
          <div className="mt-2 font-display text-3xl text-balance">
            Everything you need to run a premium cleaning company — in one place.
          </div>
        </div>
      </div>
    </div>
  );
}
