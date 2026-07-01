import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Mail, Phone } from 'lucide-react';
import { listQuoteRequests } from '../../lib/api';
import type { QuoteRequest } from '../../lib/types';
import { PageHeader } from './PageHeader';

export function QuoteRequestsAdmin() {
  const [requests, setRequests] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const { data } = await listQuoteRequests();
      if (!cancelled) {
        setRequests(data ?? []);
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Bespoke Quotes"
        subtitle="Enterprise-scale leads that exceeded the standard cart limits — follow up manually."
      />

      <div className="card overflow-hidden">
        {loading ? (
          <div className="divide-y divide-ink-100">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="px-6 py-4 animate-pulse">
                <div className="h-4 w-1/3 rounded bg-ink-100" />
                <div className="mt-2 h-3 w-1/2 rounded bg-ink-100" />
              </div>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-ink-500">
            No bespoke quote requests yet.
          </div>
        ) : (
          <ul className="divide-y divide-ink-100">
            {requests.map((q) => (
              <li key={q.id} className="grid grid-cols-1 gap-2 px-6 py-4 md:grid-cols-12 md:items-center md:gap-3">
                <div className="md:col-span-3">
                  <div className="font-medium text-ink-900">{q.full_name}</div>
                  <div className="text-xs text-ink-500">{format(parseISO(q.created_at), 'MMM d, yyyy')}</div>
                </div>
                <div className="md:col-span-4 text-sm text-ink-700">
                  <div className="inline-flex items-center gap-1.5">
                    <Mail size={12} className="text-ink-400" />
                    {q.email}
                  </div>
                  <div className="inline-flex items-center gap-1.5 md:ml-4">
                    <Phone size={12} className="text-ink-400" />
                    {q.phone}
                  </div>
                </div>
                <div className="md:col-span-5 text-sm text-ink-700">
                  {[
                    q.bedrooms != null ? `${q.bedrooms} bed` : null,
                    q.bathrooms != null ? `${q.bathrooms} bath` : null,
                    q.square_footage != null ? `${q.square_footage} sq ft` : null,
                    `Zip ${q.zip_code}`,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                  {q.notes && <div className="mt-1 text-xs text-ink-500">{q.notes}</div>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
