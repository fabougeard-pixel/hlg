export const DEFAULT_GERMANY_FREE_SHIPPING_THRESHOLD = 200;

export type ShippingMethodKind = 'free' | 'standard' | 'express' | 'collect' | 'custom';

export const CANONICAL_SHIPPING_METHOD_TYPES: Record<Exclude<ShippingMethodKind, 'custom'>, string> = {
  free: 'Livraison Gratuite',
  standard: 'Livraison standard',
  express: 'Livraison expresse',
  collect: 'Collecte au magasin',
};

export interface ShippingMethodLike {
  id?: string;
  type: string;
  rate: number;
  minOrderAmount?: number | null;
  isActive?: boolean;
}

export interface ShippingZoneLike {
  name: string;
  isActive?: boolean;
  methods: ShippingMethodLike[];
}

const FREE_EXACT_ALIASES = new Set([
  'livraison gratuite',
  'kostenlose lieferung',
  'kostenloser versand',
  'kostenfreie lieferung',
  'kostenfreier versand',
  'versandkostenfrei',
  'versandfrei',
  'free shipping',
  'free delivery',
  'gratisversand',
  'free',
]);

const COLLECT_EXACT_ALIASES = new Set([
  'collecte au magasin',
  'abholung im geschäft',
  'abholung vor ort',
  'selbstabholung',
  'abholung',
  'store pickup',
  'local pickup',
  'pickup',
  'click & collect',
  'click and collect',
]);

const EXPRESS_EXACT_ALIASES = new Set([
  'livraison expresse',
  'livraison express',
  'expressversand',
  'express-versand',
  'express lieferung',
  'expresslieferung',
  'express shipping',
  'express delivery',
]);

const STANDARD_EXACT_ALIASES = new Set([
  'livraison standard',
  'standardversand',
  'standard-versand',
  'standardlieferung',
  'standard shipping',
  'standard delivery',
  'versandkostenpauschale',
  'flat rate',
]);

export function normalizeShippingMethodKind(type?: string | null): ShippingMethodKind {
  const normalized = (type || '').trim().toLowerCase();
  if (!normalized) return 'custom';

  if (
    FREE_EXACT_ALIASES.has(normalized) ||
    normalized.includes('livraison gratuite') ||
    normalized.includes('kostenlos') ||
    normalized.includes('kostenfrei') ||
    normalized.includes('versandkostenfrei') ||
    normalized.includes('versandfrei') ||
    normalized.includes('free shipping') ||
    normalized.includes('gratisversand')
  ) {
    return 'free';
  }

  if (
    COLLECT_EXACT_ALIASES.has(normalized) ||
    normalized.includes('collecte') ||
    normalized.includes('abholung') ||
    normalized.includes('selbstabholung') ||
    normalized.includes('pickup')
  ) {
    return 'collect';
  }

  if (
    EXPRESS_EXACT_ALIASES.has(normalized) ||
    normalized.includes('express')
  ) {
    return 'express';
  }

  if (
    STANDARD_EXACT_ALIASES.has(normalized) ||
    normalized.includes('standard') ||
    normalized.includes('pauschale') ||
    normalized.includes('flat rate')
  ) {
    return 'standard';
  }

  return 'custom';
}

export function isFreeShippingMethod(type?: string | null): boolean {
  return normalizeShippingMethodKind(type) === 'free';
}

export function isZeroRateShippingMethod(type?: string | null): boolean {
  const kind = normalizeShippingMethodKind(type);
  return kind === 'free' || kind === 'collect';
}

export function isShippingMethodEligible(
  method: Pick<ShippingMethodLike, 'type' | 'minOrderAmount'>,
  orderSubtotal: number
): boolean {
  if (method.minOrderAmount == null || !Number.isFinite(method.minOrderAmount) || method.minOrderAmount <= 0) {
    return true;
  }
  return Math.round(orderSubtotal * 100) >= Math.round(method.minOrderAmount * 100);
}

export function getRemainingForShippingMethod(
  method: Pick<ShippingMethodLike, 'minOrderAmount'>,
  orderSubtotal: number
): number {
  if (method.minOrderAmount == null || !Number.isFinite(method.minOrderAmount) || method.minOrderAmount <= 0) {
    return 0;
  }
  const remainingCents = Math.max(0, Math.round(method.minOrderAmount * 100) - Math.round(orderSubtotal * 100));
  return remainingCents / 100;
}

export function isGermanyCountryName(name?: string | null): boolean {
  const normalized = (name || '').trim().toLowerCase();
  return (
    normalized === 'germany' ||
    normalized === 'deutschland' ||
    normalized === 'allemagne' ||
    normalized === 'de'
  );
}

