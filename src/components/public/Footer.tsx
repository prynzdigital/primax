import { Mail, MapPin, Phone } from 'lucide-react';
import { Logo } from './Logo';
import type { BusinessSettings } from '../../lib/types';
import { Link } from 'react-router-dom';

interface FooterProps {
  settings: BusinessSettings | null;
  onBookClick: () => void;
}

export function Footer({ settings, onBookClick }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer id="contact" className="relative mt-20 bg-ink-900 text-ink-100">
      <div className="container-page py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Logo invert />
            <p className="mt-5 max-w-md text-sm leading-relaxed text-ink-300">
              {settings?.business_name ?? 'Lumen & Bloom'} is a premium home cleaning service built
              on trust, care, and the kind of detail you can see — and feel — the moment you walk in.
            </p>

            <button onClick={onBookClick} className="btn-brand mt-6">
              Book your cleaning
            </button>
          </div>

          <div className="lg:col-span-3">
            <div className="text-xs uppercase tracking-widest text-ink-400">Services</div>
            <ul className="mt-4 space-y-2 text-sm">
              <li>Standard Home Cleaning</li>
              <li>Deep Cleaning</li>
              <li>Move-In / Move-Out Cleaning</li>
              <li>Apartment Cleaning</li>
              <li>Office Cleaning</li>
              <li>Post-Renovation Cleaning</li>
            </ul>
          </div>

          <div className="lg:col-span-4">
            <div className="text-xs uppercase tracking-widest text-ink-400">Contact</div>
            <ul className="mt-4 space-y-3 text-sm">
              {settings?.business_phone && (
                <li className="flex items-center gap-3">
                  <Phone size={14} className="text-brand-300" />
                  <a href={`tel:${settings.business_phone}`} className="hover:text-white">
                    {settings.business_phone}
                  </a>
                </li>
              )}
              {settings?.business_email && (
                <li className="flex items-center gap-3">
                  <Mail size={14} className="text-brand-300" />
                  <a href={`mailto:${settings.business_email}`} className="hover:text-white">
                    {settings.business_email}
                  </a>
                </li>
              )}
              {settings?.business_address && (
                <li className="flex items-start gap-3">
                  <MapPin size={14} className="mt-0.5 text-brand-300" />
                  <span>{settings.business_address}</span>
                </li>
              )}
            </ul>

            <div className="mt-6 flex items-center gap-3">
              <Link to="/admin" className="text-xs uppercase tracking-widest text-ink-400 hover:text-white">
                Team Admin →
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-8 text-xs text-ink-400 sm:flex-row sm:items-center sm:justify-between">
          <div>© {year} {settings?.business_name ?? 'Lumen & Bloom'}. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <span>Insured & bonded</span>
            <span>Eco-friendly</span>
            <span>Satisfaction guarantee</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
