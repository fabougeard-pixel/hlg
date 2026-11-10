'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { searchProducts } from '@/actions/public';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import { useTranslations } from 'next-intl';
import Price from '@/components/Price';
import { getUserRole } from '@/actions/auth';

const LoginModal = dynamic(() => import('@/components/auth/LoginModal'), { ssr: false });
const CartDrawer = dynamic(() => import('@/components/cart/CartDrawer'), { ssr: false });
const WishlistDrawer = dynamic(() => import('@/components/wishlist/WishlistDrawer'), { ssr: false });
const MobileSidebar = dynamic(() => import('@/components/layout/MobileSidebar'), { ssr: false });
const MobileSearchOverlay = dynamic(() => import('@/components/layout/MobileSearchOverlay'), { ssr: false });

type HeaderProps = {
  announcement?: string;
  logoImage?: string;
  headerLogoHeight?: string;
  mobileLogoHeight?: string;
  menuLinks?: Array<{ label: string; url: string }>;
  topBarLinks?: Array<{ label: string; icon: string; url: string }>;
  loginText?: string;
  myAccountText?: string;
  adminDashboardText?: string;
  topBarBgColor?: string;
  topBarTextColor?: string;
  categories?: Array<{ id: string; name: string; slug: string | null; parentId?: string | null }>;
  searchBorderColor?: string;
  searchPlaceholder?: string;
  searchBtnText?: string;
  searchBtnBgColor?: string;
  searchBtnTextColor?: string;
  showNew?: boolean;
  showHot?: boolean;
  showSale?: boolean;
  mobileAboutTitle?: string;
  mobileAboutDesc?: string;
  mobileMenuLinks?: Array<{ label: string; url: string }>;
  mobileContactAddress?: string;
  mobileContactPhone?: string;
  mobileContactEmail?: string;
  mobileContactWebsite?: string;
  mobileHeaderBorderColor?: string;
  allCategoriesBgColor?: string;
  allCategoriesTextColor?: string;
  userRole?: 'ADMIN' | 'CUSTOMER' | null;
};

const applianceCategoriesList = [
  { name: 'Alle Kategorien', slug: 'all' },
  { name: 'Gaming', slug: 'gaming' },
  { name: 'Geschirrspüler', slug: 'geschirrspueler' },
  { name: 'Herde', slug: 'herde' },
  { name: 'Kaffeemaschinen', slug: 'kaffeemaschinen' },
  { name: 'Küchenmaschinen', slug: 'kuechenmaschinen' },
  { name: 'Kühlen & Gefrieren', slug: 'kuehlen-gefrieren' },
  { name: 'Staubsauger & Reiniger', slug: 'staubsauger-reiniger' },
  { name: 'Waschmaschinen', slug: 'waschmaschinen' },
  { name: 'Trockner', slug: 'trockner' },
  { name: 'Mikrowellen', slug: 'mikrowellen' },
];