export function findShippingZoneForCountry<T extends ShippingZoneLike>(
  zones: T[],
  country?: string | null
): T | undefined {
  if (!zones || zones.length === 0) return undefined;

  if (country) {
    const target = country.trim().toLowerCase();
    const exact = zones.find((z) => z.name.trim().toLowerCase() === target);
    if (exact) return exact;

    if (isGermanyCountryName(country)) {
      const germanyAlias = zones.find((z) => isGermanyCountryName(z.name));
      if (germanyAlias) return germanyAlias;
    }
  }

  return (
    zones.find((z) => isGermanyCountryName(z.name)) ||
    zones.find((z) => z.name.trim().toLowerCase() === 'default') ||
    zones[0]
  );
}

export function getPreferredShippingMethod<T extends ShippingMethodLike>(
  methods: T[],
  orderSubtotal: number
): T | undefined {
  const active = methods.filter((m) => m.isActive !== false);
  const eligible = active.filter((m) => isShippingMethodEligible(m, orderSubtotal));
  if (eligible.length === 0) return undefined;

  const unlockedFree = eligible.find((m) => isFreeShippingMethod(m.type) && m.rate === 0);
  if (unlockedFree) return unlockedFree;

  const nonPickup = eligible.find((m) => normalizeShippingMethodKind(m.type) !== 'collect');
  return nonPickup || eligible[0];
}

export function resolveEffectiveShippingMethodId<T extends ShippingMethodLike>(
  methods: T[],
  selectedMethodId: string | undefined,
  customMethodId: string | undefined,
  orderSubtotal: number
): string {
  if (selectedMethodId) {
    const matched = methods.find((m) => m.id === selectedMethodId);
    if (matched && isShippingMethodEligible(matched, orderSubtotal)) {
      return matched.id || '';
    }
  }
  if (customMethodId) {
    const customMatched = methods.find((m) => m.id === customMethodId);
    if (customMatched && isShippingMethodEligible(customMatched, orderSubtotal)) {
      return customMatched.id || '';
    }
  }
  return getPreferredShippingMethod(methods, orderSubtotal)?.id || '';
}

export function getZoneFreeShippingMethod<T extends ShippingMethodLike>(zone?: { methods?: T[] } | null): T | undefined {
  const methods = (zone?.methods || []).filter((m) => m.isActive !== false);
  return methods.find((m) => isFreeShippingMethod(m.type));
}

export function getFreeShippingThreshold(
  zones?: ShippingZoneLike[],
  country?: string | null,
  fallback = DEFAULT_GERMANY_FREE_SHIPPING_THRESHOLD
): number | null {
  if (!zones || zones.length === 0) return fallback;
  const zone = findShippingZoneForCountry(zones, country || 'Germany');
  const freeMethod = getZoneFreeShippingMethod(zone);
  if (!freeMethod) return null;
  if (freeMethod.minOrderAmount == null || !Number.isFinite(freeMethod.minOrderAmount)) {
    return 0;
  }
  return Math.max(0, freeMethod.minOrderAmount);
}

const CANONICAL_LOCALE_LABELS: Record<Exclude<ShippingMethodKind, 'custom'>, Record<string, string>> = {
  free: {
    de: 'Kostenlose Lieferung',
    en: 'Free Shipping',
    fr: 'Livraison Gratuite',
  },
  standard: {
    de: 'Standardversand',
    en: 'Standard Shipping',
    fr: 'Livraison standard',
  },
  express: {
    de: 'Expressversand',
    en: 'Express Shipping',
    fr: 'Livraison expresse',
  },
  collect: {
    de: 'Abholung im Geschäft',
    en: 'Store Pickup',
    fr: 'Collecte au magasin',
  },
};

const KNOWN_CANONICAL_LOWER = new Set([
  'livraison gratuite',
  'livraison standard',
  'livraison expresse',
  'collecte au magasin',
  'free shipping',
  'standard shipping',
  'express shipping',
  'store pickup',
  'kostenlose lieferung',
  'standardversand',
  'expressversand',
  'abholung im geschäft',
]);

export function getLocalizedShippingMethodLabel(type: string, locale = 'de'): string {
  const trimmed = (type || '').trim();
  if (!trimmed) return '';

  const lang = locale.toLowerCase().split('-')[0];
  const lower = trimmed.toLowerCase();

  if (KNOWN_CANONICAL_LOWER.has(lower)) {
    const kind = normalizeShippingMethodKind(trimmed);
    if (kind !== 'custom') {
      return CANONICAL_LOCALE_LABELS[kind][lang] || CANONICAL_LOCALE_LABELS[kind].de || trimmed;
    }
  }

  return trimmed;
}
