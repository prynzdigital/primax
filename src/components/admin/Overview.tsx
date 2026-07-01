import { useEffect, useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import {
  Calendar,
  CheckCircle2,
  CircleDashed,
  Sparkles,
  TrendingUp,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { listAppointments, listServices } from '../../lib/api';
import type { Appointment, Service } from '../../lib/types';
import { PageHeader } from './PageHeader';
import { StatusBadge } from './StatusBadge';
import { formatCurrency } from '../../lib/availability';

export function Overview() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const [apptRes, svcRes] = await Promise.all([listAppointments(), listServices()]);
      if (cancelled) return;
      setAppointments(apptRes.data ?? []);
      setServices(svcRes.data ?? []);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcoming = appointments.filter((a) => {
      const d = parseISO(a.appointment_date);
      return d >= today && a.status !== 'cancelled' && a.status !== 'completed';
    });
    const pending = appointments.filter((a) => a.status === 'pending');
    const completed = appointments.filter((a) => a.status === 'completed');
    const revenue = completed.reduce((acc, a) => acc + (a.service?.price ?? 0), 0);
    const activeServices = services.filter((s) => s.is_active).length;
    return { upcoming, pending, completed, revenue, activeServices };
  }, [appointments, services]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Overview"
        subtitle="A snapshot of your cleaning company today."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          icon={Calendar}
          label="Upcoming appointments"
          value={stats.upcoming.length}
          accent="brand"
          hint="Active bookings ahead"
        />
        <Metric
          icon={CircleDashed}
          label="Pending review"
          value={stats.pending.length}
          accent="amber"
          hint="Awaiting confirmation"
        />
        <Metric
          icon={CheckCircle2}
          label="Completed cleanings"
          value={stats.completed.length}
          accent="mint"
          hint="All-time delivered"
        />
        <Metric
          icon={Sparkles}
          label="Active services"
          value={stats.activeServices}
          accent="ink"
          hint={`${services.length} total`}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="card">
          <div className="flex items-center justify-between border-b border-ink-100 px-6 py-4">
            <div>
              <div className="display-heading text-lg">Upcoming cleanings</div>
              <div className="text-xs text-ink-500">The next bookings on your calendar.</div>
            </div>
            <Users size={16} className="text-ink-400" />
          </div>
          <div className="divide-y divide-ink-100">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-5 animate-pulse">
                  <div className="h-4 w-1/3 rounded bg-ink-100" />
                  <div className="mt-2 h-3 w-1/2 rounded bg-ink-100" />
                </div>
              ))
            ) : stats.upcoming.length === 0 ? (
              <EmptyRow text="No upcoming cleanings on the books." />
            ) : (
              stats.upcoming.slice(0, 6).map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-4 px-6 py-4">
                  <div>
                    <div className="font-medium text-ink-900">{a.full_name}</div>
                    <div className="mt-0.5 text-xs text-ink-500">
                      {a.service?.name ?? 'Service'} ·{' '}
                      {format(parseISO(a.appointment_date), 'EEE, MMM d')} ·{' '}
                      {a.start_time.slice(0, 5)}
                    </div>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-ink-100 px-6 py-4">
            <div className="display-heading text-lg">Revenue</div>
            <TrendingUp size={16} className="text-mint-600" />
          </div>
          <div className="p-6">
            <div className="text-xs uppercase tracking-widest text-ink-400">Completed cleanings</div>
            <div className="mt-2 font-display text-4xl font-semibold text-ink-900">
              {formatCurrency(stats.revenue)}
            </div>
            <div className="mt-1 text-xs text-ink-500">
              Based on the price of completed services.
            </div>

            <div className="mt-8 space-y-3">
              <SmallRow label="Total bookings" value={appointments.length.toString()} />
              <SmallRow label="Active services" value={stats.activeServices.toString()} />
              <SmallRow label="Conversion" value={
                appointments.length === 0
                  ? '—'
                  : `${Math.round((stats.completed.length / appointments.length) * 100)}%`
              } />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  hint?: string;
  accent: 'brand' | 'amber' | 'mint' | 'ink';
}) {
  const map = {
    brand: 'bg-brand-50 text-brand-700',
    amber: 'bg-amber-50 text-amber-700',
    mint: 'bg-mint-50 text-mint-700',
    ink: 'bg-ink-100 text-ink-700',
  } as const;
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${map[accent]}`}>
          <Icon size={18} />
        </div>
        {hint && <div className="text-[10px] uppercase tracking-widest text-ink-400">{hint}</div>}
      </div>
      <div className="mt-5 font-display text-3xl font-semibold text-ink-900">{value}</div>
      <div className="mt-1 text-sm text-ink-500">{label}</div>
    </div>
  );
}

function SmallRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="text-ink-500">{label}</div>
      <div className="font-medium text-ink-900">{value}</div>
    </div>
  );
}

function EmptyRow({ text }: { text: string }) {
  return (
    <div className="px-6 py-12 text-center text-sm text-ink-500">
      {text}
    </div>
  );
}
