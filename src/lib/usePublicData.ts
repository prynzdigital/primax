import { useEffect, useState } from 'react';
import { listServices, listAddons, listBusinessHours, listBlockedDates, getBusinessSettings } from './api';
import {
  demoAddons,
  demoBlockedDates,
  demoBusinessHours,
  demoServices,
  demoSettings,
} from './demoData';
import type { Addon, BlockedDate, BusinessHours, BusinessSettings, Service } from './types';

export interface PublicData {
  services: Service[];
  addons: Addon[];
  businessHours: BusinessHours[];
  blockedDates: BlockedDate[];
  settings: BusinessSettings | null;
  loading: boolean;
}

export function usePublicData(): PublicData {
  const [services, setServices] = useState<Service[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const [svc, ads, hrs, blk, set] = await Promise.all([
        listServices(),
        listAddons(),
        listBusinessHours(),
        listBlockedDates(),
        getBusinessSettings(),
      ]);
      if (cancelled) return;

      // Backend not reachable/configured yet — fall back to demo data so the
      // site never renders blank during setup.
      if (svc.error && ads.error && hrs.error && blk.error && set.error) {
        setServices(demoServices);
        setAddons(demoAddons);
        setBusinessHours(demoBusinessHours);
        setBlockedDates(demoBlockedDates);
        setSettings(demoSettings);
        setLoading(false);
        return;
      }

      setServices(svc.data ?? []);
      setAddons(ads.data ?? []);
      setBusinessHours(hrs.data ?? []);
      setBlockedDates(blk.data ?? []);
      setSettings(set.data ?? null);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { services, addons, businessHours, blockedDates, settings, loading };
}
