'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/cartStore';
import HeroPreviewEditButton from '@/components/admin/HeroPreviewEditButton';
import { basicSanitizeHtml } from '@/lib/security';

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
  isPreview?: boolean;
  sectionId?: string;
}

function hexToRgba(hex: string, alphaPercent: number): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6 && clean.length !== 3) return `rgba(255,255,255,${alphaPercent / 100})`;
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const r = parseInt(full.substring(0, 2), 16);
  const g = parseInt(full.substring(2, 4), 16);
  const b = parseInt(full.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alphaPercent / 100))})`;
}

function parseNumberSetting(
  value: unknown,
  fallback: number,
  min?: number,
  max?: number
): number {
  if (value === undefined || value === null || value === '') return fallback;
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  let result = num;
  if (min !== undefined && result < min) result = min;
  if (max !== undefined && result > max) result = max;
  return result;
}

function parseColorSetting(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function stripHtmlTags(text: string): string {
  return String(text).replace(/<[^>]*>/g, '').trim();
}

function renderRichText(text: string): React.ReactNode {
  if (!/<\/?[a-z][\s\S]*>/i.test(text)) {
    return text;
  }
  return (
    <span
      className="contents"
      dangerouslySetInnerHTML={{ __html: basicSanitizeHtml(text) }}
    />
  );
}

export default function HlgHero({
  config = {},
  categories = [],
  isPreview = false,
  sectionId,
}: HlgHeroProps) {
  const [mounted, setMounted] = useState(false);
  const cartStore = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const cartItems = cartStore.getTotalItems();
  const cartTotal = cartStore.getTotalPrice();

  // Global Hero settings
  const heroMinHeight = parseNumberSetting(config?.heroMinHeight, 460, 240, 900);
  const heroPaddingY = parseNumberSetting(config?.heroPaddingY, 24, 0, 120);
  const heroGap = parseNumberSetting(config?.heroGap, 20, 0, 64);
  const heroBgColor = parseColorSetting(config?.heroBgColor, 'transparent');
  const showMiniCart = config?.showMiniCart !== false;
  const showMobileCategories = config?.showMobileCategories !== false;

  // Block 1 settings (Categories)
  const block1MaxItems = parseNumberSetting(config?.block1MaxItems, 8, 3, 12);
  const block1Title = config?.block1Title ?? 'Alle Kategorien';
  const block1FooterText = config?.block1FooterText ?? 'Alle Kategorien ansehen';
  const block1FooterUrl = config?.block1FooterUrl ?? '/shop';
  const block1BgColor = parseColorSetting(config?.block1BgColor, '#ffffff');
  const block1BorderColor = parseColorSetting(config?.block1BorderColor, '#e7e5e4');
  const block1BorderRadius = parseNumberSetting(config?.block1BorderRadius, 16, 0, 48);
  const block1AccentColor = parseColorSetting(config?.block1AccentColor, '#107b46');
  const block1TitleColor = parseColorSetting(config?.block1TitleColor, '#1c1917');
  const block1TitleSize = parseNumberSetting(config?.block1TitleSize, 14, 8, 40);
  const block1TextColor = parseColorSetting(config?.block1TextColor, '#44403c');
  const block1TextSize = parseNumberSetting(config?.block1TextSize, 13, 8, 28);
  const block1FooterColor = parseColorSetting(config?.block1FooterColor, block1AccentColor);
  const block1FooterSize = parseNumberSetting(config?.block1FooterSize, 12, 8, 28);

  const displayCategories =
    categories && categories.length > 0
      ? categories.slice(0, block1MaxItems).map((c) => ({ name: c.name, slug: c.slug || '' }))
      : defaultApplianceCategories.slice(0, block1MaxItems);

  // Block 2 settings (Main Banner)
  const block2Image =
    config?.bannerImage !== undefined
      ? config.bannerImage
      : config?.bgImageUrl !== undefined
        ? config.bgImageUrl
        : '/images/hero-appliances.jpg';
  const block2BadgeText = config?.badgeText ?? config?.campaignBadge ?? 'Sonderangebot';
  const block2Title =
    config?.title ??
    config?.titleGradient ??
    'Ihre hochwertigen Haushaltsgeräte zu den besten Preisen!';
  const block2Subtitle =
    config?.subtitle ??
    config?.description ??
    'Premium-Marken für Küche & Haushalt. Bis zu 40% sparen • Sofort versandbereit • 2 Jahre Garantie.';
  const block2Trust1 = config?.trustBadge1 ?? 'Kostenloser Versand ab 200 €';
  const block2Trust2 = config?.trustBadge2 ?? '2 Jahre Garantie';
  const block2CtaText = config?.ctaText ?? config?.buttonText ?? 'Angebote anzeigen';
  const block2CtaUrl = config?.ctaUrl ?? config?.buttonLink ?? '/shop';

  const block2BgColor = parseColorSetting(config?.block2BgColor, '#f5f5f4');
  const block2BorderRadius = parseNumberSetting(config?.block2BorderRadius, 16, 0, 48);
  const block2Padding = parseNumberSetting(config?.block2Padding, 28, 0, 80);
  const block2OverlayColor = parseColorSetting(config?.block2OverlayColor, '#ffffff');
  const block2OverlayOpacity = parseNumberSetting(config?.block2OverlayOpacity, 85, 0, 100);
  const block2CardBgOpacity = parseNumberSetting(config?.block2CardBgOpacity, 75, 0, 100);
  const block2BadgeBg = parseColorSetting(config?.block2BadgeBg, '#e01b1b');
  const block2BadgeTextColor = parseColorSetting(config?.block2BadgeTextColor, '#ffffff');
  const block2BadgeSize = parseNumberSetting(config?.block2BadgeSize, 11, 8, 28);
  const block2TitleColor = parseColorSetting(config?.block2TitleColor, '#dc2626');
  const block2TitleSize = parseNumberSetting(config?.block2TitleSize, 34, 12, 72);
  const block2SubtitleColor = parseColorSetting(config?.block2SubtitleColor, '#44403c');
  const block2SubtitleSize = parseNumberSetting(config?.block2SubtitleSize, 14, 8, 36);
  const block2TrustColor = parseColorSetting(config?.block2TrustColor, '#44403c');
  const block2TrustIconColor = parseColorSetting(config?.block2TrustIconColor, '#107b46');
  const block2TrustSize = parseNumberSetting(config?.block2TrustSize, 11, 8, 28);
  const block2BtnBg = parseColorSetting(config?.block2BtnBg, '#f59e0b');
  const block2BtnTextColor = parseColorSetting(config?.block2BtnTextColor, '#0c0a09');
  const block2BtnSize = parseNumberSetting(config?.block2BtnSize, 15, 8, 32);

  // Block 3 settings (Right Highlight Card)
  const block3Image =
    config?.sideCardImage !== undefined
      ? config.sideCardImage
      : config?.showcaseBgImage !== undefined
        ? config.showcaseBgImage
        : '/images/hero-coffee-machine.jpg';
  const block3Badge = config?.sideCardBadge ?? '★ Bestseller der Woche';
  const block3Category = config?.sideCardCategory ?? 'Genuss auf Knopfdruck';
  const block3Title = config?.sideCardTitle ?? 'Kaffeevollautomaten';
  const block3Subtitle =
    config?.sideCardSubtitle ??
    'Perfekter Barista-Kaffee für Ihr Zuhause mit intuitiver Touch-Bedienung.';
  const block3CtaText = config?.sideCardCtaText ?? 'Geräte entdecken';
  const block3Url = config?.sideCardUrl ?? '/shop?category=kaffeemaschinen';

  const block3BgColor = parseColorSetting(config?.block3BgColor, '#1c1917');
  const block3BorderRadius = parseNumberSetting(config?.block3BorderRadius, 16, 0, 48);
  const block3OverlayOpacity = parseNumberSetting(config?.block3OverlayOpacity, 90, 0, 100);
  const block3BadgeBg = parseColorSetting(config?.block3BadgeBg, '#ffffff');
  const block3BadgeTextColor = parseColorSetting(config?.block3BadgeTextColor, '#1c1917');
  const block3BadgeSize = parseNumberSetting(config?.block3BadgeSize, 10, 8, 24);
  const block3CategoryColor = parseColorSetting(config?.block3CategoryColor, '#fbbf24');
  const block3CategorySize = parseNumberSetting(config?.block3CategorySize, 11, 8, 28);
  const block3TitleColor = parseColorSetting(config?.block3TitleColor, '#ffffff');
  const block3TitleSize = parseNumberSetting(config?.block3TitleSize, 18, 10, 48);
  const block3SubtitleColor = parseColorSetting(config?.block3SubtitleColor, '#d6d3d1');
  const block3SubtitleSize = parseNumberSetting(config?.block3SubtitleSize, 12, 8, 28);
  const block3LinkColor = parseColorSetting(config?.block3LinkColor, '#fbbf24');
  const block3LinkSize = parseNumberSetting(config?.block3LinkSize, 12, 8, 28);

  const previewRing = isPreview
    ? 'hover:ring-2 hover:ring-[#107b46]/80 transition-shadow duration-200'
    : '';

  return (
    <section
      style={{
        paddingTop: `${heroPaddingY}px`,
        paddingBottom: `${heroPaddingY}px`,
        backgroundColor: heroBgColor,
      }}
      className="relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Floating Mini-Cart Widget (Desktop only) */}
        {showMiniCart && !isPreview && (
          <div className="hidden lg:block fixed right-0 top-1/2 -translate-y-1/2 z-40">
            <button
              type="button"
              onClick={() => cartStore.setIsOpen(true)}
              className="bg-[#156b42] hover:bg-[#107b46] text-white shadow-lg hover:shadow-xl rounded-l-2xl rounded-r-none px-3.5 py-3.5 sm:px-4 sm:py-4 flex flex-col items-center justify-center gap-2 transition-all group cursor-pointer"
              title="Warenkorb ansehen"
              aria-label="Warenkorb ansehen"
            >
              <svg
                className="w-7 h-7 text-white group-hover:scale-105 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M7 9l2.2-4.5M17 9l-2.2-4.5M4.5 9h15a1.5 1.5 0 011.45 1.88l-1.35 5.4A2.5 2.5 0 0117.17 18.2H6.83a2.5 2.5 0 01-2.43-1.92l-1.35-5.4A1.5 1.5 0 014.5 9zM9.2 12.5h5.6M10.7 15h2.6"
                />
              </svg>
              <span className="text-[12px] sm:text-[13px] font-medium tracking-tight leading-none whitespace-nowrap">
                {mounted ? cartItems : 0} {mounted && cartItems > 1 ? 'Produkte' : 'Produkt'}
              </span>
              <span className="bg-white/25 text-white text-[12px] sm:text-[13px] font-semibold px-3 py-1 rounded-full leading-tight tabular-nums whitespace-nowrap">
                {mounted ? cartTotal.toFixed(2).replace('.', ',') : '0,00'}€
              </span>
            </button>
          </div>
        )}

        {/* Main Grid: Block 1 (Categories) + Block 2 (Center Banner) + Block 3 (Highlight Card) */}
        <div
          className="grid grid-cols-1 lg:grid-cols-12 items-stretch"
          style={{ gap: `${heroGap}px` }}
        >
          {/* 1. BLOCK 1: Left Categories Column */}
          <div
            className={`hidden lg:block lg:col-span-3 relative group/block ${previewRing}`}
            style={{ borderRadius: `${block1BorderRadius}px` }}
          >
            {isPreview && sectionId && (
              <HeroPreviewEditButton sectionId={sectionId} blockNum={1} label="Block 1: Kategorien" />
            )}

            <div
              className="shadow-sm h-full flex flex-col overflow-hidden border"
              style={{
                backgroundColor: block1BgColor,
                borderColor: block1BorderColor,
                borderRadius: `${block1BorderRadius}px`,
              }}
            >
              {/* Header with Accent Indicator */}
              <div className="px-5 pt-4 pb-3 border-b" style={{ borderColor: block1BorderColor }}>
                <h3
                  className="font-extrabold tracking-tight leading-snug"
                  style={{ color: block1TitleColor, fontSize: `${block1TitleSize}px` }}
                >
                  {renderRichText(block1Title)}
                </h3>
                <div
                  className="w-8 h-0.5 rounded-full mt-1.5"
                  style={{ backgroundColor: block1AccentColor }}
                />
              </div>

              {/* Category List */}
              <nav
                className="flex-1 divide-y divide-stone-100/90 font-medium"
                style={{ fontSize: `${block1TextSize}px` }}
              >
                {displayCategories.map((cat, idx) => (
                  <Link
                    key={idx}
                    href={`/shop?category=${encodeURIComponent(cat.slug)}`}
                    className="group/item flex items-center justify-between px-5 py-3 hover:bg-black/[0.03] transition-colors"
                  >
                    <span
                      className="group-hover/item:font-semibold transition-colors truncate"
                      style={{ color: block1TextColor, fontSize: `${block1TextSize}px` }}
                    >
                      {cat.name}
                    </span>
                    <svg
                      className="w-3.5 h-3.5 opacity-45 group-hover/item:opacity-100 group-hover/item:translate-x-0.5 transition-all shrink-0 ml-2"
                      style={{ color: block1TextColor }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </nav>

              {/* Footer link */}
              {block1FooterText && (
                <div
                  className="p-3 bg-black/[0.03] border-t text-center"
                  style={{ borderColor: block1BorderColor }}
                >
                  <Link
                    href={block1FooterUrl || '/shop'}
                    className="font-bold hover:underline inline-flex items-center gap-1"
                    style={{ color: block1FooterColor, fontSize: `${block1FooterSize}px` }}
                  >
                    <span>{renderRichText(block1FooterText)}</span>
                    <span>&rarr;</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* 2. BLOCK 2: Center Main Banner */}
          <div
            className={`lg:col-span-6 xl:col-span-6 relative overflow-hidden shadow-sm border border-stone-200/80 flex items-center group/block ${previewRing}`}
            style={{
              minHeight: `${heroMinHeight}px`,
              backgroundColor: block2BgColor,
              borderRadius: `${block2BorderRadius}px`,
            }}
          >
            {isPreview && sectionId && (
              <HeroPreviewEditButton sectionId={sectionId} blockNum={2} label="Block 2: Hauptbanner" />
            )}

            {/* Background Image */}
            {block2Image && (
              <Image
                src={block2Image}
                alt={stripHtmlTags(block2Title)}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 660px"
                quality={90}
                className="object-cover object-center transition-transform duration-700"
              />
            )}

            {/* Gradient Overlay for legibility */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `linear-gradient(to right, ${hexToRgba(block2OverlayColor, block2OverlayOpacity)} 0%, ${hexToRgba(block2OverlayColor, Math.round(block2OverlayOpacity * 0.78))} 55%, rgba(255,255,255,0) 100%)`,
              }}
            />

            {/* Banner Content Card */}
            <div className="relative z-10 max-w-xl" style={{ padding: `${block2Padding}px` }}>
              <div
                className="backdrop-blur-[2px] rounded-2xl p-4 sm:p-5 shadow-xs border border-white/80 max-w-lg"
                style={{ backgroundColor: `rgba(255, 255, 255, ${block2CardBgOpacity / 100})` }}
              >
                {/* Badge */}
                {block2BadgeText && (
                  <div className="inline-flex items-center shadow-xs">
                    <span
                      className="relative font-black tracking-wider uppercase px-3.5 py-1 rounded-sm shadow-sm flex items-center gap-1.5"
                      style={{
                        backgroundColor: block2BadgeBg,
                        color: block2BadgeTextColor,
                        fontSize: `${block2BadgeSize}px`,
                      }}
                    >
                      <span
                        style={{
                          color:
                            block2BadgeTextColor.toLowerCase() === '#ffffff'
                              ? '#fde047'
                              : block2BadgeTextColor,
                        }}
                      >
                        ⚡
                      </span>
                      <span>{renderRichText(block2BadgeText)}</span>
                    </span>
                  </div>
                )}

                {/* Main Title */}
                <h1
                  className="font-black leading-[1.15] tracking-tight mt-3"
                  style={{
                    color: block2TitleColor,
                    fontSize: `${block2TitleSize}px`,
                  }}
                >
                  {renderRichText(block2Title)}
                </h1>

                {/* Subtitle */}
                {block2Subtitle && (
                  <p
                    className="font-semibold mt-2 max-w-md leading-relaxed"
                    style={{
                      color: block2SubtitleColor,
                      fontSize: `${block2SubtitleSize}px`,
                    }}
                  >
                    {renderRichText(block2Subtitle)}
                  </p>
                )}

                {/* Trust Micro-Bullets */}
                {(block2Trust1 || block2Trust2) && (
                  <div
                    className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-bold"
                    style={{ fontSize: `${block2TrustSize}px`, color: block2TrustColor }}
                  >
                    {[block2Trust1, block2Trust2].filter(Boolean).map((item, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1">
                        <span style={{ color: block2TrustIconColor }}>✓</span>
                        <span style={{ color: block2TrustColor }}>{renderRichText(item)}</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* CTA Button */}
                {block2CtaText && (
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Link
                      href={block2CtaUrl || '/shop'}
                      className="font-extrabold px-7 py-3 rounded-full inline-flex items-center gap-2 shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
                      style={{
                        backgroundColor: block2BtnBg,
                        color: block2BtnTextColor,
                        fontSize: `${block2BtnSize}px`,
                      }}
                    >
                      <span>{renderRichText(block2CtaText)}</span>
                      <svg className="w-[1.05em] h-[1.05em]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 3. BLOCK 3: Right Highlight Card */}
          <div
            className={`lg:col-span-3 hidden lg:flex flex-col relative overflow-hidden shadow-sm border border-stone-200/80 group/block ${previewRing}`}
            style={{
              minHeight: `${heroMinHeight}px`,
              backgroundColor: block3BgColor,
              borderRadius: `${block3BorderRadius}px`,
            }}
          >
            {isPreview && sectionId && (
              <HeroPreviewEditButton sectionId={sectionId} blockNum={3} label="Block 3: Highlight" />
            )}

            {/* Background Image */}
            {block3Image && (
              <Image
                src={block3Image}
                alt={stripHtmlTags(block3Title)}
                fill
                sizes="(max-width: 1024px) 100vw, 320px"
                quality={90}
                className="object-cover object-center transition-transform duration-700"
              />
            )}

            {/* Gradient overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `linear-gradient(to top, rgba(12, 10, 9, ${block3OverlayOpacity / 100}) 0%, rgba(12, 10, 9, ${Math.round(block3OverlayOpacity * 0.35) / 100}) 50%, rgba(12, 10, 9, 0) 100%)`,
              }}
            />

            {/* Top Badge */}
            {block3Badge && (
              <div className="relative z-10 p-5 pr-12">
                <span
                  className="inline-block backdrop-blur-sm font-extrabold uppercase tracking-wider px-3 py-1 rounded-full shadow-md"
                  style={{
                    backgroundColor: block3BadgeBg,
                    color: block3BadgeTextColor,
                    fontSize: `${block3BadgeSize}px`,
                  }}
                >
                  {renderRichText(block3Badge)}
                </span>
              </div>
            )}

            {/* Bottom Card Content */}
            <div className="relative z-10 mt-auto p-5">
              {block3Category && (
                <span
                  className="font-bold uppercase tracking-wider block"
                  style={{ color: block3CategoryColor, fontSize: `${block3CategorySize}px` }}
                >
                  {renderRichText(block3Category)}
                </span>
              )}
              <h4
                className="font-black tracking-tight leading-tight mt-1"
                style={{ color: block3TitleColor, fontSize: `${block3TitleSize}px` }}
              >
                {renderRichText(block3Title)}
              </h4>
              {block3Subtitle && (
                <p
                  className="mt-1 line-clamp-2 leading-snug"
                  style={{ color: block3SubtitleColor, fontSize: `${block3SubtitleSize}px` }}
                >
                  {renderRichText(block3Subtitle)}
                </p>
              )}
              {block3CtaText && (
                <Link
                  href={block3Url || '/shop?category=kaffeemaschinen'}
                  className="mt-3 inline-flex items-center gap-1.5 font-bold hover:opacity-80 transition-opacity"
                  style={{ color: block3LinkColor, fontSize: `${block3LinkSize}px` }}
                >
                  <span>{renderRichText(block3CtaText)}</span>
                  <span>&rarr;</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Category Quick Carousel */}
        {showMobileCategories && (
          <div className="mt-4 lg:hidden">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {displayCategories.map((cat, idx) => (
                <Link
                  key={idx}
                  href={`/shop?category=${encodeURIComponent(cat.slug)}`}
                  className="border font-semibold px-3.5 py-1.5 rounded-full whitespace-nowrap shadow-xs hover:opacity-80 transition-opacity"
                  style={{
                    backgroundColor: block1BgColor,
                    borderColor: block1BorderColor,
                    color: block1TextColor,
                    fontSize: `${block1TextSize}px`,
                  }}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
