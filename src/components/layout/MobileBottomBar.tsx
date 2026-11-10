'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';

export default function MobileBottomBar() {
  const pathname = usePathname();
  const cartStore = useCartStore();
  const wishlistStore = useWishlistStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalCartItems = mounted ? cartStore.getTotalItems() : 0;
  const totalWishlistItems = mounted ? wishlistStore.items.length : 0;

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 shadow-lg lg:hidden px-2 py-1.5 flex items-center justify-around select-none safe-area-pb"
    >
      {/* 1. Startseite */}
      <Link
        href="/"
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[10px] font-bold transition-colors ${
          pathname === '/' ? 'text-[#107b46]' : 'text-stone-600 hover:text-[#107b46]'
        }`}
      >
        <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span>Startseite</span>
      </Link>

      {/* 2. Shop / Kategorien */}
      <Link
        href="/shop"
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[10px] font-bold transition-colors ${
          pathname?.startsWith('/shop') ? 'text-[#107b46]' : 'text-stone-600 hover:text-[#107b46]'
        }`}
      >
        <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
        <span>Katalog</span>
      </Link>

      {/* 3. Wunschliste */}
      <Link
        href="/wishlist"
        className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[10px] font-bold transition-colors ${
          pathname === '/wishlist' ? 'text-[#107b46]' : 'text-stone-600 hover:text-[#107b46]'
        }`}
      >
        <div className="relative">
          <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {totalWishlistItems > 0 && (
            <span className="absolute -top-1 -right-2 bg-[#f59e0b] text-stone-900 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
              {totalWishlistItems}
            </span>
          )}
        </div>
        <span>Wunschliste</span>
      </Link>

      {/* 4. Warenkorb */}
      <button
        type="button"
        onClick={() => cartStore.setIsOpen(true)}
        className="relative flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[10px] font-bold text-stone-600 hover:text-[#107b46] transition-colors cursor-pointer"
      >
        <div className="relative">
          <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          {totalCartItems > 0 && (
            <span className="absolute -top-1 -right-2 bg-[#f59e0b] text-stone-900 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
              {totalCartItems}
            </span>
          )}
        </div>
        <span>Warenkorb</span>
      </button>
    </nav>
  );
}

