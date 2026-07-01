import { useEffect, useRef, useState } from 'react';
import { Navbar } from '../components/public/Navbar';
import { Hero } from '../components/public/Hero';
import { Services } from '../components/public/Services';
import { About } from '../components/public/About';
import { Booking, type SuccessData } from '../components/public/Booking';
import { Footer } from '../components/public/Footer';
import { SuccessConfirmation } from '../components/public/SuccessConfirmation';
import { listServices, listBusinessHours, listBlockedDates, getBusinessSettings } from '../lib/api';
import {
  demoBlockedDates,
  demoBusinessHours,
  demoServices,
  demoSettings,
} from '../lib/demoData';
import type {
  BlockedDate,
  BusinessHours,
  BusinessSettings,
  Service,
} from '../lib/types';

export default function PublicSite() {
  const [services, setServices] = useState<Service[]>([]);
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [success, setSuccess] = useState<SuccessData | null>(null);

  const bookingRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const [svc, hrs, blk, set] = await Promise.all([
        listServices(),
        listBusinessHours(),
        listBlockedDates(),
        getBusinessSettings(),
      ]);
      if (cancelled) return;

      // Backend not reachable/configured yet — fall back to demo data so the
      // site never renders blank during setup.
      if (svc.error && hrs.error && blk.error && set.error) {
        setServices(demoServices);
        setBusinessHours(demoBusinessHours);
        setBlockedDates(demoBlockedDates);
        setSettings(demoSettings);
        setLoading(false);
        return;
      }

      setServices(svc.data ?? []);
      setBusinessHours(hrs.data ?? []);
      setBlockedDates(blk.data ?? []);
      setSettings(set.data ?? null);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const scrollToBooking = () => {
    const el = document.getElementById('booking');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const businessName = settings?.business_name;

  if (success) {
    return (
      <SuccessConfirmation
        data={success}
        settings={settings}
        onBookAnother={() => {
          setSuccess(null);
          setSelectedService(null);
          setTimeout(scrollToBooking, 50);
        }}
      />
    );
  }

  return (
    <div className="relative" ref={bookingRef}>
      <Navbar settings={settings} onBookClick={scrollToBooking} />
      <main>
        <Hero onBookClick={scrollToBooking} businessName={businessName} />
        <Services
          services={services}
          loading={loading}
          onSelectService={(s) => {
            setSelectedService(s);
            setTimeout(scrollToBooking, 50);
          }}
        />
        <About />
        <Booking
          services={services}
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
      <Footer settings={settings} onBookClick={scrollToBooking} />
    </div>
  );
}
