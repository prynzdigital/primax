import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  ArrowLeft,
  ArrowRight,
  Bath,
  BedDouble,
  Building2,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  CookingPot,
  Hash,
  Mail,
  MapPin,
  Minus,
  PawPrint,
  Phone,
  Plus,
  Refrigerator,
  Shirt,
  ShoppingBag,
  Sofa,
  Sparkles,
  Trees,
  User,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react';
import type {
  Addon,
  Appointment,
  BlockedDate,
  BusinessHours,
  BusinessSettings,
  Service,
  TimeSlot,
} from '../../lib/types';
import {
  buildMonthGrid,
  formatCurrency,
  generateTimeSlots,
  isDateBookable,
  isSameYMD,
  toDbDate,
  toDbTime,
} from '../../lib/availability';
import {
  FREQUENCY_OPTIONS,
  MIN_BOOKING_PRICE,
  computeCartTotal,
  isEnterpriseJob,
  type CartAddonSelection,
  type CartTotal,
  type Frequency,
  type RoomCounts,
} from '../../lib/pricingRules';
import { createAppointment, createQuoteRequest, listAppointmentsForDate } from '../../lib/api';
import { cn } from '../../lib/cn';

interface BookingProps {
  services: Service[];
  addons: Addon[];
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
  address: string;
  city: string;
  zip_code: string;
  notes: string;
  rooms: RoomCounts;
  addons: CartAddonSelection[];
  frequency: Frequency;
  totalPrice: number;
}

export interface ContactFormState {
  full_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  notes: string;
}

const EMPTY_ROOMS: RoomCounts = {
  bedrooms: 0,
  bathrooms: 0,
  livingRooms: 0,
  kitchens: 0,
  balconies: 0,
};

const ROOM_TYPES: {
  key: keyof RoomCounts;
  label: string;
  icon: LucideIcon;
  modifier: keyof Pick<
    Service,
    'bedroom_modifier' | 'bathroom_modifier' | 'living_room_modifier' | 'kitchen_modifier' | 'balcony_modifier'
  >;
}[] = [
  { key: 'bedrooms', label: 'Bedroom', icon: BedDouble, modifier: 'bedroom_modifier' },
  { key: 'bathrooms', label: 'Bathroom', icon: Bath, modifier: 'bathroom_modifier' },
  { key: 'livingRooms', label: 'Living Room / Den', icon: Sofa, modifier: 'living_room_modifier' },
  { key: 'kitchens', label: 'Kitchen Area', icon: CookingPot, modifier: 'kitchen_modifier' },
  { key: 'balconies', label: 'Balcony / Patio', icon: Trees, modifier: 'balcony_modifier' },
];

const ADDON_ICONS: Record<string, LucideIcon> = {
  'premium-concierge-shopping': ShoppingBag,
  'inside-large-appliance-detail': Refrigerator,
  'inside-kitchen-cabinets-drawers': UtensilsCrossed,
  'eco-pet-hair-extraction': PawPrint,
  'load-of-laundry': Shirt,
};

type Step = 1 | 2 | 3;

