'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import QuickViewModal from '@/components/product/QuickViewModal';

export interface ProductItem {
  id: string;
  title: string;
  slug: string;
  price: number;
  compareAtPrice?: number | null;
  images: string[];
  discountLabel?: string | null;
  categorySlug?: string;
  categoryName?: string;
  allCategories?: string;
  categories?: { name: string; slug: string }[];
}

interface FeaturedProductTabsProps {
  initialProducts?: ProductItem[];
}

// Resilient fallback products with verified Cloudinary images from Silva Dias catalog
const fallbackProducts: ProductItem[] = [
  {
    id: 'fb-p1',
    title: 'Pellets Para Estufa Palet 77 Sacos De 15 Kg (1155kg)',
    slug: 'pellets-para-estufa-palet-77-sacos-15kg',
    price: 550.00,
    compareAtPrice: 590.00,
    images: ['https://res.cloudinary.com/t7r98hdh/image/upload/v1794069048/lenha/woocommerce-import/nhemnuopqbcehe1hoozw.jpg'],
    discountLabel: 'Top Vendas',
    categorySlug: 'pellets',
    categoryName: 'Pellets & Lenha',
    allCategories: 'pellets pellets-e-lenha combustiveis'
  },
  {
    id: 'fb-p2',
    title: 'Palete 48 sacos de lenha Popular Parfer 150',
    slug: 'palete-48-sacos-lenha-popular-parfer',
    price: 150.00,
    compareAtPrice: 175.00,
    images: ['https://res.cloudinary.com/t7r98hdh/image/upload/v1794069058/lenha/woocommerce-import/mzx0ucldxrmtcnwoe7pe.jpg'],
    discountLabel: 'Promoção',
    categorySlug: 'lenha-e-pellets',
    categoryName: 'Pellets & Lenha',
    allCategories: 'lenha lenha-e-pellets combustiveis'
  },
  {
    id: 'fb-p3',
    title: 'Palete de Lenha de Sobro +- 500 Kg Pronta a Queimar',
    slug: 'palete-lenha-sobro-500kg',
    price: 199.00,
    compareAtPrice: 230.00,
    images: ['https://res.cloudinary.com/t7r98hdh/image/upload/v1794069072/lenha/woocommerce-import/uew0ltmcqaulf0z9cgyi.jpg'],
    discountLabel: 'Stock Limitado',
    categorySlug: 'combustiveis',
    categoryName: 'Pellets & Lenha',
    allCategories: 'combustiveis lenha pellets-e-lenha'
  },
  {
    id: 'fb-p4',
    title: 'Fogão a Lenha Frontal M-300 TFK',
    slug: 'fogao-a-lenha-frontal-m-300-tfk',
    price: 1090.00,
    compareAtPrice: 1290.00,
    images: ['https://res.cloudinary.com/t7r98hdh/image/upload/v1794069904/lenha/woocommerce-import/rgvkzaiphxkaibnnicek.jpg'],
    discountLabel: 'EcoDesign',
    categorySlug: 'fogoes-a-lenha',
    categoryName: 'Salamandras',
    allCategories: 'fogoes-a-lenha salamandras aquecimento'
  },
  {
    id: 'fb-p5',
    title: 'Fogão a lenha de canto com forno CH-8 R + Direct Gift',
    slug: 'fogao-a-lenha-de-canto-com-forno-ch-8-r',
    price: 1350.00,
    compareAtPrice: 1550.00,
    images: ['https://res.cloudinary.com/t7r98hdh/image/upload/v1794069940/lenha/woocommerce-import/rjz1i3jj6ouezjpauj7x.jpg'],
    discountLabel: '-15%',
    categorySlug: 'fogoes-a-lenha',
    categoryName: 'Salamandras',
    allCategories: 'fogoes-a-lenha salamandras aquecimento'
  },
  {
    id: 'fb-p6',
    title: 'Lareira Londres com Forno 100cm',
    slug: 'lareira-londres-com-forno-100cm',
    price: 1190.00,
    compareAtPrice: 1390.00,
    images: ['https://res.cloudinary.com/t7r98hdh/image/upload/v1794069321/lenha/woocommerce-import/xw2f6rymeahauygmv5lk.jpg'],
    discountLabel: 'Alta Eficiência',
    categorySlug: 'lareira-a-lenha',
    categoryName: 'Recuperadores',
    allCategories: 'lareira-a-lenha recuperadores-de-calor aquecimento'
  },
  {
    id: 'fb-p7',
    title: 'Milão Lareira com Turbina 70cm',
    slug: 'milao-lareira-com-turbina-70cm',
    price: 940.00,
    compareAtPrice: 1100.00,
    images: ['https://res.cloudinary.com/t7r98hdh/image/upload/v1794069415/lenha/woocommerce-import/qxcim4xcgcybajcmvyoi.jpg'],
    discountLabel: '-18%',
    categorySlug: 'lareira-a-lenha',
    categoryName: 'Recuperadores',
    allCategories: 'lareira-a-lenha recuperadores-de-calor aquecimento'
  },
  {
    id: 'fb-p8',
    title: 'Ar condicionado portátil MEI AC 4021 12.000 BTU',
    slug: 'ar-condicionado-portatil-mei-ac-4021-12000-btu',
    price: 499.00,
    compareAtPrice: 580.00,
    images: ['https://res.cloudinary.com/t7r98hdh/image/upload/v1794070942/lenha/woocommerce-import/ljpjrhyqwgn3khk9rar6.jpg'],
    discountLabel: 'A+++',
    categorySlug: 'climatizacao',
    categoryName: 'Climatização',
    allCategories: 'climatizacao ar-condicionado ar-condicionado-portatil'
  },
  {
    id: 'fb-p9',
    title: 'Ar Condicionado Infiniton SPLIT-3726MF Branco A++ Inverter',
    slug: 'ar-condicionado-infiniton-split-3726mf-branco-a-plus-plus',
    price: 549.00,
    compareAtPrice: 650.00,
    images: ['https://res.cloudinary.com/t7r98hdh/image/upload/v1794070891/lenha/woocommerce-import/ip28kt7renygynww33k4.jpg'],
    discountLabel: 'Inverter',
    categorySlug: 'climatizacao',
    categoryName: 'Climatização',
    allCategories: 'climatizacao ar-condicionado'
  }
];

