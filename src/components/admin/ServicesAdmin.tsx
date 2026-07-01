import { useEffect, useState } from 'react';
import { CheckCircle2, Pencil, Plus, PowerOff, Power } from 'lucide-react';
import { listServices, createService, updateService } from '../../lib/api';
import type { Service, ServiceCategory } from '../../lib/types';
import { PageHeader } from './PageHeader';
import { Modal } from './Modal';
import { formatCurrency, formatDuration } from '../../lib/availability';
import { cn } from '../../lib/cn';

const CATEGORIES: { value: ServiceCategory; label: string }[] = [
  { value: 'sectional', label: 'Sectional (micro-booking)' },
  { value: 'standard', label: 'Standard Maintenance' },
  { value: 'deep', label: 'Deep Cleaning' },
  { value: 'turnover', label: 'Move-In / Move-Out Turnover' },
];

interface FormState {
  id?: string;
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  is_active: boolean;
  category: ServiceCategory;
  tasks: string;
  base_bedrooms: number;
  base_bathrooms: number;
  bedroom_modifier: number;
  bathroom_modifier: number;
}

const EMPTY: FormState = {
  name: '',
  description: '',
  duration_minutes: 90,
  price: 120,
  is_active: true,
  category: 'standard',
  tasks: '',
  base_bedrooms: 1,
  base_bathrooms: 1,
  bedroom_modifier: 0,
  bathroom_modifier: 0,
};

