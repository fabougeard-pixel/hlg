'use client';

import React from 'react';

type ProductCardActionButtonsProps = {
  isWishlisted: boolean;
  onToggleWishlist: (e: React.MouseEvent) => void;
  onQuickView: (e: React.MouseEvent) => void;
  wishlistTitle?: string;
  quickViewTitle?: string;
  positionClassName?: string;
  buttonSizeClassName?: string;
};

/**
 * Vertically stacked Wishlist + Quick View action buttons positioned at the upper-right of product card images.
 */
export default function ProductCardActionButtons({
  isWishlisted,
  onToggleWishlist,
  onQuickView,
  wishlistTitle,
  quickViewTitle = 'Schnellansicht',
  positionClassName = 'top-2 right-2',
  buttonSizeClassName = 'w-7 h-7 sm:w-8 sm:h-8',
}: ProductCardActionButtonsProps) {
  return (
    <div className={`absolute ${positionClassName} z-20 flex flex-col gap-1.5`}>
      <button
        type="button"
        onClick={onToggleWishlist}
        className={`${buttonSizeClassName} rounded-full flex items-center justify-center transition-all shadow-sm cursor-pointer ${
          isWishlisted
            ? 'bg-red-600 text-white shadow-red-500/30 ring-2 ring-red-400'
            : 'bg-white/95 text-stone-600 hover:bg-red-600 hover:text-white border border-stone-200/80 hover:border-red-600'
        }`}
        title={
          wishlistTitle ||
          (isWishlisted ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen')
        }
        aria-label="Wishlist"
      >
        <svg
          className="w-3.5 h-3.5 sm:w-4 sm:h-4"
          fill={isWishlisted ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </button>

      <button
        type="button"
        onClick={onQuickView}
        className={`${buttonSizeClassName} rounded-full bg-white/95 text-stone-600 hover:bg-[#107b46] hover:text-white border border-stone-200/80 hover:border-[#107b46] flex items-center justify-center transition-all shadow-sm cursor-pointer`}
        title={quickViewTitle}
        aria-label="Quick View"
      >
        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
      </button>
    </div>
  );
}

