'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/cartStore';
import HeroPreviewEditButton from '@/components/admin/HeroPreviewEditButton';

export interface ThermalHeroConfig {
  // Global & Background
  bgImageUrl?: string;
  bgOverlayOpacity?: string | number;

  // Showcase Card Controls
  showShowcase?: boolean | string;
  showShowcaseImage?: boolean | string;
  showcaseBadge?: string;
  showcaseImage?: string;
  showcaseImageFit?: 'contain' | 'cover';
  showcaseBgImage?: string;
  showcaseTitle?: string;
  showcaseSubtitle?: string;
  showcaseBadgeTech?: string;
  showcaseBadgeTech2?: string;
  showcasePrice?: string | number;
  showcaseComparePrice?: string | number;
  showcaseSavings?: string;
  showcaseBtnText?: string;

  // Hero Left Controls
  campaignBadge?: string;
  titlePrefix?: string;
  titleGradient?: string;
  description?: string;
  cta1Text?: string;
  cta1Link?: string;
  cta2Text?: string;
  cta2Link?: string;

  // Trust Badges
  showTrustBadges?: boolean | string;
  badge1Title?: string;
  badge1Subtitle?: string;
  badge2Title?: string;
  badge2Subtitle?: string;
  badge3Title?: string;
  badge3Subtitle?: string;
}

export interface HeroShowcaseProduct {
  id: string;
  title: string;
  subtitle?: string;
  price: number;
  compareAtPrice?: number | null;
  image: string;
  badge?: string;
  badgeTech?: string;
  badgeTech2?: string;
  categoryName?: string;
}

interface ThermalHeroProps {
  config?: ThermalHeroConfig;
  showcaseProducts?: HeroShowcaseProduct[];
  isPreview?: boolean;
  sectionId?: string;
}

