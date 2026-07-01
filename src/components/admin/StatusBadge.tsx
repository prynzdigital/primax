import type { AppointmentStatus } from '../../lib/types';

const map: Record<AppointmentStatus, { className: string; label: string }> = {
  pending: { className: 'badge-pending', label: 'Pending' },
  confirmed: { className: 'badge-confirmed', label: 'Confirmed' },
  completed: { className: 'badge-completed', label: 'Completed' },
  cancelled: { className: 'badge-cancelled', label: 'Cancelled' },
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  const cfg = map[status] ?? map.pending;
  return <span className={cfg.className}>{cfg.label}</span>;
}