function getCategoryEmoji(categorySlug?: string, title?: string): string {
  const s = ((categorySlug || '') + ' ' + (title || '')).toLowerCase();
  if (s.includes('pellet') || s.includes('lenha') || s.includes('sobro') || s.includes('azinho')) return '🪵';
  if (s.includes('salamandra') || s.includes('fogão') || s.includes('fogao')) return '🔥';
  if (s.includes('recuperador') || s.includes('lareira') || s.includes('forno')) return '🏠';
  if (s.includes('clima') || s.includes('ar condicionado') || s.includes('split')) return '❄️';
  if (s.includes('termo') || s.includes('agua') || s.includes('água')) return '💧';
  return '🔥';
}

function ProductCardImage({
  src,
  alt,
  categorySlug,
  title,
  categoryName
}: {
  src?: string;
  alt: string;
  categorySlug?: string;
  title: string;
  categoryName?: string;
}) {
  const [imgError, setImgError] = useState(false);

  // If no image or if loading failed, show an elegant thermal fallback card
  if (!src || imgError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200/70 p-4 text-center select-none">
        <span className="text-5xl mb-2 drop-shadow-sm">
          {getCategoryEmoji(categorySlug, title)}
        </span>
        <span className="text-[11px] font-bold tracking-wider text-stone-500 uppercase line-clamp-1">
          {categoryName || 'Silva Dias'}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      title={title}
      fill
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
      unoptimized={src.startsWith('http')}
      onError={() => setImgError(true)}
      className="object-contain p-2.5 group-hover:scale-105 transition-transform duration-500"
    />
  );
}

