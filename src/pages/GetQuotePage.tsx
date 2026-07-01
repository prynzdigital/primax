import { useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Navbar } from '../components/public/Navbar';
import { Footer } from '../components/public/Footer';
import { Booking, type SuccessData } from '../components/public/Booking';
import { SuccessConfirmation } from '../components/public/SuccessConfirmation';
import { usePublicData } from '../lib/usePublicData';
import type { Service } from '../lib/types';

// The 3 curated plans this landing page highlights, in display order —
// matches the "Choose Your Plan" step on primaxgroupllc.com/get-quote.
const PLAN_CATEGORIES: Service['category'][] = ['standard', 'deep', 'turnover'];

export default function GetQuotePage() {
  const { services, addons, businessHours, blockedDates, settings, loading } = usePublicData();

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [success, setSuccess] = useState<SuccessData | null>(null);

  const planServices = useMemo(
    () =>
      PLAN_CATEGORIES.map((cat) => services.find((s) => s.category === cat && s.is_active)).filter(
        (s): s is Service => !!s
      ),
    [services]
  );

  const scrollToQuote = () => {
    const el = document.getElementById('booking');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (success) {
    return (
      <SuccessConfirmation
        data={success}
        settings={settings}
        onBookAnother={() => {
          setSuccess(null);
          setSelectedService(null);
          setTimeout(scrollToQuote, 50);
        }}
      />
    );
  }

  return (
    <div className="relative">
      <Navbar settings={settings} onBookClick={scrollToQuote} />
      <main className="pt-28 pb-20">
        <div className="container-page">
          <div className="mx-auto max-w-3xl text-center">
            <div className="eyebrow mx-auto">
              <Sparkles size={12} className="text-brand-600" />
              Free quote
            </div>
            <h1 className="display-heading mt-5 text-4xl sm:text-5xl text-balance">
              Get Your Free Quote
            </h1>
            <p className="mt-4 text-base text-ink-600">
              Professional cleaning for Chicago &amp; suburbs. Custom pricing — no price lists, no guessing.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50/60 px-4 py-2 text-sm text-brand-800">
              Save $40+ per visit with a recurring plan — most clients start with a Signature Reset,
              then join Essential Living.
            </div>
          </div>
        </div>

        <Booking
          services={loading ? [] : planServices}
          addons={addons}
          selectedService={selectedService}
          setSelectedService={setSelectedService}
          businessHours={businessHours}
          blockedDates={blockedDates}
          settings={settings}
          onSuccess={(data) => {
            setSuccess(data);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      </main>
      <Footer settings={settings} onBookClick={scrollToQuote} />
    </div>
  );
}
