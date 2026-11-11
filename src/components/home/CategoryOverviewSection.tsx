'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  CategoryOverviewSettings,
  DEFAULT_CATEGORY_OVERVIEW_SETTINGS,
  DEFAULT_OVERVIEW_CARDS,
  OverviewCardItem,
} from './categorySectionData';

export default function CategoryOverviewSection({ config }: { config?: CategoryOverviewSettings }) {
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
            {cards.map((card) => (
              <Link
                key={card.id}
                href={card.linkUrl || '/shop'}
                className="group border border-stone-200/90 p-4 hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between"
                style={{
                  backgroundColor: cardBgColor,
                  borderRadius: `${cardRadius}px`,
                }}
              >
                <div className="flex items-center justify-between mb-3 gap-2">
                  {card.image && card.image.trim() !== '' ? (
                    <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-stone-50 border border-stone-200/70 shrink-0">
                      <Image
                        src={card.image}
                        alt={card.title}
                        fill
                        sizes="48px"
                        quality={90}
                        className="object-contain p-1"
                      />
                    </div>
                  ) : (
                    <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center text-lg shrink-0">
                      {card.emoji || '📦'}
                    </span>
                  )}
                  {card.priceLabel && (
                    <span className="text-[11px] font-bold text-stone-400 group-hover:text-[#107b46] transition-colors truncate">
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
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

