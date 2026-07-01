import { cn } from '../../lib/cn';

interface LogoProps {
  className?: string;
  invert?: boolean;
}

export function Logo({ className, invert }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <img
        src={invert ? '/logo-light.png' : '/logo.png'}
        alt="Primax Group logo"
        className="h-9 w-9 object-contain"
      />
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
