import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck2,
  Sparkles,
  Clock,
  CalendarX2,
  Settings,
  LogOut,
  Home,
} from 'lucide-react';
import type { AdminUser } from '../../lib/types';
import { Logo } from '../public/Logo';
import { cn } from '../../lib/cn';

interface SidebarProps {
  user: AdminUser | null;
  onSignOut: () => void;
}

const items = [
  { to: '/admin', end: true, label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/appointments', label: 'Appointments', icon: CalendarCheck2 },
  { to: '/admin/services', label: 'Services', icon: Sparkles },
  { to: '/admin/hours', label: 'Business Hours', icon: Clock },
  { to: '/admin/blocked-dates', label: 'Blocked Dates', icon: CalendarX2 },
  { to: '/admin/settings', label: 'Business Settings', icon: Settings },
];

export function Sidebar({ user, onSignOut }: SidebarProps) {
  const navigate = useNavigate();
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-ink-100 bg-white/70 backdrop-blur lg:flex lg:flex-col">
      <div className="px-5 py-6">
        <Logo />
      </div>

      <nav className="flex-1 overflow-y-auto px-3">
        <div className="mb-2 px-3 text-[10px] uppercase tracking-widest text-ink-400">Manage</div>
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                    isActive
                      ? 'bg-ink-900 text-white shadow-soft'
                      : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900'
                  )
                }
              >
                <item.icon size={16} />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="mt-8 mb-2 px-3 text-[10px] uppercase tracking-widest text-ink-400">Shortcut</div>
        <button
          onClick={() => navigate('/')}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-600 transition hover:bg-ink-100 hover:text-ink-900"
        >
          <Home size={16} />
          View public site
        </button>
      </nav>

      <div className="border-t border-ink-100 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-ink-50/60 p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-medium uppercase">
            {user?.email?.charAt(0) ?? 'A'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-medium text-ink-900">{user?.email ?? 'Admin'}</div>
            <div className="text-[10px] uppercase tracking-widest text-ink-400">Admin</div>
          </div>
          <button
            onClick={onSignOut}
            title="Sign out"
            className="rounded-full p-2 text-ink-500 hover:bg-white hover:text-ink-900"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}

export function MobileBottomBar({ onSignOut }: { onSignOut: () => void }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-ink-100 bg-white/90 px-3 py-2 backdrop-blur lg:hidden">
      <ul className="flex items-center justify-between gap-2">
        {items.slice(0, 5).map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-[10px] font-medium',
                  isActive ? 'text-brand-700' : 'text-ink-500'
                )
              }
            >
              <item.icon size={18} />
              {item.label.split(' ')[0]}
            </NavLink>
          </li>
        ))}
        <li>
          <button
            onClick={onSignOut}
            className="flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-[10px] font-medium text-ink-500"
          >
            <LogOut size={18} />
            Out
          </button>
        </li>
      </ul>
    </nav>
  );
}
