import { Routes, Route } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { Login } from '../components/admin/Login';
import { Sidebar, MobileBottomBar } from '../components/admin/Sidebar';
import { Overview } from '../components/admin/Overview';
import { AppointmentsAdmin } from '../components/admin/AppointmentsAdmin';
import { ServicesAdmin } from '../components/admin/ServicesAdmin';
import { AddonsAdmin } from '../components/admin/AddonsAdmin';
import { BusinessHoursAdmin } from '../components/admin/BusinessHoursAdmin';
import { BlockedDatesAdmin } from '../components/admin/BlockedDatesAdmin';
import { BusinessSettingsAdmin } from '../components/admin/BusinessSettingsAdmin';

export default function AdminPage() {
  const { state, user, signIn, signOut } = useAdminAuth();

  if (state === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white via-brand-50/40 to-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
          <div className="text-sm text-ink-500">Verifying access…</div>
        </div>
      </div>
    );
  }

  if (state === 'signed-out') {
    return <Login onSubmit={signIn} />;
  }

  return (
    <div className="flex min-h-screen bg-ink-50/40">
      <Sidebar user={user} onSignOut={signOut} />
      <main className="min-w-0 flex-1 px-5 py-8 pb-24 sm:px-8 lg:px-10 lg:py-10">
        <div className="mx-auto w-full max-w-6xl">
          <Routes>
            <Route index element={<Overview />} />
            <Route path="appointments" element={<AppointmentsAdmin />} />
            <Route path="services" element={<ServicesAdmin />} />
            <Route path="addons" element={<AddonsAdmin />} />
            <Route path="hours" element={<BusinessHoursAdmin />} />
            <Route path="blocked-dates" element={<BlockedDatesAdmin />} />
            <Route path="settings" element={<BusinessSettingsAdmin />} />
          </Routes>
        </div>
      </main>
      <MobileBottomBar onSignOut={signOut} />
    </div>
  );
}
