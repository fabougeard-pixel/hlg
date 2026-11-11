import prisma from '@/lib/prisma';
import CartClient from './CartClient';
import { isGermanyCountryName } from '@/lib/shipping';

export const dynamic = 'force-dynamic';

export default async function CartPage() {
  const rawZones = await prisma.shippingZone.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    include: { methods: { where: { isActive: true }, orderBy: { createdAt: 'asc' } } },
  });

  const zones = [...rawZones].sort((a, b) => {
    const aDe = isGermanyCountryName(a.name) ? 0 : 1;
    const bDe = isGermanyCountryName(b.name) ? 0 : 1;
    if (aDe !== bDe) return aDe - bDe;
    return a.name.localeCompare(b.name);
  });

  return <CartClient zones={zones} />;
}
