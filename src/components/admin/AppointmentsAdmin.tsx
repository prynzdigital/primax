import { useEffect, useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Filter, Mail, Phone, Search, StickyNote } from 'lucide-react';
import { listAppointments, updateAppointmentStatus } from '../../lib/api';
import type { Appointment, AppointmentStatus, Service } from '../../lib/types';
import { PageHeader } from './PageHeader';
import { StatusBadge } from './StatusBadge';
import { Modal } from './Modal';
import { cn } from '../../lib/cn';
import { formatCurrency } from '../../lib/availability';

const STATUSES: AppointmentStatus[] = ['pending', 'confirmed', 'completed', 'cancelled'];

export function AppointmentsAdmin() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [active, setActive] = useState<Appointment | null>(null);
  const [updating, setUpdating] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await listAppointments();
    setAppointments(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return appointments.filter((a) => {
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      if (search.trim()) {
        const s = search.toLowerCase();
        if (
          !a.full_name.toLowerCase().includes(s) &&
          !a.email.toLowerCase().includes(s) &&
          !a.phone.toLowerCase().includes(s) &&
          !(a.service?.name ?? '').toLowerCase().includes(s)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [appointments, statusFilter, search]);

  async function updateStatus(id: string, status: AppointmentStatus) {
    setUpdating(true);
    const { error } = await updateAppointmentStatus(id, status);
    setUpdating(false);
    if (!error) {
      setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
      setActive((curr) => (curr && curr.id === id ? { ...curr, status } : curr));
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Appointments"
        subtitle="All cleaning appointments — confirm, reschedule, or update status."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone, or service…"
            className="input pl-10"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Filter size={14} className="text-ink-400" />
          <FilterPill active={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>
            All
          </FilterPill>
          {STATUSES.map((s) => (
            <FilterPill key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>
              <span className="capitalize">{s}</span>
            </FilterPill>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="hidden grid-cols-12 gap-3 border-b border-ink-100 bg-ink-50/60 px-6 py-3 text-[11px] uppercase tracking-widest text-ink-500 md:grid">
          <div className="col-span-3">Client</div>
          <div className="col-span-3">Service</div>
          <div className="col-span-3">Date & time</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1 text-right">Action</div>
        </div>
        {loading ? (
          <div className="divide-y divide-ink-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-6 py-4 animate-pulse">
                <div className="h-4 w-1/3 rounded bg-ink-100" />
                <div className="mt-2 h-3 w-1/2 rounded bg-ink-100" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-ink-500">
            No appointments match your filters.
          </div>
        ) : (
          <ul className="divide-y divide-ink-100">
            {filtered.map((a) => (
              <li
                key={a.id}
                className="grid cursor-pointer grid-cols-1 gap-2 px-6 py-4 transition hover:bg-ink-50/60 md:grid-cols-12 md:items-center md:gap-3"
                onClick={() => setActive(a)}
              >
                <div className="md:col-span-3">
                  <div className="font-medium text-ink-900">{a.full_name}</div>
                  <div className="flex items-center gap-3 text-xs text-ink-500">
                    <span className="inline-flex items-center gap-1"><Mail size={11} />{a.email}</span>
                  </div>
                </div>
                <div className="md:col-span-3 text-sm text-ink-800">
                  {a.service?.name ?? '—'}
                </div>
                <div className="md:col-span-3 text-sm text-ink-800">
                  {format(parseISO(a.appointment_date), 'EEE, MMM d')} ·{' '}
                  <span className="text-ink-600">
                    {a.start_time.slice(0, 5)}–{a.end_time.slice(0, 5)}
                  </span>
                </div>
                <div className="md:col-span-2">
                  <StatusBadge status={a.status} />
                </div>
                <div className="md:col-span-1 text-right">
                  <span className="text-xs font-medium text-brand-700 hover:underline">View</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal
        open={!!active}
        onClose={() => setActive(null)}
        title={active?.full_name ?? ''}
        description={active?.service?.name}
        size="lg"
        footer={
          <button onClick={() => setActive(null)} className="btn-ghost">
            Close
          </button>
        }
      >
        {active && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailItem label="Date" value={format(parseISO(active.appointment_date), 'EEEE, MMMM d, yyyy')} />
              <DetailItem label="Time" value={`${active.start_time.slice(0, 5)} – ${active.end_time.slice(0, 5)}`} />
              <DetailItem label="Service" value={active.service?.name ?? '—'} />
              <DetailItem label="Total" value={formatCurrency(active.total_price ?? active.service?.price ?? 0)} />
              <DetailItem label="Home size" value={`${active.bedrooms} bed · ${active.bathrooms} bath`} />
              <DetailItem
                label="Add-ons"
                value={active.addons && active.addons.length > 0 ? active.addons.map((a) => a.name).join(', ') : 'None'}
              />
              <DetailItem label="Created" value={format(parseISO(active.created_at), 'MMM d, yyyy')} />
            </div>

            <div className="rounded-2xl border border-ink-100 bg-ink-50/50 p-4">
              <div className="text-[11px] uppercase tracking-widest text-ink-500">Client</div>
              <div className="mt-2 grid gap-2 text-sm text-ink-800 sm:grid-cols-2">
                <div className="flex items-center gap-2"><Mail size={12} className="text-ink-400" />{active.email}</div>
                <div className="flex items-center gap-2"><Phone size={12} className="text-ink-400" />{active.phone}</div>
              </div>
            </div>

            {active.notes && (
              <div className="rounded-2xl border border-ink-100 bg-white p-4">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-ink-500">
                  <StickyNote size={12} /> Notes
                </div>
                <p className="mt-2 text-sm text-ink-800 whitespace-pre-line">{active.notes}</p>
              </div>
            )}

            <div>
              <div className="text-[11px] uppercase tracking-widest text-ink-500">Status</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    disabled={updating}
                    onClick={() => updateStatus(active.id, s)}
                    className={cn(
                      'rounded-full px-3 py-1.5 text-xs font-medium transition',
                      active.status === s
                        ? 'bg-ink-900 text-white'
                        : 'border border-ink-200 bg-white text-ink-700 hover:border-ink-300 hover:bg-ink-50'
                    )}
                  >
                    <span className="capitalize">{s}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition',
        active
          ? 'bg-ink-900 text-white'
          : 'border border-ink-200 bg-white text-ink-600 hover:border-ink-300 hover:bg-ink-50'
      )}
    >
      {children}
    </button>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-widest text-ink-500">{label}</div>
      <div className="mt-1 text-sm font-medium text-ink-900">{value}</div>
    </div>
  );
}
