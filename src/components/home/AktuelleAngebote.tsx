'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';
import {
  BestsellerItem,
  DealItem,
  TabFilterKey,
  ANGEBOTE_FILTER_TABS,
  DEFAULT_BESTSELLERS,
  resolveTabOffers,
} from './aktuelleAngeboteData';

export type { BestsellerItem, DealItem };

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
      {score && <span className="text-[10px] text-stone-400 font-medium">{score}</span>}
    </div>
  );
}

function ProductImageBox({
  src,
  alt,
  sizes,
  priority = false,
  className = '',
}: {
  src?: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  if (!src) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-stone-50 text-stone-300 rounded-xl">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      quality={90}
      priority={priority}
      className={className}
    />
  );
}

interface AktuelleAngeboteProps {
  dbBestsellers?: BestsellerItem[];
  config?: any;
}

export default function AktuelleAngebote({ dbBestsellers, config }: AktuelleAngeboteProps) {
  const wishlistStore = useWishlistStore();
  const cartStore = useCartStore();
  const [filterDepartment, setFilterDepartment] = useState<TabFilterKey>('ALL');
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
      image: item.image || '',
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

  // Design overrides
  const design = config?.design || {};
  const accentColor = design.accentColor || '#107b46';
  const saleColor = design.saleColor || '#dc2626';
  const sectionTitle = config?.sectionTitle || 'Aktuelle Angebote';
  const spotlightBadgeText = config?.spotlightBadgeText || 'DEAL DES TAGES';
  const cardRadius = design.cardRadius !== undefined ? Number(design.cardRadius) : 16;

  // Bestsellers without rank numbering
  const bestsellers =
    dbBestsellers && dbBestsellers.length > 0 ? dbBestsellers.slice(0, 6) : DEFAULT_BESTSELLERS;

  // Resolve current pill's spotlight + 6 grid products (respecting manual admin overrides)
  const { spotlight: currentSpotlight, deals: currentGrid } = resolveTabOffers(
    filterDepartment,
    config
  );

  return (
    <section
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans"
      style={{ backgroundColor: design.sectionBg || 'transparent' }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 1. LEFT SIDEBAR: "Bestseller" without rank numbering */}
        <div className="hidden lg:block lg:col-span-3">
          <div
            className="bg-white border border-stone-200/90 shadow-sm p-4 sm:p-5"
            style={{ borderRadius: `${cardRadius}px` }}
          >
            {/* Header with Accent Indicator */}
            <div className="mb-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-stone-900 tracking-tight">
                  Bestseller
                </h3>
                <span
                  className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80"
                  style={{ color: accentColor }}
                >
                  Top-Charts
                </span>
              </div>
              <div className="w-8 h-0.5 rounded-full mt-1.5" style={{ backgroundColor: accentColor }} />
            </div>

            {/* Bestseller Vertical List (NO RANK NUMBERING) */}
            <div className="divide-y divide-stone-100">
              {bestsellers.map((item) => (
                <Link
                  key={item.id}
                  href={`/produkt/${item.slug}`}
                  className="group flex items-center gap-3 py-2.5 hover:bg-stone-50/80 rounded-xl px-1.5 transition-colors relative"
                >
                  <div className="w-11 h-11 rounded-lg border border-stone-200/80 bg-white p-1 flex items-center justify-center shrink-0 overflow-hidden group-hover:border-emerald-300 transition-colors">
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={64}
                      height={64}
                      quality={85}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                    />
                  </div>

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
                  <span>{sectionTitle}</span>
                  <span
                    className="text-xs font-bold text-white px-2 py-0.5 rounded-full shadow-xs"
                    style={{ backgroundColor: saleColor }}
                  >
                    % SALE
                  </span>
                </h2>
                <div className="w-12 h-1 rounded-full mt-1.5" style={{ backgroundColor: accentColor }} />
              </div>

              <Link
                href="/shop?sale=true"
                className="text-xs sm:text-sm font-bold hover:underline flex items-center gap-1 group pb-0.5 ml-auto"
                style={{ color: accentColor }}
              >
                <span>Alle Angebote ansehen</span>
                <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
              </Link>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-3 pb-0.5 no-scrollbar">
              {ANGEBOTE_FILTER_TABS.map((tab) => {
                const isActive = filterDepartment === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setFilterDepartment(tab.key)}
                    style={isActive ? { backgroundColor: accentColor, color: '#ffffff' } : undefined}
                    className={`text-[11px] font-bold px-3 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer ${isActive ? 'shadow-xs' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid Layout: Left Spotlight Card + Right 2x3 Grid of 6 Small Cards */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
            {/* Spotlight Card */}
            <div
              className="md:col-span-5 bg-white border-2 border-stone-200/90 hover:border-[#107b46]/50 p-5 sm:p-6 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group relative"
              style={{ borderRadius: `${cardRadius}px` }}
            >
              {/* Header Badges: DEAL DES TAGES + Live Countdown */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span
                  className="inline-flex items-center gap-1.5 text-white text-[10px] sm:text-[11px] font-black px-2.5 py-1 rounded-full shadow-xs uppercase tracking-wide"
                  style={{ backgroundColor: saleColor }}
                >
                  <span className="animate-pulse">🔥</span>
                  <span>{spotlightBadgeText}</span>
                </span>

                <div
                  className="flex items-center gap-1 bg-stone-100 text-stone-800 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md font-mono"
                  title="Angebot endet um Mitternacht"
                >
                  <span className="text-stone-400">⏳</span>
                  <span>
                    {timeLeft.hours}:{timeLeft.minutes}:{timeLeft.seconds}
                  </span>
                </div>
              </div>

              {/* Wishlist & Quick View Buttons (Floating) */}
              <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={(e) => handleOpenQuickView(e, currentSpotlight)}
                  className="w-8 h-8 rounded-full border bg-white/95 border-stone-200 text-stone-400 hover:text-[#107b46] hover:border-[#107b46] flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                  title="Schnellansicht"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={(e) => handleToggleWishlist(e, currentSpotlight)}
                  className={`w-8 h-8 rounded-full border flex items-center justify-center shadow-xs transition-colors cursor-pointer ${wishlistStore.hasItem(currentSpotlight.id)
                      ? 'bg-red-50 border-red-200 text-red-500'
                      : 'bg-white/95 border-stone-200 text-stone-400 hover:text-red-500 hover:border-red-200'
                    }`}
                  title="Zu Favoriten hinzufügen"
                >
                  <svg
                    className={`w-4 h-4 ${wishlistStore.hasItem(currentSpotlight.id)
                        ? 'fill-red-500 stroke-red-500'
                        : 'fill-none stroke-current'
                      }`}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>
              </div>

              <Link
                href={`/produkt/${currentSpotlight.slug}`}
                className="flex-1 flex flex-col items-center"
              >
                {/* High-Res Big Product Image */}
                <div className="relative w-full aspect-square max-h-[280px] mb-3 flex items-center justify-center overflow-hidden">
                  <ProductImageBox
                    src={currentSpotlight.image}
                    alt={currentSpotlight.title}
                    sizes="(max-width: 768px) 100vw, 520px"
                    priority
                    className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
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

                {/* Pricing & Savings */}
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
                      <span
                        className="text-white text-[11px] font-black px-1.5 py-0.5 rounded shadow-2xs"
                        style={{ backgroundColor: saleColor }}
                      >
                        {currentSpotlight.discount}
                      </span>
                    )}
                  </div>
                  {currentSpotlight.savings && (
                    <span className="text-[11px] font-bold mt-0.5" style={{ color: accentColor }}>
                      Sie sparen {currentSpotlight.savings}
                    </span>
                  )}
                </div>

                {/* Truck + Kostenlose & Shield + 2 Jahre */}
                <div className="flex items-center gap-2 mt-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs font-bold shadow-2xs">
                    <svg
                      className="w-4 h-4 shrink-0"
                      style={{ color: accentColor }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8h4.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h2"
                      />
                    </svg>
                    <span>{currentSpotlight.deliveryNote || 'Kostenlose'}</span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs font-bold shadow-2xs">
                    <svg
                      className="w-4 h-4 shrink-0"
                      style={{ color: accentColor }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                <span>In den Warenkorb</span>
              </button>
            </div>

            {/* Right 2x3 Grid of 6 Deals: NO bottom button; Cart Icon + Quick View Icon directly on card */}
            <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {currentGrid.map((deal) => (
                <div
                  key={deal.id}
                  className="bg-white border border-stone-200/80 p-3 hover:shadow-lg hover:border-emerald-300 transition-all flex flex-col justify-between group relative"
                  style={{ borderRadius: `${cardRadius}px` }}
                >
                  {/* Top Header: Category Name + Energy Badge */}
                  <div className="flex items-center justify-between gap-1.5 mb-1 pr-14">
                    <span
                      className="text-[11px] font-bold text-stone-500 uppercase tracking-tight truncate"
                      title={deal.category}
                    >
                      {deal.category}
                    </span>
                    {deal.energyRating && <EnergyBadge rating={deal.energyRating} />}
                  </div>

                  {/* Top Right Floating Action Icons: Quick View + Wishlist */}
                  <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1">
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

                    <button
                      type="button"
                      onClick={(e) => handleToggleWishlist(e, deal)}
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors cursor-pointer border shadow-2xs ${wishlistStore.hasItem(deal.id)
                          ? 'text-red-500 bg-red-50 border-red-200'
                          : 'text-stone-300 hover:text-red-500 bg-white/90 border-stone-200/80'
                        }`}
                      title="Zu Favoriten hinzufügen"
                    >
                      <svg
                        className={`w-3.5 h-3.5 ${wishlistStore.hasItem(deal.id)
                            ? 'fill-red-500 stroke-red-500'
                            : 'fill-none stroke-current'
                          }`}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Thumbnail Image */}
                  <Link
                    href={`/produkt/${deal.slug}`}
                    className="relative aspect-square w-full max-h-[115px] my-1 flex items-center justify-center overflow-hidden"
                  >
                    <ProductImageBox
                      src={deal.image}
                      alt={deal.title}
                      sizes="(max-width: 640px) 100vw, 240px"
                      className="object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>

                  {/* Pricing + Cart Icon directly on Card */}
                  <div className="mt-1 flex-1 flex flex-col justify-between">
                    <div>
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
                            <span
                              className="text-white text-[9px] font-black px-1.5 py-0.2 rounded shadow-2xs"
                              style={{ backgroundColor: saleColor }}
                            >
                              {deal.discount}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleAddToCart(e, deal)}
                          className="w-7 h-7 rounded-lg bg-emerald-50 hover:bg-[#107b46] text-[#107b46] hover:text-white border border-emerald-200/80 hover:border-transparent flex items-center justify-center transition-all shadow-2xs cursor-pointer shrink-0"
                          title="In den Warenkorb"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                            />
                          </svg>
                        </button>
                      </div>

                      <div className="mt-1">
                        <StarRating score={deal.ratingScore} />
                      </div>

                      <Link href={`/produkt/${deal.slug}`}>
                        <h4
                          className="text-xs font-bold text-stone-800 line-clamp-2 mt-1 leading-snug group-hover:text-[#107b46] transition-colors"
                          title={deal.title}
                        >
                          {deal.title}
                        </h4>
                      </Link>
                    </div>

                    {deal.deliveryNote && (
                      <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                        <span className="truncate" title={deal.deliveryNote}>
                          {deal.deliveryNote}
                        </span>
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
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setQuickViewProduct(null)}
          />

          <div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row z-10 border border-stone-200 animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-3 right-3 p-1.5 bg-stone-100 hover:bg-stone-200 rounded-full text-stone-700 z-20 transition cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="w-full md:w-1/2 bg-stone-50 p-6 flex items-center justify-center relative">
              <div className="relative w-full aspect-square max-h-[260px]">
                <ProductImageBox
                  src={quickViewProduct.image}
                  alt={quickViewProduct.title}
                  sizes="400px"
                  className="object-contain p-2"
                />
              </div>
            </div>

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
                    <span
                      className="text-white text-xs font-black px-2 py-0.5 rounded shadow-2xs"
                      style={{ backgroundColor: saleColor }}
                    >
                      {quickViewProduct.discount}
                    </span>
                  )}
                </div>

                {quickViewProduct.deliveryNote && (
                  <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 text-xs font-semibold text-emerald-800 flex items-center gap-2 mb-4">
                    <span className="w-2 h-2 rounded-full bg-[#107b46] animate-pulse shrink-0" />
                    <span>{quickViewProduct.deliveryNote}</span>
                  </div>
                )}
              </div>

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
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
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