export function ServicesAdmin() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await listServices();
    setServices(data ?? []);
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

  function openEdit(s: Service) {
    setForm({
      id: s.id,
      name: s.name,
      description: s.description ?? '',
      duration_minutes: s.duration_minutes,
      price: s.price,
      is_active: s.is_active,
      category: s.category,
      tasks: (s.tasks ?? []).join('\n'),
      base_bedrooms: s.base_bedrooms,
      base_bathrooms: s.base_bathrooms,
      bedroom_modifier: s.bedroom_modifier,
      bathroom_modifier: s.bathroom_modifier,
    });
    setError(null);
    setOpenForm(true);
  }

  async function save() {
    setError(null);
    if (!form.name.trim()) {
      setError('Service name is required.');
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      duration_minutes: Number(form.duration_minutes),
      price: Number(form.price),
      is_active: form.is_active,
      category: form.category,
      tasks: form.tasks
        .split('\n')
        .map((t) => t.trim())
        .filter(Boolean),
      base_bedrooms: Number(form.base_bedrooms),
      base_bathrooms: Number(form.base_bathrooms),
      bedroom_modifier: Number(form.bedroom_modifier),
      bathroom_modifier: Number(form.bathroom_modifier),
    };
    const res = form.id ? await updateService(form.id, payload) : await createService(payload);
    setSaving(false);
    if (res.error) {
      setError(res.error.message);
      return;
    }
    setOpenForm(false);
    await load();
  }

  async function toggleActive(s: Service) {
    const { error: err } = await updateService(s.id, { is_active: !s.is_active });
    if (!err) {
      setServices((prev) =>
        prev.map((it) => (it.id === s.id ? { ...it, is_active: !it.is_active } : it))
      );
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Services"
        subtitle="Manage what your cleaning company offers — pricing, duration, and visibility."
        actions={
          <button onClick={openCreate} className="btn-brand">
            <Plus size={14} />
            New service
          </button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-5 w-1/2 rounded bg-ink-100" />
              <div className="mt-3 h-3 w-full rounded bg-ink-100" />
              <div className="mt-2 h-3 w-2/3 rounded bg-ink-100" />
            </div>
          ))
        ) : services.length === 0 ? (
          <div className="col-span-full card p-12 text-center">
            <div className="display-heading text-lg">No services yet</div>
            <div className="mt-1 text-sm text-ink-500">
              Add your first cleaning service to get bookings.
            </div>
            <button onClick={openCreate} className="btn-brand mt-5 mx-auto">
              <Plus size={14} />
              New service
            </button>
          </div>
        ) : (
          services.map((s) => (
            <article key={s.id} className="card p-6 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="display-heading text-lg">{s.name}</h3>
                    {!s.is_active && (
                      <span className="badge bg-ink-100 text-ink-600 ring-ink-200">Inactive</span>
                    )}
                    {s.price === 0 && (
                      <span className="badge bg-amber-50 text-amber-700 ring-amber-200">Needs pricing</span>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-ink-500">
                    {formatDuration(s.duration_minutes)} · {formatCurrency(s.price)}
                  </div>
                </div>
                <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl', s.is_active ? 'bg-mint-50 text-mint-700' : 'bg-ink-100 text-ink-400')}>
                  <CheckCircle2 size={16} />
                </div>
              </div>
              <p className="text-sm text-ink-600 line-clamp-3 min-h-[3.5rem]">
                {s.description ?? 'No description.'}
              </p>
              <div className="mt-auto flex items-center gap-2">
                <button onClick={() => openEdit(s)} className="btn-outline flex-1">
                  <Pencil size={13} /> Edit
                </button>
                <button
                  onClick={() => toggleActive(s)}
                  className={cn(
                    'btn',
                    s.is_active
                      ? 'border border-ink-200 bg-white text-ink-700 hover:bg-ink-50'
                      : 'bg-mint-500 text-white hover:bg-mint-600'
                  )}
                >
                  {s.is_active ? (
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
        title={form.id ? 'Edit service' : 'Add a new service'}
        description="Active services appear automatically in the booking flow."
        size="lg"
        footer={
          <>
            <button onClick={() => setOpenForm(false)} className="btn-ghost">
              Cancel
            </button>
            <button onClick={save} disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : form.id ? 'Save changes' : 'Create service'}
            </button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Service name</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Deep Cleaning Service"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Description</label>
            <textarea
              rows={3}
              className="input resize-none"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="A detailed top-to-bottom cleaning, including baseboards, inside cabinets, and appliance surfaces."
            />
          </div>
          <div>
            <label className="label">Duration (minutes)</label>
            <input
              type="number"
              min={15}
              step={15}
              className="input"
              value={form.duration_minutes}
              onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value || '0', 10) })}
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
          <div className="sm:col-span-2">
            <label className="label">Category</label>
            <select
              className="input"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as ServiceCategory })}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Tasks included (one per line)</label>
            <textarea
              rows={5}
              className="input resize-none"
              value={form.tasks}
              onChange={(e) => setForm({ ...form, tasks: e.target.value })}
              placeholder={'Countertop perimeters/backsplashes\nStovetop exterior\n...'}
            />
          </div>
          <div>
            <label className="label">Base bedrooms included</label>
            <input
              type="number"
              min={0}
              className="input"
              value={form.base_bedrooms}
              onChange={(e) => setForm({ ...form, base_bedrooms: parseInt(e.target.value || '0', 10) })}
            />
          </div>
          <div>
            <label className="label">Base bathrooms included</label>
            <input
              type="number"
              min={0}
              className="input"
              value={form.base_bathrooms}
              onChange={(e) => setForm({ ...form, base_bathrooms: parseInt(e.target.value || '0', 10) })}
            />
          </div>
          <div>
            <label className="label">Price per extra bedroom (USD)</label>
            <input
              type="number"
              min={0}
              className="input"
              value={form.bedroom_modifier}
              onChange={(e) => setForm({ ...form, bedroom_modifier: parseFloat(e.target.value || '0') })}
            />
          </div>
          <div>
            <label className="label">Price per extra bathroom (USD)</label>
            <input
              type="number"
              min={0}
              className="input"
              value={form.bathroom_modifier}
              onChange={(e) => setForm({ ...form, bathroom_modifier: parseFloat(e.target.value || '0') })}
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
                Active — show on public booking page
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
