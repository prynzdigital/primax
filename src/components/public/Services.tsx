import { ArrowUpRight, Clock } from 'lucide-react';
import type { Service } from '../../lib/types';
import { formatCurrency, formatDuration } from '../../lib/availability';
import { getServiceImage } from '../../lib/images';

interface ServicesProps {
  services: Service[];
  loading: boolean;
  onSelectService: (s: Service) => void;
}

export function Services({ services, loading, onSelectService }: ServicesProps) {
  const activeServices = services.filter((s) => s.is_active && !s.is_addon);

  return (
    <section id="services" className="relative py-24 lg:py-32">
      <div className="container-page">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="eyebrow">Our services</div>
            <h2 className="display-heading mt-4 text-4xl sm:text-5xl text-balance">
              Cleaning that's tailored to the way you live.
            </h2>
            <p className="mt-4 text-base text-ink-600 text-pretty">
              From a quick refresh to a full post-renovation reset — choose a service, pick a time,
              and let our trusted cleaning team take it from there.
            </p>
          </div>
          <a href="#booking" className="btn-outline self-start md:self-end">
            See availability
            <ArrowUpRight size={16} />
          </a>
        </div>

        <div className="mt-12">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card overflow-hidden">
                  <div className="aspect-[4/3] w-full animate-pulse bg-ink-100" />
                  <div className="p-6 space-y-3">
                    <div className="h-5 w-2/3 animate-pulse rounded bg-ink-100" />
                    <div className="h-3 w-full animate-pulse rounded bg-ink-100" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-ink-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : activeServices.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="display-heading text-xl">No services available yet</div>
              <div className="mt-2 text-sm text-ink-500">
                Please check back soon — services will appear here automatically.
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {activeServices.map((service, idx) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  index={idx}
                  onSelect={() => onSelectService(service)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ServiceCard({
  service,
  index,
  onSelect,
}: {
  service: Service;
  index: number;
  onSelect: () => void;
}) {
  const image = getServiceImage(service.name);
  const featured = index === 0;

  return (
    <article
      className={`group card relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lift ${
        featured ? 'md:col-span-2 lg:col-span-1' : ''
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={service.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.background =
              'linear-gradient(135deg,#d6f1f6,#daf4e6)';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/35 via-transparent to-transparent" />
        <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-ink-700 shadow-soft backdrop-blur">
          <Clock size={12} className="text-brand-600" />
          {formatDuration(service.duration_minutes)}
        </div>
        <div className="absolute bottom-4 right-4 rounded-full bg-white/95 px-3 py-1 text-sm font-semibold text-ink-900 shadow-soft backdrop-blur">
          {formatCurrency(service.price)}
        </div>
      </div>

      <div className="p-6">
        <h3 className="display-heading text-xl">{service.name}</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-600 line-clamp-3">
          {service.description ?? 'A premium, detail-oriented cleaning service for your space.'}
        </p>

        <button
          onClick={onSelect}
          className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-brand-700 transition group-hover:gap-3"
        >
          Book this service
          <ArrowUpRight size={14} className="transition-transform group-hover:rotate-12" />
        </button>
      </div>
    </article>
  );
}