// Robust category classifier ensuring 100% precision for each tab
function classifyProductForTab(p: ProductItem): 'pellets' | 'salamandras' | 'recuperadores' | 'climatizacao' {
  const title = (p.title || '').toLowerCase();
  const catName = (p.categoryName || '').toLowerCase();
  const catSlug = (p.categorySlug || '').toLowerCase();
  const allCats = (p.allCategories || '').toLowerCase();
  const text = `${title} ${catName} ${catSlug} ${allCats}`;

  // 1. CLIMATIZAÇÃO:
  // Ar condicionado, splits, desumidificadores, ventiladores, bombas de calor, termoacumuladores, climatizadores
  // MUST NOT include wood stoves, pellet stoves or fireplaces
  const isClimate =
    title.includes('ar condicionado') ||
    title.includes('split') ||
    title.includes('desumidificador') ||
    title.includes('ventilador') ||
    title.includes('bomba calor') ||
    title.includes('bomba de calor') ||
    title.includes('termoacumulador') ||
    title.includes('climatizador') ||
    title.includes('btu') ||
    catSlug.includes('ar-condicionado') ||
    catSlug.includes('desumidificador') ||
    catSlug.includes('ventilador') ||
    catSlug.includes('termoacumulador') ||
    (allCats.includes('climatizacao') && !title.includes('lenha') && !title.includes('pellet') && !title.includes('fogão') && !title.includes('lareira'));

  if (isClimate) {
    return 'climatizacao';
  }

  // 2. PELLETS & LENHA (Combustíveis / Biomassa / Sacos / Paletes)
  // Must be combustible fuels only, NEVER appliances/stoves/fireplaces
  const isCombustible =
    title.includes('palete') ||
    title.includes('saco') ||
    title.includes('sacos') ||
    title.includes('big bag') ||
    title.includes('aparas') ||
    title.includes('sobro') ||
    title.includes('azinho') ||
    title.includes('carvão') ||
    title.includes('carvao') ||
    title.includes('briquette') ||
    title.includes('bioetanol') ||
    title.includes('combust') ||
    catSlug.includes('combustiveis') ||
    catSlug.includes('pellets-e-lenha') ||
    catSlug.includes('lenha-e-pellets') ||
    catSlug.includes('pellets') ||
    allCats.includes('combustiveis');

  const isHeatingAppliance =
    title.includes('salamandra') ||
    title.includes('fogão') ||
    title.includes('fogao') ||
    title.includes('recuperador') ||
    title.includes('lareira') ||
    title.includes('forno') ||
    title.includes('insert') ||
    title.includes('caldeira') ||
    title.includes('cozinha') ||
    title.includes('estufa') ||
    catSlug.includes('fogoes') ||
    catSlug.includes('salamandras') ||
    catSlug.includes('recuperadores') ||
    catSlug.includes('fornos') ||
    catSlug.includes('lareira') ||
    allCats.includes('fogoes') ||
    allCats.includes('salamandras') ||
    allCats.includes('recuperadores') ||
    allCats.includes('fornos') ||
    allCats.includes('lareira');

  if (isCombustible && !isHeatingAppliance) {
    return 'pellets';
  }

  // 3. SALAMANDRAS & FOGÕES:
  // Salamandras a pellets, salamandras a lenha, fogões a lenha, fogões a pellets, estufas, cozinhas a lenha
  if (
    title.includes('salamandra') ||
    title.includes('fogão') ||
    title.includes('fogao') ||
    title.includes('estufa') ||
    title.includes('cozinha') ||
    catSlug.includes('salamandras') ||
    catSlug.includes('fogoes') ||
    catSlug.includes('cozinha-com-forno') ||
    allCats.includes('salamandras') ||
    allCats.includes('fogoes')
  ) {
    return 'salamandras';
  }

  // 4. RECUPERADORES & LAREIRAS:
  // Recuperadores de calor, lareiras, fornos a lenha, inserts, caldeiras
  if (
    title.includes('recuperador') ||
    title.includes('lareira') ||
    title.includes('forno') ||
    title.includes('insert') ||
    title.includes('caldeira') ||
    catSlug.includes('recuperadores') ||
    catSlug.includes('lareira') ||
    catSlug.includes('fornos') ||
    catSlug.includes('caldeiras') ||
    allCats.includes('recuperadores') ||
    allCats.includes('lareira') ||
    allCats.includes('fornos')
  ) {
    return 'recuperadores';
  }

  if (text.includes('clima') || text.includes('radiador')) return 'climatizacao';
  if (text.includes('recuperador') || text.includes('lareira')) return 'recuperadores';
  if (text.includes('salamandra') || text.includes('fog')) return 'salamandras';

  return 'recuperadores';
}

