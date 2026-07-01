import { useEffect, useState } from 'react';
import { Sparkles, X, Copy, Check } from 'lucide-react';
import { checkHealth } from '../lib/api';
import { Modal } from './admin/Modal';

const ENV_SNIPPET = `DATABASE_URL=postgresql://<user>:<password>@<host>/<db>?sslmode=require
JWT_SECRET=a-long-random-secret`;

export function SetupBanner() {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    checkHealth().then(({ data }) => {
      if (!cancelled) setConfigured(!!data?.ok);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (configured !== false || dismissed) return null;

  async function copy() {
    try {
      await navigator.clipboard.writeText(ENV_SNIPPET);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  return (
    <>
      <div className="fixed bottom-4 right-4 z-[60] max-w-sm animate-slide-up sm:bottom-6 sm:right-6">
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200/80 bg-white/95 p-4 shadow-lift backdrop-blur">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
            <Sparkles size={15} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="text-sm font-semibold text-ink-900">Demo mode</div>
              <button
                onClick={() => setDismissed(true)}
                className="-mr-1 -mt-1 rounded-full p-1 text-ink-400 transition hover:bg-ink-100 hover:text-ink-700"
                aria-label="Dismiss"
              >
                <X size={13} />
              </button>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-ink-600">
              The Neon database isn't connected yet. The site is showing sample data. Add your
              connection details to enable real bookings and admin.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-3 py-1.5 text-[11px] font-medium text-white transition hover:bg-ink-800"
              >
                How to connect
              </button>
              <button
                onClick={() => setDismissed(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-white px-3 py-1.5 text-[11px] font-medium text-ink-700 hover:bg-ink-50"
              >
                Continue in demo
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Connect Neon"
        description="Add your Neon connection string and a JWT secret — the app will switch to real data automatically."
        size="lg"
        footer={
          <button onClick={() => setOpen(false)} className="btn-primary">
            Got it
          </button>
        }
      >
        <ol className="space-y-4 text-sm text-ink-700">
          <li>
            <div className="font-medium text-ink-900">1. Run the schema against your Neon database</div>
            <div className="mt-1 text-ink-500">
              <code className="rounded bg-ink-100 px-1.5 py-0.5 text-xs">psql "$DATABASE_URL" -f neon/schema.sql</code>
            </div>
          </li>
          <li>
            <div className="font-medium text-ink-900">2. Set environment variables</div>
            <div className="relative mt-2">
              <pre className="overflow-auto rounded-xl border border-ink-100 bg-ink-50 p-4 text-xs text-ink-800">
{ENV_SNIPPET}
              </pre>
              <button
                onClick={copy}
                className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-ink-700 ring-1 ring-ink-200 hover:bg-ink-50"
              >
                {copied ? <Check size={12} className="text-mint-600" /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="mt-2 text-xs text-ink-500">
              In Vercel: <span className="font-medium text-ink-700">Project Settings → Environment Variables</span>.
              Locally, add them to a gitignored <code className="rounded bg-ink-100 px-1.5 py-0.5 text-xs">.env</code> file.
              Never prefix these with <code className="rounded bg-ink-100 px-1.5 py-0.5 text-xs">VITE_</code> — that
              would expose them to the browser.
            </div>
          </li>
          <li>
            <div className="font-medium text-ink-900">3. Create an admin login</div>
            <div className="mt-1 text-ink-500">
              <code className="rounded bg-ink-100 px-1.5 py-0.5 text-xs">
                DATABASE_URL=... node scripts/create-admin.mjs you@primaxgroupllc.com yourpassword
              </code>
            </div>
          </li>
          <li>
            <div className="font-medium text-ink-900">4. You're live</div>
            <div className="mt-1 text-ink-500">
              The site will automatically use your real Neon data — services, business hours,
              appointments, and admin access — without changing any code.
            </div>
          </li>
        </ol>
      </Modal>
    </>
  );
}
