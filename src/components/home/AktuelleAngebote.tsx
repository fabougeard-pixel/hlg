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

// 6 Exact Deals from the capture
const captureDealsGrid: DealItem[] = [
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
    deliveryNote: 'Sofort lieferbar • Kostenloser Versand',
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

// Fallback Bestsellers from capture if none from DB
const defaultBestsellersList: BestsellerItem[] = [
  {
    id: 'bs-1',
    title: 'BAUKNECHT Waschmaschine Frontlader 8kg',
    price: '319,80€',
    rawPrice: 319.80,
    image: '/images/deals/bestseller-1.jpg',
    slug: 'bauknecht-waschmaschine-frontlader-8kg',
    energyRating: 'A',
    rank: 1,
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
    rank: 2,
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
    rank: 3,
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
    rank: 4,
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
    rank: 5,
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
    rank: 6,
  },
];

// Spotlight Deal from capture with all discount & timer data
const spotlightDeal: DealItem = {
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
  deliveryNote: 'Kostenloser Express-Versand',
  department: 'KAFFEE',
};

export default function AktuelleAngebote({ dbBestsellers }: { dbBestsellers?: BestsellerItem[] }) {
  const wishlistStore = useWishlistStore();
  const cartStore = useCartStore();
  const [recentlyAdded, setRecentlyAdded] = useState<Record<string, boolean>>({});
  const [filterDepartment, setFilterDepartment] = useState<string>('ALL');

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
      price: item.rawPrice,
      image: item.image,
      quantity: 1,
    });
    setRecentlyAdded(prev => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setRecentlyAdded(prev => ({ ...prev, [item.id]: false }));
    }, 1800);
    cartStore.setIsOpen(true);
    toast.success('In den Warenkorb gelegt');
  };

  // Combine DB detected bestsellers with capture bestsellers
  const bestsellers = (dbBestsellers && dbBestsellers.length > 0)
    ? dbBestsellers.slice(0, 6).map((item, idx) => ({ ...item, rank: idx + 1 }))
    : defaultBestsellersList;

  // Filter deals by selected department
  const filteredDeals = filterDepartment === 'ALL'
    ? captureDealsGrid
    : captureDealsGrid.filter(d => d.department === filterDepartment);

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
        
        {/* 1. LEFT SIDEBAR: "Bestseller" with Dynamic Detection and Rank Badges */}
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

            {/* Bestseller Vertical List */}
            <div className="divide-y divide-stone-100">
              {bestsellers.map((item, idx) => {
                const rank = item.rank || (idx + 1);
                const rankStyles = rank === 1
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-stone-900 shadow-xs'
                  : rank === 2
                    ? 'bg-gradient-to-r from-stone-300 to-stone-400 text-stone-900'
                    : rank === 3
                      ? 'bg-gradient-to-r from-amber-700 to-amber-800 text-white'
                      : 'bg-stone-100 text-stone-600';

                return (
                  <Link
                    key={item.id}
                    href={`/produkt/${item.slug}`}
                    className="group flex items-center gap-3 py-2.5 hover:bg-stone-50/80 rounded-xl px-1.5 transition-colors relative"
                  >
                    {/* Rank Pill */}
                    <span className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 ${rankStyles}`}>
                      {rank}
                    </span>

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
                );
              })}
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
            
            {/* Spotlight Card: De'Longhi La Specialista Maestro */}
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
                onClick={(e) => handleToggleWishlist(e, spotlightDeal)}
                className={`absolute top-4 right-4 z-10 w-8 h-8 rounded-full border flex items-center justify-center shadow-xs transition-colors cursor-pointer ${
                  wishlistStore.hasItem(spotlightDeal.id)
                    ? 'bg-red-50 border-red-200 text-red-500'
                    : 'bg-white/95 border-stone-200 text-stone-400 hover:text-red-500 hover:border-red-200'
                }`}
                title="Zu Favoriten hinzufügen"
              >
                <svg className={`w-4 h-4 ${wishlistStore.hasItem(spotlightDeal.id) ? 'fill-red-500 stroke-red-500' : 'fill-none stroke-current'}`} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>

              <Link href={`/produkt/${spotlightDeal.slug}`} className="flex-1 flex flex-col items-center">
                {/* Big Center Product Image */}
                <div className="relative w-full aspect-square max-h-[280px] mb-3 flex items-center justify-center overflow-hidden">
                  <Image
                    src={spotlightDeal.image}
                    alt={spotlightDeal.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                    priority
                  />
                </div>

                {/* Category */}
                <span className="text-[11px] font-bold text-stone-400 tracking-wider uppercase mb-1 block">
                  {spotlightDeal.category}
                </span>

                {/* Title */}
                <h3 className="text-sm sm:text-base font-extrabold text-stone-900 text-center leading-snug group-hover:text-[#107b46] transition-colors line-clamp-2 px-1">
                  {spotlightDeal.title}
                </h3>

                {/* Stars Rating */}
                <div className="mt-2">
                  <StarRating score={spotlightDeal.ratingScore} />
                </div>

                {/* Pricing & Savings Block (Prominent discount) */}
                <div className="flex flex-col items-center mt-2.5">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                      {spotlightDeal.price}
                    </span>
                    <span className="text-xs sm:text-sm text-stone-400 line-through">
                      {spotlightDeal.compareAtPrice}
                    </span>
                    <span className="bg-[#dc2626] text-white text-[11px] font-black px-1.5 py-0.5 rounded shadow-2xs">
                      {spotlightDeal.discount}
                    </span>
                  </div>
                  {spotlightDeal.savings && (
                    <span className="text-[11px] font-bold text-[#107b46] mt-0.5">
                      Sie sparen {spotlightDeal.savings}
                    </span>
                  )}
                </div>

                {/* Stock & Delivery Reassurance */}
                {spotlightDeal.deliveryNote && (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50/90 px-3 py-1 rounded-full mt-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#107b46] animate-pulse" />
                    <span>{spotlightDeal.deliveryNote}</span>
                    <span className="text-stone-300">•</span>
                    <span>2 Jahre Garantie</span>
                  </div>
                )}
              </Link>

              {/* Action Button */}
              <button
                type="button"
                onClick={(e) => handleAddToCart(e, spotlightDeal)}
                className={`w-full mt-4 text-white font-bold text-xs sm:text-sm py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                  recentlyAdded[spotlightDeal.id]
                    ? 'bg-[#107b46]'
                    : 'bg-stone-900 hover:bg-[#107b46]'
                }`}
              >
                {recentlyAdded[spotlightDeal.id] ? (
                  <>
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>✓ In den Warenkorb gelegt!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span>In den Warenkorb</span>
                  </>
                )}
              </button>
            </div>

            {/* Right 2x3 Grid of 6 Deals (Clean without truncation) */}
            <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredDeals.map((deal) => (
                <div
                  key={deal.id}
                  className="bg-white rounded-2xl border border-stone-200/80 p-3 hover:shadow-lg hover:border-emerald-300 transition-all flex flex-col justify-between group relative"
                >
                  {/* Top Header: Full Category Name + Energy Badge */}
                  <div className="flex items-center justify-between gap-1.5 mb-1 pr-7">
                    <span className="text-[11px] font-bold text-stone-500 uppercase tracking-tight truncate" title={deal.category}>
                      {deal.category}
                    </span>
                    {deal.energyRating && <EnergyBadge rating={deal.energyRating} />}
                  </div>

                  {/* Floating Wishlist Button */}
                  <button
                    type="button"
                    onClick={(e) => handleToggleWishlist(e, deal)}
                    className={`absolute top-2.5 right-2.5 z-10 w-6 h-6 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                      wishlistStore.hasItem(deal.id)
                        ? 'text-red-500 bg-red-50'
                        : 'text-stone-300 hover:text-red-500 bg-white/80'
                    }`}
                    title="Favorit"
                  >
                    <svg className={`w-3.5 h-3.5 ${wishlistStore.hasItem(deal.id) ? 'fill-red-500 stroke-red-500' : 'fill-none stroke-current'}`} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>

                  {/* Thumbnail */}
                  <Link
                    href={`/produkt/${deal.slug}`}
                    className="relative aspect-square w-full max-h-[110px] my-1.5 flex items-center justify-center overflow-hidden"
                  >
                    <Image
                      src={deal.image}
                      alt={deal.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 200px"
                      className="object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>

                  {/* Pricing + Red Discount Tag */}
                  <div className="mt-1">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="text-sm font-black text-stone-900 leading-tight">
                        {deal.price}
                      </span>
                      <span className="text-[10px] text-stone-400 line-through leading-tight">
                        {deal.compareAtPrice}
                      </span>
                      <span className="bg-[#dc2626] text-white text-[9px] font-black px-1.5 py-0.2 rounded shadow-2xs">
                        {deal.discount}
                      </span>
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

                    {/* Stock / Delivery Reassurance */}
                    {deal.deliveryNote && (
                      <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                        <span className="truncate" title={deal.deliveryNote}>{deal.deliveryNote}</span>
                      </div>
                    )}
                  </div>

                  {/* Quick Add to Cart Button */}
                  <div className="mt-2 pt-2 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(e, deal)}
                      className={`w-full text-center text-xs font-bold py-1.5 rounded-lg border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        recentlyAdded[deal.id]
                          ? 'bg-[#107b46] text-white border-transparent'
                          : 'text-stone-700 hover:text-white hover:bg-[#107b46] border-stone-200 hover:border-transparent'
                      }`}
                    >
                      {recentlyAdded[deal.id] ? (
                        <>
                          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>✓ Im Korb</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                          <span>In den Korb</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
