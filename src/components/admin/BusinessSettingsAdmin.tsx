import { useEffect, useState } from 'react';
import { Building2, Mail, MapPin, Phone, Save, Timer, Hourglass, type LucideIcon } from 'lucide-react';
import { getBusinessSettings, saveBusinessSettings } from '../../lib/api';
import type { BusinessSettings } from '../../lib/types';
import { PageHeader } from './PageHeader';

interface FormState {
  business_name: string;
  business_email: string;
  business_phone: string;
  business_address: string;
  slot_interval_minutes: number;
  booking_notice_hours: number;
}

const EMPTY: FormState = {
  business_name: '',
  business_email: '',
  business_phone: '',
  business_address: '',
  slot_interval_minutes: 30,
  booking_notice_hours: 2,
};

export function BusinessSettingsAdmin() {
  const [existing, setExisting] = useState<BusinessSettings | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await getBusinessSettings();
      if (data) {
        setExisting(data as BusinessSettings);
        setForm({
          business_name: data.business_name ?? '',
          business_email: data.business_email ?? '',
          business_phone: data.business_phone ?? '',
          business_address: data.business_address ?? '',
          slot_interval_minutes: data.slot_interval_minutes ?? 30,
          booking_notice_hours: data.booking_notice_hours ?? 2,
        });
      }
      setLoading(false);
    }
    load();
  }, []);

  async function save() {
    setError(null);
    setSaving(true);
    const payload = {
      business_name: form.business_name,
      business_email: form.business_email,
      business_phone: form.business_phone,
      business_address: form.business_address,
      slot_interval_minutes: Number(form.slot_interval_minutes),
      booking_notice_hours: Number(form.booking_notice_hours),
    };
    const res = await saveBusinessSettings(payload);
    setSaving(false);
    if (res.error) {
      setError(res.error.message);
      return;
    }
    if (res.data) setExisting(res.data);
    setSavedAt(new Date());
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Business Settings"
        subtitle="The company info, contact, and booking rules that power the public site."
        actions={
          <button onClick={save} disabled={saving} className="btn-primary">
            <Save size={14} />
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="card p-6 sm:p-8 space-y-6">
          <Section title="Company information">
            <Field
              icon={Building2}
              label="Company Name"
              value={form.business_name}
              onChange={(v) => setForm({ ...form, business_name: v })}
              placeholder="Lumen & Bloom Cleaning Co."
              disabled={loading}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                icon={Mail}
                label="Company Email"
                type="email"
                value={form.business_email}
                onChange={(v) => setForm({ ...form, business_email: v })}
                placeholder="hello@cleaningco.com"
                disabled={loading}
              />
              <Field
                icon={Phone}
                label="Company Phone"
                value={form.business_phone}
                onChange={(v) => setForm({ ...form, business_phone: v })}
                placeholder="(555) 555-1234"
                disabled={loading}
              />
            </div>
            <Field
              icon={MapPin}
              label="Company Address"
              value={form.business_address}
              onChange={(v) => setForm({ ...form, business_address: v })}
              placeholder="245 Maple Ave, Brooklyn, NY"
              disabled={loading}
            />
          </Section>

          <Section title="Booking rules">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                icon={Timer}
                label="Slot Interval (minutes)"
                type="number"
                value={String(form.slot_interval_minutes)}
                onChange={(v) =>
                  setForm({ ...form, slot_interval_minutes: parseInt(v || '0', 10) })
                }
                hint="How frequently new time slots appear (e.g. every 30 min)."
                disabled={loading}
              />
              <Field
                icon={Hourglass}
                label="Booking Notice (hours)"
                type="number"
                value={String(form.booking_notice_hours)}
                onChange={(v) =>
                  setForm({ ...form, booking_notice_hours: parseInt(v || '0', 10) })
                }
                hint="Minimum lead time before a new appointment can start."
                disabled={loading}
              />
            </div>
          </Section>

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

        <aside className="card overflow-hidden">
          <div className="border-b border-ink-100 px-6 py-4">
            <div className="display-heading text-lg">Public preview</div>
            <div className="text-xs text-ink-500">How your details appear to clients.</div>
          </div>
          <div className="space-y-5 p-6">
            <PreviewRow icon={Building2} label="Name" value={form.business_name || '—'} />
            <PreviewRow icon={Mail} label="Email" value={form.business_email || '—'} />
            <PreviewRow icon={Phone} label="Phone" value={form.business_phone || '—'} />
            <PreviewRow icon={MapPin} label="Address" value={form.business_address || '—'} />
            <div className="border-t border-dashed border-ink-200 pt-5 grid gap-2 text-sm">
              <div className="flex items-center justify-between"><span className="text-ink-500">Slot interval</span><span className="font-medium text-ink-900">{form.slot_interval_minutes} min</span></div>
              <div className="flex items-center justify-between"><span className="text-ink-500">Booking notice</span><span className="font-medium text-ink-900">{form.booking_notice_hours} hr</span></div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="text-[11px] uppercase tracking-widest text-ink-500">{title}</div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  hint,
  disabled,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  hint?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        <Icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="input pl-10"
        />
      </div>
      {hint && <div className="mt-1.5 text-xs text-ink-500">{hint}</div>}
    </div>
  );
}

function PreviewRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
        <Icon size={14} />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-widest text-ink-500">{label}</div>
        <div className="truncate text-sm font-medium text-ink-900">{value}</div>
      </div>
    </div>
  );
}
