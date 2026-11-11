'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import MobileHeaderBar, {
  BasketSvg,
  CloseSvg,
  CompareSvg,
  HeartSvg,
  SearchSvg,
  UserSvg,
} from '@/components/layout/MobileHeaderBar';

export type SearchCategoryOption = {
  name: string;
  value: string;
  isChild?: boolean;
};

type MobileSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  logoImage?: string;
  darkLogoImage?: string;
  menuLinks?: Array<{ label: string; url: string }>;
  contactAddress?: string;
  contactEmail?: string;
  searchCategories?: SearchCategoryOption[];
  searchPlaceholder?: string;
  cartCount?: number;
  wishlistCount?: number;
  compareCount?: number;
  onCartClick?: () => void;
  onWishlistClick?: () => void;
  onCompareClick?: () => void;
  onAccountClick?: () => void;
};

const fallbackSearchCategories: SearchCategoryOption[] = [
  { name: 'Alle Kategorien', value: 'all', isChild: false },
  { name: 'Gaming', value: 'gaming', isChild: false },
  { name: 'Geschirrspüler', value: 'geschirrspueler', isChild: false },
  { name: 'Herde', value: 'herde', isChild: false },
  { name: 'Kaffeemaschinen', value: 'kaffeemaschinen', isChild: false },
  { name: 'Küchenmaschinen', value: 'kuechenmaschinen', isChild: false },
  { name: 'Kühlen & Gefrieren', value: 'kuehlen-gefrieren', isChild: false },
  { name: 'Staubsauger & Reiniger', value: 'staubsauger-reiniger', isChild: false },
  { name: 'Waschmaschinen', value: 'waschmaschinen', isChild: false },
  { name: 'Trockner', value: 'trockner', isChild: false },
  { name: 'Mikrowellen', value: 'mikrowellen', isChild: false },
];

const isPlaceholderOrGenericAddress = (str?: string) => {
  if (!str) return true;
  const s = str.trim().toLowerCase();
  if (!s || s === 'deutschland' || s === 'germany') return true;
  return s.includes('123 main') || s.includes('example.com') || s.includes('123 456') || s.includes('253 000');
};

const isPlaceholderEmail = (str?: string) => {
  if (!str) return true;
  const s = str.trim().toLowerCase();
  return !s || s.includes('example.com');
};

type DrawerSearchBarProps = {
  categories: SearchCategoryOption[];
  placeholder: string;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  onNavigate: () => void;
};