export default function Header({
  announcement = 'Willkommen bei HLG Hausgeräte • Kostenloser Versand ab 50 €',
  logoImage = '/LOGO-HLG-HAUSGERAETE.png',
  headerLogoHeight = '48',
  mobileLogoHeight = '40',
  menuLinks = [],
  topBarLinks = [],
  loginText,
  myAccountText,
  adminDashboardText,
  topBarBgColor = '#ffffff',
  topBarTextColor = '#4b5563',
  categories = [],
  searchBorderColor = '#d1d5db',
  searchPlaceholder = 'Produkt suchen .....',
  searchBtnText = 'Suchen',
  searchBtnBgColor = '#f59e0b',
  searchBtnTextColor = '#111827',
  showNew = true,
  showHot = true,
  showSale = true,
  mobileAboutTitle = '',
  mobileAboutDesc = '',
  mobileMenuLinks = [],
  mobileContactAddress = '',
  mobileContactPhone = '',
  mobileContactEmail = '',
  mobileContactWebsite = '',
  mobileHeaderBorderColor = '#d1d5db',
  userRole = null,
}: HeaderProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const cartStore = useCartStore();
  const wishlistStore = useWishlistStore();

  const cartItems = cartStore.getTotalItems();
  const cartTotal = cartStore.getTotalPrice();
  const wishlistItems = wishlistStore.items.length;

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [actualUserRole, setActualUserRole] = useState<'ADMIN' | 'CUSTOMER' | null>(userRole);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCategoryLabel, setSelectedCategoryLabel] = useState('Alle Kategorien');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getUserRole().then(role => {
      setActualUserRole(role as 'ADMIN' | 'CUSTOMER' | null);
    });
    setMounted(true);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);

    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Debounced Search Effect
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        setIsSearching(true);
        setShowSearchResults(true);
        try {
          const results = await searchProducts(searchQuery, selectedCategory === 'all' ? '' : selectedCategory, 6);
          setSearchResults(results);
        } catch (error) {
          console.error('Search error', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() || selectedCategory !== 'all') {
      setShowSearchResults(false);
      const params = new URLSearchParams();
      if (searchQuery.trim()) {
        params.append('q', searchQuery.trim());
      }
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      router.push(`/search?${params.toString()}`);
    }
  };

  const navLinks = menuLinks && menuLinks.length > 0 ? menuLinks : [
    { label: 'Startseite', url: '/' },
    { label: 'Shop', url: '/shop' },
    { label: 'Kontakt', url: '/kontakt' },
    { label: 'Rückgabe & Erstattung', url: '/rueckgabe-und-erstattung' },
  ];

  const currentLogo = logoImage && logoImage !== '/logo.jpg' && logoImage !== '/logo-flame.png' 
    ? logoImage 
    : '/LOGO-HLG-HAUSGERAETE.png';

  return (
    <>
      <header className="w-full font-sans relative z-50 shadow-sm">
        {/* Top Green Brand Bar */}
        <div className="bg-[#107b46] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center group transition-transform hover:opacity-95" title="HLG Hausgeräte">
                <Image
                  src={currentLogo}
                  alt="HLG HAUSGERÄTE"
                  width={220}
                  height={58}
                  className="h-10 sm:h-12 w-auto object-contain brightness-105"
                  priority
                />
              </Link>
            </div>

            {/* Middle Search Bar with Categories Dropdown and Pill Button */}
            <div className="hidden lg:flex flex-1 max-w-2xl mx-4 relative" ref={searchContainerRef}>
              <form
                onSubmit={handleSearchSubmit}
                className="w-full bg-white rounded-full flex items-center pl-3 pr-1.5 py-1 shadow-sm border border-transparent focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-200 transition-all text-stone-800"
              >
                {/* Category Dropdown inside Search Bar */}
                <div className="relative shrink-0" ref={categoryDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900 transition rounded-full hover:bg-stone-100 select-none cursor-pointer"
                  >
                    <span className="truncate max-w-[130px]">{selectedCategoryLabel}</span>
                    <svg
                      className={`w-3.5 h-3.5 text-stone-500 transition-transform duration-200 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isCategoryDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-stone-200 shadow-xl rounded-2xl py-2 z-50 text-xs font-medium text-stone-700 animate-in fade-in duration-150">
                      <div className="px-3 py-1 text-[10px] font-bold tracking-wider text-stone-400 uppercase">
                        Kategorie wählen
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {applianceCategoriesList.map((cat) => (
                          <button
                            key={cat.slug}
                            type="button"
                            onClick={() => {
                              setSelectedCategory(cat.slug);
                              setSelectedCategoryLabel(cat.name);
                              setIsCategoryDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3.5 py-2 hover:bg-emerald-50 hover:text-[#107b46] transition flex items-center justify-between ${
                              selectedCategory === cat.slug ? 'font-bold text-[#107b46] bg-emerald-50/70' : ''
                            }`}
                          >
                            <span>{cat.name}</span>
                            {selectedCategory === cat.slug && (
                              <svg className="w-3.5 h-3.5 text-[#107b46]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Thin Divider */}
                <div className="w-[1px] h-5 bg-stone-300 mx-1 shrink-0" />

                {/* Search Input */}
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (searchQuery.length > 1) setShowSearchResults(true);
                  }}
                  className="flex-1 px-3 py-1 text-sm bg-transparent outline-none placeholder-stone-400 text-stone-800"
                />

                {/* Clear query button if text present */}
                {searchQuery.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setShowSearchResults(false);
                    }}
                    className="p-1 mr-1 text-stone-400 hover:text-stone-600 transition"
                    title="Löschen"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}

                {/* Yellow "Suchen" Button with Magnifying Glass */}
                <button
                  type="submit"
                  className="bg-[#f59e0b] hover:bg-[#d97706] active:bg-[#b45309] text-stone-900 font-bold px-5 py-2 rounded-full flex items-center gap-1.5 transition text-xs sm:text-sm shrink-0 shadow-sm cursor-pointer"
                >
                  {isSearching ? (
                    <div className="w-3.5 h-3.5 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{searchBtnText}</span>
                      <svg className="w-4 h-4 text-stone-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </>
                  )}
                </button>
              </form>

              {/* Autocomplete Search Results Dropdown */}
              {showSearchResults && searchQuery.length > 1 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-stone-200 shadow-2xl rounded-2xl z-50 overflow-hidden">
                  {isSearching && searchResults.length === 0 ? (
                    <div className="p-4 text-center text-stone-500 text-sm">Suche nach Geräten...</div>
                  ) : searchResults.length > 0 ? (
                    <div>
                      <div className="px-4 py-2 bg-stone-50 border-b border-stone-100 flex items-center justify-between text-xs font-semibold text-stone-600">
                        <span>Gefundene Produkte</span>
                        <Link
                          href={`/search?q=${encodeURIComponent(searchQuery)}`}
                          onClick={() => setShowSearchResults(false)}
                          className="text-[#107b46] hover:underline"
                        >
                          Alle anzeigen &rarr;
                        </Link>
                      </div>
                      <ul className="max-h-80 overflow-y-auto divide-y divide-stone-100">
                        {searchResults.map((product) => (
                          <li key={product.id}>
                            <Link
                              href={`/produto/${product.slug}`}
                              onClick={() => {
                                setShowSearchResults(false);
                                setSearchQuery('');
                              }}
                              className="flex items-center px-4 py-2.5 hover:bg-amber-50/50 transition group"
                            >
                              <div className="w-11 h-11 flex-shrink-0 bg-stone-50 rounded-lg overflow-hidden mr-3 p-1 border border-stone-100">
                                {product.images && product.images.length > 0 ? (
                                  <Image
                                    width={100}
                                    height={100}
                                    src={product.images[0]}
                                    alt={product.title}
                                    className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-stone-300">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-stone-900 truncate group-hover:text-[#107b46] transition-colors">
                                  {product.title}
                                </h4>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <Price amount={product.price} showTax={false} className="text-[#107b46] font-bold text-sm" />
                                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                                    <Price amount={product.compareAtPrice} showTax={false} className="text-stone-400 line-through text-xs" />
                                  )}
                                </div>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-sm text-stone-500">
                      Keine Produkte gefunden für &quot;<span className="font-semibold text-stone-800">{searchQuery}</span>&quot;
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Side: Konto + 3 Yellow Badge Icons + Hamburger */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              {/* Account Button: Icon + "Konto" */}
              <button
                type="button"
                onClick={() => {
                  if (actualUserRole) {
                    router.push(actualUserRole === 'ADMIN' ? '/admin' : '/account');
                  } else {
                    setIsLoginModalOpen(true);
                  }
                }}
                className="flex items-center gap-1.5 text-white hover:text-amber-300 transition py-1 text-sm font-medium cursor-pointer"
                title={actualUserRole ? 'Mein Konto' : 'Anmelden'}
              >
                <div className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center hover:border-white transition">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="hidden sm:inline-block font-semibold text-sm">Konto</span>
              </button>

              {/* Vertical divider */}
              <div className="w-[1px] h-6 bg-white/30 hidden sm:block" />

              {/* 1. Vergleich (Compare) Icon with yellow badge */}
              <button
                type="button"
                onClick={() => router.push('/compare')}
                className="relative p-1 text-white hover:text-amber-300 transition"
                title="Produktvergleich"
                aria-label="Produktvergleich"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="absolute -top-1 -right-1 bg-[#f59e0b] text-stone-900 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  0
                </span>
              </button>

              {/* 2. Wunschliste (Wishlist) Icon with yellow badge */}
              <button
                type="button"
                onClick={() => wishlistStore.setIsOpen(true)}
                className="relative p-1 text-white hover:text-amber-300 transition"
                title="Wunschliste"
                aria-label="Wunschliste"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="absolute -top-1 -right-1 bg-[#f59e0b] text-stone-900 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {mounted ? wishlistItems : 0}
                </span>
              </button>

              {/* 3. Warenkorb (Cart) Icon with yellow badge */}
              <button
                type="button"
                onClick={() => cartStore.setIsOpen(true)}
                className="relative p-1 text-white hover:text-amber-300 transition"
                title="Warenkorb"
                aria-label="Warenkorb"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span className="absolute -top-1 -right-1 bg-[#f59e0b] text-stone-900 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {mounted ? cartItems : 0}
                </span>
              </button>

              {/* Mobile Search Button (Visible on mobile/tablet) */}
              <button
                type="button"
                onClick={() => setIsMobileSearchOpen(true)}
                className="lg:hidden p-1.5 text-white hover:text-amber-300 transition"
                aria-label="Suche öffnen"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Hamburger Menu Toggle (Visible on mobile/tablet) */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-1.5 text-white hover:text-amber-300 transition ml-1"
                aria-label="Menü öffnen"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Secondary Navigation Bar (White Sub-Header) */}
        <div className="bg-white border-b border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            {/* Nav links on the left */}
            <nav className="flex items-center space-x-6 sm:space-x-8 text-sm font-semibold">
              {navLinks.map((link, idx) => {
                const isHome = link.url === '/' || link.label.toLowerCase() === 'startseite';
                return (
                  <Link
                    key={idx}
                    href={link.url}
                    className={`py-3.5 transition-colors relative block ${
                      isHome
                        ? 'text-[#107b46] font-bold after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#107b46]'
                        : 'text-stone-700 hover:text-[#107b46]'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Value perks on desktop right */}
            <div className="hidden md:flex items-center space-x-6 text-xs font-medium text-stone-500">
              <span className="flex items-center gap-1.5 text-stone-700">
                <span className="text-[#107b46]">✓</span> Kostenloser Versand ab 50 €
              </span>
              <span className="flex items-center gap-1.5 text-stone-700">
                <span className="text-[#107b46]">✓</span> 2 Jahre Herstellergarantie
              </span>
              <span className="flex items-center gap-1.5 text-stone-700">
                <span className="text-[#107b46]">✓</span> Schnelle Lieferung
              </span>
            </div>
          </div>
        </div>

        {/* Modals & Drawers */}
        <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
        <CartDrawer isOpen={cartStore.isOpen} onClose={() => cartStore.setIsOpen(false)} />
        <WishlistDrawer isOpen={wishlistStore.isOpen} onClose={() => wishlistStore.setIsOpen(false)} />
        <MobileBottomNav
          onSearchClick={() => setIsMobileSearchOpen(true)}
          onLoginClick={() => setIsLoginModalOpen(true)}
          userRole={actualUserRole}
          onCartClick={() => cartStore.setIsOpen(true)}
        />
        <MobileSearchOverlay
          isOpen={isMobileSearchOpen}
          onClose={() => setIsMobileSearchOpen(false)}
          placeholder={searchPlaceholder}
        />
        <MobileSidebar
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          logoImage={currentLogo}
          logoHeight={mobileLogoHeight}
          aboutTitle={mobileAboutTitle}
          aboutDesc={mobileAboutDesc}
          menuLinks={navLinks}
          contactAddress={mobileContactAddress}
          contactPhone={mobileContactPhone}
          contactEmail={mobileContactEmail}
          contactWebsite={mobileContactWebsite}
          categories={categories}
        />
      </header>
    </>
  );
}