export default function ThermalHero({ config, showcaseProducts, isPreview, sectionId }: ThermalHeroProps) {
  const [added, setAdded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const cartStore = useCartStore();

  // Visibility toggles
  const isShowcaseVisible = config?.showShowcase !== false && config?.showShowcase !== 'false';
  const isShowcaseImageVisible = config?.showShowcaseImage !== false && config?.showShowcaseImage !== 'false';
  const isTrustBadgesVisible = config?.showTrustBadges !== false && config?.showTrustBadges !== 'false';

  // Background settings
  const bgImageUrl = config?.bgImageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1600';
  const rawBgOpacity = config?.bgOverlayOpacity !== undefined && config?.bgOverlayOpacity !== ''
    ? parseFloat(config.bgOverlayOpacity.toString())
    : 0.60;
  // Normalized opacity between 0.1 and 1.0
  const bgOpacity = isNaN(rawBgOpacity) ? 0.60 : Math.min(Math.max(rawBgOpacity, 0.1), 1.0);

  // Hero Left Content
  const campaignBadge = config?.campaignBadge ?? 'Campanha de Inverno 2026 • Stock Garantido em Armazém';
  const titlePrefix = config?.titlePrefix ?? 'Promoção de Inverno!';
  const titleGradient = config?.titleGradient ?? 'FOGÃO A PELLETS & LENHA';
  const description = config?.description ?? 'Rendimento térmico máximo, economia comprovada e conforto para toda a família. Descubra a gama completa de equipamentos certificados Eco-Design com entrega direta em sua casa.';
  const cta1Text = config?.cta1Text ?? 'Ver Ofertas em Destaque';
  const cta1Link = config?.cta1Link ?? '/shop';
  const cta2Text = config?.cta2Text ?? 'Calcular Envio de Palete';
  const cta2Link = config?.cta2Link ?? '#simulador-envio';

  // Trust Badges
  const badge1Title = config?.badge1Title ?? 'ENplus A1';
  const badge1Subtitle = config?.badge1Subtitle ?? 'Pellets Certificados';
  const badge2Title = config?.badge2Title ?? '48 a 72h';
  const badge2Subtitle = config?.badge2Subtitle ?? 'Entrega Rápida';
  const badge3Title = config?.badge3Title ?? '100% Seguro';
  const badge3Subtitle = config?.badge3Subtitle ?? 'MB WAY & Multibanco';

  // Default Top Sellers for rotation
  const defaultShowcaseProducts: HeroShowcaseProduct[] = useMemo(() => [
    {
      id: 'hero-fogao-salamandra-11kw',
      title: config?.showcaseTitle || 'Fogão / Salamandra Eco 11kW',
      subtitle: config?.showcaseSubtitle || 'Combustão limpa • Pellets & Lenha • EcoDesign 2026',
      price: typeof config?.showcasePrice === 'number'
        ? config.showcasePrice
        : (config?.showcasePrice ? parseFloat(config.showcasePrice.toString().replace(/[^0-9.,]/g, '').replace(',', '.')) : 1417.50) || 1417.50,
      compareAtPrice: typeof config?.showcaseComparePrice === 'number'
        ? config.showcaseComparePrice
        : (config?.showcaseComparePrice ? parseFloat(config.showcaseComparePrice.toString().replace(/[^0-9.,]/g, '').replace(',', '.')) : 1890.00) || 1890.00,
      image: config?.showcaseImage || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800',
      badge: config?.showcaseBadge || 'POUPANÇA -25%',
      badgeTech: config?.showcaseBadgeTech || '🔥 Alto Rendimento 92%',
      badgeTech2: config?.showcaseBadgeTech2 || 'Até 110 m²'
    },
    {
      id: '1adf6ece-6164-4377-8045-667089cf42e3',
      title: 'Palete de Pellets ENplus A1 (70 Sacos de 15kg)',
      subtitle: '1050kg • Elevado poder calorífico • 100% Madeira Natural',
      price: 369.90,
      compareAtPrice: 420.00,
      image: 'https://res.cloudinary.com/t7r98hdh/image/upload/v1794069048/lenha/woocommerce-import/nhemnuopqbcehe1hoozw.jpg',
      badge: 'TOP VENDAS -12%',
      badgeTech: '⭐ Certificado ENplus A1',
      badgeTech2: '70 Sacos • 1050 kg'
    },
    {
      id: '475369b3-c985-499a-8016-91f2e536502f',
      title: 'Salamandra a Pellets 9kW com Controlo Wi-Fi',
      subtitle: 'Ventilação forçada • Controlo por App • Programação Diária',
      price: 1090.00,
      compareAtPrice: 1350.00,
      image: 'https://res.cloudinary.com/t7r98hdh/image/upload/v1794069904/lenha/woocommerce-import/rgvkzaiphxkaibnnicek.jpg',
      badge: 'POUPANÇA 260 €',
      badgeTech: '🔥 Rendimento 91%',
      badgeTech2: 'Até 95 m²'
    },
    {
      id: 'd9d64f7c-ed4c-42ec-b4a1-79e9791b357c',
      title: 'Recuperador de Calor a Lenha 14kW Ventilado',
      subtitle: 'Ferro fundido maciço • Vidro cerâmico • Ventilação turbo',
      price: 975.00,
      compareAtPrice: 1190.00,
      image: 'https://res.cloudinary.com/t7r98hdh/image/upload/v1794069321/lenha/woocommerce-import/xw2f6rymeahauygmv5lk.jpg',
      badge: 'POUPANÇA -18%',
      badgeTech: '🔥 Potência 14kW',
      badgeTech2: 'Até 140 m²'
    },
    {
      id: 'dbcf4a1b-3548-4797-bd0d-4293a1b3d036',
      title: 'Ar Condicionado Split Inverter 12.000 BTU R32 Wi-Fi',
      subtitle: 'Wi-Fi integrado • Silencioso 19dB • Função Aquecimento & Frio',
      price: 529.00,
      compareAtPrice: 649.00,
      image: 'https://res.cloudinary.com/t7r98hdh/image/upload/v1794070891/lenha/woocommerce-import/ip28kt7renygynww33k4.jpg',
      badge: 'CLASSE A+++',
      badgeTech: '❄️ Inverter R32 Wi-Fi',
      badgeTech2: '12.000 BTU'
    },
    {
      id: '8cd0eb50-2bdf-416e-9b8b-4624404253a2',
      title: 'Palete de Lenha de Sobro +- 500 Kg',
      subtitle: 'Seca em estufa (< 18% humidade) • Pronta a queimar',
      price: 199.00,
      compareAtPrice: 240.00,
      image: 'https://res.cloudinary.com/t7r98hdh/image/upload/v1794069072/lenha/woocommerce-import/uew0ltmcqaulf0z9cgyi.jpg',
      badge: 'STOCK LIMITADO',
      badgeTech: '🪵 Lenha de Sobro Seca',
      badgeTech2: '500 kg'
    }
  ], [config]);

  const showcaseList = useMemo(() => {
    if (showcaseProducts && showcaseProducts.length > 0) {
      return showcaseProducts;
    }
    return defaultShowcaseProducts;
  }, [showcaseProducts, defaultShowcaseProducts]);

  const currentItem = showcaseList[currentIndex] || showcaseList[0] || defaultShowcaseProducts[0];

  const handleNext = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % showcaseList.length);
      setIsAnimating(false);
    }, 180);
  };

  const handlePrev = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + showcaseList.length) % showcaseList.length);
      setIsAnimating(false);
    }, 180);
  };

  // Auto-rotate every 5.5s unless hovered
  useEffect(() => {
    if (showcaseList.length <= 1 || isHovered) return;
    const interval = setInterval(() => {
      handleNext();
    }, 5500);
    return () => clearInterval(interval);
  }, [showcaseList.length, isHovered, currentIndex]);

  const showcaseImageFit = config?.showcaseImageFit === 'cover' ? 'cover' : 'contain';
  const showcaseBgImage = config?.showcaseBgImage || '';
  const showcaseBtnText = config?.showcaseBtnText ?? 'In den Warenkorb';

  const savingsText = useMemo(() => {
    if (currentItem.compareAtPrice && currentItem.compareAtPrice > currentItem.price) {
      const diff = currentItem.compareAtPrice - currentItem.price;
      return `Sie sparen ${diff.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}`;
    }
    return null;
  }, [currentItem]);

  const handleAddToCart = () => {
    if (!currentItem) return;
    cartStore.addItem({
      id: currentItem.id,
      productId: currentItem.id,
      title: currentItem.title,
      price: currentItem.price,
      image: currentItem.image,
      quantity: 1
    });
    cartStore.setIsOpen(true);

    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const handleCta2Click = (e: React.MouseEvent) => {
    if (cta2Link.startsWith('#')) {
      e.preventDefault();
      const targetId = cta2Link.replace('#', '');
      const el = 
        document.getElementById(targetId) ||
        document.getElementById('simulador-envio') ||
        document.getElementById('simulador-envios') ||
        document.getElementById('sec_shipping') ||
        document.querySelector('[id*="simulador"]');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.location.hash = targetId;
      }
    }
  };

  return (
    <section className="relative bg-stone-950 text-white overflow-hidden py-14 lg:py-20 border-b border-stone-800 group">
      {/* Admin preview edit button */}
      {isPreview && sectionId && (
        <HeroPreviewEditButton sectionId={sectionId} blockNum={0} />
      )}

      {/* Main Hero Background Image & Lighting */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Glow ambient effects */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* User Background Image with controllable opacity */}
        {bgImageUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-500 ease-out"
            style={{
              backgroundImage: `url('${bgImageUrl}')`,
              opacity: bgOpacity
            }}
          />
        )}

        {/* Gradient overlay for high text legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/95 via-stone-950/75 to-stone-950/40 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-stone-950/40 pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className={`grid grid-cols-1 ${isShowcaseVisible ? 'lg:grid-cols-12 gap-10 lg:gap-8 items-center' : 'max-w-4xl'}`}>

          {/* Left Column: Headlines & Call to Actions */}
          <div className={`${isShowcaseVisible ? 'lg:col-span-7' : 'w-full'} space-y-6`}>
            {campaignBadge && (
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-red-950/70 border border-red-600/40 rounded-full text-xs backdrop-blur-md shadow-sm">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                </span>
                <span className="text-white font-bold tracking-wide animate-pulse">
                  {campaignBadge}
                </span>
              </div>
            )}

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-white drop-shadow-md">
              {titlePrefix && <>{titlePrefix}<br /></>}
              {titleGradient && (
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-400 to-amber-300">
                  {titleGradient}
                </span>
              )}
            </h1>

            {description && (
              <p className="text-stone-200 text-sm sm:text-base max-w-xl leading-relaxed drop-shadow-sm">
                {description}
              </p>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              {cta1Text && (
                <Link
                  href={cta1Link}
                  className="px-7 py-3.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white rounded-xl font-bold text-sm shadow-xl shadow-red-600/30 transition-all flex items-center gap-2 group/btn"
                >
                  <span>{cta1Text}</span>
                  <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              )}

              {cta2Text && (
                <a
                  href={cta2Link}
                  onClick={handleCta2Click}
                  className="px-6 py-3.5 bg-stone-900/90 hover:bg-stone-800/90 active:scale-95 text-stone-200 border border-stone-700 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 shadow-sm cursor-pointer backdrop-blur-sm"
                >
                  <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                  </svg>
                  <span>{cta2Text}</span>
                </a>
              )}
            </div>

            {/* Mini Trust Badges */}
            {isTrustBadgesVisible && (
              <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-5 sm:pt-6 border-t border-stone-800 text-xs text-stone-300 max-w-lg">
                <div className="space-y-0.5">
                  <span className="block text-white font-bold text-xs sm:text-sm tracking-wide">{badge1Title}</span>
                  <span className="text-[10px] sm:text-[11px] text-stone-400">{badge1Subtitle}</span>
                </div>
                <div className="space-y-0.5 border-l border-stone-800 pl-2 sm:pl-4">
                  <span className="block text-white font-bold text-xs sm:text-sm tracking-wide">{badge2Title}</span>
                  <span className="text-[10px] sm:text-[11px] text-stone-400">{badge2Subtitle}</span>
                </div>
                <div className="space-y-0.5 border-l border-stone-800 pl-2 sm:pl-4">
                  <span className="block text-white font-bold text-xs sm:text-sm tracking-wide">{badge3Title}</span>
                  <span className="text-[10px] sm:text-[11px] text-stone-400">{badge3Subtitle}</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Visual Showcase Card with Automatic Rotation */}
          {isShowcaseVisible && (
            <div
              className="lg:col-span-5 relative"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <div className="relative bg-gradient-to-b from-stone-900/95 via-stone-850/95 to-stone-950/95 border border-stone-700/70 rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-xl transition-all duration-300">

                {/* Card Top Bar: Badge + Navigation Controls */}
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-2">
                    {currentItem.badge && (
                      <span className="px-3 py-1 bg-red-600 text-white font-black text-[11px] uppercase tracking-wider rounded-full shadow-lg shadow-red-600/40 border border-red-500">
                        {currentItem.badge}
                      </span>
                    )}
                    <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider bg-stone-800/80 px-2 py-0.5 rounded border border-stone-700/60">
                      Mais Vendidos • {currentIndex + 1}/{showcaseList.length}
                    </span>
                  </div>

                  {/* Manual Controls */}
                  {showcaseList.length > 1 && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handlePrev}
                        title="Artigo anterior"
                        className="w-7 h-7 rounded-full bg-stone-800 hover:bg-red-600 border border-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={handleNext}
                        title="Próximo artigo"
                        className="w-7 h-7 rounded-full bg-stone-800 hover:bg-red-600 border border-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                {/* Showcase Image / Visual Container */}
                {isShowcaseImageVisible && (
                  <div className="aspect-4/3 rounded-2xl bg-stone-950/90 border border-stone-800 relative overflow-hidden group/img flex items-center justify-center p-3">
                    {/* Optional Showcase Background Image */}
                    {showcaseBgImage && (
                      <div
                        className="absolute inset-0 bg-cover bg-center z-0 transition-opacity"
                        style={{
                          backgroundImage: `url('${showcaseBgImage}')`,
                          opacity: 0.85
                        }}
                      />
                    )}

                    {/* Product Image with smooth transition */}
                    <div className={`relative w-full h-full transition-all duration-300 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                      {currentItem.image ? (
                        <Image
                          src={currentItem.image}
                          alt={currentItem.title}
                          fill
                          unoptimized={currentItem.image.startsWith('http')}
                          className={`${showcaseImageFit === 'cover' ? 'object-cover' : 'object-contain p-2'} object-center group-hover/img:scale-105 transition-transform duration-700 z-10`}
                          sizes="(max-width: 768px) 100vw, 500px"
                          priority
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">
                          🔥
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent z-10 pointer-events-none" />

                    {/* Tech Badges on image */}
                    <div className={`absolute bottom-3 left-4 right-4 z-20 flex items-center justify-between transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
                      {currentItem.badgeTech && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-900/90 rounded-md text-[11px] font-semibold text-amber-300 border border-stone-700/60 shadow-sm">
                          {currentItem.badgeTech}
                        </span>
                      )}
                      {currentItem.badgeTech2 && (
                        <span className="text-[11px] font-medium text-stone-300 bg-black/70 px-2 py-0.5 rounded shadow-sm">
                          {currentItem.badgeTech2}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Product Info with transition */}
                <div className={`mt-4 space-y-2 transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
                  <div>
                    <h3 className="text-white font-bold text-base sm:text-lg leading-tight line-clamp-1">
                      {currentItem.title}
                    </h3>
                    {currentItem.subtitle && (
                      <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">
                        {currentItem.subtitle}
                      </p>
                    )}
                  </div>

                  <div className="flex items-baseline gap-3 pt-1">
                    <span className="text-red-400 font-extrabold text-2xl sm:text-3xl">
                      {currentItem.price.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
                    </span>
                    {currentItem.compareAtPrice && currentItem.compareAtPrice > currentItem.price && (
                      <span className="text-stone-500 line-through text-sm">
                        {currentItem.compareAtPrice.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
                      </span>
                    )}
                    {savingsText && (
                      <span className="text-[11px] font-bold text-emerald-400 ml-auto bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
                        {savingsText}
                      </span>
                    )}
                  </div>
                </div>

                {/* Interactive Dots Pagination */}
                {showcaseList.length > 1 && (
                  <div className="flex items-center justify-center gap-1.5 pt-3">
                    {showcaseList.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setIsAnimating(true);
                          setTimeout(() => {
                            setCurrentIndex(idx);
                            setIsAnimating(false);
                          }, 150);
                        }}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${idx === currentIndex ? 'w-6 bg-red-500' : 'w-1.5 bg-stone-700 hover:bg-stone-500'
                          }`}
                        title={`Ir para produto ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}

                {/* Action Button */}
                <button
                  onClick={handleAddToCart}
                  className={`w-full mt-3.5 py-3.5 px-4 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${added
                      ? 'bg-emerald-600 text-white'
                      : 'bg-red-600 hover:bg-red-700 active:scale-98 text-white shadow-red-600/30'
                    }`}
                >
                  {added ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>In den Warenkorb gelegt!</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      <span>{showcaseBtnText}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
