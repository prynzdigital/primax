import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Mail,
  Minus,
  Phone,
  Plus,
  Sparkles,
  User,
  type LucideIcon,
} from 'lucide-react';
import type {
  Appointment,
  BlockedDate,
  BusinessHours,
  BusinessSettings,
  Service,
  TimeSlot,
} from '../../lib/types';
import {
  buildMonthGrid,
  computeTotalPrice,
  formatCurrency,
  formatDuration,
  generateTimeSlots,
  isDateBookable,
  isSameYMD,
  toDbDate,
  toDbTime,
} from '../../lib/availability';
import { createAppointment, listAppointmentsForDate } from '../../lib/api';
import { cn } from '../../lib/cn';
import { getServiceImage } from '../../lib/images';

interface BookingProps {
  services: Service[];
  selectedService: Service | null;
  setSelectedService: (s: Service | null) => void;
  businessHours: BusinessHours[];
  blockedDates: BlockedDate[];
  settings: BusinessSettings | null;
  onSuccess: (data: SuccessData) => void;
}

export interface SuccessData {
  service: Service;
  date: Date;
  slot: TimeSlot;
  full_name: string;
  email: string;
  phone: string;
  notes: string;
  bedrooms: number;
  bathrooms: number;
  addon: Service | null;
  totalPrice: number;
}

type Step = 1 | 2 | 3;

