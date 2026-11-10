'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';

export interface BestsellerItem {
  id: string;
  title: string;
  price: string;
  rawPrice: number;
  rating?: number;
  ratingScore?: string;
  image: string;
  slug: string;
  energyRating?: string;
  rank?: number;
}

export interface DealItem {
  id: string;
  category: string;
  categorySlug: string;
  title: string;
  price: string;
  rawPrice: number;
  compareAtPrice: string;
  discount: string;
  savings?: string;
  rating: number;
  ratingScore: string;
  image: string;
  slug: string;
  energyRating?: string;
  deliveryNote?: string;
  warrantyNote?: string;
  department: 'WASCHEN' | 'SAUGEN' | 'KUECHE' | 'KUEHLEN' | 'GAMING' | 'KAFFEE';
}

// Official EU Energy Label Badge
function EnergyBadge({ rating }: { rating?: string }) {
  if (!rating) return null;
  const colors: Record<string, { bg: string; text: string }> = {
    'A': { bg: 'bg-[#009640]', text: 'text-white' },
    'A+++': { bg: 'bg-[#009640]', text: 'text-white' },
    'A++': { bg: 'bg-[#009640]', text: 'text-white' },
    'A+': { bg: 'bg-[#009640]', text: 'text-white' },
    'B': { bg: 'bg-[#54b848]', text: 'text-white' },
    'C': { bg: 'bg-[#bfd730]', text: 'text-stone-900' },
    'D': { bg: 'bg-[#ffcc00]', text: 'text-stone-900' },
    'E': { bg: 'bg-[#f5a623]', text: 'text-white' },
    'F': { bg: 'bg-[#f05a28]', text: 'text-white' },
    'G': { bg: 'bg-[#e30613]', text: 'text-white' },
  };
  const c = colors[rating] || { bg: 'bg-[#009640]', text: 'text-white' };
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded ${c.bg} ${c.text} shadow-2xs tracking-wider shrink-0`}
      title={`EU-Energieeffizienzklasse ${rating}`}
    >
      <span>{rating}</span>
      <span className="text-[7px] opacity-80">↗</span>
    </span>
  );
}

function StarRating({ score }: { score?: string }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex text-amber-400">
        {[1, 2, 3, 4, 5].map((s) => (
          <svg key={s} className="w-3 h-3 fill-current" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      {score && (
        <span className="text-[10px] text-stone-400 font-medium">{score}</span>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// DATA PER CATEGORY (Spotlight + 6 Small Cards for each pill)
// -------------------------------------------------------------

// 1. ALLE ANGEBOTE (Default from Capture)
const defaultAlleSpotlight: DealItem = {
  id: 'deal-spotlight',
  category: 'Kaffeemaschinen',
  categorySlug: 'kaffeemaschinen',
  title: 'DELONGHI La Specialista Maestro Cold Brew EC9865.M Espressomaschine Silber/Schwarz',
  price: '1 322,90€',
  rawPrice: 1322.90,
  compareAtPrice: '1 599,00€',
  discount: '-17%',
  savings: '276,10€',
  rating: 5,
  ratingScore: '(5.00)',
  image: '/images/deals/deal-spotlight.jpg',
  slug: 'delonghi-la-specialista-maestro-cold-brew',
  deliveryNote: 'Kostenlose',
  warrantyNote: '2 Jahre',
  department: 'KAFFEE',
};

const defaultAlleGrid: DealItem[] = [
  {
    id: 'deal-1',
    category: 'Waschtrockner',
    categorySlug: 'waschtrockner',
    title: 'SIEMENS WN54C2A40 iQ700 Waschtrockner 10/6 kg',
    price: '861,94€',
    rawPrice: 861.94,
    compareAtPrice: '1 124,90€',
    discount: '-23%',
    savings: '262,96€',
    rating: 5,
    ratingScore: '(5.00)',
    image: '/images/deals/deal-1.jpg',
    slug: 'siemens-wn54c2a40-iq700-waschtrockner',
    energyRating: 'A',
    deliveryNote: 'Lieferung bis zum Verwendungsort',
    department: 'WASCHEN',
  },
  {
    id: 'deal-2',
    category: 'Staubsauger & Reiniger',
    categorySlug: 'staubsauger-reiniger',
    title: 'ROBOROCK S8 MAXV ULTRA WEISS MIT ALL-IN-ONE DOCK',
    price: '1 303,80€',
    rawPrice: 1303.80,
    compareAtPrice: '1 740,55€',
    discount: '-25%',
    savings: '436,75€',
    rating: 5,
    ratingScore: '(4.80)',
    image: '/images/deals/deal-2.jpg',
    slug: 'roborock-s8-maxv-ultra-weiss',
    deliveryNote: 'Sofort lieferbar • 1-2 Werktage',
    department: 'SAUGEN',
  },
  {
    id: 'deal-3',
    category: 'Gaming',
    categorySlug: 'gaming',
    title: 'NINTENDO Switch (OLED-Modell) Neon-Rot/Neon-Blau',
    price: '271,90€',
    rawPrice: 271.90,
    compareAtPrice: '350,93€',
    discount: '-23%',
    savings: '79,03€',
    rating: 5,
    ratingScore: '(4.94)',
    image: '/images/deals/deal-3.jpg',
    slug: 'nintendo-switch-oled-modell-neon-rot-neon-blau',
    deliveryNote: 'Sofort lieferbar',
    department: 'GAMING',
  },
  {
    id: 'deal-4',
    category: 'Kleine Haushaltsgeräte',
    categorySlug: 'kuechenmaschinen',
    title: 'KENWOOD Titanium Chef Patissier XL KWL90.594SI',
    price: '729,60€',
    rawPrice: 729.60,
    compareAtPrice: '955,80€',
    discount: '-24%',
    savings: '226,20€',
    rating: 5,
    ratingScore: '(4.63)',
    image: '/images/deals/deal-4.jpg',
    slug: 'kenwood-titanium-chef-patissier-xl',
    deliveryNote: 'Auf Lager • 2-3 Werktage',
    department: 'KUECHE',
  },
  {
    id: 'deal-5',
    category: 'Kleine Haushaltsgeräte',
    categorySlug: 'kuechenmaschinen',
    title: 'KENWOOD Titanium Chef Patissier XL mit Zubehör',
    price: '461,90€',
    rawPrice: 461.90,
    compareAtPrice: '749,93€',
    discount: '-38%',
    savings: '288,03€',
    rating: 5,
    ratingScore: '(4.80)',
    image: '/images/deals/deal-5.jpg',
    slug: 'kenwood-titanium-chef-patissier-xl-zubehoer',
    deliveryNote: 'Auf Lager • 2-3 Werktage',
    department: 'KUECHE',
  },
  {
    id: 'deal-6',
    category: 'Kühlen & Gefrieren',
    categorySlug: 'kuehlen-gefrieren',
    title: 'HAIER HSR5918DIPB SBS 90 SERIE 5 Side-by-Side',
    price: '836,89€',
    rawPrice: 836.89,
    compareAtPrice: '1 108,79€',
    discount: '-25%',
    savings: '271,90€',
    rating: 5,
    ratingScore: '(5.00)',
    image: '/images/deals/deal-6.jpg',
    slug: 'haier-hsr5918dipb-sbs-90-serie-5',
    energyRating: 'E',
    deliveryNote: 'Kostenlose 2-Mann-Lieferung',
    department: 'KUEHLEN',
  },
];

// 2. WASCHEN & TROCKNEN
const waschenSpotlight: DealItem = {
  id: 'waschen-spotlight',
  category: 'Waschtrockner',
  categorySlug: 'waschtrockner',
  title: 'SIEMENS WN54C2A40 iQ700 Waschtrockner (10 kg Waschen / 6 kg Trocknen, A)',
  price: '861,94€',
  rawPrice: 861.94,
  compareAtPrice: '1 124,90€',
  discount: '-23%',
  savings: '262,96€',
  rating: 5,
  ratingScore: '(5.00)',
  image: '/images/deals/deal-1.jpg',
  slug: 'siemens-wn54c2a40-iq700-waschtrockner',
  energyRating: 'A',
  deliveryNote: 'Kostenlose',
  warrantyNote: '2 Jahre',
  department: 'WASCHEN',
};

const waschenGrid: DealItem[] = [
  {
    id: 'wasch-1',
    category: 'Waschmaschinen',
    categorySlug: 'waschmaschinen',
    title: 'SIEMENS WG44B2FCB iQ700 Waschmaschine 9kg 1257 U/Min.',
    price: '699,90€',
    rawPrice: 699.90,
    compareAtPrice: '899,00€',
    discount: '-22%',
    rating: 5,
    ratingScore: '(4.95)',
    image: 'https://res.cloudinary.com/lrknfak7/image/upload/v1794335627/hlg/woocommerce-import/siemens-wg44b2fcb-iq700-waschmaschine-9-kg-1257-umin-a-1.jpg',
    slug: 'siemens-wg44b2fcb-iq700-waschmaschine-9-kg-1257-u-min-a',
    energyRating: 'A',
    deliveryNote: 'Auf Lager • 2-3 Werktage',
    department: 'WASCHEN',
  },
  {
    id: 'wasch-2',
    category: 'Waschtrockner',
    categorySlug: 'waschtrockner',
    title: 'CANDY CBD 485D1E/1-S Waschtrockner 8 kg / 5 kg',
    price: '466,29€',
    rawPrice: 466.29,
    compareAtPrice: '599,00€',
    discount: '-22%',
    rating: 5,
    ratingScore: '(4.80)',
    image: '/images/deals/bestseller-2.jpg',
    slug: 'candy-cbd-485d1e-1-s-waschtrockner-8-kg-5-kg',
    energyRating: 'D',
    deliveryNote: 'Sofort versandfertig',
    department: 'WASCHEN',
  },
  {
    id: 'wasch-3',
    category: 'Waschmaschinen',
    categorySlug: 'waschmaschinen',
    title: 'HAIER HW100-BP14929 I-PRO SERIE 1 Waschmaschine 10kg',
    price: '411,90€',
    rawPrice: 411.90,
    compareAtPrice: '549,00€',
    discount: '-25%',
    rating: 5,
    ratingScore: '(4.88)',
    image: 'https://res.cloudinary.com/lrknfak7/image/upload/v1794335251/hlg/woocommerce-import/haier-hw100-bp14929-i-pro-serie-1-waschmaschine-10-kg-1330-umin-a-1-1.jpg',
    slug: 'haier-hw100-bp14929-i-pro-serie-1-waschmaschine-10-kg-1330-u-min-a-2',
    energyRating: 'A',
    deliveryNote: 'Kostenlose 2-Mann-Lieferung',
    department: 'WASCHEN',
  },
  {
    id: 'wasch-4',
    category: 'Waschmaschinen',
    categorySlug: 'waschmaschinen',
    title: 'GORENJE WNEI94APS Waschmaschine 9kg 1400 U/Min.',
    price: '263,94€',
    rawPrice: 263.94,
    compareAtPrice: '349,00€',
    discount: '-24%',
    rating: 5,
    ratingScore: '(4.70)',
    image: 'https://res.cloudinary.com/lrknfak7/image/upload/v1794335507/hlg/woocommerce-import/gorenje-wnei94aps-waschmaschine-9-kg-1400-umin-a-1.jpg',
    slug: 'gorenje-wnei94aps-waschmaschine-9-kg-1400-u-min-a',
    energyRating: 'A',
    deliveryNote: 'Auf Lager',
    department: 'WASCHEN',
  },
  {
    id: 'wasch-5',
    category: 'Waschmaschinen',
    categorySlug: 'waschmaschinen',
    title: 'MIELE WWE460 WPS PWash&8kg W1 White Edition Waschmaschine',
    price: '996,99€',
    rawPrice: 996.99,
    compareAtPrice: '1 199,00€',
    discount: '-17%',
    rating: 5,
    ratingScore: '(5.00)',
    image: 'https://res.cloudinary.com/lrknfak7/image/upload/v1794335321/hlg/woocommerce-import/miele-wwe460-wps-pwash8kg-w1-white-edition-waschmaschine-8-kg-1400-umin-a-flusenfilter-fremdkoerperfilter-1.jpg',
    slug: 'miele-wwe460-wps-pwash8kg-w1-white-edition-waschmaschine-8-kg-1400-u-min-a-flusenfilter-fremdkoerperfilter',
    energyRating: 'A',
    deliveryNote: 'Premium-Lieferung inklusive',
    department: 'WASCHEN',
  },
  {
    id: 'wasch-6',
    category: 'Waschmaschinen',
    categorySlug: 'waschmaschinen',
    title: 'BOSCH WGB244040 Serie 8 Waschmaschine 9 kg',
    price: '564,70€',
    rawPrice: 564.70,
    compareAtPrice: '729,00€',
    discount: '-23%',
    rating: 5,
    ratingScore: '(4.90)',
    image: 'https://res.cloudinary.com/lrknfak7/image/upload/v1794335423/hlg/woocommerce-import/bosch-wgb244040-serie-8-waschmaschine-9-kg-1257-umin-a-1.jpg',
    slug: 'bosch-wgb244040-serie-8-waschmaschine-9-kg-1257-u-min-a',
    energyRating: 'A',
    deliveryNote: 'Auf Lager • 2-3 Werktage',
    department: 'WASCHEN',
  },
];

// 3. STAUBSAUGER
const saugenSpotlight: DealItem = {
  id: 'saugen-spotlight',
  category: 'Staubsauger & Reiniger',
  categorySlug: 'staubsauger-reiniger',
  title: 'ROBOROCK S8 MAXV ULTRA WEISS MIT ALL-IN-ONE DOCK',
  price: '1 303,80€',
  rawPrice: 1303.80,
  compareAtPrice: '1 740,55€',
  discount: '-25%',
  savings: '436,75€',
  rating: 5,
  ratingScore: '(4.80)',
  image: '/images/deals/deal-2.jpg',
  slug: 'roborock-s8-maxv-ultra-weiss',
  deliveryNote: 'Kostenlose',
  warrantyNote: '2 Jahre',
  department: 'SAUGEN',
};

const saugenGrid: DealItem[] = [
  {
    id: 'saug-1',
    category: 'Staubsauger & Reiniger',
    categorySlug: 'staubsauger-reiniger',
    title: 'TONI HOMI M30 Saugroboter mit Wischfunktion',
    price: '184,80€',
    rawPrice: 184.80,
    compareAtPrice: '249,00€',
    discount: '-26%',
    rating: 5,
    ratingScore: '(4.70)',
    image: 'https://res.cloudinary.com/lrknfak7/image/upload/v1794334346/hlg/woocommerce-import/toni-homi-m30-saugroboter-mit-wischfunktion-1.jpg',
    slug: 'toni-homi-m30-saugroboter-mit-wischfunktion',
    deliveryNote: 'Sofort lieferbar',
    department: 'SAUGEN',
  },
  {
    id: 'saug-2',
    category: 'Staubsauger & Reiniger',
    categorySlug: 'staubsauger-reiniger',
    title: 'ROBOROCK S8 Pro Ultra Saugroboter Schwarz',
    price: '999,00€',
    rawPrice: 999.00,
    compareAtPrice: '1 299,00€',
    discount: '-23%',
    rating: 5,
    ratingScore: '(4.92)',
    image: '/images/deals/deal-2.jpg',
    slug: 'roborock-s8-maxv-ultra-weiss',
    deliveryNote: 'Auf Lager • Expressversand',
    department: 'SAUGEN',
  },
  {
    id: 'saug-3',
    category: 'Staubsauger & Reiniger',
    categorySlug: 'staubsauger-reiniger',
    title: 'DREAME L20 Ultra Complete Saugroboter mit Wischarm',
    price: '899,00€',
    rawPrice: 899.00,
    compareAtPrice: '1 199,00€',
    discount: '-25%',
    rating: 5,
    ratingScore: '(4.85)',
    image: 'https://res.cloudinary.com/lrknfak7/image/upload/v1794334346/hlg/woocommerce-import/toni-homi-m30-saugroboter-mit-wischfunktion-2.jpg',
    slug: 'dreame-l20-ultra-complete',
    deliveryNote: 'Sofort lieferbar',
    department: 'SAUGEN',
  },
  {
    id: 'saug-4',
    category: 'Staubsauger & Reiniger',
    categorySlug: 'staubsauger-reiniger',
    title: 'ROWENTA X-Force Flex 14.60 Akku-Staubsauger',
    price: '329,90€',
    rawPrice: 329.90,
    compareAtPrice: '449,00€',
    discount: '-27%',
    rating: 5,
    ratingScore: '(4.75)',
    image: 'https://res.cloudinary.com/lrknfak7/image/upload/v1794334347/hlg/woocommerce-import/toni-homi-m30-saugroboter-mit-wischfunktion-4.jpg',
    slug: 'rowenta-x-force-flex-14-60',
    deliveryNote: 'Auf Lager • 2-3 Werktage',
    department: 'SAUGEN',
  },
  {
    id: 'saug-5',
    category: 'Staubsauger & Reiniger',
    categorySlug: 'staubsauger-reiniger',
    title: 'DYSON V15 Detect Absolute Akku-Staubsauger',
    price: '649,00€',
    rawPrice: 649.00,
    compareAtPrice: '799,00€',
    discount: '-19%',
    rating: 5,
    ratingScore: '(4.94)',
    image: 'https://res.cloudinary.com/lrknfak7/image/upload/v1794334347/hlg/woocommerce-import/toni-homi-m30-saugroboter-mit-wischfunktion-6.jpg',
    slug: 'dyson-v15-detect-absolute',
    deliveryNote: 'Kostenlose Lieferung',
    department: 'SAUGEN',
  },
  {
    id: 'saug-6',
    category: 'Staubsauger & Reiniger',
    categorySlug: 'staubsauger-reiniger',
    title: 'XIAOMI Robot Vacuum X10+ All-in-One Station',
    price: '499,00€',
    rawPrice: 499.00,
    compareAtPrice: '649,00€',
    discount: '-23%',
    rating: 5,
    ratingScore: '(4.80)',
    image: 'https://res.cloudinary.com/lrknfak7/image/upload/v1794334346/hlg/woocommerce-import/toni-homi-m30-saugroboter-mit-wischfunktion-3.jpg',
    slug: 'xiaomi-robot-vacuum-x10-plus',
    deliveryNote: 'Sofort lieferbar',
    department: 'SAUGEN',
  },
];

// 4. KÜCHENGERÄTE
const kuecheSpotlight: DealItem = {
  id: 'kueche-spotlight',
  category: 'Kaffeemaschinen',
  categorySlug: 'kaffeemaschinen',
  title: 'DELONGHI La Specialista Maestro Cold Brew EC9865.M Espressomaschine Silber/Schwarz',
  price: '1 322,90€',
  rawPrice: 1322.90,
  compareAtPrice: '1 599,00€',
  discount: '-17%',
  savings: '276,10€',
  rating: 5,
  ratingScore: '(5.00)',
  image: '/images/deals/deal-spotlight.jpg',
  slug: 'delonghi-la-specialista-maestro-cold-brew',
  deliveryNote: 'Kostenlose',
  warrantyNote: '2 Jahre',
  department: 'KAFFEE',
};

const kuecheGrid: DealItem[] = [
  {
    id: 'kuech-1',
    category: 'Kleine Haushaltsgeräte',
    categorySlug: 'kuechenmaschinen',
    title: 'KENWOOD Titanium Chef Patissier XL KWL90.594SI',
    price: '729,60€',
    rawPrice: 729.60,
    compareAtPrice: '955,80€',
    discount: '-24%',
    rating: 5,
    ratingScore: '(4.63)',
    image: '/images/deals/deal-4.jpg',
    slug: 'kenwood-titanium-chef-patissier-xl',
    deliveryNote: 'Auf Lager • 2-3 Werktage',
    department: 'KUECHE',
  },
  {
    id: 'kuech-2',
    category: 'Kleine Haushaltsgeräte',
    categorySlug: 'kuechenmaschinen',
    title: 'KENWOOD Titanium Chef Patissier XL mit Zubehör',
    price: '461,90€',
    rawPrice: 461.90,
    compareAtPrice: '749,93€',
    discount: '-38%',
    rating: 5,
    ratingScore: '(4.80)',
    image: '/images/deals/deal-5.jpg',
    slug: 'kenwood-titanium-chef-patissier-xl-zubehoer',
    deliveryNote: 'Auf Lager • 2-3 Werktage',
    department: 'KUECHE',
  },
  {
    id: 'kuech-3',
    category: 'Küchenmaschinen',
    categorySlug: 'kuechenmaschinen',
    title: 'KITCHENAID Artisan Küchenmaschine 4.8L Liebesapfelrot',
    price: '232,82€',
    rawPrice: 232.82,
    compareAtPrice: '349,00€',
    discount: '-33%',
    rating: 5,
    ratingScore: '(5.00)',
    image: '/images/deals/bestseller-5.jpg',
    slug: 'kitchenaid-artisan-rot',
    deliveryNote: 'Sofort lieferbar',
    department: 'KUECHE',
  },
  {
    id: 'kuech-4',
    category: 'Küchenmaschinen',
    categorySlug: 'kuechenmaschinen',
    title: 'KITCHENAID 5KSM175PS Artisan Küchenmaschine Guacamole',
    price: '529,80€',
    rawPrice: 529.80,
    compareAtPrice: '699,00€',
    discount: '-24%',
    rating: 5,
    ratingScore: '(5.00)',
    image: '/images/deals/bestseller-6.jpg',
    slug: 'kitchenaid-artisan-gruen',
    deliveryNote: 'Auf Lager',
    department: 'KUECHE',
  },
  {
    id: 'kuech-5',
    category: 'Kaffeemaschinen',
    categorySlug: 'kaffeemaschinen',
    title: 'JURA E6 (ECS) Kaffeevollautomat Piano White',
    price: '652,70€',
    rawPrice: 652.70,
    compareAtPrice: '849,00€',
    discount: '-23%',
    rating: 5,
    ratingScore: '(4.67)',
    image: '/images/deals/bestseller-4.jpg',
    slug: 'jura-e6-ecs-kaffeevollautomat',
    deliveryNote: 'Kostenlose Lieferung',
    department: 'KUECHE',
  },
  {
    id: 'kuech-6',
    category: 'Herde & Kochfelder',
    categorySlug: 'herde',
    title: 'AEG IKE 64450 XB Induktionskochfeld 60cm',
    price: '350,79€',
    rawPrice: 350.79,
    compareAtPrice: '489,00€',
    discount: '-28%',
    rating: 5,
    ratingScore: '(4.50)',
    image: '/images/deals/bestseller-3.jpg',
    slug: 'aeg-ike-64450-xb-induktionskochfeld',
    energyRating: 'A+',
    deliveryNote: 'Auf Lager • 2-3 Werktage',
    department: 'KUECHE',
  },
];

// 5. KÜHLEN
const kuehlenSpotlight: DealItem = {
  id: 'kuehlen-spotlight',
  category: 'Kühlen & Gefrieren',
  categorySlug: 'kuehlen-gefrieren',
  title: 'HAIER HSR5918DIPB SBS 90 SERIE 5 Side-by-Side Kühl-Gefrierkombination',
  price: '836,89€',
  rawPrice: 836.89,
  compareAtPrice: '1 108,79€',
  discount: '-25%',
  savings: '271,90€',
  rating: 5,
  ratingScore: '(5.00)',
  image: '/images/deals/deal-6.jpg',
  slug: 'haier-hsr5918dipb-sbs-90-serie-5',
  energyRating: 'E',
  deliveryNote: 'Kostenlose',
  warrantyNote: '2 Jahre',
  department: 'KUEHLEN',
};

const kuehlenGrid: DealItem[] = [
  {
    id: 'kuehl-1',
    category: 'Kühlen & Gefrieren',
    categorySlug: 'kuehlen-gefrieren',
    title: 'SAMSUNG RS67A8810S9 Side-by-Side SpaceMax No Frost',
    price: '949,00€',
    rawPrice: 949.00,
    compareAtPrice: '1 299,00€',
    discount: '-27%',
    rating: 5,
    ratingScore: '(4.90)',
    image: '/images/deals/deal-6.jpg',
    slug: 'haier-hsr5918dipb-sbs-90-serie-5',
    energyRating: 'E',
    deliveryNote: 'Kostenlose 2-Mann-Lieferung',
    department: 'KUEHLEN',
  },
  {
    id: 'kuehl-2',
    category: 'Kühlen & Gefrieren',
    categorySlug: 'kuehlen-gefrieren',
    title: 'LIEBHERR CNd 5203 Plus Kühl-Gefrierkombination',
    price: '729,00€',
    rawPrice: 729.00,
    compareAtPrice: '949,00€',
    discount: '-23%',
    rating: 5,
    ratingScore: '(4.95)',
    image: '/images/deals/deal-6.jpg',
    slug: 'haier-hsr5918dipb-sbs-90-serie-5',
    energyRating: 'D',
    deliveryNote: 'Auf Lager • 2-3 Werktage',
    department: 'KUEHLEN',
  },
  {
    id: 'kuehl-3',
    category: 'Kühlen & Gefrieren',
    categorySlug: 'kuehlen-gefrieren',
    title: 'BOSCH KGN39VWEA Serie 4 Kühl-Gefrierkombination',
    price: '569,90€',
    rawPrice: 569.90,
    compareAtPrice: '749,00€',
    discount: '-24%',
    rating: 5,
    ratingScore: '(4.80)',
    image: '/images/deals/deal-6.jpg',
    slug: 'haier-hsr5918dipb-sbs-90-serie-5',
    energyRating: 'E',
    deliveryNote: 'Auf Lager',
    department: 'KUEHLEN',
  },
  {
    id: 'kuehl-4',
    category: 'Kühlen & Gefrieren',
    categorySlug: 'kuehlen-gefrieren',
    title: 'BAUKNECHT KSN 19 A2+ IN Side-by-Side Edelstahl-Optik',
    price: '799,00€',
    rawPrice: 799.00,
    compareAtPrice: '1 099,00€',
    discount: '-27%',
    rating: 5,
    ratingScore: '(4.75)',
    image: '/images/deals/deal-6.jpg',
    slug: 'haier-hsr5918dipb-sbs-90-serie-5',
    energyRating: 'E',
    deliveryNote: 'Kostenlose Lieferung',
    department: 'KUEHLEN',
  },
  {
    id: 'kuehl-5',
    category: 'Kühlen & Gefrieren',
    categorySlug: 'kuehlen-gefrieren',
    title: 'SIEMENS KG39N2LEA iQ300 Kühl-Gefrierkombination',
    price: '589,00€',
    rawPrice: 589.00,
    compareAtPrice: '779,00€',
    discount: '-24%',
    rating: 5,
    ratingScore: '(4.85)',
    image: '/images/deals/deal-6.jpg',
    slug: 'haier-hsr5918dipb-sbs-90-serie-5',
    energyRating: 'E',
    deliveryNote: 'Sofort versandfertig',
    department: 'KUEHLEN',
  },
  {
    id: 'kuehl-6',
    category: 'Kühlen & Gefrieren',
    categorySlug: 'kuehlen-gefrieren',
    title: 'GORENJE NRK6192AXL4 NoFrost Plus Kühlkombination',
    price: '419,90€',
    rawPrice: 419.90,
    compareAtPrice: '549,00€',
    discount: '-24%',
    rating: 5,
    ratingScore: '(4.70)',
    image: '/images/deals/deal-6.jpg',
    slug: 'haier-hsr5918dipb-sbs-90-serie-5',
    energyRating: 'E',
    deliveryNote: 'Auf Lager',
    department: 'KUEHLEN',
  },
];

// 6. GAMING
const gamingSpotlight: DealItem = {
  id: 'gaming-spotlight',
  category: 'Gaming',
  categorySlug: 'gaming',
  title: 'NINTENDO Switch (OLED-Modell) Neon-Rot/Neon-Blau mit 7-Zoll OLED',
  price: '271,90€',
  rawPrice: 271.90,
  compareAtPrice: '350,93€',
  discount: '-23%',
  savings: '79,03€',
  rating: 5,
  ratingScore: '(4.94)',
  image: '/images/deals/deal-3.jpg',
  slug: 'nintendo-switch-oled-modell-neon-rot-neon-blau',
  deliveryNote: 'Kostenlose',
  warrantyNote: '2 Jahre',
  department: 'GAMING',
};

const gamingGrid: DealItem[] = [
  {
    id: 'game-1',
    category: 'Gaming',
    categorySlug: 'gaming',
    title: 'NINTENDO SWITCH LITE GRAU Handheld Konsole',
    price: '211,80€',
    rawPrice: 211.80,
    compareAtPrice: '249,00€',
    discount: '-15%',
    rating: 5,
    ratingScore: '(4.85)',
    image: 'https://res.cloudinary.com/lrknfak7/image/upload/v1794334458/hlg/woocommerce-import/nintendo-switch-lite-grau-1.jpg',
    slug: 'nintendo-switch-lite-grau',
    deliveryNote: 'Sofort lieferbar',
    department: 'GAMING',
  },
  {
    id: 'game-2',
    category: 'Gaming',
    categorySlug: 'gaming',
    title: 'NINTENDO SWITCH GRAU Konsole mit Joy-Con',
    price: '230,92€',
    rawPrice: 230.92,
    compareAtPrice: '289,00€',
    discount: '-20%',
    rating: 5,
    ratingScore: '(4.80)',
    image: 'https://res.cloudinary.com/lrknfak7/image/upload/v1794334454/hlg/woocommerce-import/nintendo-switch-grau-1.jpg',
    slug: 'nintendo-switch-grau',
    deliveryNote: 'Auf Lager • 2-3 Werktage',
    department: 'GAMING',
  },
  {
    id: 'game-3',
    category: 'Gaming',
    categorySlug: 'gaming',
    title: 'NINTENDO Switch Lite Gelb Handheld Edition',
    price: '174,60€',
    rawPrice: 174.60,
    compareAtPrice: '229,00€',
    discount: '-24%',
    rating: 5,
    ratingScore: '(4.78)',
    image: 'https://res.cloudinary.com/lrknfak7/image/upload/v1794334437/hlg/woocommerce-import/nintendo-switch-lite-gelb-1.jpg',
    slug: 'nintendo-switch-lite-gelb',
    deliveryNote: 'Sofort lieferbar',
    department: 'GAMING',
  },
  {
    id: 'game-4',
    category: 'Gaming',
    categorySlug: 'gaming',
    title: 'SONY PLAYSTATION 4 1 TB PRO BLACK Standalone Konsole',
    price: '214,99€',
    rawPrice: 214.99,
    compareAtPrice: '299,00€',
    discount: '-28%',
    rating: 5,
    ratingScore: '(4.70)',
    image: 'https://res.cloudinary.com/lrknfak7/image/upload/v1794334532/hlg/woocommerce-import/asset-mp-107802474.jpg',
    slug: 'sony-playstation-4-1-tb-pro-black-standalone',
    deliveryNote: 'Auf Lager',
    department: 'GAMING',
  },
  {
    id: 'game-5',
    category: 'Gaming',
    categorySlug: 'gaming',
    title: 'PLAYSTATION 5 DualSense Wireless-Controller Midnight Black',
    price: '59,99€',
    rawPrice: 59.99,
    compareAtPrice: '74,99€',
    discount: '-20%',
    rating: 5,
    ratingScore: '(4.92)',
    image: '/images/deals/deal-3.jpg',
    slug: 'nintendo-switch-oled-modell-neon-rot-neon-blau',
    deliveryNote: 'Sofort lieferbar',
    department: 'GAMING',
  },
  {
    id: 'game-6',
    category: 'Gaming',
    categorySlug: 'gaming',
    title: 'NINTENDO Switch Pro Controller Schwarz Wireless',
    price: '54,90€',
    rawPrice: 54.90,
    compareAtPrice: '69,99€',
    discount: '-22%',
    rating: 5,
    ratingScore: '(4.88)',
    image: '/images/deals/deal-3.jpg',
    slug: 'nintendo-switch-oled-modell-neon-rot-neon-blau',
    deliveryNote: 'Auf Lager',
    department: 'GAMING',
  },
];

// Fallback Bestsellers from capture without rank numbering
const defaultBestsellersList: BestsellerItem[] = [
  {
    id: 'bs-1',
    title: 'BAUKNECHT Waschmaschine Frontlader 8kg',
    price: '319,80€',
    rawPrice: 319.80,
    image: '/images/deals/bestseller-1.jpg',
    slug: 'bauknecht-waschmaschine-frontlader-8kg',
    energyRating: 'A',
    rating: 5,
    ratingScore: '(5.00)',
  },
  {
    id: 'bs-2',
    title: 'CANDY CBD 485D1E/1-S Waschtrockner',
    price: '466,29€',
    rawPrice: 466.29,
    image: '/images/deals/bestseller-2.jpg',
    slug: 'candy-cbd-485d1e-1-s-waschtrockner-8-kg-5-kg',
    energyRating: 'D',
    rating: 5,
    ratingScore: '(4.80)',
  },
  {
    id: 'bs-3',
    title: 'AEG IKE 64450 XB Induktionskochfeld 60cm',
    price: '350,79€',
    rawPrice: 350.79,
    rating: 5,
    ratingScore: '(4.50)',
    image: '/images/deals/bestseller-3.jpg',
    slug: 'aeg-ike-64450-xb-induktionskochfeld',
    energyRating: 'A+',
  },
  {
    id: 'bs-4',
    title: 'JURA E6 (ECS) Kaffeevollautomat Piano White',
    price: '652,70€',
    rawPrice: 652.70,
    rating: 5,
    ratingScore: '(4.67)',
    image: '/images/deals/bestseller-4.jpg',
    slug: 'jura-e6-ecs-kaffeevollautomat',
  },
  {
    id: 'bs-5',
    title: 'KITCHENAID Artisan Küchenmaschine 4.8L Liebesapfelrot',
    price: '232,82€',
    rawPrice: 232.82,
    rating: 5,
    ratingScore: '(5.00)',
    image: '/images/deals/bestseller-5.jpg',
    slug: 'kitchenaid-artisan-rot',
  },
  {
    id: 'bs-6',
    title: 'KITCHENAID 5KSM175PS Artisan Küchenmaschine Guacamole',
    price: '529,80€',
    rawPrice: 529.80,
    rating: 5,
    ratingScore: '(5.00)',
    image: '/images/deals/bestseller-6.jpg',
    slug: 'kitchenaid-artisan-gruen',
  },
];

interface AktuelleAngeboteProps {
  dbBestsellers?: BestsellerItem[];
  config?: any;
}

export default function AktuelleAngebote({ dbBestsellers, config }: AktuelleAngeboteProps) {
  const wishlistStore = useWishlistStore();
  const cartStore = useCartStore();
  const [filterDepartment, setFilterDepartment] = useState<string>('ALL');
  const [quickViewProduct, setQuickViewProduct] = useState<DealItem | null>(null);

  // Live Countdown Timer for Deal of the Day (counts down to midnight)
  const [timeLeft, setTimeLeft] = useState<{ hours: string; minutes: string; seconds: string }>({
    hours: '08',
    minutes: '35',
    seconds: '12',
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const diff = Math.max(0, endOfDay.getTime() - now.getTime());
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0'),
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleWishlist = (e: React.MouseEvent, item: any) => {
    e.preventDefault();
    e.stopPropagation();
    wishlistStore.toggleItem(item.id);
    const isNowInWishlist = wishlistStore.hasItem(item.id);
    toast.success(isNowInWishlist ? 'Aus Favoriten entfernt' : 'Zu Favoriten hinzugefügt');
  };

  const handleAddToCart = (e: React.MouseEvent, item: any) => {
    e.preventDefault();
    e.stopPropagation();
    cartStore.addItem({
      id: item.id,
      productId: item.id,
      title: item.title,
      price: item.rawPrice || 0,
      image: item.image,
      quantity: 1,
    });
    cartStore.setIsOpen(true);
    toast.success('In den Warenkorb gelegt');
  };

  const handleOpenQuickView = (e: React.MouseEvent, item: DealItem) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewProduct(item);
  };

  // Combine DB detected bestsellers with capture bestsellers (NO RANK NUMBERING)
  const bestsellers = (dbBestsellers && dbBestsellers.length > 0)
    ? dbBestsellers.slice(0, 6)
    : defaultBestsellersList;

  // Custom Alle Angebote from config if defined by user
  const customAlleSpotlight: DealItem = config?.spotlight ? {
    id: 'deal-spotlight-custom',
    category: config.spotlight.category || defaultAlleSpotlight.category,
    categorySlug: 'angebote',
    title: config.spotlight.title || defaultAlleSpotlight.title,
    price: config.spotlight.price || defaultAlleSpotlight.price,
    rawPrice: config.spotlight.rawPrice || parseFloat(String(config.spotlight.price || '0').replace(/[^0-9,.]/g, '').replace(',', '.')) || defaultAlleSpotlight.rawPrice,
    compareAtPrice: config.spotlight.compareAtPrice || defaultAlleSpotlight.compareAtPrice,
    discount: config.spotlight.discount || defaultAlleSpotlight.discount,
    savings: config.spotlight.savings || defaultAlleSpotlight.savings,
    rating: 5,
    ratingScore: '(5.00)',
    image: config.spotlight.image || defaultAlleSpotlight.image,
    slug: config.spotlight.slug || defaultAlleSpotlight.slug,
    deliveryNote: config.spotlight.deliveryNote || 'Kostenlose',
    warrantyNote: config.spotlight.warrantyNote || '2 Jahre',
    department: 'KAFFEE',
  } : defaultAlleSpotlight;

  const customAlleGrid: DealItem[] = (Array.isArray(config?.deals) && config.deals.length === 6)
    ? config.deals.map((d: any, idx: number) => ({
        id: `deal-custom-${idx}`,
        category: d.category || defaultAlleGrid[idx].category,
        categorySlug: defaultAlleGrid[idx].categorySlug,
        title: d.title || defaultAlleGrid[idx].title,
        price: d.price || defaultAlleGrid[idx].price,
        rawPrice: d.rawPrice || parseFloat(String(d.price || '0').replace(/[^0-9,.]/g, '').replace(',', '.')) || defaultAlleGrid[idx].rawPrice,
        compareAtPrice: d.compareAtPrice || defaultAlleGrid[idx].compareAtPrice,
        discount: d.discount || defaultAlleGrid[idx].discount,
        rating: 5,
        ratingScore: defaultAlleGrid[idx].ratingScore,
        image: d.image || defaultAlleGrid[idx].image,
        slug: d.slug || defaultAlleGrid[idx].slug,
        energyRating: d.energyRating || defaultAlleGrid[idx].energyRating,
        deliveryNote: d.deliveryNote || defaultAlleGrid[idx].deliveryNote,
        department: defaultAlleGrid[idx].department,
      }))
    : defaultAlleGrid;

  // Resolve active Spotlight Card and 6 Small Cards based on selected pill
  let currentSpotlight: DealItem = customAlleSpotlight;
  let currentGrid: DealItem[] = customAlleGrid;

  if (filterDepartment === 'WASCHEN') {
    currentSpotlight = waschenSpotlight;
    currentGrid = waschenGrid;
  } else if (filterDepartment === 'SAUGEN') {
    currentSpotlight = saugenSpotlight;
    currentGrid = saugenGrid;
  } else if (filterDepartment === 'KUECHE') {
    currentSpotlight = kuecheSpotlight;
    currentGrid = kuecheGrid;
  } else if (filterDepartment === 'KUEHLEN') {
    currentSpotlight = kuehlenSpotlight;
    currentGrid = kuehlenGrid;
  } else if (filterDepartment === 'GAMING') {
    currentSpotlight = gamingSpotlight;
    currentGrid = gamingGrid;
  }

  const filterTabs = [
    { key: 'ALL', label: 'Alle Angebote' },
    { key: 'WASCHEN', label: 'Waschen & Trocknen' },
    { key: 'SAUGEN', label: 'Staubsauger' },
    { key: 'KUECHE', label: 'Küchengeräte' },
    { key: 'KUEHLEN', label: 'Kühlen' },
    { key: 'GAMING', label: 'Gaming' },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* 1. LEFT SIDEBAR: "Bestseller" without rank numbering */}
        <div className="hidden lg:block lg:col-span-3">
          <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-4 sm:p-5">
            {/* Header with Green Indicator */}
            <div className="mb-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-stone-900 tracking-tight">
                  Bestseller
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#107b46] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80">
                  Top-Charts
                </span>
              </div>
              <div className="w-8 h-0.5 bg-[#107b46] rounded-full mt-1.5" />
            </div>

            {/* Bestseller Vertical List (NO RANK NUMBERING) */}
            <div className="divide-y divide-stone-100">
              {bestsellers.map((item) => (
                <Link
                  key={item.id}
                  href={`/produkt/${item.slug}`}
                  className="group flex items-center gap-3 py-2.5 hover:bg-stone-50/80 rounded-xl px-1.5 transition-colors relative"
                >
                  {/* Thumbnail Box */}
                  <div className="w-11 h-11 rounded-lg border border-stone-200/80 bg-white p-1 flex items-center justify-center shrink-0 overflow-hidden group-hover:border-emerald-300 transition-colors">
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={44}
                      height={44}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-extrabold text-stone-900 leading-tight">
                        {item.price}
                      </span>
                      {item.energyRating && <EnergyBadge rating={item.energyRating} />}
                    </div>

                    {item.rating && (
                      <div className="flex items-center gap-1 my-0.5">
                        <div className="flex text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <svg key={s} className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        {item.ratingScore && (
                          <span className="text-[9px] text-stone-400 font-medium">
                            {item.ratingScore}
                          </span>
                        )}
                      </div>
                    )}

                    <h4 className="text-[11px] font-semibold text-stone-600 truncate group-hover:text-[#107b46] transition-colors">
                      {item.title}
                    </h4>
                  </div>

                  {/* Subtle hover arrow */}
                  <span className="text-stone-300 group-hover:text-[#107b46] text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    &rarr;
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* 2. RIGHT MAIN AREA: "Aktuelle Angebote" */}
        <div className="lg:col-span-9">
          {/* Header with Title and Filter Tabs */}
          <div className="border-b border-stone-200/90 pb-3 mb-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
                  <span>Aktuelle Angebote</span>
                  <span className="text-xs font-bold text-white bg-[#dc2626] px-2 py-0.5 rounded-full shadow-xs">
                    % SALE
                  </span>
                </h2>
                <div className="w-12 h-1 bg-[#107b46] rounded-full mt-1.5" />
              </div>

              <Link
                href="/shop?sale=true"
                className="text-xs sm:text-sm font-bold text-[#107b46] hover:underline flex items-center gap-1 group pb-0.5 ml-auto"
              >
                <span>Alle Angebote ansehen</span>
                <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
              </Link>
            </div>

            {/* Quick Department Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-3 pb-0.5 no-scrollbar">
              {filterTabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setFilterDepartment(tab.key)}
                  className={`text-[11px] font-bold px-3 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                    filterDepartment === tab.key
                      ? 'bg-[#107b46] text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid Layout: Left Spotlight Card (40%) + Right 2x3 Cards Grid (60%) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
            
            {/* Spotlight Card: Always shows a hero product for the active tab */}
            <div className="md:col-span-5 bg-white rounded-2xl border-2 border-stone-200/90 hover:border-[#107b46]/50 p-5 sm:p-6 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group relative">
              
              {/* Header Badges: DEAL DES TAGES + Live Countdown */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 bg-[#dc2626] text-white text-[10px] sm:text-[11px] font-black px-2.5 py-1 rounded-full shadow-xs uppercase tracking-wide">
                  <span className="animate-pulse">🔥</span>
                  <span>DEAL DES TAGES</span>
                </span>

                {/* Countdown Timer */}
                <div className="flex items-center gap-1 bg-stone-100 text-stone-800 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md font-mono" title="Angebot endet um Mitternacht">
                  <span className="text-stone-400">⏳</span>
                  <span>{timeLeft.hours}:{timeLeft.minutes}:{timeLeft.seconds}</span>
                </div>
              </div>

              {/* Wishlist Button (Floating) */}
              <button
                type="button"
                onClick={(e) => handleToggleWishlist(e, currentSpotlight)}
                className={`absolute top-4 right-4 z-10 w-8 h-8 rounded-full border flex items-center justify-center shadow-xs transition-colors cursor-pointer ${
                  wishlistStore.hasItem(currentSpotlight.id)
                    ? 'bg-red-50 border-red-200 text-red-500'
                    : 'bg-white/95 border-stone-200 text-stone-400 hover:text-red-500 hover:border-red-200'
                }`}
                title="Zu Favoriten hinzufügen"
              >
                <svg className={`w-4 h-4 ${wishlistStore.hasItem(currentSpotlight.id) ? 'fill-red-500 stroke-red-500' : 'fill-none stroke-current'}`} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>

              <Link href={`/produkt/${currentSpotlight.slug}`} className="flex-1 flex flex-col items-center">
                {/* Big Center Product Image */}
                <div className="relative w-full aspect-square max-h-[280px] mb-3 flex items-center justify-center overflow-hidden">
                  <Image
                    src={currentSpotlight.image}
                    alt={currentSpotlight.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                    priority
                  />
                </div>

                {/* Category */}
                <span className="text-[11px] font-bold text-stone-400 tracking-wider uppercase mb-1 block">
                  {currentSpotlight.category}
                </span>

                {/* Title */}
                <h3 className="text-sm sm:text-base font-extrabold text-stone-900 text-center leading-snug group-hover:text-[#107b46] transition-colors line-clamp-2 px-1">
                  {currentSpotlight.title}
                </h3>

                {/* Stars Rating */}
                <div className="mt-2">
                  <StarRating score={currentSpotlight.ratingScore} />
                </div>

                {/* Pricing & Savings Block */}
                <div className="flex flex-col items-center mt-2.5">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                      {currentSpotlight.price}
                    </span>
                    {currentSpotlight.compareAtPrice && (
                      <span className="text-xs sm:text-sm text-stone-400 line-through">
                        {currentSpotlight.compareAtPrice}
                      </span>
                    )}
                    {currentSpotlight.discount && (
                      <span className="bg-[#dc2626] text-white text-[11px] font-black px-1.5 py-0.5 rounded shadow-2xs">
                        {currentSpotlight.discount}
                      </span>
                    )}
                  </div>
                  {currentSpotlight.savings && (
                    <span className="text-[11px] font-bold text-[#107b46] mt-0.5">
                      Sie sparen {currentSpotlight.savings}
                    </span>
                  )}
                </div>

                {/* REPLACED BADGE: Truck Icon + Kostenlose & Shield Icon + 2 Jahre */}
                <div className="flex items-center gap-2 mt-3">
                  {/* Truck Icon + Kostenlose */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs font-bold shadow-2xs">
                    <svg className="w-4 h-4 text-[#107b46] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8h4.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h2" />
                    </svg>
                    <span>{currentSpotlight.deliveryNote || 'Kostenlose'}</span>
                  </div>

                  {/* Shield Icon + 2 Jahre */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs font-bold shadow-2xs">
                    <svg className="w-4 h-4 text-[#107b46] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>{currentSpotlight.warrantyNote || '2 Jahre'}</span>
                  </div>
                </div>
              </Link>

              {/* Big CTA Button: In den Warenkorb */}
              <button
                type="button"
                onClick={(e) => handleAddToCart(e, currentSpotlight)}
                className="w-full mt-4 bg-stone-900 hover:bg-[#107b46] text-white font-bold text-xs sm:text-sm py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span>In den Warenkorb</span>
              </button>
            </div>

            {/* Right 2x3 Grid of 6 Deals: NO "In den Korb" text button; Cart Icon + Quick View Icon directly on card */}
            <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {currentGrid.map((deal) => (
                <div
                  key={deal.id}
                  className="bg-white rounded-2xl border border-stone-200/80 p-3 hover:shadow-lg hover:border-emerald-300 transition-all flex flex-col justify-between group relative"
                >
                  {/* Top Header: Category Name + Energy Badge */}
                  <div className="flex items-center justify-between gap-1.5 mb-1 pr-14">
                    <span className="text-[11px] font-bold text-stone-500 uppercase tracking-tight truncate" title={deal.category}>
                      {deal.category}
                    </span>
                    {deal.energyRating && <EnergyBadge rating={deal.energyRating} />}
                  </div>

                  {/* Top Right Floating Action Icons: Wishlist + Quick View */}
                  <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1">
                    {/* Quick View Eye Icon */}
                    <button
                      type="button"
                      onClick={(e) => handleOpenQuickView(e, deal)}
                      className="w-6 h-6 rounded-full flex items-center justify-center transition-colors cursor-pointer text-stone-400 hover:text-[#107b46] bg-white/90 border border-stone-200/80 shadow-2xs hover:border-[#107b46]"
                      title="Schnellansicht"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>

                    {/* Wishlist Heart Icon */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleWishlist(e, deal)}
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors cursor-pointer border shadow-2xs ${
                        wishlistStore.hasItem(deal.id)
                          ? 'text-red-500 bg-red-50 border-red-200'
                          : 'text-stone-300 hover:text-red-500 bg-white/90 border-stone-200/80'
                      }`}
                      title="Zu Favoriten hinzufügen"
                    >
                      <svg className={`w-3.5 h-3.5 ${wishlistStore.hasItem(deal.id) ? 'fill-red-500 stroke-red-500' : 'fill-none stroke-current'}`} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>

                  {/* Thumbnail Image */}
                  <Link
                    href={`/produkt/${deal.slug}`}
                    className="relative aspect-square w-full max-h-[115px] my-1 flex items-center justify-center overflow-hidden"
                  >
                    <Image
                      src={deal.image}
                      alt={deal.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 200px"
                      className="object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>

                  {/* Pricing + Cart Icon on Card */}
                  <div className="mt-1 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Price Row + Integrated Cart Button */}
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-baseline gap-1.5 flex-wrap">
                          <span className="text-sm font-black text-stone-900 leading-tight">
                            {deal.price}
                          </span>
                          {deal.compareAtPrice && (
                            <span className="text-[10px] text-stone-400 line-through leading-tight">
                              {deal.compareAtPrice}
                            </span>
                          )}
                          {deal.discount && (
                            <span className="bg-[#dc2626] text-white text-[9px] font-black px-1.5 py-0.2 rounded shadow-2xs">
                              {deal.discount}
                            </span>
                          )}
                        </div>

                        {/* Cart Icon Button directly on the card */}
                        <button
                          type="button"
                          onClick={(e) => handleAddToCart(e, deal)}
                          className="w-7 h-7 rounded-lg bg-emerald-50 hover:bg-[#107b46] text-[#107b46] hover:text-white border border-emerald-200/80 hover:border-transparent flex items-center justify-center transition-all shadow-2xs cursor-pointer shrink-0"
                          title="In den Warenkorb"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                        </button>
                      </div>

                      {/* Star Rating */}
                      <div className="mt-1">
                        <StarRating score={deal.ratingScore} />
                      </div>

                      {/* Product Title */}
                      <Link href={`/produkt/${deal.slug}`}>
                        <h4 className="text-xs font-bold text-stone-800 line-clamp-2 mt-1 leading-snug group-hover:text-[#107b46] transition-colors" title={deal.title}>
                          {deal.title}
                        </h4>
                      </Link>
                    </div>

                    {/* Stock / Delivery Reassurance */}
                    {deal.deliveryNote && (
                      <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                        <span className="truncate" title={deal.deliveryNote}>{deal.deliveryNote}</span>
                      </div>
                    )}
                  </div>

                </div>
              ))}
            </div>

          </div>
        </div>

      </div>

      {/* QUICK VIEW MODAL */}
      {quickViewProduct && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setQuickViewProduct(null)}
          />

          {/* Modal Container */}
          <div 
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row z-10 border border-stone-200 animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              type="button"
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-3 right-3 p-1.5 bg-stone-100 hover:bg-stone-200 rounded-full text-stone-700 z-20 transition cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Left: Product Image */}
            <div className="w-full md:w-1/2 bg-stone-50 p-6 flex items-center justify-center relative">
              <div className="relative w-full aspect-square max-h-[260px]">
                <Image
                  src={quickViewProduct.image}
                  alt={quickViewProduct.title}
                  fill
                  className="object-contain p-2"
                />
              </div>
            </div>

            {/* Right: Details & Add to Cart */}
            <div className="w-full md:w-1/2 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                    {quickViewProduct.category}
                  </span>
                  {quickViewProduct.energyRating && <EnergyBadge rating={quickViewProduct.energyRating} />}
                </div>

                <h3 className="text-base font-extrabold text-stone-900 leading-snug mb-2">
                  {quickViewProduct.title}
                </h3>

                <div className="mb-3">
                  <StarRating score={quickViewProduct.ratingScore} />
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-2xl font-black text-stone-900">
                    {quickViewProduct.price}
                  </span>
                  {quickViewProduct.compareAtPrice && (
                    <span className="text-sm text-stone-400 line-through">
                      {quickViewProduct.compareAtPrice}
                    </span>
                  )}
                  {quickViewProduct.discount && (
                    <span className="bg-[#dc2626] text-white text-xs font-black px-2 py-0.5 rounded shadow-2xs">
                      {quickViewProduct.discount}
                    </span>
                  )}
                </div>

                {/* Delivery details */}
                {quickViewProduct.deliveryNote && (
                  <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 text-xs font-semibold text-emerald-800 flex items-center gap-2 mb-4">
                    <span className="w-2 h-2 rounded-full bg-[#107b46] animate-pulse shrink-0" />
                    <span>{quickViewProduct.deliveryNote}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={(e) => {
                    handleAddToCart(e, quickViewProduct);
                    setQuickViewProduct(null);
                  }}
                  className="w-full py-3 bg-[#107b46] hover:bg-[#0d693b] text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span>In den Warenkorb</span>
                </button>

                <Link
                  href={`/produkt/${quickViewProduct.slug}`}
                  onClick={() => setQuickViewProduct(null)}
                  className="w-full py-2 text-stone-600 hover:text-stone-900 font-bold text-xs text-center block transition-colors"
                >
                  Vollständige Produktdetails ansehen &rarr;
                </Link>
              </div>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}
