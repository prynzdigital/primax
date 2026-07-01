import { CheckCircle2, Calendar, Clock, MapPin, Mail, Phone, ArrowLeft, type LucideIcon } from 'lucide-react';
import { format } from 'date-fns';
import type { BusinessSettings } from '../../lib/types';
import type { SuccessData } from './Booking';
import { formatCurrency, formatDuration } from '../../lib/availability';
import { IMG } from '../../lib/images';

interface Props {
  data: SuccessData;
  settings: BusinessSettings | null;
  onBookAnother: () => void;
}

export function SuccessConfirmation({ data, settings, onBookAnother }: Props) {
  return (
    <section className="relative min-h-screen overflow-hidden pt-28 pb-20">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-hero-grid bg-[length:22px_22px] opacity-50" />
        <div className="absolute -top-32 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-mint-200/40 blur-3xl" />
      </div>

      <div className="container-page">
        <div className="mx-auto max-w-3xl">
          <div className="card overflow-hidden animate-slide-up">
            <div className="relative h-44 overflow-hidden">
              <img src={IMG.livingRoom} alt="Bright clean living room" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900/60 to-transparent" />
              <div className="absolute left-6 bottom-6 flex items-center gap-3 text-white">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-mint-500 shadow-lift">
                  <CheckCircle2 size={24} />
                </span>
                <div>
                  <div className="text-xs uppercase tracking-widest opacity-80">Appointment received</div>
                  <div className="font-display text-2xl">Your cleaning is booked.</div>
                </div>
              </div>
            </div>

            <div className="p-8">
              <p className="text-base text-ink-600">
                Thanks, <span className="font-semibold text-ink-900">{data.full_name}</span>! Our team
                received your appointment request. You'll get a confirmation by email shortly. We'll
                reach out if anything needs adjusting.
              </p>

              <div className="mt-8 grid gap-4 rounded-2xl border border-ink-100 bg-ink-50/40 p-6 sm:grid-cols-2">
                <Detail icon={Calendar} label="Date" value={format(data.date, 'EEEE, MMMM d, yyyy')} />
                <Detail
                  icon={Clock}
                  label="Time"
                  value={`${data.slot.label} · ${formatDuration(data.service.duration_minutes + data.addons.reduce((sum, a) => sum + a.duration_minutes, 0))}`}
                />
                <Detail icon={Mail} label="Email" value={data.email} />
                <Detail icon={Phone} label="Phone" value={data.phone} />
                <Detail
                  icon={MapPin}
                  label="Address"
                  value={`${data.address}, ${data.city} ${data.zip_code}`}
                  className="sm:col-span-2"
                />
                <Detail
                  icon={MapPin}
                  label="Service"
                  value={
                    (data.service.category === 'standard' || data.service.category === 'turnover'
                      ? `${data.service.name} (${data.bedrooms} bed · ${data.bathrooms} bath)`
                      : data.service.name) +
                    (data.addons.length > 0 ? ` + ${data.addons.map((a) => a.name).join(', ')}` : '') +
                    ` · ${formatCurrency(data.totalPrice)}`
                  }
                  className="sm:col-span-2"
                />
                {data.notes && (
                  <Detail icon={Mail} label="Notes" value={data.notes} className="sm:col-span-2" />
                )}
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-ink-500">
                  Need to change something? Contact{' '}
                  {settings?.business_phone && (
                    <a href={`tel:${settings.business_phone}`} className="font-medium text-brand-700">
                      {settings.business_phone}
                    </a>
                  )}
                  {settings?.business_email && (
                    <>
                      {settings?.business_phone && ' or '}
                      <a href={`mailto:${settings.business_email}`} className="font-medium text-brand-700">
                        {settings.business_email}
                      </a>
                    </>
                  )}
                  .
                </div>
                <button onClick={onBookAnother} className="btn-outline">
                  <ArrowLeft size={14} />
                  Book another cleaning
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-ink-500">
        <Icon size={12} className="text-brand-600" />
        {label}
      </div>
      <div className="mt-1 text-sm font-medium text-ink-900">{value}</div>
    </div>
  );
}
