import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { listBusinessHours, saveBusinessHours } from '../../lib/api';
import type { BusinessHours } from '../../lib/types';
import { WEEKDAYS } from '../../lib/types';
import { PageHeader } from './PageHeader';

interface Row extends BusinessHours {
  dirty?: boolean;
}

export function BusinessHoursAdmin() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await listBusinessHours();
      const filled: Row[] = WEEKDAYS.map((_, i) => {
        const existing = (data ?? []).find((r: BusinessHours) => r.weekday === i);
        return (
          existing ?? {
            id: '',
            weekday: i,
            is_open: false,
            start_time: '09:00:00',
            end_time: '17:00:00',
          }
        );
      });
      setRows(filled);
      setLoading(false);
    }
    load();
  }, []);

  function patch(weekday: number, patch: Partial<Row>) {
    setRows((prev) =>
      prev.map((r) => (r.weekday === weekday ? { ...r, ...patch, dirty: true } : r))
    );
  }

  function timeToInput(t: string) {
    return t.slice(0, 5);
  }
  function inputToTime(v: string) {
    return v.length === 5 ? `${v}:00` : v;
  }

  async function saveAll() {
    setSaving(true);
    setError(null);
    try {
      const payload = rows.map((r) => ({
        weekday: r.weekday,
        is_open: r.is_open,
        start_time: r.start_time,
        end_time: r.end_time,
      }));
      const { data, error: err } = await saveBusinessHours(payload);
      if (err) throw new Error(err.message);
      if (data) setRows(data.map((r) => ({ ...r, dirty: false })));
      setSavedAt(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save business hours.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Business Hours"
        subtitle="Set the hours your cleaning team is available — this controls public booking slots."
        actions={
          <button onClick={saveAll} disabled={saving} className="btn-primary">
            <Save size={14} />
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        }
      />

      <div className="card overflow-hidden">
        {loading ? (
          <div className="divide-y divide-ink-100">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="px-6 py-4 animate-pulse">
                <div className="h-4 w-1/4 rounded bg-ink-100" />
              </div>
            ))}
          </div>
        ) : (
          <ul className="divide-y divide-ink-100">
            {rows.map((r) => (
              <li
                key={r.weekday}
                className="grid grid-cols-1 items-center gap-4 px-6 py-4 sm:grid-cols-[140px_1fr_1fr_120px]"
              >
                <div className="font-medium text-ink-900">{WEEKDAYS[r.weekday]}</div>
                <div>
                  <label className="label">Opens</label>
                  <input
                    type="time"
                    disabled={!r.is_open}
                    value={timeToInput(r.start_time)}
                    onChange={(e) =>
                      patch(r.weekday, { start_time: inputToTime(e.target.value) })
                    }
                    className="input disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="label">Closes</label>
                  <input
                    type="time"
                    disabled={!r.is_open}
                    value={timeToInput(r.end_time)}
                    onChange={(e) =>
                      patch(r.weekday, { end_time: inputToTime(e.target.value) })
                    }
                    className="input disabled:opacity-50"
                  />
                </div>
                <div className="flex sm:justify-end">
                  <label className="flex cursor-pointer items-center gap-2 rounded-full bg-ink-50 px-3 py-2 text-xs">
                    <input
                      type="checkbox"
                      checked={r.is_open}
                      onChange={(e) => patch(r.weekday, { is_open: e.target.checked })}
                      className="h-4 w-4 rounded border-ink-300 text-brand-600"
                    />
                    {r.is_open ? 'Open' : 'Closed'}
                  </label>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      )}
      {savedAt && !error && (
        <div className="text-xs text-mint-700">
          Saved · {savedAt.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}