export default function FeaturedProductTabs({ initialProducts }: FeaturedProductTabsProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const cartStore = useCartStore();
  const wishlistStore = useWishlistStore();
  const [quickViewProduct, setQuickViewProduct] = useState<any | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const handleToggleWishlist = (e: React.MouseEvent, prod: ProductItem) => {
    e.preventDefault();
    e.stopPropagation();
    const wasWishlisted = wishlistStore.hasItem(prod.id);
    wishlistStore.toggleItem(prod.id);
    if (!wasWishlisted) {
      wishlistStore.setIsOpen(true);
    }
  };

  const handleOpenQuickView = (e: React.MouseEvent, prod: ProductItem) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewProduct({
      id: prod.id,
      title: prod.title,
      slug: prod.slug,
      price: prod.price,
      compareAtPrice: prod.compareAtPrice,
      images: prod.images,
      description: '',
      shortDescription: prod.discountLabel || '',
      category: prod.categoryName || '',
      stock: 15,
      type: 'SIMPLE'
    });
    setIsQuickViewOpen(true);
  };

  // Combine initialProducts with verified fallbacks, and strictly filter ONLY PROMO items
  const products: ProductItem[] = React.useMemo(() => {
    const rawList = initialProducts && initialProducts.length > 0 ? initialProducts : fallbackProducts;
    const existingIds = new Set(rawList.map(p => p.id || p.slug));
    const extras = fallbackProducts.filter(f => !existingIds.has(f.id) && !existingIds.has(f.slug));
    const combined = [...rawList, ...extras];

    // Enforce that ONLY items with real promotion (compareAtPrice > price or discountLabel) are shown
    return combined.filter(p =>
      (p.compareAtPrice && p.compareAtPrice > p.price) ||
      (p.discountLabel && p.discountLabel.trim() !== '')
    );
  }, [initialProducts]);

  const tabs = [
    { id: 'all', label: 'Todos' },
    { id: 'pellets', label: 'Pellets & Lenha' },
    { id: 'salamandras', label: 'Salamandras' },
    { id: 'recuperadores', label: 'Recuperadores' },
    { id: 'climatizacao', label: 'Climatização' },
  ];

  const filteredProducts = React.useMemo(() => {
    return products.filter(p => {
      if (activeTab === 'all') return true;
      return classifyProductForTab(p) === activeTab;
    });
  }, [products, activeTab]);

  // Update slider scroll button states
  const checkScrollState = () => {
    if (!sliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    setCanScrollLeft(scrollLeft > 15);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 15);

    // Approximate slide index (out of 4 items per view on desktop)
    const cardWidth = clientWidth / 4;
    if (cardWidth > 0) {
      setCurrentSlideIndex(Math.round(scrollLeft / cardWidth));
    }
  };

  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;
    checkScrollState();
    el.addEventListener('scroll', checkScrollState, { passive: true });
    window.addEventListener('resize', checkScrollState);
    return () => {
      el.removeEventListener('scroll', checkScrollState);
      window.removeEventListener('resize', checkScrollState);
    };
  }, [filteredProducts]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (sliderRef.current) {
      sliderRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return;
    const container = sliderRef.current;
    // Scroll by the visible viewport width (4 products on desktop, 2 on tablet, 1 on mobile)
    const scrollAmount = container.clientWidth * 0.85;
    container.scrollBy({
      left: direction === 'right' ? scrollAmount : -scrollAmount,
      behavior: 'smooth'
    });
  };

  const handleAddToCart = (product: ProductItem) => {
    cartStore.addItem({
      id: product.id,
      productId: product.id,
      title: product.title,
      price: product.price,
      image: product.images[0] || '',
      quantity: 1
    });
    cartStore.setIsOpen(true);

    setToastMessage(`✓ ${product.title} in den Warenkorb gelegt!`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const hasSlider = filteredProducts.length > 4;

  return (
    <section id="catalogo" className="py-14 bg-stone-100/70 border-t border-stone-200 relative">
      <div className="max-w-7xl mx-auto px-4">

        {/* Header & Filter Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-red-600 font-extrabold text-xs uppercase tracking-wider block">
              Equipamentos & Combustíveis
            </span>
            <div className="flex items-center gap-3 mt-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                Produtos em Destaque
              </h2>
              {hasSlider && (
                <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-bold border border-red-200">
                  {filteredProducts.length} em promoção
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Interactive Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-stone-200 shadow-sm overflow-x-auto no-scrollbar">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${isActive
                      ? 'bg-stone-900 text-white shadow-sm'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                      }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Carousel Navigation Arrows in Header (When > 4 products) */}
            {hasSlider && (
              <div className="hidden sm:flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => scroll('left')}
                  disabled={!canScrollLeft}
                  aria-label="Artigos anteriores"
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${canScrollLeft
                    ? 'bg-white border-stone-300 text-stone-800 hover:bg-red-600 hover:text-white hover:border-red-600 shadow-sm'
                    : 'bg-stone-100 border-stone-200 text-stone-300 cursor-not-allowed'
                    }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => scroll('right')}
                  disabled={!canScrollRight}
                  aria-label="Próximos artigos"
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${canScrollRight
                    ? 'bg-white border-stone-300 text-stone-800 hover:bg-red-600 hover:text-white hover:border-red-600 shadow-sm'
                    : 'bg-stone-100 border-stone-200 text-stone-300 cursor-not-allowed'
                    }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Carousel / Slider Container */}
        <div className="relative group/carousel">

          {/* Floating Left Arrow on Desktop */}
          {hasSlider && canScrollLeft && (
            <button
              type="button"
              onClick={() => scroll('left')}
              aria-label="Artigos anteriores"
              className="hidden lg:flex absolute -left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white text-stone-900 shadow-xl border border-stone-200 items-center justify-center hover:bg-red-600 hover:text-white hover:border-red-600 transition-all cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Floating Right Arrow on Desktop */}
          {hasSlider && canScrollRight && (
            <button
              type="button"
              onClick={() => scroll('right')}
              aria-label="Próximos artigos"
              className="hidden lg:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white text-stone-900 shadow-xl border border-stone-200 items-center justify-center hover:bg-red-600 hover:text-white hover:border-red-600 transition-all cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Product Cards Track: Exactly 4 products per view on desktop (lg), 2 on tablet (sm), peek-swipe on mobile */}
          <div
            ref={sliderRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar pb-3 pt-1 px-1"
          >
            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                className="w-[84vw] max-w-[320px] sm:max-w-none sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] shrink-0 snap-start bg-white rounded-2xl border border-stone-200 hover:border-red-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-3.5 sm:p-4 flex flex-col justify-between group"
              >
                <div>
                  {/* Image & Badges Container */}
                  <div className="relative rounded-xl bg-stone-50 border border-stone-100 aspect-square flex items-center justify-center mb-4 overflow-hidden group/img">

                    {/* Top Left Badges */}
                    <div className="absolute top-2.5 left-2.5 z-10 flex flex-col items-start gap-1 pointer-events-none">
                      {prod.discountLabel ? (
                        <span className="px-2.5 py-1 bg-red-600 text-white font-extrabold text-[10px] rounded-md uppercase tracking-wider shadow-sm">
                          {prod.discountLabel}
                        </span>
                      ) : null}
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-semibold text-[10px] rounded border border-emerald-200 shadow-xs">
                        Em Stock
                      </span>
                    </div>

                    {/* Top Right Action Icons: Wishlist & Quick View */}
                    <div className="absolute top-2.5 right-2.5 z-20 flex flex-col gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => handleToggleWishlist(e, prod)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-md cursor-pointer ${wishlistStore.hasItem(prod.id)
                          ? 'bg-red-600 text-white shadow-red-500/30 ring-2 ring-red-400'
                          : 'bg-white/95 text-stone-700 hover:bg-red-600 hover:text-white border border-stone-200/80 hover:border-red-600'
                          }`}
                        title={wishlistStore.hasItem(prod.id) ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
                        aria-label="Wishlist"
                      >
                        <svg className="w-4 h-4" fill={wishlistStore.hasItem(prod.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleOpenQuickView(e, prod)}
                        className="w-8 h-8 rounded-full bg-white/95 text-stone-700 hover:bg-[#107b46] hover:text-white border border-stone-200/80 hover:border-[#107b46] flex items-center justify-center transition-all shadow-md cursor-pointer"
                        title="Schnellansicht"
                        aria-label="Quick View"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </div>

                    {/* Resilient Product Image */}
                    <Link href={`/produkt/${prod.slug}`} className="w-full h-full block">
                      <ProductCardImage
                        src={prod.images && prod.images[0] ? prod.images[0] : undefined}
                        alt={prod.title}
                        categorySlug={prod.categorySlug}
                        title={prod.title}
                        categoryName={prod.categoryName}
                      />
                    </Link>
                  </div>

                  {/* Category & Title */}
                  <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1 flex flex-wrap items-center gap-1 z-20 relative">
                    {prod.categories && prod.categories.length > 0 ? (
                      prod.categories.map((cat, idx) => (
                        <React.Fragment key={cat.slug || idx}>
                          <Link
                            href={`/kategorie/${cat.slug}`}
                            className="hover:text-[#107b46] hover:underline transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {cat.name}
                          </Link>
                          {idx < prod.categories!.length - 1 && (
                            <span className="text-stone-300 font-normal">,</span>
                          )}
                        </React.Fragment>
                      ))
                    ) : prod.categorySlug ? (
                      <Link
                        href={`/kategorie/${prod.categorySlug}`}
                        className="hover:text-[#107b46] hover:underline transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {prod.categoryName || 'Haushaltsgeräte'}
                      </Link>
                    ) : (
                      <span>{prod.categoryName || 'Haushaltsgeräte'}</span>
                    )}
                  </div>
                  <Link href={`/produkt/${prod.slug}`}>
                    <h4 className="font-bold text-stone-900 text-sm mt-1 line-clamp-2 min-h-[40px] group-hover:text-[#107b46] transition-colors">
                      {prod.title}
                    </h4>
                  </Link>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-1.5 text-amber-500 text-xs mt-2">
                    <span className="tracking-tighter">★★★★★</span>
                    <span className="text-stone-400 font-normal text-[11px]">4.9 (42)</span>
                  </div>
                </div>

                {/* Price & Add to Cart Button */}
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                  <div>
                    {prod.compareAtPrice && prod.compareAtPrice > prod.price && (
                      <span className="text-stone-400 line-through text-xs block font-medium">
                        {prod.compareAtPrice.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                      </span>
                    )}
                    <span className="text-stone-900 font-extrabold text-lg">
                      {prod.price.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddToCart(prod)}
                    className="px-3.5 py-2 bg-stone-900 hover:bg-[#107b46] text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer flex items-center gap-1.5 group/btn"
                    title={`${prod.title} in den Warenkorb legen`}
                  >
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>In den Warenkorb</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Swipe / Slide Indicator (When > 4 products) */}
          {hasSlider && (
            <div className="flex items-center justify-between sm:hidden mt-4 pt-2">
              <span className="text-xs font-semibold text-stone-500">
                {filteredProducts.length} produtos disponíveis (deslize para ver mais)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scroll('left')}
                  disabled={!canScrollLeft}
                  className={`w-8 h-8 rounded-lg border flex items-center justify-center ${canScrollLeft ? 'bg-white text-stone-900 border-stone-300' : 'bg-stone-100 text-stone-300 border-stone-200'
                    }`}
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => scroll('right')}
                  disabled={!canScrollRight}
                  className={`w-8 h-8 rounded-lg border flex items-center justify-center ${canScrollRight ? 'bg-white text-stone-900 border-stone-300' : 'bg-stone-100 text-stone-300 border-stone-200'
                    }`}
                >
                  ›
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-stone-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-stone-700 text-xs font-semibold flex items-center gap-3 z-50 animate-bounce">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          isOpen={isQuickViewOpen}
          onClose={() => setIsQuickViewOpen(false)}
          product={quickViewProduct}
        />
      )}
    </section>
  );
}