export function Booking({
  services,
  addons,
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

  const [form, setForm] = useState<ContactFormState>({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cart state
  const [rooms, setRooms] = useState<RoomCounts>(EMPTY_ROOMS);
  const [addonQty, setAddonQty] = useState<Record<string, number>>({});
  const [zipCode, setZipCode] = useState('');
  const [squareFootage, setSquareFootage] = useState<number | null>(null);
  const [frequency, setFrequency] = useState<Frequency>('one_time');

  // Bespoke-quote (enterprise) state
  const [quoteForm, setQuoteForm] = useState({ full_name: '', email: '', phone: '' });
  const [quoteMode, setQuoteMode] = useState(false);
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);
  const [quoteDone, setQuoteDone] = useState(false);

  const tiers = useMemo(
    () =>
      services.filter(
        (s) => s.is_active && (s.category === 'standard' || s.category === 'deep' || s.category === 'turnover')
      ),
    [services]
  );
  const activeAddons = useMemo(() => addons.filter((a) => a.is_active), [addons]);

  const cartAddons: CartAddonSelection[] = useMemo(
    () =>
      activeAddons
        .map((addon) => ({ addon, quantity: addonQty[addon.id] ?? 0 }))
        .filter((x) => x.quantity > 0),
    [activeAddons, addonQty]
  );

  const cart: CartTotal | null = useMemo(
    () =>
      selectedService
        ? computeCartTotal({ service: selectedService, rooms, addons: cartAddons, zipCode, frequency })
        : null,
    [selectedService, rooms, cartAddons, zipCode, frequency]
  );

  const enterprise = isEnterpriseJob({
    bedrooms: rooms.bedrooms,
    bathrooms: rooms.bathrooms,
    squareFootage,
  });
  const belowMinimum = !!cart && cart.subtotal < MIN_BOOKING_PRICE;

  useEffect(() => {
    if (selectedService) {
      setStep((prev) => (prev < 2 ? prev : prev)); // stay on step 1 while configuring
      setRooms(EMPTY_ROOMS);
      setAddonQty({});
      setQuoteMode(false);
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

  function setRoom(key: keyof RoomCounts, value: number) {
    setRooms((prev) => ({ ...prev, [key]: Math.max(0, value) }));
  }

  function setAddon(id: string, qty: number) {
    setAddonQty((prev) => ({ ...prev, [id]: Math.max(0, qty) }));
  }

  function next() {
    if (step === 1 && selectedService && !belowMinimum && !enterprise) setStep(2);
    else if (step === 2 && selectedDate && selectedSlot) setStep(3);
  }
  function prev() {
    if (step === 3) setStep(2);
    else if (step === 2) setStep(1);
  }

  async function submit() {
    if (!selectedService || !selectedDate || !selectedSlot || !cart) return;
    setError(null);
    if (
      !form.full_name.trim() || !form.email.trim() || !form.phone.trim() ||
      !form.address.trim() || !form.city.trim() || !zipCode.trim()
    ) {
      setError('Please fill in your name, email, phone, and service address.');
      return;
    }

    setSubmitting(true);
    const payload = {
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      zip_code: zipCode.trim(),
      service_id: selectedService.id,
      appointment_date: toDbDate(selectedDate),
      start_time: toDbTime(selectedSlot.start),
      end_time: toDbTime(selectedSlot.end),
      notes: form.notes.trim() || null,
      bedrooms: rooms.bedrooms,
      bathrooms: rooms.bathrooms,
      living_rooms: rooms.livingRooms,
      kitchens: rooms.kitchens,
      balconies: rooms.balconies,
      square_footage: squareFootage,
      frequency,
      addons: cartAddons.map((c) => ({ id: c.addon.id, quantity: c.quantity })),
      total_price: cart.total,
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
      address: payload.address,
      city: payload.city,
      zip_code: payload.zip_code,
      notes: form.notes.trim(),
      rooms,
      addons: cartAddons,
      frequency,
      totalPrice: cart.total,
    });
  }

  async function submitQuote() {
    setError(null);
    if (!quoteForm.full_name.trim() || !quoteForm.email.trim() || !quoteForm.phone.trim() || !zipCode.trim()) {
      setError('Please fill in your name, email, phone, and zip code.');
      return;
    }
    setQuoteSubmitting(true);
    const { error: e } = await createQuoteRequest({
      full_name: quoteForm.full_name.trim(),
      email: quoteForm.email.trim(),
      phone: quoteForm.phone.trim(),
      zip_code: zipCode.trim(),
      square_footage: squareFootage,
      bedrooms: rooms.bedrooms,
      bathrooms: rooms.bathrooms,
      notes: null,
    });
    setQuoteSubmitting(false);
    if (e) {
      setError(e.message || 'Could not submit your request. Please try again.');
      return;
    }
    setQuoteDone(true);
  }

  return (
    <section id="booking" className="relative py-24 lg:py-32 bg-gradient-to-b from-white to-brand-50/30">
      <div className="container-page">
        <div className="mx-auto max-w-3xl text-center">
          <div className="eyebrow mx-auto">Build your clean</div>
          <h2 className="display-heading mt-4 text-4xl sm:text-5xl text-balance">
            Configure your premium Chicago clean.
          </h2>
          <p className="mt-4 text-base text-ink-600">
            Pick a tier, add rooms and upgrades, and watch your price update live. Chicago only.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-5xl">
          <StepIndicator step={step} />

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="card overflow-hidden">
              <div className="p-6 sm:p-8">
                {step === 1 && !quoteMode && (
                  <Step1
                    tiers={tiers}
                    selected={selectedService}
                    onSelect={setSelectedService}
                    rooms={rooms}
                    setRoom={setRoom}
                    addons={activeAddons}
                    addonQty={addonQty}
                    setAddon={setAddon}
                    zipCode={zipCode}
                    setZipCode={setZipCode}
                    squareFootage={squareFootage}
                    setSquareFootage={setSquareFootage}
                    frequency={frequency}
                    setFrequency={setFrequency}
                  />
                )}
                {step === 1 && quoteMode && (
                  <QuoteForm
                    form={quoteForm}
                    setForm={setQuoteForm}
                    done={quoteDone}
                    error={error}
                    rooms={rooms}
                    squareFootage={squareFootage}
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
                {step === 3 && <Step3 form={form} setForm={setForm} error={error} />}
              </div>

              {!(step === 1 && quoteMode && quoteDone) && (
                <div className="flex items-center justify-between gap-3 border-t border-ink-100 bg-ink-50/40 p-5">
                  <button
                    onClick={quoteMode ? () => setQuoteMode(false) : prev}
                    className="btn-ghost"
                    disabled={step === 1 && !quoteMode}
                  >
                    <ArrowLeft size={14} />
                    Back
                  </button>

                  {step === 1 && !quoteMode && enterprise ? (
                    <button onClick={() => setQuoteMode(true)} className="btn-brand">
                      <Sparkles size={14} />
                      Request Bespoke Premium Quote
                    </button>
                  ) : step === 1 && quoteMode ? (
                    <button onClick={submitQuote} disabled={quoteSubmitting} className="btn-brand">
                      {quoteSubmitting ? 'Sending…' : 'Submit request'}
                    </button>
                  ) : step < 3 ? (
                    <button
                      onClick={next}
                      disabled={
                        (step === 1 && (!selectedService || belowMinimum)) ||
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
              )}
            </div>

            <Summary
              service={selectedService}
              cart={cart}
              rooms={rooms}
              addons={cartAddons}
              frequency={frequency}
              zipCode={zipCode}
              date={selectedDate}
              slot={selectedSlot}
              belowMinimum={belowMinimum}
              enterprise={enterprise}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function StepIndicator({ step }: { step: Step }) {
  const items = [
    { n: 1, label: 'Configure' },
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
                done && 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
                !active && !done && 'bg-white text-ink-500 ring-1 ring-ink-200'
              )}
            >
              <span
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold',
                  active && 'bg-white text-ink-900',
                  done && 'bg-emerald-500 text-white',
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
  tiers,
  selected,
  onSelect,
  rooms,
  setRoom,
  addons,
  addonQty,
  setAddon,
  zipCode,
  setZipCode,
  squareFootage,
  setSquareFootage,
  frequency,
  setFrequency,
}: {
  tiers: Service[];
  selected: Service | null;
  onSelect: (s: Service) => void;
  rooms: RoomCounts;
  setRoom: (k: keyof RoomCounts, v: number) => void;
  addons: Addon[];
  addonQty: Record<string, number>;
  setAddon: (id: string, qty: number) => void;
  zipCode: string;
  setZipCode: (v: string) => void;
  squareFootage: number | null;
  setSquareFootage: (v: number | null) => void;
  frequency: Frequency;
  setFrequency: (f: Frequency) => void;
}) {
  return (
    <div className="space-y-8">
      {/* Tier selection */}
      <div>
        <h3 className="display-heading text-2xl">1. Choose your service tier</h3>
        <p className="mt-1 text-sm text-ink-500">The base intensity of your clean.</p>
        <div className="mt-4 grid gap-3">
          {tiers.map((s) => {
            const active = selected?.id === s.id;
            return (
              <button
                key={s.id}
                onClick={() => onSelect(s)}
                className={cn(
                  'group flex items-center gap-4 rounded-2xl border bg-white p-4 text-left transition-all',
                  active
                    ? 'border-emerald-500 ring-2 ring-emerald-100 shadow-soft'
                    : 'border-ink-200 hover:border-ink-300 hover:shadow-soft'
                )}
              >
                <span
                  className={cn(
                    'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border transition',
                    active ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-ink-300'
                  )}
                >
                  {active && <Check size={12} />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-ink-900">{s.name}</div>
                  <div className="mt-0.5 text-xs text-ink-500">{s.description}</div>
                </div>
                <div className="text-right">
                  <div className="font-display text-lg font-semibold text-ink-900">{formatCurrency(s.price)}</div>
                  <div className="text-[10px] uppercase tracking-widest text-ink-400">Base fee</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Room configurator */}
      {selected && (
        <div>
          <h3 className="display-heading text-2xl">2. Configure your rooms</h3>
          <p className="mt-1 text-sm text-ink-500">Per-room pricing scales with your chosen tier.</p>
          <div className="mt-4 grid gap-2">
            {ROOM_TYPES.map(({ key, label, icon: Icon, modifier }) => (
              <div
                key={key}
                className="flex items-center gap-4 rounded-xl border border-ink-100 bg-white p-3"
              >
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                  <Icon size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-ink-900">{label}</div>
                  <div className="text-xs text-ink-500">+{formatCurrency(selected[modifier])} each</div>
                </div>
                <Counter value={rooms[key]} onChange={(v) => setRoom(key, v)} min={0} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Premium add-ons */}
      {selected && addons.length > 0 && (
        <div>
          <h3 className="display-heading text-2xl">3. Premium upgrades</h3>
          <p className="mt-1 text-sm text-ink-500">Optional luxury add-ons.</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {addons.map((a) => {
              const Icon = (a.slug && ADDON_ICONS[a.slug]) || Sparkles;
              const qty = addonQty[a.id] ?? 0;
              const disabled = a.disabled_for_category === selected.category;
              const on = qty > 0;
              return (
                <div
                  key={a.id}
                  className={cn(
                    'flex flex-col gap-2 rounded-xl border p-3 transition',
                    disabled
                      ? 'border-ink-100 bg-ink-50/60 opacity-60'
                      : on
                      ? 'border-emerald-500 bg-emerald-50/40'
                      : 'border-ink-200 bg-white hover:border-ink-300'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg',
                        on ? 'bg-emerald-100 text-emerald-700' : 'bg-brand-50 text-brand-700'
                      )}
                    >
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-ink-900">{a.name}</div>
                      <div className="text-xs text-ink-500">
                        {formatCurrency(a.price)}
                        {a.is_counter ? ' each' : ''}
                        {disabled && ' · included in this tier'}
                      </div>
                    </div>
                  </div>
                  {!disabled &&
                    (a.is_counter ? (
                      <Counter
                        value={qty}
                        onChange={(v) => setAddon(a.id, v)}
                        min={0}
                        max={a.max_quantity ?? undefined}
                      />
                    ) : (
                      <button
                        onClick={() => setAddon(a.id, on ? 0 : 1)}
                        className={cn(
                          'rounded-lg px-3 py-2 text-xs font-medium transition',
                          on
                            ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                            : 'border border-ink-200 bg-white text-ink-700 hover:bg-ink-50'
                        )}
                      >
                        {on ? 'Added ✓' : 'Add'}
                      </button>
                    ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Location + square footage */}
      {selected && (
        <div>
          <h3 className="display-heading text-2xl">4. Location &amp; size</h3>
          <p className="mt-1 text-sm text-ink-500">
            Your Chicago zip determines availability and any luxury/logistics adjustments.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Chicago zip code</label>
              <input
                inputMode="numeric"
                maxLength={5}
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value.replace(/\D/g, ''))}
                placeholder="60614"
                className="input"
              />
            </div>
            <div>
              <label className="label">Square footage (optional)</label>
              <input
                type="number"
                min={0}
                value={squareFootage ?? ''}
                onChange={(e) => setSquareFootage(e.target.value ? parseInt(e.target.value, 10) : null)}
                placeholder="e.g. 1200"
                className="input"
              />
            </div>
          </div>
        </div>
      )}

      {/* Frequency */}
      {selected && (
        <div>
          <h3 className="display-heading text-2xl">5. How often?</h3>
          <p className="mt-1 text-sm text-ink-500">Recurring plans unlock a standing discount.</p>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {FREQUENCY_OPTIONS.map((f) => {
              const active = frequency === f.value;
              return (
                <button
                  key={f.value}
                  onClick={() => setFrequency(f.value)}
                  className={cn(
                    'relative rounded-xl border px-3 py-3 text-center transition',
                    active
                      ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-200'
                      : 'border-ink-200 bg-white hover:border-ink-300'
                  )}
                >
                  {f.badge && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">
                      {f.badge}
                    </span>
                  )}
                  <div className="text-xs font-medium text-ink-900">{f.label}</div>
                  <div className={cn('mt-1 text-[11px] font-semibold', active ? 'text-emerald-700' : 'text-ink-500')}>
                    {f.discountPct > 0 ? `Save ${f.discountPct}%` : 'No discount'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function Counter({
  value,
  onChange,
  min = 0,
  max,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex flex-shrink-0 items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-700 transition hover:bg-ink-50 disabled:opacity-40"
        aria-label="Decrease"
      >
        <Minus size={14} />
      </button>
      <span className="w-6 text-center text-sm font-semibold text-ink-900">{value}</span>
      <button
        type="button"
        onClick={() => onChange(max !== undefined ? Math.min(max, value + 1) : value + 1)}
        disabled={max !== undefined && value >= max}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-700 transition hover:bg-ink-50 disabled:opacity-40"
        aria-label="Increase"
      >
        <Plus size={14} />
      </button>
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
                    bookable && !isSelected && 'text-ink-800 hover:bg-emerald-50 hover:text-emerald-700',
                    isSelected && 'bg-ink-900 text-white shadow-soft'
                  )}
                >
                  {d.getDate()}
                  {isToday && !isSelected && (
                    <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-emerald-500" />
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
                const active = selectedSlot && selectedSlot.start.getTime() === slot.start.getTime();
                return (
                  <button
                    key={slot.start.toISOString()}
                    onClick={() => setSelectedSlot(slot)}
                    className={cn(
                      'rounded-xl px-2 py-2.5 text-sm font-medium transition',
                      active
                        ? 'bg-ink-900 text-white shadow-soft'
                        : 'border border-ink-200 bg-white text-ink-800 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800'
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
  form: ContactFormState;
  setForm: (f: ContactFormState) => void;
  error: string | null;
}) {
  return (
    <div>
      <h3 className="display-heading text-2xl">Your details</h3>
      <p className="mt-1 text-sm text-ink-500">
        Tell us where to go and how to reach you. (Zip collected in step 1.)
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Field icon={User} label="Full name" value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} placeholder="Maya Reyes" />
        <Field icon={Phone} label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="(555) 555-1234" />
        <div className="sm:col-span-2">
          <Field icon={Mail} label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="you@example.com" />
        </div>
        <div className="sm:col-span-2">
          <Field icon={MapPin} label="Service address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} placeholder="123 W Adams St, Apt 4B" />
        </div>
        <Field icon={Building2} label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} placeholder="Chicago" />
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
        <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>
      )}
    </div>
  );
}

function QuoteForm({
  form,
  setForm,
  done,
  error,
  rooms,
  squareFootage,
}: {
  form: { full_name: string; email: string; phone: string };
  setForm: (f: { full_name: string; email: string; phone: string }) => void;
  done: boolean;
  error: string | null;
  rooms: RoomCounts;
  squareFootage: number | null;
}) {
  if (done) {
    return (
      <div className="py-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <Check size={26} />
        </div>
        <h3 className="display-heading mt-5 text-2xl">Request received</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-600">
          Thanks! A Primax specialist will reach out shortly with a bespoke quote tailored to your larger
          property.
        </p>
      </div>
    );
  }
  return (
    <div>
      <div className="rounded-xl border border-brand-200 bg-brand-50/60 p-4 text-sm text-brand-800">
        This property qualifies for our <span className="font-semibold">bespoke premium</span> service
        {' '}({rooms.bedrooms} bed · {rooms.bathrooms} bath{squareFootage ? ` · ${squareFootage} sq ft` : ''}).
        Share your details and we'll build a custom quote.
      </div>
      <h3 className="display-heading mt-6 text-2xl">Request a bespoke quote</h3>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Field icon={User} label="Full name" value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} placeholder="Maya Reyes" />
        <Field icon={Phone} label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="(555) 555-1234" />
        <div className="sm:col-span-2">
          <Field icon={Mail} label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="you@example.com" />
        </div>
      </div>
      {error && (
        <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>
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
  cart,
  rooms,
  addons,
  frequency,
  zipCode,
  date,
  slot,
  belowMinimum,
  enterprise,
}: {
  service: Service | null;
  cart: CartTotal | null;
  rooms: RoomCounts;
  addons: CartAddonSelection[];
  frequency: Frequency;
  zipCode: string;
  date: Date | null;
  slot: TimeSlot | null;
  belowMinimum: boolean;
  enterprise: boolean;
}) {
  const freqLabel = FREQUENCY_OPTIONS.find((f) => f.value === frequency)?.label ?? '';
  const totalRooms = rooms.bedrooms + rooms.bathrooms + rooms.livingRooms + rooms.kitchens + rooms.balconies;

  return (
    <aside className="card sticky top-24 h-fit overflow-hidden">
      <div className="border-b border-ink-100 bg-ink-900 px-5 py-4 text-white">
        <div className="text-[10px] uppercase tracking-widest text-white/60">Your cart</div>
        <div className="font-display text-lg">{service?.name ?? 'Pick a tier to begin'}</div>
      </div>

      <div className="p-5">
        {!service || !cart ? (
          <div className="rounded-xl border border-dashed border-ink-200 p-6 text-center text-sm text-ink-500">
            Select a service tier to start building your quote.
          </div>
        ) : enterprise ? (
          <div className="rounded-xl border border-brand-200 bg-brand-50/60 p-4 text-center text-sm text-brand-800">
            <Sparkles size={18} className="mx-auto mb-2 text-brand-600" />
            This is a large property. Request a bespoke premium quote for accurate pricing.
          </div>
        ) : (
          <>
            <div className="space-y-2 text-sm">
              <LineItem label="Base fee" value={formatCurrency(cart.baseFee)} />
              {cart.roomAdditions > 0 && (
                <LineItem label={`Room additions (${totalRooms})`} value={formatCurrency(cart.roomAdditions)} />
              )}
              {cart.addonsTotal > 0 && (
                <LineItem label="Premium add-ons" value={formatCurrency(cart.addonsTotal)} />
              )}
              {cart.locationFee > 0 && (
                <LineItem
                  label={`Urban Logistics & Parking Fee (${cart.locationMultiplier.toFixed(2)}×)`}
                  value={`+${formatCurrency(cart.locationFee)}`}
                />
              )}
              {cart.discountPct > 0 && (
                <LineItem
                  label={`${freqLabel} discount (${cart.discountPct}%)`}
                  value={`−${formatCurrency(cart.discountAmount)}`}
                  accent
                />
              )}
            </div>

            {addons.length > 0 && (
              <div className="mt-3 border-t border-dashed border-ink-200 pt-3 text-xs text-ink-500">
                {addons.map((c) => (
                  <div key={c.addon.id} className="flex justify-between py-0.5">
                    <span>
                      {c.addon.name}
                      {c.quantity > 1 ? ` ×${c.quantity}` : ''}
                    </span>
                    <span>{formatCurrency(c.addon.price * c.quantity)}</span>
                  </div>
                ))}
              </div>
            )}

            {(date || slot) && (
              <div className="mt-3 border-t border-dashed border-ink-200 pt-3 text-xs text-ink-500">
                {date && <div>{format(date, 'EEE, MMM d, yyyy')}</div>}
                {slot && <div>{slot.label}</div>}
                {zipCode && <div>Zip {zipCode}</div>}
              </div>
            )}

            <div className="mt-4 flex items-center justify-between border-t border-ink-200 pt-4">
              <div className="text-sm text-ink-500">Total{cart.discountPct > 0 ? ' per visit' : ''}</div>
              <div className="font-display text-3xl font-semibold text-ink-900">
                {formatCurrency(cart.total)}
              </div>
            </div>

            {belowMinimum && (
              <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-800">
                Premium Booking Minimum of {formatCurrency(MIN_BOOKING_PRICE)} not met. Add items to unlock
                checkout.
              </div>
            )}

            <div className="mt-3 text-xs text-ink-400">Final pricing confirmed after booking. No payment due now.</div>
          </>
        )}
      </div>
    </aside>
  );
}

function LineItem({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-600">{label}</span>
      <span className={cn('font-medium', accent ? 'text-emerald-600' : 'text-ink-900')}>{value}</span>
    </div>
  );
}
