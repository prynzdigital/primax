import { ShieldCheck, Leaf, Sparkles, HandHeart } from 'lucide-react';
import { IMG } from '../../lib/images';

const values = [
  {
    icon: ShieldCheck,
    title: 'Vetted & insured',
    description: 'Background-checked, bonded, and fully insured — every cleaner on every job.',
  },
  {
    icon: Leaf,
    title: 'EPA-approved eco-friendly',
    description: 'We use EPA-approved, eco-friendly products that are safe for families, kids, and pets.',
  },
  {
    icon: Sparkles,
    title: 'On-time guarantee',
    description: 'We show up when we say we will. Your time is respected on every booking.',
  },
  {
    icon: HandHeart,
    title: '24-hr satisfaction guarantee',
    description: 'Not perfectly satisfied? We come back within 24 hours and re-clean it on us.',
  },
];

export function About() {
  return (
    <section id="about" className="relative py-24 lg:py-32 bg-gradient-to-b from-white via-brand-50/40 to-white">
      <div className="container-page">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-lift">
              <img
                src={IMG.aboutTeam}
                alt="Professional cleaning team preparing supplies"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900/20 via-transparent to-transparent" />
            </div>

            <div className="absolute -bottom-6 -right-6 hidden h-44 w-44 overflow-hidden rounded-2xl shadow-lift ring-4 ring-white sm:block">
              <img
                src={IMG.aboutDetail}
                alt="Detail of folded linens and clean home surface"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="absolute -top-4 -left-4 hidden rounded-2xl bg-white p-4 shadow-lift sm:block">
              <div className="text-3xl font-display font-semibold text-ink-900">10+ yrs</div>
              <div className="text-xs uppercase tracking-widest text-ink-500">Industry experience</div>
            </div>
          </div>

          <div>
            <div className="eyebrow">About us</div>
            <h2 className="display-heading mt-4 text-4xl sm:text-5xl text-balance">
              Chicago's cleaning team you'll trust with your home — and your business.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-ink-600 text-pretty">
              Primax Group LLC was built on one promise: leave every space better than we found it.
              With 10+ years of industry experience and a presence across Chicago and its South Suburbs,
              our background-checked, bonded, and insured crews bring consistency, discretion, and
              genuine care to every visit — whether it's your home, your office, or your Airbnb.
            </p>

            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {values.map((v) => (
                <div
                  key={v.title}
                  className="rounded-2xl border border-ink-100 bg-white p-5 transition hover:border-brand-200 hover:shadow-soft"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                    <v.icon size={18} />
                  </div>
                  <div className="mt-4 text-sm font-semibold text-ink-900">{v.title}</div>
                  <div className="mt-1 text-sm text-ink-600">{v.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