export function Booking({
  services,
  selectedService,
  setSelectedService,
  businessHours,
  blockedDates,
  settings,
  onSuccess,
}: BookingProps) {
  const [step, setStep] = useState<Step>(1);
  const [monthAnchor, setMonthAnchor] = useState<Date>(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [appointmentsForDate, setAppointmentsForDate] = useState<Appointment[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [form, setForm] = useState({ full_name: '', email: '', phone: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [bedrooms, setBedrooms] = useState(1);
  const [bathrooms, setBathrooms] = useState(1);
  const [addonSelected, setAddonSelected] = useState(false);

  const activeServices = useMemo(
    () => services.filter((s) => s.is_active && !s.is_addon),
    [services]
  );
  const addonService = useMemo(
    () => services.find((s) => s.is_addon && s.is_active) ?? null,
    [services]
  );
  const scalesWithRooms =
    selectedService?.category === 'standard' || selectedService?.category === 'turnover';
  const showAddonOption = selectedService?.category === 'standard' && !!addonService;
  const selectedAddon = showAddonOption && addonSelected ? addonService : null;
  const totalPrice = selectedService
    ? computeTotalPrice({ service: selectedService, bedrooms, bathrooms, addon: selectedAddon })
    : 0;

  useEffect(() => {
    if (selectedService) {
      setStep((prev) => (prev < 2 ? 2 : prev));
      setBedrooms(selectedService.base_bedrooms);
      setBathrooms(selectedService.base_bathrooms);
      if (selectedService.category !== 'standard') setAddonSelected(false);
    }
  }, [selectedService]);

  useEffect(() => {
    setSelectedSlot(null);
  }, [selectedDate]);

  // Fetch appointments to compute availability for the chosen date
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!selectedDate) {
        setAppointmentsForDate([]);
        return;
      }
      setLoadingSlots(true);
      const dateStr = toDbDate(selectedDate);
      const { data, error: e } = await listAppointmentsForDate(dateStr);
      if (!cancelled) {
        if (e) {
          // If the availability check fails, slots fall back to working hours only.
          setAppointmentsForDate([]);
        } else {
          setAppointmentsForDate(data ?? []);
        }
        setLoadingSlots(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [selectedDate]);

  const slots = useMemo(() => {
    if (!selectedDate || !selectedService) return [];
    return generateTimeSlots({
      date: selectedDate,
      service: selectedService,
      hours: businessHours,
      blocked: blockedDates,
      appointments: appointmentsForDate,
      settings,
    });
  }, [selectedDate, selectedService, businessHours, blockedDates, appointmentsForDate, settings]);

  function next() {
    if (step === 1 && selectedService) setStep(2);
    else if (step === 2 && selectedDate && selectedSlot) setStep(3);
  }
  function prev() {
    if (step === 3) setStep(2);
    else if (step === 2) setStep(1);
  }

  async function submit() {
    if (!selectedService || !selectedDate || !selectedSlot) return;
    setError(null);
    if (!form.full_name.trim() || !form.email.trim() || !form.phone.trim()) {
      setError('Please fill in your name, email, and phone.');
      return;
    }

    setSubmitting(true);
    const payload = {
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      service_id: selectedService.id,
      appointment_date: toDbDate(selectedDate),
      start_time: toDbTime(selectedSlot.start),
      end_time: toDbTime(selectedSlot.end),
      notes: form.notes.trim() || null,
      bedrooms,
      bathrooms,
      addon_service_id: selectedAddon?.id ?? null,
      total_price: totalPrice,
    };

    const { error: insertErr } = await createAppointment(payload);
    setSubmitting(false);

    if (insertErr) {
      setError(insertErr.message || 'Something went wrong. Please try again.');
      return;
    }

    onSuccess({
      service: selectedService,
      date: selectedDate,
      slot: selectedSlot,
      full_name: payload.full_name,
      email: payload.email,
      phone: payload.phone,
      notes: form.notes.trim(),
      bedrooms,
      bathrooms,
      addon: selectedAddon,
      totalPrice,
    });
  }

  return (
    <section id="booking" className="relative py-24 lg:py-32 bg-gradient-to-b from-white to-brand-50/30">
      <div className="container-page">
        <div className="mx-auto max-w-3xl text-center">
          <div className="eyebrow mx-auto">Reserve your cleaning</div>
          <h2 className="display-heading mt-4 text-4xl sm:text-5xl text-balance">
            Book a fresh home in three simple steps.
          </h2>
          <p className="mt-4 text-base text-ink-600">
            Choose your cleaning service, pick a time that works, and we'll handle the rest.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-5xl">
          <StepIndicator step={step} />

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="card overflow-hidden">
              <div className="p-6 sm:p-8">
                {step === 1 && (
                  <Step1
                    services={activeServices}
                    selected={selectedService}
                    onSelect={setSelectedService}
                    scalesWithRooms={scalesWithRooms}
                    bedrooms={bedrooms}
                    setBedrooms={setBedrooms}
                    bathrooms={bathrooms}
                    setBathrooms={setBathrooms}
                    showAddonOption={showAddonOption}
                    addonService={addonService}
                    addonSelected={addonSelected}
                    setAddonSelected={setAddonSelected}
                  />
                )}
                {step === 2 && (
                  <Step2
                    monthAnchor={monthAnchor}
                    setMonthAnchor={setMonthAnchor}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    selectedSlot={selectedSlot}
                    setSelectedSlot={setSelectedSlot}
                    hours={businessHours}
                    blocked={blockedDates}
                    slots={slots}
                    loadingSlots={loadingSlots}
                  />
                )}
                {step === 3 && (
                  <Step3 form={form} setForm={setForm} error={error} />
                )}
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-ink-100 bg-ink-50/40 p-5">
                <button
                  onClick={prev}
                  className="btn-ghost"
                  disabled={step === 1}
                >
                  <ArrowLeft size={14} />
                  Back
                </button>
                {step < 3 ? (
                  <button
                    onClick={next}
                    disabled={
                      (step === 1 && !selectedService) ||
                      (step === 2 && (!selectedDate || !selectedSlot))
                    }
                    className="btn-brand"
                  >
                    Continue
                    <ArrowRight size={14} />
                  </button>
                ) : (
                  <button onClick={submit} disabled={submitting} className="btn-brand">
                    {submitting ? 'Booking…' : 'Confirm booking'}
                    {!submitting && <Check size={14} />}
                  </button>
                )}
              </div>
            </div>

            <Summary
              service={selectedService}
              date={selectedDate}
              slot={selectedSlot}
              form={form}
              step={step}
              bedrooms={bedrooms}
              bathrooms={bathrooms}
              scalesWithRooms={scalesWithRooms}
              addon={selectedAddon}
              totalPrice={totalPrice}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function StepIndicator({ step }: { step: Step }) {
  const items = [
    { n: 1, label: 'Service' },
    { n: 2, label: 'Date & time' },
    { n: 3, label: 'Your details' },
  ];
  return (
    <ol className="flex items-center justify-center gap-2 sm:gap-4">
      {items.map((it, idx) => {
        const active = step === it.n;
        const done = step > it.n;
        return (
          <li key={it.n} className="flex items-center gap-2 sm:gap-4">
            <div
              className={cn(
                'flex items-center gap-2 rounded-full px-3 py-1.5 text-xs sm:text-sm transition',
                active && 'bg-ink-900 text-white shadow-soft',
                done && 'bg-mint-50 text-mint-700 ring-1 ring-mint-200',
                !active && !done && 'bg-white text-ink-500 ring-1 ring-ink-200'
              )}
            >
              <span
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold',
                  active && 'bg-white text-ink-900',
                  done && 'bg-mint-500 text-white',
                  !active && !done && 'bg-ink-100 text-ink-500'
                )}
              >
                {done ? <Check size={12} /> : it.n}
              </span>
              <span className="font-medium">{it.label}</span>
            </div>
            {idx < items.length - 1 && <div className="h-px w-6 bg-ink-200 sm:w-12" />}
          </li>
        );
      })}
    </ol>
  );
}

function Step1({
  services,
  selected,
  onSelect,
  scalesWithRooms,
  bedrooms,
  setBedrooms,
  bathrooms,
  setBathrooms,
  showAddonOption,
  addonService,
  addonSelected,
  setAddonSelected,
}: {
  services: Service[];
  selected: Service | null;
  onSelect: (s: Service) => void;
  scalesWithRooms: boolean;
  bedrooms: number;
  setBedrooms: (n: number) => void;
  bathrooms: number;
  setBathrooms: (n: number) => void;
  showAddonOption: boolean;
  addonService: Service | null;
  addonSelected: boolean;
  setAddonSelected: (v: boolean) => void;
}) {
  return (
    <div>
      <h3 className="display-heading text-2xl">Choose your cleaning service</h3>
      <p className="mt-1 text-sm text-ink-500">Pick the service that best matches your home.</p>

      {services.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-ink-200 p-8 text-center text-sm text-ink-500">
          No active services right now. Please check back soon.
        </div>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {services.map((s) => {
            const active = selected?.id === s.id;
            return (
              <button
                key={s.id}
                onClick={() => onSelect(s)}
                className={cn(
                  'group relative flex gap-4 rounded-2xl border bg-white p-4 text-left transition-all',
                  active
                    ? 'border-brand-500 ring-2 ring-brand-100 shadow-soft'
                    : 'border-ink-200 hover:border-ink-300 hover:shadow-soft'
                )}
              >
                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-ink-100">
                  <img
                    src={getServiceImage(s.name)}
                    alt={s.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate font-semibold text-ink-900">{s.name}</div>
                    {active && (
                      <span className="inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-600 text-white">
                        <Check size={12} />
                      </span>
                    )}
                  </div>
                  <div className="mt-1 line-clamp-2 text-xs text-ink-500">
                    {s.description ?? 'A premium cleaning service.'}
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-xs text-ink-600">
                    <span className="inline-flex items-center gap-1">
                      <Clock size={12} className="text-brand-600" />
                      {formatDuration(s.duration_minutes)}
                    </span>
                    <span className="text-ink-300">·</span>
                    <span className="font-semibold text-ink-900">{formatCurrency(s.price)}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {selected && scalesWithRooms && (
        <div className="mt-6 rounded-2xl border border-ink-100 bg-ink-50/50 p-5">
          <div className="text-sm font-medium text-ink-900">Home size</div>
          <p className="mt-1 text-xs text-ink-500">
            Price adjusts automatically for bedrooms and bathrooms beyond the base.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <RoomStepper
              label="Bedrooms"
              value={bedrooms}
              min={selected.base_bedrooms}
              onChange={setBedrooms}
            />
            <RoomStepper
              label="Bathrooms"
              value={bathrooms}
              min={selected.base_bathrooms}
              onChange={setBathrooms}
            />
          </div>
        </div>
      )}

      {selected && showAddonOption && addonService && (
        <label
          className={cn(
            'mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition',
            addonSelected ? 'border-brand-500 bg-brand-50/50' : 'border-ink-200 bg-white hover:border-ink-300'
          )}
        >
          <input
            type="checkbox"
            checked={addonSelected}
            onChange={(e) => setAddonSelected(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-200"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-brand-600" />
              <span className="text-sm font-semibold text-ink-900">
                Add {addonService.name.replace(' (Add-On to Standard)', '')}
              </span>
              <span className="ml-auto text-sm font-semibold text-ink-900">
                +{formatCurrency(addonService.price)}
              </span>
            </div>
            <p className="mt-1 text-xs text-ink-500">
              {addonService.description ?? 'A deeper, top-to-bottom clean on top of the standard visit.'}
            </p>
          </div>
        </label>
      )}
    </div>
  );
}

function RoomStepper({
  label,
  value,
  min,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-widest text-ink-500">{label}</div>
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-700 transition hover:bg-ink-50 disabled:opacity-40"
          aria-label={`Decrease ${label.toLowerCase()}`}
        >
          <Minus size={14} />
        </button>
        <span className="w-6 text-center text-sm font-semibold text-ink-900">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-700 transition hover:bg-ink-50"
          aria-label={`Increase ${label.toLowerCase()}`}
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

function Step2({
  monthAnchor,
  setMonthAnchor,
  selectedDate,
  setSelectedDate,
  selectedSlot,
  setSelectedSlot,
  hours,
  blocked,
  slots,
  loadingSlots,
}: {
  monthAnchor: Date;
  setMonthAnchor: (d: Date) => void;
  selectedDate: Date | null;
  setSelectedDate: (d: Date | null) => void;
  selectedSlot: TimeSlot | null;
  setSelectedSlot: (s: TimeSlot | null) => void;
  hours: BusinessHours[];
  blocked: BlockedDate[];
  slots: TimeSlot[];
  loadingSlots: boolean;
}) {
  const grid = useMemo(() => buildMonthGrid(monthAnchor), [monthAnchor]);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div>
      <h3 className="display-heading text-2xl">Pick a date and time</h3>
      <p className="mt-1 text-sm text-ink-500">
        Only available dates and time slots are shown. Times reflect your local timezone.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl border border-ink-100 bg-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays size={16} className="text-brand-600" />
              <div className="font-medium text-ink-900">{format(monthAnchor, 'MMMM yyyy')}</div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  const d = new Date(monthAnchor);
                  d.setMonth(d.getMonth() - 1);
                  setMonthAnchor(d);
                }}
                className="rounded-full p-2 text-ink-500 hover:bg-ink-100 hover:text-ink-800"
                aria-label="Previous month"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => {
                  const d = new Date(monthAnchor);
                  d.setMonth(d.getMonth() + 1);
                  setMonthAnchor(d);
                }}
                className="rounded-full p-2 text-ink-500 hover:bg-ink-100 hover:text-ink-800"
                aria-label="Next month"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[11px] uppercase tracking-widest text-ink-400">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div key={i} className="py-1">{d}</div>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {grid.map((d, i) => {
              const inMonth = d.getMonth() === monthAnchor.getMonth();
              const past = d < today;
              const bookable = !past && inMonth && isDateBookable({ date: d, hours, blocked });
              const isSelected = selectedDate && isSameYMD(d, selectedDate);
              const isToday = isSameYMD(d, new Date());

              return (
                <button
                  key={i}
                  disabled={!bookable}
                  onClick={() => setSelectedDate(d)}
                  className={cn(
                    'relative aspect-square rounded-xl text-sm font-medium transition-all',
                    !inMonth && 'text-ink-300',
                    inMonth && !bookable && 'text-ink-300 cursor-not-allowed line-through',
                    bookable && !isSelected && 'text-ink-800 hover:bg-brand-50 hover:text-brand-700',
                    isSelected && 'bg-ink-900 text-white shadow-soft'
                  )}
                >
                  {d.getDate()}
                  {isToday && !isSelected && (
                    <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-brand-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-ink-100 bg-white p-5">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-brand-600" />
            <div className="font-medium text-ink-900">
              {selectedDate ? format(selectedDate, 'EEE, MMM d') : 'Available times'}
            </div>
          </div>

          {!selectedDate ? (
            <div className="mt-6 rounded-xl border border-dashed border-ink-200 p-8 text-center text-sm text-ink-500">
              Choose a date to see available cleaning times.
            </div>
          ) : loadingSlots ? (
            <div className="mt-6 grid grid-cols-3 gap-2">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="h-10 animate-pulse rounded-xl bg-ink-100" />
              ))}
            </div>
          ) : slots.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-ink-200 p-8 text-center text-sm text-ink-500">
              No availability on this date. Please pick another day.
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-3 gap-2 max-h-[280px] overflow-y-auto pr-1">
              {slots.map((slot) => {
                const active =
                  selectedSlot && selectedSlot.start.getTime() === slot.start.getTime();
                return (
                  <button
                    key={slot.start.toISOString()}
                    onClick={() => setSelectedSlot(slot)}
                    className={cn(
                      'rounded-xl px-2 py-2.5 text-sm font-medium transition',
                      active
                        ? 'bg-ink-900 text-white shadow-soft'
                        : 'border border-ink-200 bg-white text-ink-800 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800'
                    )}
                  >
                    {slot.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Step3({
  form,
  setForm,
  error,
}: {
  form: { full_name: string; email: string; phone: string; notes: string };
  setForm: (f: { full_name: string; email: string; phone: string; notes: string }) => void;
  error: string | null;
}) {
  return (
    <div>
      <h3 className="display-heading text-2xl">Your details</h3>
      <p className="mt-1 text-sm text-ink-500">
        Tell us a little about your home so the cleaning team is prepared.
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Field
          icon={User}
          label="Full name"
          value={form.full_name}
          onChange={(v) => setForm({ ...form, full_name: v })}
          placeholder="Maya Reyes"
        />
        <Field
          icon={Phone}
          label="Phone"
          value={form.phone}
          onChange={(v) => setForm({ ...form, phone: v })}
          placeholder="(555) 555-1234"
        />
        <div className="sm:col-span-2">
          <Field
            icon={Mail}
            label="Email"
            type="email"
            value={form.email}
            onChange={(v) => setForm({ ...form, email: v })}
            placeholder="you@example.com"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Notes for your cleaning team (optional)</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Pets, entry instructions, areas to focus on…"
            rows={4}
            className="input resize-none"
          />
        </div>
      </div>

      {error && (
        <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      )}
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
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
          className="input pl-10"
        />
      </div>
    </div>
  );
}

function Summary({
  service,
  date,
  slot,
  form,
  step,
  bedrooms,
  bathrooms,
  scalesWithRooms,
  addon,
  totalPrice,
}: {
  service: Service | null;
  date: Date | null;
  slot: TimeSlot | null;
  form: { full_name: string; email: string; phone: string; notes: string };
  step: Step;
  bedrooms: number;
  bathrooms: number;
  scalesWithRooms: boolean;
  addon: Service | null;
  totalPrice: number;
}) {
  return (
    <aside className="card sticky top-24 h-fit overflow-hidden">
      <div className="relative h-32 overflow-hidden">
        <img
          src={service ? getServiceImage(service.name) : 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=600&q=80'}
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/70 to-transparent" />
        <div className="absolute bottom-3 left-4 text-white">
          <div className="text-[10px] uppercase tracking-widest opacity-80">Your cleaning</div>
          <div className="font-display text-lg">{service?.name ?? 'Pick a service'}</div>
        </div>
      </div>

      <div className="p-5">
        {service && scalesWithRooms && (
          <Row label="Home size">{bedrooms} bed · {bathrooms} bath</Row>
        )}
        {addon && <Row label="Add-on">{addon.name.replace(' (Add-On to Standard)', '')}</Row>}
        <Row label="Date">
          {date ? format(date, 'EEE, MMM d, yyyy') : <Placeholder>Select a date</Placeholder>}
        </Row>
        <Row label="Time">
          {slot ? slot.label : <Placeholder>Select a time</Placeholder>}
        </Row>
        <Row label="Duration">
          {service ? formatDuration(service.duration_minutes + (addon?.duration_minutes ?? 0)) : <Placeholder>—</Placeholder>}
        </Row>
        {step === 3 && (
          <>
            <Row label="Name">
              {form.full_name || <Placeholder>—</Placeholder>}
            </Row>
            <Row label="Email">
              {form.email || <Placeholder>—</Placeholder>}
            </Row>
          </>
        )}
        <div className="mt-4 border-t border-dashed border-ink-200 pt-4">
          <div className="flex items-center justify-between text-sm">
            <div className="text-ink-500">Estimated total</div>
            <div className="font-display text-2xl font-semibold text-ink-900">
              {service ? formatCurrency(totalPrice) : '—'}
            </div>
          </div>
          <div className="mt-1 text-xs text-ink-500">
            Final pricing confirmed after booking. No payment due now.
          </div>
        </div>
      </div>
    </aside>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <div className="text-xs uppercase tracking-widest text-ink-400">{label}</div>
      <div className="text-right text-sm text-ink-800">{children}</div>
    </div>
  );
}

function Placeholder({ children }: { children: React.ReactNode }) {
  return <span className="text-ink-300">{children}</span>;
}
