import { useRef, useState } from 'react';
import { Navbar } from '../components/public/Navbar';
import { Hero } from '../components/public/Hero';
import { Services } from '../components/public/Services';
import { About } from '../components/public/About';
import { Booking, type SuccessData } from '../components/public/Booking';
import { Footer } from '../components/public/Footer';
import { SuccessConfirmation } from '../components/public/SuccessConfirmation';
import { usePublicData } from '../lib/usePublicData';
import type { Service } from '../lib/types';

export default function PublicSite() {
  const { services, addons, businessHours, blockedDates, settings, loading } = usePublicData();

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [success, setSuccess] = useState<SuccessData | null>(null);

  const bookingRef = useRef<HTMLDivElement | null>(null);

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
      <Footer settings={settings} onBookClick={scrollToBooking} />
    </div>
  );
}
