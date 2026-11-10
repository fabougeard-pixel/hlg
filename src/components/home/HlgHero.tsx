'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/cartStore';

interface CategoryItem {
  name: string;
  slug: string;
  icon?: string;
}

const defaultApplianceCategories: CategoryItem[] = [
  { name: 'Gaming', slug: 'gaming' },
  { name: 'Geschirrspüler', slug: 'geschirrspueler' },
  { name: 'Herde', slug: 'herde' },
  { name: 'Kaffeemaschinen', slug: 'kaffeemaschinen' },
  { name: 'Küchenmaschinen', slug: 'kuechenmaschinen' },
  { name: 'Kühlen & Gefrieren', slug: 'kuehlen-gefrieren' },
  { name: 'Staubsauger & Reiniger', slug: 'staubsauger-reiniger' },
  { name: 'Waschmaschinen', slug: 'waschmaschinen' },
];

export interface HlgHeroProps {
  config?: any;
  categories?: Array<{ id?: string; name: string; slug: string | null }>;
}

export default function HlgHero({ config, categories = [] }: HlgHeroProps) {
  const [mounted, setMounted] = useState(false);
  const cartStore = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const cartItems = cartStore.getTotalItems();
  const cartTotal = cartStore.getTotalPrice();

  const displayCategories = categories && categories.length > 0
    ? categories.slice(0, 8).map(c => ({ name: c.name, slug: c.slug || '' }))
    : defaultApplianceCategories;

  return (
    <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 lg:py-6">
      {/* Floating Mini-Cart Widget (Matching client screenshot) */}
      <div className="fixed right-4 sm:right-6 top-28 sm:top-32 z-40">
        <button
          type="button"
          onClick={() => cartStore.setIsOpen(true)}
          className="bg-[#107b46] hover:bg-[#0d693b] text-white shadow-xl hover:shadow-2xl rounded-2xl px-3.5 py-3 flex flex-col items-center justify-center transition-all hover:scale-105 active:scale-95 group cursor-pointer border-2 border-white/80"
          title="Warenkorb ansehen"
        >
          {/* Basket Icon */}
          <div className="relative mb-1">
            <svg
              className="w-6 h-6 text-white group-hover:rotate-6 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>

          {/* Items count */}
          <span className="text-[11px] font-bold tracking-tight leading-tight">
            {mounted ? cartItems : 0} {cartItems === 1 ? 'Produkt' : 'Produkte'}
          </span>

          {/* Total Price */}
          <span className="text-xs font-black mt-0.5 bg-black/20 px-2 py-0.5 rounded-full">
            {mounted ? cartTotal.toFixed(2).replace('.', ',') : '0,00'} €
          </span>
        </button>
      </div>

      {/* Main Grid: Left Sidebar + Center Hero Banner + Right Promo Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* 1. LEFT COLUMN: "Alle Kategorien" Sidebar */}
        <div className="hidden lg:block lg:col-span-3">
          <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm h-full flex flex-col overflow-hidden">
            {/* Header with Green Indicator */}
            <div className="px-5 pt-4 pb-3 border-b border-stone-100">
              <h3 className="text-sm font-extrabold text-stone-900 tracking-tight">
                Alle Kategorien
              </h3>
              {/* Green indicator bar matching screenshot */}
              <div className="w-8 h-0.5 bg-[#107b46] rounded-full mt-1.5" />
            </div>

            {/* Category List */}
            <nav className="flex-1 divide-y divide-stone-100/90 text-xs sm:text-sm font-medium">
              {displayCategories.map((cat, idx) => (
                <Link
                  key={idx}
                  href={`/shop?category=${encodeURIComponent(cat.slug)}`}
                  className="group flex items-center justify-between px-5 py-3 hover:bg-emerald-50/60 hover:text-[#107b46] transition-colors"
                >
                  <span className="text-stone-700 group-hover:text-[#107b46] group-hover:font-semibold transition-colors truncate">
                    {cat.name}
                  </span>
                  <svg
                    className="w-3.5 h-3.5 text-stone-300 group-hover:text-[#107b46] group-hover:translate-x-0.5 transition-all shrink-0 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </nav>

            {/* Bottom link to view all */}
            <div className="p-3 bg-stone-50 border-t border-stone-100 text-center">
              <Link
                href="/shop"
                className="text-xs font-bold text-[#107b46] hover:underline inline-flex items-center gap-1"
              >
                <span>Alle Kategorien ansehen</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 2. CENTER COLUMN: Main Banner */}
        <div className="lg:col-span-6 xl:col-span-6 relative rounded-2xl overflow-hidden shadow-sm border border-stone-200/80 min-h-[420px] sm:min-h-[460px] flex items-center">
          {/* Background Appliance Ensemble Image */}
          <Image
            src="/images/hero-appliances.jpg"
            alt="Ihre hochwertigen Haushaltsgeräte zu den besten Preisen"
            fill
            priority
            className="object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-700"
          />

          {/* Subtle gradient overlay to guarantee text legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent lg:via-white/70 pointer-events-none" />

          {/* Banner Content Card */}
          <div className="relative z-10 p-5 sm:p-8 max-w-xl">
            {/* Frosted text container to maximize legibility without altering background photo */}
            <div className="bg-white/75 backdrop-blur-[2px] rounded-2xl p-4 sm:p-5 shadow-xs border border-white/80 max-w-lg">
              {/* "Sonderangebot" Ribbon Tag */}
              <div className="inline-flex items-center shadow-xs">
                <span className="relative bg-[#e01b1b] text-white text-[11px] sm:text-xs font-black tracking-wider uppercase px-3.5 py-1 rounded-sm shadow-sm flex items-center gap-1.5">
                  <span className="text-amber-300">⚡</span>
                  <span>Sonderangebot</span>
                </span>
              </div>

              {/* Main Red Catchphrase (Exact client slogan with crisp legibility) */}
              <h1 className="text-2xl sm:text-3xl xl:text-4xl font-black text-[#dc2626] leading-[1.15] tracking-tight mt-3">
                Ihre hochwertigen Haushaltsgeräte zu den besten Preisen!
              </h1>

              {/* Value Proposition Subtext */}
              <p className="text-xs sm:text-sm font-semibold text-stone-700 mt-2 max-w-md leading-relaxed">
                Premium-Marken für Küche &amp; Haushalt. Bis zu 40% sparen • Sofort versandbereit • 2 Jahre Garantie.
              </p>

              {/* Trust Micro-Bullets */}
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-bold text-stone-600">
                <span className="inline-flex items-center gap-1 text-[#107b46]">
                  <span>✓</span> <span className="text-stone-700">Kostenloser Versand ab 50 €</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[#107b46]">
                  <span>✓</span> <span className="text-stone-700">2 Jahre Garantie</span>
                </span>
              </div>

              {/* Yellow CTA Button "Angebote anzeigen" */}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Link
                  href="/shop"
                  className="bg-[#f59e0b] hover:bg-[#d97706] active:bg-[#b45309] text-stone-950 font-extrabold text-sm sm:text-base px-7 py-3 rounded-full inline-flex items-center gap-2 shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <span>Angebote anzeigen</span>
                  <svg className="w-4 h-4 text-stone-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 3. RIGHT COLUMN: Coffee Machine Promo / Right Hero Banner */}
        <div className="lg:col-span-3 hidden lg:flex flex-col relative rounded-2xl overflow-hidden shadow-sm border border-stone-200/80 min-h-[420px] sm:min-h-[460px] group">
          {/* Coffee machine photo */}
          <Image
            src="/images/hero-coffee-machine.jpg"
            alt="Kaffeevollautomaten Highlight"
            fill
            className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
          />

          {/* Gradient overlay for bottom card */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/30 to-transparent pointer-events-none" />

          {/* Top Badge */}
          <div className="relative z-10 p-5">
            <span className="inline-block bg-white/95 backdrop-blur-sm text-stone-900 font-extrabold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
              ★ Bestseller der Woche
            </span>
          </div>

          {/* Bottom Card Content */}
          <div className="relative z-10 mt-auto p-5 text-white">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
              Genuss auf Knopfdruck
            </span>
            <h4 className="text-lg font-black tracking-tight leading-tight mt-1">
              Kaffeevollautomaten
            </h4>
            <p className="text-xs text-stone-300 mt-1 line-clamp-2">
              Perfekter Barista-Kaffee für Ihr Zuhause mit intuitiver Touch-Bedienung.
            </p>
            <Link
              href="/shop?category=kaffeemaschinen"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
            >
              <span>Geräte entdecken</span>
              <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </Link>
          </div>
        </div>

      </div>

      {/* Mobile/Tablet Category Quick Carousel (UX Improvement on small screens) */}
      <div className="mt-4 lg:hidden">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {displayCategories.map((cat, idx) => (
            <Link
              key={idx}
              href={`/shop?category=${encodeURIComponent(cat.slug)}`}
              className="bg-white border border-stone-200 text-stone-800 text-xs font-semibold px-3.5 py-1.5 rounded-full whitespace-nowrap shadow-xs hover:border-[#107b46] hover:text-[#107b46] transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

