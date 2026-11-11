'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';
import {
  CatalogProductSummary,
  CategoryProductItem,
  CategoryShowcaseSettings,
  resolveCategorySectionConfig,
} from './categorySectionData';

function EnergyBadge({ rating }: { rating?: string }) {
  if (!rating) return null;
  const colors: Record<string, { bg: string; text: string }> = {
    A: { bg: 'bg-[#009640]', text: 'text-white' },
    'A+++': { bg: 'bg-[#009640]', text: 'text-white' },
    'A++': { bg: 'bg-[#009640]', text: 'text-white' },
    'A+': { bg: 'bg-[#009640]', text: 'text-white' },
    B: { bg: 'bg-[#54b848]', text: 'text-white' },
    C: { bg: 'bg-[#bfd730]', text: 'text-stone-900' },
    D: { bg: 'bg-[#ffcc00]', text: 'text-stone-900' },
    E: { bg: 'bg-[#f5a623]', text: 'text-white' },
    F: { bg: 'bg-[#f05a28]', text: 'text-white' },
    G: { bg: 'bg-[#e30613]', text: 'text-white' },
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

function CategoryProductCard({
  item,
  accentColor,
  saleColor,
  cardRadius,
  cardBorderColor,
  buttonBgColor,
  buttonTextColor,
  onQuickView,
}: {
  item: CategoryProductItem;
  accentColor: string;
  saleColor: string;
  cardRadius: number;
  cardBorderColor: string;
  buttonBgColor: string;
  buttonTextColor: string;
  onQuickView: (item: CategoryProductItem) => void;
}) {
  const wishlistStore = useWishlistStore();
  const cartStore = useCartStore();
  const [isAdded, setIsAdded] = useState(false);
  const isWishlisted = wishlistStore.hasItem(item.id);

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    wishlistStore.toggleItem(item.id);
    toast.success(isWishlisted ? 'Aus Favoriten entfernt' : 'Zu Favoriten hinzugefügt');
  };

  const handleAddToCart = (e: React.MouseEvent) => {
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
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1800);
    cartStore.setIsOpen(true);
    toast.success('In den Warenkorb gelegt');
  };

  return (
    <div
      className="bg-white border p-3 sm:p-4 hover:shadow-lg transition-all flex flex-col justify-between group relative"
      style={{
        borderRadius: `${cardRadius}px`,
        borderColor: cardBorderColor,
      }}
    >
      {/* Top: Category + EU Badge & Action Icons */}
      <div className="flex items-center justify-between gap-1 mb-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[10px] sm:text-[11px] font-semibold text-stone-400 uppercase tracking-wider truncate">
            {item.category}
          </span>
          {item.energyRating && <EnergyBadge rating={item.energyRating} />}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onQuickView(item);
            }}
            className="w-6 h-6 rounded-full bg-stone-50 hover:bg-[#107b46] text-stone-500 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Schnellansicht"
            aria-label="Schnellansicht"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleToggleWishlist}
            className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
              isWishlisted ? 'text-red-500 bg-red-50' : 'text-stone-400 hover:text-red-500 hover:bg-stone-50'
            }`}
            title="Favorit"
            aria-label="Favorit"
          >
            <svg
              className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-red-500 stroke-red-500' : 'fill-none stroke-current'}`}
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
      </div>

      {/* Product Image */}
      <Link
        href={`/produkt/${item.slug}`}
        className="relative aspect-square w-full max-h-[145px] my-2 flex items-center justify-center overflow-hidden bg-white rounded-xl"
      >
        {item.image ? (
          <Image
            src={item.image}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 50vw, 240px"
            quality={90}
            className="object-contain p-1 group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-stone-50 text-stone-300">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </Link>

      {/* Details */}
      <div className="mt-1">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-sm sm:text-base font-extrabold text-stone-900 leading-tight">
            {item.price}
          </span>
          {item.compareAtPrice && (
            <span className="text-xs text-stone-400 line-through leading-tight">
              {item.compareAtPrice}
            </span>
          )}
        </div>

        {item.discount && (
          <div className="mt-1">
            <span
              className="inline-block text-white text-[10px] font-black px-1.5 py-0.5 rounded-sm shadow-2xs"
              style={{ backgroundColor: saleColor }}
            >
              {item.discount}
            </span>
          </div>
        )}

        {/* Stars */}
        <div className="flex items-center gap-1 my-1">
          <div className="flex text-amber-400">
            {[1, 2, 3, 4, 5].map((s) => (
              <svg key={s} className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          {item.ratingScore && (
            <span className="text-[10px] text-stone-500 font-medium">{item.ratingScore}</span>
          )}
        </div>

        {/* Title */}
        <Link href={`/produkt/${item.slug}`}>
          <h4 className="text-xs font-bold text-stone-800 line-clamp-2 mt-1 leading-snug group-hover:text-[#107b46] transition-colors min-h-[32px]">
            {item.title}
          </h4>
        </Link>

        {/* Stock / Delivery */}
        <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse shrink-0"
            style={{ backgroundColor: accentColor }}
          />
          <span className="truncate">{item.deliveryNote || 'Auf Lager • 2-3 Werktage'}</span>
        </div>
      </div>

      {/* Quick Add Button — always "In den Warenkorb" */}
      <div className="mt-2.5 pt-2 border-t border-stone-100">
        <button
          type="button"
          onClick={handleAddToCart}
          className="w-full text-center text-xs font-bold py-1.5 rounded-lg border transition-all cursor-pointer flex items-center justify-center gap-1.5"
          style={
            isAdded
              ? { backgroundColor: accentColor, color: '#ffffff', borderColor: 'transparent' }
              : {
                  backgroundColor: buttonBgColor || '#ffffff',
                  color: buttonTextColor || '#374151',
                  borderColor: buttonBgColor ? buttonBgColor : '#e7e5e4',
                }
          }
        >
          {isAdded ? (
            <>
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <span>Im Warenkorb</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span>In den Warenkorb</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function CategoryShowcaseSection({
  config,
  catalogProducts = [],
}: {
  config?: CategoryShowcaseSettings;
  catalogProducts?: CatalogProductSummary[];
}) {
  const [quickViewItem, setQuickViewItem] = useState<CategoryProductItem | null>(null);
  const cartStore = useCartStore();

  const resolved = resolveCategorySectionConfig(config, catalogProducts);
  const design = resolved.design || {};

  const accentColor = design.accentColor || '#107b46';
  const saleColor = design.saleColor || '#dc2626';
  const titleColor = design.titleColor || '#1c1917';
  const titleSize = design.titleSize !== undefined ? Number(design.titleSize) : 22;
  const paddingY = design.paddingY !== undefined ? Number(design.paddingY) : 24;
  const sectionBg = design.sectionBg || 'transparent';
  const cardRadius = design.cardRadius !== undefined ? Number(design.cardRadius) : 16;
  const cardBorderColor = design.cardBorderColor || '#e7e5e4';
  const buttonBgColor = design.buttonBgColor || '';
  const buttonTextColor = design.buttonTextColor || '';
  const bannerBadgeBg = design.bannerBadgeBg || accentColor;
  const bannerOverlayOpacity =
    design.bannerOverlayOpacity !== undefined ? Number(design.bannerOverlayOpacity) / 100 : 0.72;
  const bannerColSpanClass = design.bannerWidth === '4' ? 'lg:col-span-4' : 'lg:col-span-3';
  const gridColSpanClass = design.bannerWidth === '4' ? 'lg:col-span-8' : 'lg:col-span-9';

  const gridColsClass = (() => {
    switch (resolved.colsDesktop) {
      case '2':
        return 'grid-cols-2';
      case '3':
        return 'grid-cols-2 sm:grid-cols-3';
      case '5':
        return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5';
      case '4':
      default:
        return resolved.showBanner
          ? 'grid-cols-2 sm:grid-cols-4'
          : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4';
    }
  })();

  const sectionHeader = (
    <div className="border-b border-stone-200/90 pb-3 mb-5 flex items-end justify-between gap-3">
      <div>
        <h2
          className="font-black tracking-tight leading-tight"
          style={{ color: titleColor, fontSize: `${titleSize}px` }}
        >
          {resolved.title}
        </h2>
        <div className="w-12 h-1 rounded-full mt-2" style={{ backgroundColor: accentColor }} />
      </div>
      {resolved.linkText && (
        <Link
          href={resolved.linkUrl || '/shop'}
          className="text-xs sm:text-sm font-bold text-stone-700 hover:text-[#107b46] bg-stone-50 hover:bg-emerald-50 px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 group border border-stone-200/80 hover:border-emerald-300 shadow-2xs shrink-0"
        >
          <span>{resolved.linkText}</span>
          <span
            className="group-hover:translate-x-0.5 transition-transform"
            style={{ color: accentColor }}
          >
            &rarr;
          </span>
        </Link>
      )}
    </div>
  );

  const bannerBlock = resolved.showBanner ? (
    <div
      className={`${bannerColSpanClass} overflow-hidden relative shadow-md min-h-[320px] flex flex-col justify-end p-6 bg-stone-900 group ${
        resolved.bannerPosition === 'right' ? 'lg:order-2' : 'lg:order-1'
      }`}
      style={{ borderRadius: `${cardRadius}px` }}
    >
      {resolved.bannerImage && resolved.bannerImage.trim() !== '' ? (
        <Image
          src={resolved.bannerImage}
          alt={resolved.bannerTitle || resolved.title}
          fill
          sizes="(max-width: 1024px) 100vw, 420px"
          quality={90}
          className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(145deg, ${accentColor}, #0f172a)`,
          }}
        />
      )}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to top, rgba(12, 10, 9, ${Math.min(
            0.96,
            bannerOverlayOpacity + 0.18
          )}), rgba(12, 10, 9, ${bannerOverlayOpacity * 0.5}), transparent)`,
        }}
      />
      <div className="relative z-10 text-white">
        {resolved.bannerBadge && (
          <span
            className="inline-block text-white text-[10px] font-black px-2.5 py-0.5 rounded-full mb-2 uppercase tracking-wider"
            style={{ backgroundColor: bannerBadgeBg }}
          >
            {resolved.bannerBadge}
          </span>
        )}
        <h3 className="text-xl sm:text-2xl font-black text-white leading-tight drop-shadow-sm mb-3">
          {resolved.bannerTitle}
        </h3>
        {resolved.bannerCtaText && (
          <Link
            href={resolved.bannerCtaUrl || resolved.linkUrl || '/shop'}
            className="bg-white hover:bg-stone-100 text-stone-900 text-xs font-black px-4 py-2 rounded-full inline-flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <span>{resolved.bannerCtaText}</span>
            <span>&rarr;</span>
          </Link>
        )}
      </div>
    </div>
  ) : null;

  return (
    <section
      className="font-sans"
      style={{
        backgroundColor: sectionBg,
        paddingTop: `${paddingY}px`,
        paddingBottom: `${paddingY}px`,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {resolved.showBanner ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {bannerBlock}
            <div
              className={`${gridColSpanClass} flex flex-col justify-between ${
                resolved.bannerPosition === 'right' ? 'lg:order-1' : 'lg:order-2'
              }`}
            >
              {sectionHeader}
              {resolved.products.length > 0 ? (
                <div className={`grid ${gridColsClass} gap-3.5 sm:gap-4 flex-1`}>
                  {resolved.products.map((item) => (
                    <CategoryProductCard
                      key={item.id}
                      item={item}
                      accentColor={accentColor}
                      saleColor={saleColor}
                      cardRadius={cardRadius}
                      cardBorderColor={cardBorderColor}
                      buttonBgColor={buttonBgColor}
                      buttonTextColor={buttonTextColor}
                      onQuickView={setQuickViewItem}
                    />
                  ))}
                </div>
              ) : (
                <div className="border-2 border-dashed border-stone-200 rounded-2xl p-8 text-center text-xs text-stone-500">
                  Keine Produkte in dieser Kategorie gefunden. Bitte Kategorie oder manuelle Produkte im Editor wählen.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            {sectionHeader}
            {resolved.products.length > 0 ? (
              <div className={`grid ${gridColsClass} gap-3.5 sm:gap-4`}>
                {resolved.products.map((item) => (
                  <CategoryProductCard
                    key={item.id}
                    item={item}
                    accentColor={accentColor}
                    saleColor={saleColor}
                    cardRadius={cardRadius}
                    cardBorderColor={cardBorderColor}
                    buttonBgColor={buttonBgColor}
                    buttonTextColor={buttonTextColor}
                    onQuickView={setQuickViewItem}
                  />
                ))}
              </div>
            ) : (
              <div className="border-2 border-dashed border-stone-200 rounded-2xl p-8 text-center text-xs text-stone-500">
                Keine Produkte in dieser Kategorie gefunden. Bitte Kategorie oder manuelle Produkte im Editor wählen.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick View Modal */}
      {quickViewItem && (
        <div
          className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setQuickViewItem(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setQuickViewItem(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 cursor-pointer"
              aria-label="Schließen"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="relative aspect-square bg-stone-50 rounded-2xl flex items-center justify-center overflow-hidden p-4">
              {quickViewItem.image && (
                <Image
                  src={quickViewItem.image}
                  alt={quickViewItem.title}
                  fill
                  sizes="320px"
                  quality={90}
                  className="object-contain p-3"
                />
              )}
            </div>

            <div className="flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                    {quickViewItem.category}
                  </span>
                  {quickViewItem.energyRating && <EnergyBadge rating={quickViewItem.energyRating} />}
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-stone-900 leading-snug mb-2">
                  {quickViewItem.title}
                </h3>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-2xl font-black text-stone-900">{quickViewItem.price}</span>
                  {quickViewItem.compareAtPrice && (
                    <span className="text-sm text-stone-400 line-through">
                      {quickViewItem.compareAtPrice}
                    </span>
                  )}
                  {quickViewItem.discount && (
                    <span
                      className="text-white text-xs font-black px-2 py-0.5 rounded shadow-2xs"
                      style={{ backgroundColor: saleColor }}
                    >
                      {quickViewItem.discount}
                    </span>
                  )}
                </div>
                {quickViewItem.deliveryNote && (
                  <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 text-xs font-semibold text-emerald-800 flex items-center gap-2 mb-4">
                    <span className="w-2 h-2 rounded-full bg-[#107b46] animate-pulse shrink-0" />
                    <span>{quickViewItem.deliveryNote}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => {
                    cartStore.addItem({
                      id: quickViewItem.id,
                      productId: quickViewItem.id,
                      title: quickViewItem.title,
                      price: quickViewItem.rawPrice || 0,
                      image: quickViewItem.image || '',
                      quantity: 1,
                    });
                    cartStore.setIsOpen(true);
                    toast.success('In den Warenkorb gelegt');
                    setQuickViewItem(null);
                  }}
                  className="w-full py-3 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  style={{ backgroundColor: accentColor }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span>In den Warenkorb</span>
                </button>
                <Link
                  href={`/produkt/${quickViewItem.slug}`}
                  onClick={() => setQuickViewItem(null)}
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
