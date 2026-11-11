'use client';

import React from 'react';
import Link from 'next/link';
import BrandLogoMark from './BrandLogoMark';
import {
  BrandShowcaseSettings,
  CatalogBrandSummary,
  ServicePerkIconKey,
  resolveBrandShowcaseConfig,
} from './categorySectionData';

function ServicePerkIcon({ iconKey }: { iconKey: ServicePerkIconKey }) {
  switch (iconKey) {
    case 'trash':
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      );
    case 'wrench':
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
        </svg>
      );
    case 'card':
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      );
    case 'truck':
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </svg>
      );
    case 'sparkles':
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      );
    case 'shield':
    default:
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
  }
}

const GRID_COL_CLASSES: Record<string, string> = {
  '4': 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  '5': 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
  '6': 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
};

interface BrandShowcaseProps {
  config?: BrandShowcaseSettings;
  catalogBrands?: CatalogBrandSummary[];
}

export default function BrandShowcase({ config, catalogBrands = [] }: BrandShowcaseProps) {
  const resolved = resolveBrandShowcaseConfig(config, catalogBrands);
  const design = resolved.design || {};

  const accentColor = design.accentColor || '#107b46';
  const sectionBg = design.sectionBg || '#ffffff';
  const cardBgColor = design.cardBgColor || '#ffffff';
  const cardBorderColor = design.cardBorderColor || '#e7e5e4';
  const cardRadius = design.cardRadius !== undefined ? Number(design.cardRadius) : 16;
  const bannerBgColor = design.bannerBgColor || '#fafaf9';
  const bannerBorderColor = design.bannerBorderColor || '#e7e5e4';
  const titleColor = design.titleColor || '#1c1917';
  const titleSize = design.titleSize !== undefined ? Number(design.titleSize) : 30;
  const paddingY = design.paddingY !== undefined ? Number(design.paddingY) : 56;
  const colsDesktop = String(design.colsDesktop || '6');
  const gridColsClass = GRID_COL_CLASSES[colsDesktop] || GRID_COL_CLASSES['6'];
  const logoHeight = design.logoHeight !== undefined ? Number(design.logoHeight) : 38;
  const showSlogan = design.showSlogan === true;
  const showProductCount = design.showProductCount !== false;
  const showServiceBanner = design.showServiceBanner !== false;

  return (
    <section
      className="border-t border-stone-200"
      style={{
        backgroundColor: sectionBg,
        paddingTop: `${paddingY}px`,
        paddingBottom: `${paddingY}px`,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          {resolved.eyebrow && (
            <span
              className="font-bold text-xs uppercase tracking-wider block"
              style={{ color: accentColor }}
            >
              {resolved.eyebrow}
            </span>
          )}
          <h2
            className="font-black tracking-tight mt-1"
            style={{ color: titleColor, fontSize: `${titleSize}px`, lineHeight: 1.2 }}
          >
            {resolved.title}
          </h2>
          {resolved.description && (
            <p className="text-sm text-stone-500 mt-2">{resolved.description}</p>
          )}
        </div>

        {/* Brand Logos Grid */}
        <div className={`grid ${gridColsClass} gap-3 sm:gap-4 ${showServiceBanner ? 'mb-14' : ''}`}>
          {resolved.brands.map((brand, idx) => (
            <Link
              key={brand.id || idx}
              href={brand.linkUrl || `/shop?brand=${encodeURIComponent(brand.slug)}`}
              aria-label={`${brand.name} Produkte entdecken`}
              style={{
                backgroundColor: cardBgColor,
                borderColor: cardBorderColor,
                borderRadius: `${cardRadius}px`,
              }}
              className="border hover:shadow-md hover:-translate-y-0.5 transition-all px-4 py-5 text-center group flex flex-col items-center justify-center min-h-[108px] relative overflow-hidden"
            >
              <div className="w-full flex items-center justify-center">
                <BrandLogoMark
                  name={brand.name}
                  slug={brand.slug}
                  logo={brand.logo}
                  height={logoHeight}
                />
              </div>

              {showSlogan && brand.slogan && (
                <span className="text-[10px] text-stone-500 group-hover:text-stone-700 transition-colors mt-2 line-clamp-1">
                  {brand.slogan}
                </span>
              )}

              {showProductCount && typeof brand.productCount === 'number' && brand.productCount > 0 && (
                <span className="mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-600 group-hover:bg-stone-200 group-hover:text-stone-900 transition-colors">
                  {brand.productCount} {brand.productCount === 1 ? 'Produkt' : 'Produkte'}
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* Services & Guarantees Banner */}
        {showServiceBanner && (
          <div
            className="rounded-3xl border p-6 sm:p-10 shadow-xs"
            style={{
              backgroundColor: bannerBgColor,
              borderColor: bannerBorderColor,
            }}
          >
            <div className="text-center mb-8">
              {resolved.serviceEyebrow && (
                <span
                  className="font-extrabold text-xs uppercase tracking-wider block"
                  style={{ color: accentColor }}
                >
                  {resolved.serviceEyebrow}
                </span>
              )}
              <h3 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight mt-1">
                {resolved.serviceTitle}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {resolved.servicePerks.map((perk, idx) => (
                <div
                  key={perk.id || idx}
                  className="bg-white rounded-2xl p-5 border border-stone-200/70 shadow-xs flex flex-col"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 mb-3.5 border"
                    style={{
                      backgroundColor: '#ecfdf5',
                      borderColor: '#d1fae5',
                      color: accentColor,
                    }}
                  >
                    <ServicePerkIcon iconKey={perk.iconKey} />
                  </div>
                  <h4 className="font-extrabold text-stone-900 text-sm mb-1">{perk.title}</h4>
                  <p className="text-xs text-stone-500 leading-relaxed">{perk.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
