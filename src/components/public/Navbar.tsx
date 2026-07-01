import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Phone } from 'lucide-react';
import { Logo } from './Logo';
import type { BusinessSettings } from '../../lib/types';
import { cn } from '../../lib/cn';

interface NavbarProps {
  settings: BusinessSettings | null;
  onBookClick: () => void;
}

const links = [
  { href: '#services', label: 'Services' },
  { href: '#about', label: 'About' },
  { href: '#booking', label: 'Book' },
  { href: '#contact', label: 'Contact' },
];

export function Navbar({ settings, onBookClick }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed left-0 right-0 top-0 z-40 transition-all duration-300',
        scrolled ? 'backdrop-blur-md bg-white/80 border-b border-ink-100' : 'bg-transparent'
      )}
    >
      <div className="container-page flex h-[72px] items-center justify-between py-3">
        <a href="#top" className="flex items-center">
          <Logo />
        </a>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-4 py-2 text-sm text-ink-700 transition hover:bg-ink-50 hover:text-ink-900"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {settings?.business_phone && (
            <a
              href={`tel:${settings.business_phone}`}
              className="hidden items-center gap-2 rounded-full border border-ink-200 bg-white px-4 py-2 text-sm text-ink-700 transition hover:border-ink-300 hover:bg-ink-50 md:inline-flex"
            >
              <Phone size={14} className="text-brand-600" />
              {settings.business_phone}
            </a>
          )}
          <button onClick={onBookClick} className="btn-brand hidden md:inline-flex">
            Book a cleaning
          </button>
          <Link
            to="/admin"
            className="hidden text-xs uppercase tracking-widest text-ink-400 transition hover:text-ink-700 lg:inline-flex"
          >
            Admin
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-full border border-ink-200 bg-white p-2 lg:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-ink-100 bg-white/95 backdrop-blur-md">
          <div className="container-page py-4 flex flex-col gap-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-sm text-ink-700 hover:bg-ink-50"
              >
                {l.label}
              </a>
            ))}
            <button
              onClick={() => {
                setOpen(false);
                onBookClick();
              }}
              className="btn-brand mt-2"
            >
              Book a cleaning
            </button>
            <Link to="/admin" className="mt-2 text-center text-xs uppercase tracking-widest text-ink-400">
              Admin
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
