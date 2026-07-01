import { useEffect, useState } from 'react';
import { CalendarX2, Plus, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { listBlockedDates, addBlockedDate, removeBlockedDate } from '../../lib/api';
import type { BlockedDate } from '../../lib/types';
import { PageHeader } from './PageHeader';
import { Modal } from './Modal';
import { toDbDate } from '../../lib/availability';

export function BlockedDatesAdmin() {
  const [items, setItems] = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    blocked_date: toDbDate(new Date()),
    reason: '',
  });

  async function load() {
    setLoading(true);
    const { data } = await listBlockedDates();
    setItems(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function add() {
    setError(null);
    if (!form.blocked_date) {
      setError('Please pick a date.');
      return;
    }
    setSaving(true);
    const { error: err } = await addBlockedDate({
      blocked_date: form.blocked_date,
      reason: form.reason.trim() || null,
    });
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    setOpen(false);
    setForm({ blocked_date: toDbDate(new Date()), reason: '' });
    await load();
  }

  async function remove(id: string) {
    const { error: err } = await removeBlockedDate(id);
    if (!err) setItems((prev) => prev.filter((x) => x.id !== id));
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Blocked Dates"
        subtitle="Days your cleaning team is unavailable — holidays, time off, or fully booked dates."
        actions={
          <button onClick={() => setOpen(true)} className="btn-brand">
            <Plus size={14} />
            Block a date
          </button>
        }
      />

      <div className="card overflow-hidden">
        {loading ? (
          <div className="divide-y divide-ink-100">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="px-6 py-4 animate-pulse">
                <div className="h-4 w-1/3 rounded bg-ink-100" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <CalendarX2 size={20} />
            </div>
            <div className="mt-4 display-heading text-lg">No blocked dates</div>
            <div className="mt-1 text-sm text-ink-500">
              Block a date to prevent new bookings from being scheduled.
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-ink-100">
            {items.map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-4 px-6 py-4">
                <div>
                  <div className="font-medium text-ink-900">
                    {format(parseISO(b.blocked_date), 'EEEE, MMMM d, yyyy')}
                  </div>
                  <div className="text-xs text-ink-500">
                    {b.reason ?? 'No reason provided'}
                  </div>
                </div>
                <button
                  onClick={() => remove(b.id)}
                  className="rounded-full border border-ink-200 p-2 text-ink-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                  aria-label="Remove blocked date"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Block a date"
        description="Cleaning appointments cannot be booked on this date."
        footer={
          <>
            <button onClick={() => setOpen(false)} className="btn-ghost">Cancel</button>
            <button onClick={add} disabled={saving} className="btn-primary">
              {saving ? 'Blocking…' : 'Block date'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label">Date</label>
            <input
              type="date"
              value={form.blocked_date}
              onChange={(e) => setForm({ ...form, blocked_date: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="label">Reason (optional)</label>
            <input
              type="text"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="Holiday, team training, fully booked…"
              className="input"
            />
          </div>
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {error}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
