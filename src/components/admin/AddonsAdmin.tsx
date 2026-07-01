import { useEffect, useState } from 'react';
import { Pencil, Plus, PowerOff, Power } from 'lucide-react';
import { listAddons, createAddon, updateAddon } from '../../lib/api';
import type { Addon } from '../../lib/types';
import { PageHeader } from './PageHeader';
import { Modal } from './Modal';
import { formatCurrency, formatDuration } from '../../lib/availability';
import { cn } from '../../lib/cn';

interface FormState {
  id?: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  is_active: boolean;
}

const EMPTY: FormState = {
  name: '',
  description: '',
  price: 0,
  duration_minutes: 0,
  is_active: true,
};

export function AddonsAdmin() {
  const [addons, setAddons] = useState<Addon[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await listAddons();
    setAddons(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setForm(EMPTY);
    setError(null);
    setOpenForm(true);
  }

  function openEdit(a: Addon) {
    setForm({
      id: a.id,
      name: a.name,
      description: a.description ?? '',
      price: a.price,
      duration_minutes: a.duration_minutes,
      is_active: a.is_active,
    });
    setError(null);
    setOpenForm(true);
  }

  async function save() {
    setError(null);
    if (!form.name.trim()) {
      setError('Add-on name is required.');
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: Number(form.price),
      duration_minutes: Number(form.duration_minutes),
      is_active: form.is_active,
    };
    const res = form.id ? await updateAddon(form.id, payload) : await createAddon(payload);
    setSaving(false);
    if (res.error) {
      setError(res.error.message);
      return;
    }
    setOpenForm(false);
    await load();
  }

  async function toggleActive(a: Addon) {
    const { error: err } = await updateAddon(a.id, { is_active: !a.is_active });
    if (!err) {
      setAddons((prev) =>
        prev.map((it) => (it.id === a.id ? { ...it, is_active: !it.is_active } : it))
      );
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Add-ons"
        subtitle="Optional extras customers can add to any booking — never bundled automatically."
        actions={
          <button onClick={openCreate} className="btn-brand">
            <Plus size={14} />
            New add-on
          </button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-5 w-1/2 rounded bg-ink-100" />
              <div className="mt-3 h-3 w-full rounded bg-ink-100" />
              <div className="mt-2 h-3 w-2/3 rounded bg-ink-100" />
            </div>
          ))
        ) : addons.length === 0 ? (
          <div className="col-span-full card p-12 text-center">
            <div className="display-heading text-lg">No add-ons yet</div>
            <div className="mt-1 text-sm text-ink-500">
              Add your first optional extra, like laundry or inside-oven cleaning.
            </div>
            <button onClick={openCreate} className="btn-brand mt-5 mx-auto">
              <Plus size={14} />
              New add-on
            </button>
          </div>
        ) : (
          addons.map((a) => (
            <article key={a.id} className="card p-6 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="display-heading text-lg">{a.name}</h3>
                    {!a.is_active && (
                      <span className="badge bg-ink-100 text-ink-600 ring-ink-200">Inactive</span>
                    )}
                    {a.price === 0 && (
                      <span className="badge bg-amber-50 text-amber-700 ring-amber-200">Needs pricing</span>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-ink-500">
                    {a.duration_minutes > 0 ? formatDuration(a.duration_minutes) + ' · ' : ''}
                    {formatCurrency(a.price)}
                  </div>
                </div>
              </div>
              <p className="text-sm text-ink-600 line-clamp-3 min-h-[3.5rem]">
                {a.description ?? 'No description.'}
              </p>
              <div className="mt-auto flex items-center gap-2">
                <button onClick={() => openEdit(a)} className="btn-outline flex-1">
                  <Pencil size={13} /> Edit
                </button>
                <button
                  onClick={() => toggleActive(a)}
                  className={cn(
                    'btn',
                    a.is_active
                      ? 'border border-ink-200 bg-white text-ink-700 hover:bg-ink-50'
                      : 'bg-mint-500 text-white hover:bg-mint-600'
                  )}
                >
                  {a.is_active ? (
                    <>
                      <PowerOff size={13} /> Deactivate
                    </>
                  ) : (
                    <>
                      <Power size={13} /> Activate
                    </>
                  )}
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      <Modal
        open={openForm}
        onClose={() => setOpenForm(false)}
        title={form.id ? 'Edit add-on' : 'Add a new add-on'}
        description="Active add-ons appear as optional extras in the booking flow."
        footer={
          <>
            <button onClick={() => setOpenForm(false)} className="btn-ghost">
              Cancel
            </button>
            <button onClick={save} disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : form.id ? 'Save changes' : 'Create add-on'}
            </button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Add-on name</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Inside Oven"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Description</label>
            <textarea
              rows={3}
              className="input resize-none"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Full interior clean of the oven cavity, racks, and door glass."
            />
          </div>
          <div>
            <label className="label">Price (USD)</label>
            <input
              type="number"
              min={0}
              step={1}
              className="input"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value || '0') })}
            />
          </div>
          <div>
            <label className="label">Extra duration (minutes)</label>
            <input
              type="number"
              min={0}
              step={5}
              className="input"
              value={form.duration_minutes}
              onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value || '0', 10) })}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="flex items-center gap-3 rounded-xl border border-ink-100 bg-ink-50/50 p-3">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-200"
              />
              <span className="text-sm text-ink-800">
                Active — offered as an optional extra during booking
              </span>
            </label>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {error}
          </div>
        )}
      </Modal>
    </div>
  );
}
