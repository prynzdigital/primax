import { ArrowRight, Sparkles, Star } from 'lucide-react';
import { IMG } from '../../lib/images';

interface HeroProps {
  onBookClick: () => void;
  businessName?: string;
}

export function Hero({ onBookClick, businessName }: HeroProps) {
  return (
    <section id="top" className="relative overflow-hidden pt-28 pb-20 lg:pt-36 lg:pb-28">
      {/* Background blobs and grid */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-hero-grid bg-[length:22px_22px] opacity-60" />
        <div className="absolute -top-40 -left-40 h-[480px] w-[480px] rounded-full bg-brand-200/40 blur-3xl" />
        <div className="absolute -bottom-32 right-0 h-[420px] w-[420px] rounded-full bg-mint-200/50 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-fade" />
      </div>

      <div className="container-page grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-6 animate-slide-up">
          <div className="eyebrow">
            <Sparkles size={12} className="text-brand-600" />
            Background-checked · Eco-friendly · Bonded & Insured
          </div>

          <h1 className="display-heading mt-5 text-5xl sm:text-6xl lg:text-7xl text-balance leading-[1.02]">
            Elevating Chicago's
            <br />
            <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-mint-500 bg-clip-text text-transparent">
              living &amp; working standards.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-600 text-pretty">
            {businessName ?? 'Primax Group LLC'} is Chicago's trusted cleaning partner for working professionals,
            busy families, offices, and property managers. Book a spotless clean in minutes — handled
            by a vetted, trained crew you'll want back every time.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <button onClick={onBookClick} className="btn-brand text-base px-6 py-3.5">
              Book your cleaning
              <ArrowRight size={16} />
            </button>
            <a href="#services" className="btn-outline text-base px-6 py-3.5">
              Explore services
            </a>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[IMG.cleanerPortrait, IMG.aboutDetail, IMG.kitchen].map((src, i) => (
                  <div
                    key={i}
                    className="h-9 w-9 overflow-hidden rounded-full ring-2 ring-white bg-ink-100"
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={12} fill="currentColor" stroke="none" />
                  ))}
                </div>
                <div className="text-xs text-ink-500">Trusted by Chicago households &amp; offices</div>
              </div>
            </div>

            <div className="h-8 w-px bg-ink-200 hidden sm:block" />

            <div className="text-sm">
              <div className="text-ink-900 font-medium">100% satisfaction</div>
              <div className="text-xs text-ink-500">Or we'll re-clean it free.</div>
            </div>
          </div>
        </div>

        <div className="relative lg:col-span-6">
          <div className="relative aspect-[5/6] w-full overflow-hidden rounded-[2rem] shadow-lift">
            <img
              src={IMG.hero}
              alt="Bright, freshly cleaned living room interior"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-900/30 via-transparent to-transparent" />

            <div className="absolute left-5 top-5 rounded-2xl bg-white/90 px-4 py-3 shadow-soft backdrop-blur">
              <div className="text-xs uppercase tracking-widest text-ink-500">Next available</div>
              <div className="text-sm font-medium text-ink-900">Tomorrow · 9:00 AM</div>
            </div>

            <div className="absolute bottom-5 right-5 max-w-[220px] rounded-2xl bg-white/95 p-4 shadow-lift backdrop-blur">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-mint-500 animate-pulse-soft" />
                <div className="text-xs font-medium text-mint-700">Cleaner en route</div>
              </div>
              <div className="mt-2 text-sm text-ink-700">
                "They made my apartment feel brand new."
              </div>
              <div className="mt-1 text-xs text-ink-500">— Verified Chicago client</div>
            </div>
          </div>

          <div className="absolute -bottom-8 -left-6 hidden h-40 w-40 overflow-hidden rounded-2xl shadow-lift ring-4 ring-white sm:block">
            <img src={IMG.heroSecondary} alt="Detail of sparkling clean kitchen" className="h-full w-full object-cover" />
          </div>

          <div className="absolute -right-4 top-12 hidden rounded-2xl border border-ink-100 bg-white px-4 py-3 shadow-soft sm:block">
            <div className="text-xs text-ink-500">Trust score</div>
            <div className="text-xl font-display font-semibold text-ink-900">5.0</div>
          </div>
        </div>
      </div>
    </section>
  );
}
