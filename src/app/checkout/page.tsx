import { getSettings } from '@/actions/settings';
import CheckoutClient from './CheckoutClient';
import prisma from '@/lib/prisma';
import { Suspense } from 'react';
import { isGermanyCountryName } from '@/lib/shipping';

export const dynamic = 'force-dynamic';

export default async function CheckoutPage() {
  const settings = await getSettings();
  
  // Send to the client ONLY the necessary settings, for security reasons
  const paymentSettings = {
    ENABLE_STRIPE: settings.ENABLE_STRIPE !== undefined ? settings.ENABLE_STRIPE : 'true',
    ENABLE_PAYPAL: settings.ENABLE_PAYPAL !== undefined ? settings.ENABLE_PAYPAL : 'true',
    ENABLE_BANK_TRANSFER: settings.ENABLE_BANK_TRANSFER !== undefined ? settings.ENABLE_BANK_TRANSFER : 'true',
    BANK_TRANSFER_CHECKOUT_MESSAGE: settings.BANK_TRANSFER_CHECKOUT_MESSAGE || '',
  };

  const rawZones = await prisma.shippingZone.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    include: { methods: { where: { isActive: true }, orderBy: { createdAt: 'asc' } } }
  });

  const zones = [...rawZones].sort((a, b) => {
    const aDe = isGermanyCountryName(a.name) ? 0 : 1;
    const bDe = isGermanyCountryName(b.name) ? 0 : 1;
    if (aDe !== bDe) return aDe - bDe;
    return a.name.localeCompare(b.name);
  });

  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-16 text-center text-stone-600 font-medium">Kasse wird geladen...</div>}>
      <CheckoutClient settings={paymentSettings} zones={zones} />
    </Suspense>
  );
}
