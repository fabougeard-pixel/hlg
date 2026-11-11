'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

export function UserSvg({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

export function BasketSvg({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M5 10l2-6h10l2 6M3 10h18l-1.5 9.5a1.5 1.5 0 01-1.5 1.5H6a1.5 1.5 0 01-1.5-1.5L3 10zm6 4v3m3-3v3m3-3v3" />
    </svg>
  );
}

export function HeartSvg({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

export function SearchSvg({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

export function CloseSvg({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export function HamburgerSvg({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 6h18M3 12h18M3 18h12" />
    </svg>
  );
}

type MobileHeaderBarProps = {
  logoSrc: string;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onLogoClick?: () => void;
  onAccountClick: () => void;
  onCartClick: () => void;
  onWishlistClick: () => void;
  cartCount: number;
  wishlistCount: number;
};

/**
 * Shared mobile top header bar rendered both closed inside Header and pinned at the top of MobileSidebar.
 */
export default function MobileHeaderBar({
  logoSrc,
  isMenuOpen,
  onToggleMenu,
  onLogoClick,
  onAccountClick,
  onCartClick,
  onWishlistClick,
  cartCount,
  wishlistCount,
}: MobileHeaderBarProps) {
  const badgeClasses =
    'absolute -top-1.5 -left-2 bg-[#facc15] text-stone-900 text-[10px] font-bold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center leading-none shadow-2xs';

  return (
    <div className="lg:hidden w-full bg-white border-b border-stone-200 px-3.5 py-2.5 flex items-center justify-between gap-2 shrink-0">
      <Link href="/" onClick={onLogoClick} className="flex items-center shrink-0" title="HLG Hausgeräte">
        <Image
          src={logoSrc}
          alt="HLG HAUSGERÄTE"
          width={160}
          height={44}
          className="h-7 sm:h-8 w-auto object-contain"
          priority
        />
      </Link>

      <div className="flex items-center gap-3.5 sm:gap-4 text-stone-800 shrink-0">
        <button
          type="button"
          onClick={onAccountClick}
          aria-label="Mein Konto"
          title="Mein Konto"
          className="p-1 hover:text-[#107b46] transition cursor-pointer"
        >
          <UserSvg className="w-[21px] h-[21px]" />
        </button>

        <button
          type="button"
          onClick={onCartClick}
          aria-label="Warenkorb"
          title="Warenkorb"
          className="relative p-1 hover:text-[#107b46] transition cursor-pointer"
        >
          <BasketSvg className="w-[21px] h-[21px]" />
          <span className={badgeClasses}>{cartCount}</span>
        </button>

        <button
          type="button"
          onClick={onWishlistClick}
          aria-label="Wunschliste"
          title="Wunschliste"
          className="relative p-1 hover:text-[#107b46] transition cursor-pointer"
        >
          <HeartSvg className="w-[21px] h-[21px]" />
          <span className={badgeClasses}>{wishlistCount}</span>
        </button>

        <button
          type="button"
          onClick={onToggleMenu}
          aria-label={isMenuOpen ? 'Menü schließen' : 'Menü öffnen'}
          aria-expanded={isMenuOpen}
          className="p-1 -mr-1 text-stone-800 hover:text-[#107b46] transition cursor-pointer"
        >
          {isMenuOpen ? <CloseSvg className="w-6 h-6" /> : <HamburgerSvg className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
}

