'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/store/cartStore';

type MobileSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  logoImage?: string;
  logoHeight?: string;
  aboutTitle?: string;
  aboutDesc?: string;
  menuLinks?: Array<{ label: string, url: string }>;
  contactAddress?: string;
  contactPhone?: string;
  contactEmail?: string;
  contactWebsite?: string;
  categories?: Array<{ id: string, name: string, slug: string | null }>;
};

const defaultCategories = [
  { name: 'Gaming', slug: 'gaming', icon: '🎮' },
  { name: 'Geschirrspüler', slug: 'geschirrspueler', icon: '🍽️' },
  { name: 'Herde', slug: 'herde', icon: '🍳' },
  { name: 'Kaffeemaschinen', slug: 'kaffeemaschinen', icon: '☕' },
  { name: 'Küchenmaschinen', slug: 'kuechenmaschinen', icon: '🥣' },
  { name: 'Kühlen & Gefrieren', slug: 'kuehlen-gefrieren', icon: '❄️' },
  { name: 'Staubsauger & Reiniger', slug: 'staubsauger-reiniger', icon: '🧹' },
  { name: 'Waschmaschinen', slug: 'waschmaschinen', icon: '🧺' },
  { name: 'Trockner', slug: 'trockner', icon: '💨' },
  { name: 'Mikrowellen', slug: 'mikrowellen', icon: '📡' },
];

