'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  CatalogProductSummary,
  CategoryOverviewSettings,
  DEFAULT_CATEGORY_OVERVIEW_SETTINGS,
  DEFAULT_OVERVIEW_CARDS,
  OverviewCardItem,
} from './categorySectionData';

function extractCategorySlug(linkUrl?: string): string {
  if (!linkUrl) return '';
  const match = linkUrl.match(/[?&]category=([^&#]+)/i);
  if (match && match[1]) return decodeURIComponent(match[1]).toLowerCase();
  const pathMatch = linkUrl.match(/\/product-category\/([^/?#]+)/i);
  if (pathMatch && pathMatch[1]) return decodeURIComponent(pathMatch[1]).toLowerCase();
  return '';
}

function findCategoryProductImage(
  linkUrl: string | undefined,
  catalogProducts: CatalogProductSummary[]
): string {
  if (!catalogProducts.length) return '';
  const slugLower = extractCategorySlug(linkUrl);
  if (!slugLower) return '';

  const match = catalogProducts.find((p) => {
    const hasImg = Array.isArray(p.images) && p.images.length > 0 && Boolean(p.images[0]);
    if (!hasImg) return false;
    if (Array.isArray(p.categories)) {
      return p.categories.some((c) => (c.slug || '').toLowerCase() === slugLower);
    }
    return (p.categorySlug || '').toLowerCase() === slugLower;
  });

  return match?.images?.[0] || '';
}

export default function CategoryOverviewSection({
  config,
  catalogProducts = [],
}: {
  config?: CategoryOverviewSettings;
  catalogProducts?: CatalogProductSummary[];
}) {
  const settings = config || {};
  const design = settings.design || {};

  const eyebrow =
    settings.eyebrow !== undefined ? settings.eyebrow : DEFAULT_CATEGORY_OVERVIEW_SETTINGS.eyebrow;
  const title =
    settings.title !== undefined ? settings.title : DEFAULT_CATEGORY_OVERVIEW_SETTINGS.title;
  const description =
    settings.description !== undefined
      ? settings.description
      : DEFAULT_CATEGORY_OVERVIEW_SETTINGS.description;
  const ctaText =
    settings.ctaText !== undefined ? settings.ctaText : DEFAULT_CATEGORY_OVERVIEW_SETTINGS.ctaText;
  const ctaUrl =
    settings.ctaUrl !== undefined ? settings.ctaUrl : DEFAULT_CATEGORY_OVERVIEW_SETTINGS.ctaUrl;

  const cards: OverviewCardItem[] =
    Array.isArray(settings.cards) && settings.cards.length > 0
      ? settings.cards
      : DEFAULT_OVERVIEW_CARDS;

  const accentColor = design.accentColor || '#107b46';
  const titleColor = design.titleColor || '#1c1917';
  const titleSize = design.titleSize !== undefined ? Number(design.titleSize) : 24;
  const paddingY = design.paddingY !== undefined ? Number(design.paddingY) : 28;
  const containerBgFrom = design.containerBgFrom || '#fafaf9';
  const containerBgTo = design.containerBgTo || '#ecfdf5';
  const containerBorderColor = design.containerBorderColor || '#e7e5e4';
  const containerRadius = design.containerRadius !== undefined ? Number(design.containerRadius) : 24;
  const cardBgColor = design.cardBgColor || '#ffffff';
  const cardRadius = design.cardRadius !== undefined ? Number(design.cardRadius) : 16;
  const colsDesktop = design.colsDesktop || settings.colsDesktop || '4';

  const gridColsClass =
    colsDesktop === '2'
      ? 'grid-cols-1 sm:grid-cols-2'
      : colsDesktop === '3'
        ? 'grid-cols-2 lg:grid-cols-3'
        : 'grid-cols-2 lg:grid-cols-4';

  return (
    <section
      className="font-sans"
      style={{ paddingTop: `${paddingY}px`, paddingBottom: `${paddingY}px` }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="border p-6 sm:p-8"
          style={{
            background: `linear-gradient(to bottom right, ${containerBgFrom}, ${containerBgTo})`,
            borderColor: containerBorderColor,
            borderRadius: `${containerRadius}px`,
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              {eyebrow && (
                <span
                  className="text-xs font-black uppercase tracking-wider"
                  style={{ color: accentColor }}
                >
                  {eyebrow}
                </span>
              )}
              <h2
                className="font-black tracking-tight mt-1 leading-tight"
                style={{ color: titleColor, fontSize: `${titleSize}px` }}
              >
                {title}
              </h2>
              {description && (
                <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-xl">{description}</p>
              )}
            </div>

            {ctaText && (
              <Link
                href={ctaUrl || '/shop'}
                className="text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-full inline-flex items-center gap-2 transition-all shadow-sm shrink-0 self-start sm:self-auto hover:opacity-95"
                style={{ backgroundColor: accentColor }}
              >
                <span>{ctaText}</span>
                <span>&rarr;</span>
              </Link>
            )}
          </div>

          <div className={`grid ${gridColsClass} gap-4`}>
            {cards.map((card) => {
              // Respect explicit empty string (user deleted image), otherwise use card.image or auto-pick a product photo from its category
              const resolvedImage =
                card.image === ''
                  ? ''
                  : card.image && card.image.trim() !== ''
                    ? card.image
                    : findCategoryProductImage(card.linkUrl, catalogProducts);

              return (
                <Link
                  key={card.id}
                  href={card.linkUrl || '/shop'}
                  className="group border border-stone-200/90 p-4 hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between"
                  style={{
                    backgroundColor: cardBgColor,
                    borderRadius: `${cardRadius}px`,
                  }}
                >
                  <div className="flex items-start justify-between mb-3 gap-2">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-white border border-stone-200/80 p-1.5 flex items-center justify-center shrink-0 shadow-2xs group-hover:border-emerald-200 transition-colors">
                      {resolvedImage ? (
                        <Image
                          src={resolvedImage}
                          alt={card.title}
                          fill
                          sizes="96px"
                          quality={90}
                          className="object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <svg
                          className="w-7 h-7 text-stone-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.6}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      )}
                    </div>

                    {card.priceLabel && (
                      <span className="text-[11px] font-bold text-stone-400 group-hover:text-[#107b46] transition-colors text-right">
                        {card.priceLabel}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-extrabold text-stone-900 text-sm group-hover:text-[#107b46] transition-colors">
                      {card.title}
                    </h3>
                    {card.subtitle && (
                      <p className="text-[11px] text-stone-500 mt-0.5">{card.subtitle}</p>
                    )}
                  </div>

                  {card.ctaText && (
                    <div
                      className="mt-3 pt-2 border-t border-stone-100 flex items-center text-xs font-bold group-hover:translate-x-1 transition-transform"
                      style={{ color: accentColor }}
                    >
                      <span>{card.ctaText} &rarr;</span>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
