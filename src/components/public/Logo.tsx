import { cn } from '../../lib/cn';

interface LogoProps {
  className?: string;
  invert?: boolean;
}

export function Logo({ className, invert }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className="relative">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700 shadow-glow" />
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v4" />
            <path d="M12 18v4" />
            <path d="M4.93 4.93l2.83 2.83" />
            <path d="M16.24 16.24l2.83 2.83" />
            <path d="M2 12h4" />
            <path d="M18 12h4" />
            <path d="M4.93 19.07l2.83-2.83" />
            <path d="M16.24 7.76l2.83-2.83" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>
      </div>
      <div className="leading-tight">
        <div className={cn('font-display text-lg font-semibold tracking-tight', invert ? 'text-white' : 'text-ink-900')}>
          Primax <span className="text-brand-500">Group</span>
        </div>
        <div className={cn('text-[10px] uppercase tracking-[0.18em]', invert ? 'text-white/60' : 'text-ink-400')}>
          LLC · Chicago
        </div>
      </div>
    </div>
  );
}