export default function MobileSidebar({
  isOpen,
  onClose,
  logoImage,
  logoHeight = '64',
  menuLinks = [],
  contactAddress = '',
  contactPhone = '',
  contactEmail = '',
  categories = [],
}: MobileSidebarProps) {
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(true);
  const cartStore = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const displayCategories = categories && categories.length > 0 ? categories : defaultCategories;

  // Filter out Home / Startseite from the rest of the desktop menu so it's not duplicated
  const isHomeLink = (url: string, label: string) => {
    const u = (url || '').trim().toLowerCase();
    const l = (label || '').trim().toLowerCase();
    return u === '/' || l === 'início' || l === 'inicio' || l === 'home' || l === 'startseite';
  };

  const otherDesktopLinks = (menuLinks || []).filter(link => !isHomeLink(link.url, link.label));

  // Check if contact items are defined (ignoring old dummy placeholders)
  const isDummyPlaceholder = (str?: string) => {
    if (!str) return true;
    const s = str.trim().toLowerCase();
    if (!s) return true;
    if (s.includes('123 main') || s.includes('example.com') || s.includes('123 456') || s.includes('253 000')) return true;
    return false;
  };

  const hasPhone = Boolean(contactPhone?.trim() && !isDummyPlaceholder(contactPhone));
  const hasEmail = Boolean(contactEmail?.trim() && !isDummyPlaceholder(contactEmail));
  const hasAddress = Boolean(contactAddress?.trim() && !isDummyPlaceholder(contactAddress));
  const hasAnyContact = hasPhone || hasEmail || hasAddress;

  return (
    <div className="fixed inset-0 z-[100] flex lg:hidden">
      {/* Overlay backdrop */}
      <div
        className="absolute inset-0 bg-stone-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar Panel */}
      <div className="relative w-[86%] max-w-sm bg-white h-full shadow-2xl flex flex-col overflow-y-auto animate-in slide-in-from-left duration-300 z-10">

        {/* Top Header: Logo + Close Button */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
          <Link href="/" onClick={onClose} className="block">
            <Image
              src={logoImage && logoImage !== '/logo.png' && logoImage !== '/logo.jpg' ? logoImage : '/LOGO-HLG-HAUSGERAETE.png'}
              alt="HLG Hausgeräte"
              width={190}
              height={60}
              className="object-contain"
              style={{ width: 'auto', height: `${logoHeight}px` }}
            />
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Menü schließen"
            className="w-9 h-9 flex items-center justify-center text-stone-500 hover:text-stone-900 bg-white hover:bg-stone-200 border border-stone-200 rounded-full transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Quick User Utilities Row */}
        <div className="grid grid-cols-2 gap-2 p-3.5 bg-stone-100/80 border-b border-stone-200">
          <Link
            href="/account"
            onClick={onClose}
            className="flex items-center gap-2 p-2 bg-white rounded-xl border border-stone-200 text-xs font-bold text-stone-800 hover:border-emerald-500 hover:text-[#107b46] transition shadow-xs"
          >
            <svg className="w-4 h-4 text-[#107b46] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="truncate">Mein Konto</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              onClose();
              cartStore.setIsOpen(true);
            }}
            className="flex items-center justify-between p-2 bg-white rounded-xl border border-stone-200 text-xs font-bold text-stone-800 hover:border-emerald-500 hover:text-[#107b46] transition shadow-xs cursor-pointer"
          >
            <span className="flex items-center gap-2 truncate">
              <svg className="w-4 h-4 text-[#107b46] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span>Warenkorb</span>
            </span>
            {mounted && cartStore.getTotalItems() > 0 && (
              <span className="bg-[#107b46] text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {cartStore.getTotalItems()}
              </span>
            )}
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="p-3.5 flex-1 overflow-y-auto">
          <ul className="space-y-1 pb-3">
            {/* 1. Startseite */}
            <li>
              <Link
                href="/"
                onClick={onClose}
                className="flex items-center justify-between px-3.5 py-2.5 text-sm font-bold text-stone-800 hover:bg-emerald-50 hover:text-[#107b46] rounded-xl transition-colors"
              >
                <span>Startseite</span>
                <span className="text-stone-400 text-xs">&rarr;</span>
              </Link>
            </li>

            {/* 2. Categorias de Produtos Accordion */}
            <li>
              <button
                type="button"
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 text-sm font-bold text-stone-900 bg-stone-100/90 hover:bg-emerald-50 hover:text-[#107b46] rounded-xl transition-colors cursor-pointer mt-1"
              >
                <span className="flex items-center gap-2">
                  <span>📂</span>
                  <span>Alle Kategorien</span>
                </span>
                <svg className={`w-4 h-4 text-stone-500 transition-transform duration-200 ${isCategoriesOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isCategoriesOpen && (
                <ul className="mt-1 ml-2 space-y-1 border-l-2 border-emerald-500 pl-2 py-1">
                  {displayCategories.map((cat: any, idx: number) => (
                    <li key={cat.id || idx}>
                      <Link
                        href={`/product-category/${cat.slug || cat.id}`}
                        onClick={onClose}
                        className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-stone-700 hover:text-[#107b46] hover:bg-emerald-50 rounded-lg transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          {cat.icon && <span>{cat.icon}</span>}
                          <span>{cat.name}</span>
                        </span>
                        <svg className="w-3 h-3 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>

            {/* 3. The rest of the main menu defined for Desktop */}
            {otherDesktopLinks.map((link, idx) => (
              <li key={`desktop-menu-${idx}`}>
                <Link
                  href={link.url}
                  onClick={onClose}
                  className="flex items-center justify-between px-3.5 py-2.5 text-sm font-bold text-stone-800 hover:bg-emerald-50 hover:text-[#107b46] rounded-xl transition-colors"
                >
                  <span>{link.label}</span>
                  <span className="text-stone-400 text-xs">&rarr;</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contact & Support Details at the bottom */}
        {hasAnyContact && (
          <div className="p-4 bg-stone-50 border-t border-stone-200 mt-auto text-xs space-y-2.5">
            <p className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">Kundenservice</p>

            {hasPhone && (
              <a href={`tel:${contactPhone.replace(/\s+/g, '')}`} className="flex items-center gap-2 text-stone-600 hover:text-[#107b46] transition">
                <svg className="w-4 h-4 text-[#107b46] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>{contactPhone}</span>
              </a>
            )}

            {hasEmail && (
              <a href={`mailto:${contactEmail}`} className="flex items-center gap-2 text-stone-600 hover:text-[#107b46] transition truncate">
                <svg className="w-4 h-4 text-[#107b46] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="truncate">{contactEmail}</span>
              </a>
            )}

            {hasAddress && (
              <p className="flex items-start gap-2 text-stone-500 pt-1 border-t border-stone-200/60 text-[11px] leading-tight">
                <span className="shrink-0">📍</span>
                <span>{contactAddress}</span>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