function DrawerSearchBar({ categories, placeholder, inputRef, onNavigate }: DrawerSearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLabel, setSelectedLabel] = useState('Alle Kategorien');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() && selectedCategory === 'all') {
      inputRef?.current?.focus();
      return;
    }
    const params = new URLSearchParams();
    if (query.trim()) {
      params.append('q', query.trim());
    }
    if (selectedCategory !== 'all') {
      params.append('category', selectedCategory);
    }
    onNavigate();
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <form
        onSubmit={handleSubmit}
        className="w-full h-11 bg-[#f4f4f5] border border-stone-200/80 rounded-md flex items-center px-2.5 focus-within:bg-white focus-within:border-[#107b46] transition-colors"
      >
        <button
          type="button"
          onClick={() => setIsDropdownOpen((prev) => !prev)}
          className="flex items-center gap-1.5 text-xs sm:text-[13px] font-medium text-stone-700 hover:text-stone-900 pr-2 shrink-0 max-w-[140px] cursor-pointer"
        >
          <span className="truncate">{selectedLabel}</span>
          <svg
            className={`w-3.5 h-3.5 text-stone-500 shrink-0 transition-transform duration-150 ${isDropdownOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div className="w-px h-5 bg-stone-300/80 mx-2 shrink-0" />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="flex-1 min-w-0 bg-transparent text-sm text-stone-800 placeholder-stone-400 outline-none"
        />

        <button
          type="submit"
          aria-label="Suchen"
          className="p-1.5 text-stone-700 hover:text-[#107b46] transition shrink-0 cursor-pointer"
        >
          <SearchSvg className="w-4 h-4" />
        </button>
      </form>

      {isDropdownOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-stone-200 rounded-lg shadow-xl py-1.5 z-30 max-h-64 overflow-y-auto">
          {categories.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.value);
                setSelectedLabel(cat.name);
                setIsDropdownOpen(false);
              }}
              className={`w-full text-left py-2 text-xs font-medium hover:bg-emerald-50 hover:text-[#107b46] transition flex items-center justify-between cursor-pointer ${cat.isChild ? 'pl-6 pr-3.5 text-stone-600' : 'px-3.5 text-stone-800'
                } ${selectedCategory === cat.value ? 'font-semibold text-[#107b46] bg-emerald-50/70' : ''}`}
            >
              <span className="truncate">{cat.name}</span>
              {selectedCategory === cat.value && (
                <svg className="w-3.5 h-3.5 text-[#107b46] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function DrawerNavLinks({
  links,
  pathname,
  onNavigate,
}: {
  links: Array<{ label: string; url: string }>;
  pathname: string | null;
  onNavigate: () => void;
}) {
  return (
    <nav aria-label="Menü Navigation">
      <ul className="space-y-4">
        {links.map((link, idx) => {
          const isActive =
            link.url === '/'
              ? pathname === '/'
              : Boolean(pathname && pathname.startsWith(link.url));
          return (
            <li key={`${link.url}-${idx}`}>
              <Link
                href={link.url}
                onClick={onNavigate}
                className={`block text-[15px] font-medium transition-colors ${isActive ? 'text-[#107b46]' : 'text-stone-800 hover:text-[#107b46]'
                  }`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

const emptySubscribe = () => () => { };

/**
 * Responsive navigation & search drawer:
 * - Desktop (>= lg): left vertical green utility rail + white panel matching HLG off-canvas design.
 * - Mobile (< lg): white mobile top header pinned with close button + full-screen white drawer panel.
 */
export default function MobileSidebar({
  isOpen,
  onClose,
  logoImage = '/LOGO-HLG-HAUSGERAETE.png',
  darkLogoImage = '/LOGO-HLG-HAUSGERAETE-DARK.png',
  menuLinks = [],
  contactAddress = '',
  contactEmail = '',
  searchCategories,
  searchPlaceholder = 'Produkt suchen .....',
  cartCount = 0,
  wishlistCount = 0,
  compareCount = 0,
  onCartClick,
  onWishlistClick,
  onCompareClick,
  onAccountClick,
}: MobileSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const desktopSearchInputRef = useRef<HTMLInputElement>(null);
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const formattedDate = isClient
    ? new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
    : '';

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = '';
      return;
    }

    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const categoriesList =
    searchCategories && searchCategories.length > 0 ? searchCategories : fallbackSearchCategories;

  const displayLinks =
    menuLinks && menuLinks.length > 0
      ? menuLinks
      : [
        { label: 'Startseite', url: '/' },
        { label: 'Shop', url: '/shop' },
        { label: 'Kontakt', url: '/kontakt' },
        { label: 'Rückgabe & Erstattung', url: '/rueckgabe-und-erstattung' },
      ];

  const displayAddress = !isPlaceholderOrGenericAddress(contactAddress)
    ? contactAddress.trim()
    : 'Borsteler Chaussee 151, 22453 Hamburg, DEUTSCHLAND';

  const displayEmail = !isPlaceholderEmail(contactEmail)
    ? contactEmail.trim()
    : 'info@hlg-hausgeraete.de';

  const triggerCart = () => {
    onClose();
    onCartClick?.();
  };

  const triggerCompare = () => {
    onClose();
    if (onCompareClick) {
      onCompareClick();
    } else {
      router.push('/compare');
    }
  };

  const triggerWishlist = () => {
    onClose();
    onWishlistClick?.();
  };

  const triggerAccount = () => {
    onClose();
    if (onAccountClick) {
      onAccountClick();
    } else {
      router.push('/account');
    }
  };

  const railBadgeClasses =
    'absolute -top-1.5 -left-2 bg-[#facc15] text-stone-900 text-[10px] font-bold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center leading-none shadow-2xs';

  return (
    <>
      {/* Desktop Off-Canvas Drawer (lg+) */}
      <div className="hidden lg:flex fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label="Menü">
        <div
          className="absolute inset-0 bg-stone-950/60 backdrop-blur-[1px] transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />

        <div className="relative z-10 flex h-full w-[420px] max-w-[92vw] bg-white shadow-2xl animate-in slide-in-from-left duration-200">
          {/* Left Vertical Green Utility Rail */}
          <div className="w-14 bg-[#107b46] text-white flex flex-col items-center justify-between py-4 shrink-0">
            <div className="flex flex-col items-center gap-6">
              <button
                type="button"
                onClick={onClose}
                aria-label="Menü schließen"
                className="w-9 h-9 bg-white text-stone-700 hover:bg-stone-100 rounded-md shadow-xs flex items-center justify-center transition-colors cursor-pointer"
              >
                <CloseSvg className="w-4 h-4" />
              </button>

              <div className="flex flex-col items-center gap-5">
                <button
                  type="button"
                  onClick={triggerCart}
                  aria-label="Warenkorb"
                  title="Warenkorb"
                  className="relative p-1 text-white hover:text-amber-300 transition cursor-pointer"
                >
                  <BasketSvg className="w-5 h-5" />
                  <span className={railBadgeClasses}>{cartCount}</span>
                </button>

                <button
                  type="button"
                  onClick={triggerCompare}
                  aria-label="Produktvergleich"
                  title="Produktvergleich"
                  className="relative p-1 text-white hover:text-amber-300 transition cursor-pointer"
                >
                  <CompareSvg className="w-5 h-5" />
                  <span className={railBadgeClasses}>{compareCount}</span>
                </button>

                <button
                  type="button"
                  onClick={triggerWishlist}
                  aria-label="Wunschliste"
                  title="Wunschliste"
                  className="relative p-1 text-white hover:text-amber-300 transition cursor-pointer"
                >
                  <HeartSvg className="w-5 h-5" />
                  <span className={railBadgeClasses}>{wishlistCount}</span>
                </button>

                <button
                  type="button"
                  onClick={triggerAccount}
                  aria-label="Mein Konto"
                  title="Mein Konto"
                  className="p-1 text-white hover:text-amber-300 transition cursor-pointer"
                >
                  <UserSvg className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={() => desktopSearchInputRef.current?.focus()}
                  aria-label="Suche fokussieren"
                  title="Suchen"
                  className="p-1 text-white hover:text-amber-300 transition cursor-pointer"
                >
                  <SearchSvg className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="w-14 h-28 flex items-center justify-center overflow-hidden pb-2">
              <Image
                src={logoImage}
                alt="HLG HAUSGERÄTE"
                width={140}
                height={39}
                className="-rotate-90 max-w-none w-24 h-auto object-contain select-none"
              />
            </div>
          </div>

          {/* Right White Content Panel */}
          <div className="flex-1 bg-white px-6 py-5 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-12">
              <DrawerSearchBar
                categories={categoriesList}
                placeholder={searchPlaceholder}
                inputRef={desktopSearchInputRef}
                onNavigate={onClose}
              />

              <DrawerNavLinks
                links={displayLinks}
                pathname={pathname}
                onNavigate={onClose}
              />
            </div>

            <div className="pt-8 text-[13px] leading-relaxed text-stone-500 space-y-2">
              {formattedDate && <p>{formattedDate}</p>}
              <p>{displayAddress}</p>
              <a href={`mailto:${displayEmail}`} className="block text-stone-500 hover:text-[#107b46] transition">
                {displayEmail}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile / Tablet Full-Screen Menu Panel (< lg) */}
      <div className="lg:hidden fixed inset-0 z-[100] flex flex-col bg-white animate-in fade-in duration-150" role="dialog" aria-modal="true" aria-label="Mobiles Menü">
        <MobileHeaderBar
          logoSrc={darkLogoImage}
          isMenuOpen={true}
          onToggleMenu={onClose}
          onLogoClick={onClose}
          onAccountClick={triggerAccount}
          onCartClick={triggerCart}
          onCompareClick={triggerCompare}
          onWishlistClick={triggerWishlist}
          cartCount={cartCount}
          wishlistCount={wishlistCount}
          compareCount={compareCount}
        />

        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-8">
          <DrawerSearchBar
            categories={categoriesList}
            placeholder={searchPlaceholder}
            onNavigate={onClose}
          />

          <div className="mt-6">
            <DrawerNavLinks
              links={displayLinks}
              pathname={pathname}
              onNavigate={onClose}
            />
          </div>

          <div className="mt-6 p-5 border border-stone-200 rounded-md bg-white text-sm text-stone-700 leading-relaxed space-y-1.5">
            <p className="whitespace-pre-line">{displayAddress}</p>
            <a href={`mailto:${displayEmail}`} className="block text-stone-700 hover:text-[#107b46] transition">
              {displayEmail}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
