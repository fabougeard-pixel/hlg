export type SectionType =
  | 'Hero'
  | 'AktuelleAngebote'
  | 'CategoryShowcase'
  | 'CategoryShowcaseSection'
  | 'CategoryOverview'
  | 'BrandShowcase'
  | 'TrustBar'
  | 'CategoryExplorer'
  | 'HeatingGuideBlogs'
  | 'Newsletter'
  | 'PromoBanners'
  | 'ProductGrid'
  | 'FullWidthBanner'
  | 'FeaturedProductTabs'
  | 'ShippingSimulator'
  | 'BestDeals'
  | 'BestSeller'
  | 'LatestBlogs';

export interface SectionConfig {
  id: string;
  type: SectionType;
  name: string;
  enabled: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  settings: Record<string, any>;
}

export interface AdminCategoryOption {
  id: string;
  name: string;
  slug: string;
  displayName?: string;
}

export interface CatalogProductSummary {
  id: string;
  title: string;
  slug?: string;
  price: number;
  compareAtPrice?: number | null;
  images?: string[];
  discountLabel?: string | null;
  categorySlug?: string;
  categoryName?: string;
  categories?: Array<{ name: string; slug?: string | null }>;
}

export interface CategoryShowcaseDesign {
  accentColor?: string;
  saleColor?: string;
  titleColor?: string;
  titleSize?: number | string;
  paddingY?: number | string;
  sectionBg?: string;
  cardRadius?: number | string;
  cardBorderColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
  bannerBadgeBg?: string;
  bannerOverlayOpacity?: number | string;
  bannerWidth?: '3' | '4' | string;
}

export interface CategoryOverviewDesign {
  accentColor?: string;
  titleColor?: string;
  titleSize?: number | string;
  paddingY?: number | string;
  containerBgFrom?: string;
  containerBgTo?: string;
  containerBorderColor?: string;
  containerRadius?: number | string;
  cardBgColor?: string;
  cardRadius?: number | string;
  colsDesktop?: '2' | '3' | '4' | string;
}

export interface CategoryShowcaseSettings {
  preset?: CategorySectionPreset;
  title?: string;
  linkText?: string;
  linkUrl?: string;
  categorySlug?: string;
  sourceMode?: 'MANUAL' | 'CATEGORY';
  showBanner?: boolean;
  bannerPosition?: 'left' | 'right';
  bannerImage?: string;
  bannerBadge?: string;
  bannerTitle?: string;
  bannerCtaText?: string;
  bannerCtaUrl?: string;
  colsDesktop?: '2' | '3' | '4' | '5';
  maxProducts?: number;
  products?: CategoryProductItem[];
  design?: CategoryShowcaseDesign;
}

export interface CategoryOverviewSettings {
  eyebrow?: string;
  title?: string;
  description?: string;
  ctaText?: string;
  ctaUrl?: string;
  colsDesktop?: '2' | '3' | '4';
  cards?: OverviewCardItem[];
  design?: CategoryOverviewDesign;
}

export interface CatalogBrandSummary {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  productCount?: number;
  _count?: {
    products?: number;
  };
}

export interface BrandShowcaseItem {
  id: string;
  name: string;
  slug: string;
  slogan?: string;
  logo?: string;
  linkUrl?: string;
  productCount?: number;
}

export type ServicePerkIconKey = 'trash' | 'wrench' | 'shield' | 'card' | 'truck' | 'sparkles';

export interface ServicePerkItem {
  id: string;
  iconKey: ServicePerkIconKey;
  title: string;
  desc: string;
}

export interface BrandShowcaseDesign {
  accentColor?: string;
  sectionBg?: string;
  cardBgColor?: string;
  cardBorderColor?: string;
  cardRadius?: number | string;
  bannerBgColor?: string;
  bannerBorderColor?: string;
  titleColor?: string;
  titleSize?: number | string;
  paddingY?: number | string;
  colsDesktop?: '4' | '5' | '6' | string;
  logoHeight?: number | string;
  showSlogan?: boolean;
  showProductCount?: boolean;
  showServiceBanner?: boolean;
}

export interface BrandShowcaseSettings {
  eyebrow?: string;
  title?: string;
  description?: string;
  sourceMode?: 'AUTO' | 'MANUAL';
  maxBrands?: number;
  brands?: BrandShowcaseItem[];
  brandLogoOverrides?: Record<string, string>;
  serviceEyebrow?: string;
  serviceTitle?: string;
  servicePerks?: ServicePerkItem[];
  design?: BrandShowcaseDesign;
}

export type CategorySectionPreset = 'coffee' | 'washing' | 'cooling' | 'vacuum' | 'custom';

export interface CategoryProductItem {
  id: string;
  category: string;
  title: string;
  price: string;
  rawPrice: number;
  compareAtPrice?: string;
  discount?: string;
  rating: number;
  ratingScore?: string;
  image: string;
  slug: string;
  energyRating?: string;
  deliveryNote?: string;
}

export interface OverviewCardItem {
  id: string;
  title: string;
  subtitle: string;
  priceLabel: string;
  emoji?: string;
  image?: string;
  ctaText: string;
  linkUrl: string;
}

export interface CategorySectionDefaults {
  preset: CategorySectionPreset;
  title: string;
  linkText: string;
  linkUrl: string;
  categorySlug: string;
  sourceMode: 'MANUAL' | 'CATEGORY';
  showBanner: boolean;
  bannerPosition: 'left' | 'right';
  bannerImage: string;
  bannerBadge: string;
  bannerTitle: string;
  bannerCtaText: string;
  bannerCtaUrl: string;
  colsDesktop: '2' | '3' | '4' | '5';
  maxProducts: number;
  products: CategoryProductItem[];
}

export const CATEGORY_PRESET_DEFAULTS: Record<CategorySectionPreset, CategorySectionDefaults> = {
  coffee: {
    preset: 'coffee',
    title: 'Kaffeemaschinen & Vollautomaten',
    linkText: 'Alle ansehen',
    linkUrl: '/shop?category=kaffeemaschinen',
    categorySlug: 'kaffeemaschinen',
    sourceMode: 'MANUAL',
    showBanner: true,
    bannerPosition: 'left',
    bannerImage: '/images/hero-coffee-machine.jpg',
    bannerBadge: 'Barista Qualität',
    bannerTitle: 'Die besten Kaffeemaschinen zum besten Preis!',
    bannerCtaText: 'Jetzt entdecken',
    bannerCtaUrl: '/shop?category=kaffeemaschinen',
    colsDesktop: '4',
    maxProducts: 4,
    products: [
      {
        id: '0be90249-fb98-47a6-84d5-bb65ca07a6f0',
        category: 'Kaffeemaschinen',
        title: 'DELONGHI La Specialista Maestro Cold Brew EC9865.M Espressomaschine Silber/Schwarz',
        price: '1 322,90€',
        rawPrice: 1322.9,
        rating: 5,
        ratingScore: '(5.00)',
        image:
          'https://res.cloudinary.com/lrknfak7/image/upload/v1794347198/hlg/woocommerce-import/delonghi-la-specialista-maestro-cold-brew-ec9865-m-espressomaschine-silber-schwarz.jpg',
        slug: 'delonghi-la-specialista-maestro-cold-brew-ec9865-m-espressomaschine-silber-schwarz',
        deliveryNote: 'Auf Lager • 2-3 Werktage',
      },
      {
        id: '8626d785-471b-4181-bf2e-45caf76476c1',
        category: 'Kaffeemaschinen',
        title: 'SMEG EGF03PGEU Espressomaschine Pastellgrün',
        price: '790,90€',
        rawPrice: 790.9,
        rating: 5,
        ratingScore: '(4.90)',
        image:
          'https://res.cloudinary.com/lrknfak7/image/upload/v1794347230/hlg/woocommerce-import/smeg-egf03pgeu-espressomaschine-pastellgruen1.jpg',
        slug: 'smeg-egf03pgeu-espressomaschine-pastellgruen',
        deliveryNote: 'Auf Lager • 2-3 Werktage',
      },
      {
        id: 'd84a0488-8436-4c29-8e9c-db5ad29ae00d',
        category: 'Kaffeemaschinen',
        title: 'LELIT PL42 TEMD Espressomaschine Edelstahl',
        price: '545,90€',
        rawPrice: 545.9,
        rating: 5,
        ratingScore: '(4.85)',
        image:
          'https://res.cloudinary.com/lrknfak7/image/upload/v1794347248/hlg/woocommerce-import/lelit-pl42-temd-espressomaschine-edelstahl.jpg',
        slug: 'lelit-pl42-temd-espressomaschine-edelstahl',
        deliveryNote: 'Auf Lager • 2-3 Werktage',
      },
      {
        id: 'ae4c32ad-70c6-49b0-9278-3db6d322bedc',
        category: 'Kaffeemaschinen',
        title: 'MOCCAMASTER KBG Select Filterkaffeemaschine Yellow Pepper',
        price: '236,90€',
        rawPrice: 236.9,
        rating: 5,
        ratingScore: '(5.00)',
        image:
          'https://res.cloudinary.com/lrknfak7/image/upload/v1794347224/hlg/woocommerce-import/moccamaster-kbg-select-filterkaffeemaschine-yellow-pepper.jpg',
        slug: 'moccamaster-kbg-select-filterkaffeemaschine-yellow-pepper',
        deliveryNote: 'Auf Lager • 2-3 Werktage',
      },
    ],
  },

  washing: {
    preset: 'washing',
    title: 'Waschmaschinen & Frontlader',
    linkText: 'Alle ansehen',
    linkUrl: '/shop?category=waschmaschinen',
    categorySlug: 'waschmaschinen',
    sourceMode: 'MANUAL',
    showBanner: false,
    bannerPosition: 'left',
    bannerImage: '/images/hero-appliances.jpg',
    bannerBadge: 'Top Energieklasse A',
    bannerTitle: 'Sparsame Waschmaschinen & Frontlader',
    bannerCtaText: 'Jetzt ansehen',
    bannerCtaUrl: '/shop?category=waschmaschinen',
    colsDesktop: '5',
    maxProducts: 5,
    products: [
      {
        id: 'ca52bec5-ae06-440e-90b6-6a00ee50d2f7',
        category: 'Waschmaschine',
        title: 'MIELE WWB680 WCS 125 Edition W1 White Edition 8 kg 1400 U/Min.',
        price: '839,69€',
        rawPrice: 839.69,
        rating: 5,
        ratingScore: '(5.00)',
        image:
          'https://res.cloudinary.com/lrknfak7/image/upload/v1794335611/hlg/woocommerce-import/miele-wwb680-wcs-125-edition-w1-white-edition-waschmaschine-8-kg-1400-umin-a-flusenfilter-fremdkoerperfilter-1.jpg',
        slug: 'miele-wwb680-wcs-125-edition-w1-white-edition-waschmaschine-8-kg-1400-u-min-a-flusenfilter-fremdkoerperfilter',
        energyRating: 'A',
        deliveryNote: 'Kostenlose 2-Mann-Lieferung',
      },
      {
        id: '596c1c7a-44bf-4934-a8f9-2fb04b8e5ff9',
        category: 'Waschmaschine',
        title: 'BOSCH WGG 256 Z 40 Serie 6 Waschmaschine 10 kg 1600 U/Min.',
        price: '537,80€',
        rawPrice: 537.8,
        rating: 5,
        ratingScore: '(4.95)',
        image:
          'https://res.cloudinary.com/lrknfak7/image/upload/v1794335648/hlg/woocommerce-import/bosch-wgg-256-z-40-serie-6-waschmaschine-10-kg-1600-umin-a-1.jpg',
        slug: 'bosch-wgg-256-z-40-serie-6-waschmaschine-10-kg-1600-u-min-a',
        energyRating: 'A',
        deliveryNote: 'Auf Lager • 2-3 Werktage',
      },
      {
        id: '0172a8f1-d825-4e8d-8bc6-8a71fbcaed0f',
        category: 'Waschmaschine',
        title: 'SIEMENS WG44B2FCB iQ700 Waschmaschine 9 kg',
        price: '699,90€',
        rawPrice: 699.9,
        rating: 5,
        ratingScore: '(4.90)',
        image:
          'https://res.cloudinary.com/lrknfak7/image/upload/v1794335627/hlg/woocommerce-import/siemens-wg44b2fcb-iq700-waschmaschine-9-kg-1257-umin-a-1.jpg',
        slug: 'siemens-wg44b2fcb-iq700-waschmaschine-9-kg-1257-u-min-a',
        energyRating: 'A',
        deliveryNote: 'Auf Lager • 2-3 Werktage',
      },
      {
        id: 'eb0e381f-396d-4713-8488-c25bf72a4a82',
        category: 'Waschmaschine',
        title: 'SIEMENS WU14UT28 iQ500 Waschmaschine 8 kg 1400 U/Min.',
        price: '507,90€',
        rawPrice: 507.9,
        rating: 5,
        ratingScore: '(4.85)',
        image:
          'https://res.cloudinary.com/lrknfak7/image/upload/v1794335616/hlg/woocommerce-import/siemens-wu14ut28-iq500-waschmaschine-8-kg-1400-umin-a-1.jpg',
        slug: 'siemens-wu14ut28-iq500-waschmaschine-8-kg-1400-u-min-a',
        energyRating: 'A',
        deliveryNote: 'Auf Lager • 2-3 Werktage',
      },
      {
        id: '51e23ab5-a7c5-495d-87fa-1b5d076b119d',
        category: 'Waschmaschine',
        title: 'HAIER HW70-BP14929 I-Pro Series 1 Waschmaschine 7 kg',
        price: '328,98€',
        rawPrice: 328.98,
        rating: 5,
        ratingScore: '(4.80)',
        image:
          'https://res.cloudinary.com/lrknfak7/image/upload/v1794335660/hlg/woocommerce-import/haier-hw70-bp14929-i-pro-series-1-waschmaschine-7-kg-1330-u-min-a.jpg',
        slug: 'haier-hw70-bp14929-i-pro-series-1-waschmaschine-7-kg-1330-u-min-a',
        energyRating: 'A',
        deliveryNote: 'Auf Lager • 2-3 Werktage',
      },
    ],
  },

  cooling: {
    preset: 'cooling',
    title: 'Kühlen & Gefrieren (Side-by-Side & Kombi)',
    linkText: 'Alle ansehen',
    linkUrl: '/shop?category=kuehlen-gefrieren',
    categorySlug: 'kuehlen-gefrieren',
    sourceMode: 'MANUAL',
    showBanner: true,
    bannerPosition: 'left',
    bannerImage: '/images/banner-fridge.jpg',
    bannerBadge: 'Eco Design',
    bannerTitle: 'Unsere Auswahl an Kühlgeräten – 100% Energieeffizienz',
    bannerCtaText: 'Modelle ansehen',
    bannerCtaUrl: '/shop?category=kuehlen-gefrieren',
    colsDesktop: '3',
    maxProducts: 6,
    products: [
      {
        id: 'ccfc7ea9-a76d-4fa1-9ce5-1c10b00470bc',
        category: 'Kühlen & Gefrieren',
        title: 'HAIER HSR5918DIPB SBS 90 SERIE 5 Side-by-Side 511 l Schwarz Matt',
        price: '836,89€',
        rawPrice: 836.89,
        compareAtPrice: '1 108,79€',
        discount: '-25%',
        rating: 5,
        ratingScore: '(5.00)',
        image:
          'https://res.cloudinary.com/lrknfak7/image/upload/v1794334397/hlg/woocommerce-import/haier-hsr5918dipb-sbs-90-serie-5-side-by-side-511-l-d-1775-mm-hoch-schwarz-matt-1.jpg',
        slug: 'haier-hsr5918dipb-sbs-90-serie-5-side-by-side-511-l-d-1775-mm-hoch-schwarz-matt',
        energyRating: 'D',
        deliveryNote: 'Kostenlose 2-Mann-Lieferung',
      },
      {
        id: '5de41e99-5274-450f-a619-52b9c4b20bf3',
        category: 'Kühlen & Gefrieren',
        title: 'LG GSLE91EVAB L-Serie Side-by-Side 623 l Essence Black Steel',
        price: '1 599,90€',
        rawPrice: 1599.9,
        rating: 5,
        ratingScore: '(4.95)',
        image:
          'https://res.cloudinary.com/lrknfak7/image/upload/v1794334393/hlg/woocommerce-import/lg-gsle91evab-l-serie-side-by-side-623-l-b-1790-mm-hoch-essence-black-steel-1.jpg',
        slug: 'lg-gsle91evab-l-serie-side-by-side-623-l-b-1790-mm-hoch-essence-black-steel',
        energyRating: 'B',
        deliveryNote: 'Kostenlose 2-Mann-Lieferung',
      },
      {
        id: '732ee009-aa52-41eb-82fb-f883c4920e63',
        category: 'Kühlen & Gefrieren',
        title: 'KOENIC KDD 181 D NF IN Side by Side 522 l Dark Inox',
        price: '633,90€',
        rawPrice: 633.9,
        rating: 5,
        ratingScore: '(4.85)',
        image:
          'https://res.cloudinary.com/lrknfak7/image/upload/v1794334412/hlg/woocommerce-import/koenic-kdd-181-d-nf-in-side-by-side-522-l-d-1905-mm-hoch-dark-inox-1.jpg',
        slug: 'koenic-kdd-181-d-nf-in-side-by-side-522-l-d-1905-mm-hoch-dark-inox',
        energyRating: 'D',
        deliveryNote: 'Kostenlose 2-Mann-Lieferung',
      },
      {
        id: 'ab5d1902-34fc-4899-8bb3-c0fd348ad8a7',
        category: 'Kühlen & Gefrieren',
        title: 'HAIER HDPW3620CNPD 2D 60 SERIE 3 Pro Kühlgefrierkombination 406 l',
        price: '424,90€',
        rawPrice: 424.9,
        rating: 5,
        ratingScore: '(4.80)',
        image:
          'https://res.cloudinary.com/lrknfak7/image/upload/v1794334408/hlg/woocommerce-import/haier-hdpw3620cnpd-2d-60-serie-3-pro-kuehlgefrierkombination-c-406-l-2050-mm-hoch-dark-inox-1.jpg',
        slug: 'haier-hdpw3620cnpd-2d-60-serie-3-pro-kuehlgefrierkombination-c-406-l-2050-mm-hoch-dark-inox',
        energyRating: 'C',
        deliveryNote: 'Auf Lager • 2-3 Werktage',
      },
      {
        id: '55952923-d412-4827-9244-81272ddeab68',
        category: 'Kühlen & Gefrieren',
        title: 'LG GBV5240CPY Serie 5 Kühlgefrierkombination 387 l Prime Silver',
        price: '500,60€',
        rawPrice: 500.6,
        rating: 5,
        ratingScore: '(4.90)',
        image:
          'https://res.cloudinary.com/lrknfak7/image/upload/v1794334386/hlg/woocommerce-import/lg-gbv5240cpy-serie-5-kuehlgefrierkombination-c-387-l-2030-mm-hoch-prime-silver-1.jpg',
        slug: 'lg-gbv5240cpy-serie-5-kuehlgefrierkombination-c-387-l-2030-mm-hoch-prime-silver',
        energyRating: 'C',
        deliveryNote: 'Auf Lager • 2-3 Werktage',
      },
      {
        id: 'c58a92e2-17dd-4645-b060-10de305d5c62',
        category: 'Kühlen & Gefrieren',
        title: 'HAIER HFR3718ENMD FD 70 SERIE 3 French Door 402 l Dark Inox',
        price: '517,98€',
        rawPrice: 517.98,
        rating: 5,
        ratingScore: '(4.75)',
        image:
          'https://res.cloudinary.com/lrknfak7/image/upload/v1794334382/hlg/woocommerce-import/haier-hfr3718enmd-fd-70-serie-3-french-door-402-l-e-1775-mm-hoch-dark-inox-1.jpg',
        slug: 'haier-hfr3718enmd-fd-70-serie-3-french-door-402-l-e-1775-mm-hoch-dark-inox',
        energyRating: 'E',
        deliveryNote: 'Kostenlose 2-Mann-Lieferung',
      },
    ],
  },

  vacuum: {
    preset: 'vacuum',
    title: 'Staubsauger & Reinigungsroboter',
    linkText: 'Alle ansehen',
    linkUrl: '/shop?category=staubsauger-reiniger',
    categorySlug: 'staubsauger-reiniger',
    sourceMode: 'MANUAL',
    showBanner: false,
    bannerPosition: 'left',
    bannerImage: '/images/hero-appliances.jpg',
    bannerBadge: 'Smart Clean',
    bannerTitle: 'Reinigungsroboter & Akkusauger',
    bannerCtaText: 'Jetzt entdecken',
    bannerCtaUrl: '/shop?category=staubsauger-reiniger',
    colsDesktop: '4',
    maxProducts: 4,
    products: [
      {
        id: 'b65ac695-ff62-4f7c-9e44-6cf5e9bccaf8',
        category: 'Staubsauger & Reiniger',
        title: 'ROBOROCK S8 MAXV ULTRA WEISS MIT WASSERANSCHLUSS Saugroboter',
        price: '1 303,80€',
        rawPrice: 1303.8,
        compareAtPrice: '1 740,55€',
        discount: '-25%',
        rating: 5,
        ratingScore: '(4.90)',
        image:
          'https://res.cloudinary.com/lrknfak7/image/upload/v1794334330/hlg/woocommerce-import/roborock-s8-maxv-ultra-weiss-mit-wasseranschluss-saugroboter-1.jpg',
        slug: 'roborock-s8-maxv-ultra-weiss-mit-wasseranschluss-saugroboter',
        deliveryNote: 'Sofort lieferbar',
      },
      {
        id: 'fa00ed3e-0c83-4ac6-8ac1-7d8e627991da',
        category: 'Staubsauger & Reiniger',
        title: 'MIELE Scout RX3 Runner Saugroboter',
        price: '489,80€',
        rawPrice: 489.8,
        rating: 5,
        ratingScore: '(4.85)',
        image:
          'https://res.cloudinary.com/lrknfak7/image/upload/v1794334336/hlg/woocommerce-import/miele-scout-rx3-runner-saugroboter-1.jpg',
        slug: 'miele-scout-rx3-runner-saugroboter',
        deliveryNote: 'Auf Lager • 2-3 Werktage',
      },
      {
        id: 'a0e8af20-1e8f-4056-bfbd-19ecc75676e5',
        category: 'Staubsauger & Reiniger',
        title: 'DREAME L10 Ultra Saugroboter mit Station',
        price: '517,90€',
        rawPrice: 517.9,
        rating: 5,
        ratingScore: '(4.80)',
        image:
          'https://res.cloudinary.com/lrknfak7/image/upload/v1794334357/hlg/woocommerce-import/dreame-l-10-ultra-saugroboter-1.jpg',
        slug: 'dreame-l-10-ultra-saugroboter-2023',
        deliveryNote: 'Auf Lager • 2-3 Werktage',
      },
      {
        id: '1ef3eacf-f054-4cd3-a969-44a3bb391a65',
        category: 'Staubsauger & Reiniger',
        title: 'XIAOMI X20+ Saugroboter mit Absaug- & Wischstation',
        price: '279,92€',
        rawPrice: 279.92,
        rating: 5,
        ratingScore: '(4.85)',
        image:
          'https://res.cloudinary.com/lrknfak7/image/upload/v1794334362/hlg/woocommerce-import/xiaomi-x20-saugroboter-5.jpg',
        slug: 'xiaomi-x20-saugroboter',
        deliveryNote: 'Sofort lieferbar',
      },
    ],
  },

  custom: {
    preset: 'custom',
    title: 'Kategorie-Highlights',
    linkText: 'Alle ansehen',
    linkUrl: '/shop',
    categorySlug: '',
    sourceMode: 'CATEGORY',
    showBanner: false,
    bannerPosition: 'left',
    bannerImage: '/images/hero-appliances.jpg',
    bannerBadge: 'HLG Auswahl',
    bannerTitle: 'Top Marken zum Bestpreis',
    bannerCtaText: 'Jetzt entdecken',
    bannerCtaUrl: '/shop',
    colsDesktop: '4',
    maxProducts: 4,
    products: [],
  },
};

export const DEFAULT_OVERVIEW_CARDS: OverviewCardItem[] = [
  {
    id: 'ov-dishwashers',
    title: 'Geschirrspüler',
    subtitle: 'Vollintegriert, Einbau & Tischgeräte',
    priceLabel: 'Ab 202,79 €',
    emoji: '🍽️',
    image:
      'https://res.cloudinary.com/lrknfak7/image/upload/v1794335022/hlg/woocommerce-import/bomann-tsg-5701-tischgeschirrspueler-auftischgeraet-420-mm-breit-58-db-a-g-1.jpg',
    ctaText: 'Modelle ansehen',
    linkUrl: '/shop?category=geschirrspueler-grosse-haushaltsgeraete',
  },
  {
    id: 'ov-kitchen',
    title: 'Küchenmaschinen',
    subtitle: 'Kenwood, KitchenAid & Zubehör',
    priceLabel: 'Ab 192,89 €',
    emoji: '🥣',
    image:
      'https://res.cloudinary.com/lrknfak7/image/upload/v1794334231/hlg/woocommerce-import/kenwood-kmix-kmx751abk-kuechenmaschine-black-ruehrschuesselkapazitaet-5-l-1000-watt-1.jpg',
    ctaText: 'Modelle ansehen',
    linkUrl: '/shop?category=kuechenmaschinen',
  },
  {
    id: 'ov-hobs',
    title: 'Herde & Induktion',
    subtitle: 'Induktionskochfelder & Backöfen',
    priceLabel: 'Ab 198,80 €',
    emoji: '🍳',
    image:
      'https://res.cloudinary.com/lrknfak7/image/upload/v1794335668/hlg/woocommerce-import/aeg-ike-84471-xb-steel-766-mm-breit-6-kochfelder.jpg',
    ctaText: 'Modelle ansehen',
    linkUrl: '/shop?category=herde',
  },
  {
    id: 'ov-gaming',
    title: 'Gaming & Unterhaltung',
    subtitle: 'PS5, Switch OLED, Xbox & VR',
    priceLabel: 'Ab 174,60 €',
    emoji: '🎮',
    image:
      'https://res.cloudinary.com/lrknfak7/image/upload/v1794334532/hlg/woocommerce-import/asset-mp-107802474.jpg',
    ctaText: 'Modelle ansehen',
    linkUrl: '/shop?category=gaming',
  },
];

export const DEFAULT_CATEGORY_OVERVIEW_SETTINGS = {
  eyebrow: 'Sortiment im Überblick',
  title: 'Weitere Gerätekategorien entdecken',
  description:
    'Entdecken Sie unser gesamtes Portfolio führender Hersteller – sofort lieferbar mit 2 Jahren Garantie.',
  ctaText: 'Gesamten Shop ansehen',
  ctaUrl: '/shop',
  colsDesktop: '4',
  cards: DEFAULT_OVERVIEW_CARDS,
};

export function createSplitCategorySections(enabled = true): SectionConfig[] {
  return [
    {
      id: 'sec_cat_coffee',
      type: 'CategoryShowcaseSection',
      name: 'Kaffeemaschinen & Vollautomaten',
      enabled,
      settings: { preset: 'coffee' },
    },
    {
      id: 'sec_cat_washing',
      type: 'CategoryShowcaseSection',
      name: 'Waschmaschinen & Frontlader',
      enabled,
      settings: { preset: 'washing' },
    },
    {
      id: 'sec_cat_cooling',
      type: 'CategoryShowcaseSection',
      name: 'Kühlen & Gefrieren (Side-by-Side & Kombi)',
      enabled,
      settings: { preset: 'cooling' },
    },
    {
      id: 'sec_cat_vacuum',
      type: 'CategoryShowcaseSection',
      name: 'Staubsauger & Reinigungsroboter',
      enabled,
      settings: { preset: 'vacuum' },
    },
    {
      id: 'sec_cat_overview',
      type: 'CategoryOverview',
      name: 'Sortiment im Überblick',
      enabled,
      settings: {},
    },
  ];
}

export const DEFAULT_HLG_SECTIONS: SectionConfig[] = [
  { id: 'sec_hero', type: 'Hero', name: 'Hero Banner & Kategorien', enabled: true, settings: {} },
  { id: 'sec_deals', type: 'AktuelleAngebote', name: 'Aktuelle Angebote & Bestseller', enabled: true, settings: {} },
  ...createSplitCategorySections(true),
  { id: 'sec_brands', type: 'BrandShowcase', name: 'Marken & HLG Garantien', enabled: true, settings: {} },
  { id: 'sec_trust', type: 'TrustBar', name: 'Vertrauensgarantien (TrustBar)', enabled: true, settings: {} },
  {
    id: 'sec_blogs',
    type: 'HeatingGuideBlogs',
    name: 'HLG Magazin & Ratgeber',
    enabled: true,
    settings: { title: 'HLG Magazin & Ratgeber' },
  },
  { id: 'sec_newsletter', type: 'Newsletter', name: 'Newsletter Registrierung', enabled: true, settings: {} },
];

/**
 * Expands any legacy monolithic `CategoryShowcase` section into the 5 individual
 * category sections so existing saved layouts automatically get the 5-section split.
 */
export function normalizeHomepageSections(rawSections: Partial<SectionConfig>[]): SectionConfig[] {
  if (!Array.isArray(rawSections) || rawSections.length === 0) {
    return DEFAULT_HLG_SECTIONS;
  }

  const expanded: SectionConfig[] = [];
  for (const sec of rawSections) {
    if (!sec || !sec.type) continue;
    if (sec.type === 'CategoryShowcase') {
      expanded.push(...createSplitCategorySections(sec.enabled !== false));
    } else {
      expanded.push(sec as SectionConfig);
    }
  }

  const hasHlg = expanded.some(
    (s) =>
      s.type === 'AktuelleAngebote' ||
      s.type === 'CategoryShowcaseSection' ||
      s.type === 'CategoryOverview'
  );
  return hasHlg ? expanded : DEFAULT_HLG_SECTIONS;
}

/**
 * Resolves effective content + design for a single CategoryShowcaseSection
 * from its preset defaults plus saved admin overrides.
 */
export function resolveCategorySectionConfig(
  config: CategoryShowcaseSettings = {},
  catalogProducts: CatalogProductSummary[] = []
): {
  preset: CategorySectionPreset;
  title: string;
  linkText: string;
  linkUrl: string;
  categorySlug: string;
  sourceMode: 'MANUAL' | 'CATEGORY';
  showBanner: boolean;
  bannerPosition: 'left' | 'right';
  bannerImage: string;
  bannerBadge: string;
  bannerTitle: string;
  bannerCtaText: string;
  bannerCtaUrl: string;
  colsDesktop: '2' | '3' | '4' | '5';
  maxProducts: number;
  products: CategoryProductItem[];
  design: CategoryShowcaseDesign;
} {
  const presetKey: CategorySectionPreset =
    config?.preset && CATEGORY_PRESET_DEFAULTS[config.preset as CategorySectionPreset]
      ? (config.preset as CategorySectionPreset)
      : 'coffee';
  const base = CATEGORY_PRESET_DEFAULTS[presetKey];

  const sourceMode: 'MANUAL' | 'CATEGORY' = config?.sourceMode || base.sourceMode;
  const categorySlug =
    config?.categorySlug !== undefined ? config.categorySlug : base.categorySlug;
  const maxProducts = Math.max(
    1,
    Math.min(12, Number(config?.maxProducts !== undefined ? config.maxProducts : base.maxProducts))
  );

  // Manual items: prefer explicit config.products (preserving empty/edited fields), else preset defaults
  const configuredManual =
    Array.isArray(config?.products) && config.products.length > 0
      ? config.products
      : base.products;

  let resolvedProducts: CategoryProductItem[] = configuredManual.slice(0, maxProducts);

  if (sourceMode === 'CATEGORY' && categorySlug && catalogProducts.length > 0) {
    const slugLower = categorySlug.toLowerCase();
    const matched = catalogProducts.filter((p) => {
      if (Array.isArray(p.categories)) {
        return p.categories.some((c) => (c.slug || '').toLowerCase() === slugLower);
      }
      return (p.categorySlug || '').toLowerCase() === slugLower;
    });

    if (matched.length > 0) {
      resolvedProducts = matched.slice(0, maxProducts).map((p) => {
        const compareAt = p.compareAtPrice && p.compareAtPrice > p.price ? p.compareAtPrice : null;
        const discountPct = compareAt
          ? `-${Math.round(((compareAt - p.price) / compareAt) * 100)}%`
          : undefined;
        return {
          id: p.id,
          category: p.categories?.[0]?.name || p.categoryName || base.title,
          title: p.title,
          price: `${Number(p.price).toFixed(2).replace('.', ',')}€`,
          rawPrice: Number(p.price),
          compareAtPrice: compareAt ? `${Number(compareAt).toFixed(2).replace('.', ',')}€` : undefined,
          discount: p.discountLabel || discountPct,
          rating: 5,
          ratingScore: '(5.00)',
          image: p.images?.[0] || '',
          slug: p.slug || '',
          energyRating: p.title?.match(/\b([A-G]|\bA\+{1,3})\b/)?.[1]?.toUpperCase() || undefined,
          deliveryNote: 'Auf Lager • 2-3 Werktage',
        };
      });
    }
  }

  return {
    preset: presetKey,
    title: config?.title !== undefined ? config.title : base.title,
    linkText: config?.linkText !== undefined ? config.linkText : base.linkText,
    linkUrl: config?.linkUrl !== undefined ? config.linkUrl : base.linkUrl,
    categorySlug,
    sourceMode,
    showBanner: config?.showBanner !== undefined ? Boolean(config.showBanner) : base.showBanner,
    bannerPosition: config?.bannerPosition || base.bannerPosition,
    bannerImage: config?.bannerImage !== undefined ? config.bannerImage : base.bannerImage,
    bannerBadge: config?.bannerBadge !== undefined ? config.bannerBadge : base.bannerBadge,
    bannerTitle: config?.bannerTitle !== undefined ? config.bannerTitle : base.bannerTitle,
    bannerCtaText: config?.bannerCtaText !== undefined ? config.bannerCtaText : base.bannerCtaText,
    bannerCtaUrl: config?.bannerCtaUrl !== undefined ? config.bannerCtaUrl : base.bannerCtaUrl,
    colsDesktop: config?.colsDesktop || base.colsDesktop,
    maxProducts,
    products: resolvedProducts,
    design: config?.design || {},
  };
}

export const DEFAULT_BRAND_SHOWCASE_ITEMS: BrandShowcaseItem[] = [
  { id: 'br-bosch', name: 'Bosch', slug: 'bosch', slogan: 'Technik fürs Leben', linkUrl: '/shop?brand=bosch' },
  { id: 'br-siemens', name: 'Siemens', slug: 'siemens', slogan: 'Die Zukunft zieht ein', linkUrl: '/shop?brand=siemens' },
  { id: 'br-miele', name: 'Miele', slug: 'miele', slogan: 'Immer besser', linkUrl: '/shop?brand=miele' },
  { id: 'br-aeg', name: 'AEG', slug: 'aeg', slogan: 'Perfekt in Form & Funktion', linkUrl: '/shop?brand=aeg' },
  { id: 'br-samsung', name: 'Samsung', slug: 'samsung', slogan: 'Smart Forward', linkUrl: '/shop?brand=samsung' },
  { id: 'br-delonghi', name: "De'Longhi", slug: 'delonghi', slogan: 'Better Everyday', linkUrl: '/shop?brand=delonghi' },
  { id: 'br-lg', name: 'LG', slug: 'lg', slogan: "Life's Good", linkUrl: '/shop?brand=lg' },
  { id: 'br-philips', name: 'Philips', slug: 'philips', slogan: 'Innovation & You', linkUrl: '/shop?brand=philips' },
  { id: 'br-kitchenaid', name: 'KitchenAid', slug: 'kitchenaid', slogan: 'Kulinarische Meisterwerke', linkUrl: '/shop?brand=kitchenaid' },
  { id: 'br-roborock', name: 'Roborock', slug: 'roborock', slogan: 'Smarte Saugroboter', linkUrl: '/shop?brand=roborock' },
  { id: 'br-jura', name: 'Jura', slug: 'jura', slogan: 'Kaffee-Tradition', linkUrl: '/shop?brand=jura' },
  { id: 'br-haier', name: 'Haier', slug: 'haier', slogan: 'Intelligente Haushaltsgeräte', linkUrl: '/shop?brand=haier' },
  { id: 'br-bauknecht', name: 'Bauknecht', slug: 'bauknecht', slogan: 'Für ein gesundes Zuhause', linkUrl: '/shop?brand=bauknecht' },
  { id: 'br-candy', name: 'Candy', slug: 'candy', slogan: 'Smarte Alltagshelfer', linkUrl: '/shop?brand=candy' },
];

export const DEFAULT_BRAND_SERVICE_PERKS: ServicePerkItem[] = [
  {
    id: 'perk-disposal',
    iconKey: 'trash',
    title: 'Altgeräte-Entsorgung',
    desc: 'Kostenlose und fachgerechte Mitnahme Ihres alten Haushaltsgeräts bei Lieferung.',
  },
  {
    id: 'perk-install',
    iconKey: 'wrench',
    title: 'Anschluss & Montage',
    desc: 'Auf Wunsch professioneller Aufbau- und Anschlussservice direkt bei Ihnen zu Hause.',
  },
  {
    id: 'perk-warranty',
    iconKey: 'shield',
    title: '2 Jahre Herstellergarantie',
    desc: 'Voller Schutz auf alle Neu- und Markengeräte mit schnellem Reparaturservice.',
  },
  {
    id: 'perk-payment',
    iconKey: 'card',
    title: 'Bequemer Ratenkauf',
    desc: 'Flexible Zahlungsoptionen: PayPal, Klarna Ratenkauf, Rechnung und Sofortüberweisung.',
  },
];

export const DEFAULT_BRAND_SHOWCASE_SETTINGS = {
  eyebrow: 'Geprüfte Markenqualität',
  title: 'Führende Hersteller bei HLG Hausgeräte',
  description:
    'Entdecken Sie innovative Spitzengeräte weltbekannter Qualitätshersteller mit voller Herstellergarantie.',
  sourceMode: 'AUTO' as const,
  maxBrands: 12,
  brands: DEFAULT_BRAND_SHOWCASE_ITEMS.slice(0, 12),
  serviceEyebrow: 'Der HLG Vorteil',
  serviceTitle: 'Unser Rundum-Sorglos-Service für Großgeräte',
  servicePerks: DEFAULT_BRAND_SERVICE_PERKS,
};

function normalizeBrandLookupKey(val: string): string {
  return val
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

export function getCatalogBrandProductCount(b: CatalogBrandSummary): number {
  if (typeof b.productCount === 'number') return b.productCount;
  if (typeof b._count?.products === 'number') return b._count.products;
  return 0;
}

/**
 * Resolves BrandShowcase content + design from admin settings and live catalog brands.
 * Automatically links every brand card to `/shop?brand=<slug>` and merges uploaded DB/editor logos.
 */
export function resolveBrandShowcaseConfig(
  config: BrandShowcaseSettings = {},
  catalogBrands: CatalogBrandSummary[] = []
): {
  eyebrow: string;
  title: string;
  description: string;
  sourceMode: 'AUTO' | 'MANUAL';
  maxBrands: number;
  brands: BrandShowcaseItem[];
  serviceEyebrow: string;
  serviceTitle: string;
  servicePerks: ServicePerkItem[];
  design: BrandShowcaseDesign;
} {
  const catalogByKey = new Map<string, CatalogBrandSummary>();
  for (const raw of catalogBrands) {
    const count = getCatalogBrandProductCount(raw);
    for (const k of [normalizeBrandLookupKey(raw.slug), normalizeBrandLookupKey(raw.name)]) {
      if (!k) continue;
      const existing = catalogByKey.get(k);
      if (!existing || count > getCatalogBrandProductCount(existing)) {
        catalogByKey.set(k, raw);
      }
    }
  }

  const defaultsByKey = new Map<string, BrandShowcaseItem>();
  for (const item of DEFAULT_BRAND_SHOWCASE_ITEMS) {
    defaultsByKey.set(normalizeBrandLookupKey(item.slug || item.name), item);
  }

  const logoOverrides = config?.brandLogoOverrides || {};
  const maxBrands = Math.max(
    1,
    Math.min(24, Number(config?.maxBrands !== undefined ? config.maxBrands : 12))
  );
  const sourceMode: 'AUTO' | 'MANUAL' = config?.sourceMode || 'AUTO';

  let resolvedBrands: BrandShowcaseItem[] = [];

  if (sourceMode === 'AUTO' && catalogBrands.length > 0) {
    // Deduplicate catalog brands by normalized key (keeping higher product count)
    const uniqueCatalog = Array.from(new Set(catalogByKey.values()));
    const withProducts = uniqueCatalog.filter((b) => getCatalogBrandProductCount(b) > 0);
    const pool = (withProducts.length > 0 ? withProducts : uniqueCatalog).sort((a, b) => {
      const diff = getCatalogBrandProductCount(b) - getCatalogBrandProductCount(a);
      return diff !== 0 ? diff : a.name.localeCompare(b.name, 'de');
    });

    resolvedBrands = pool.slice(0, maxBrands).map((dbBrand) => {
      const key = normalizeBrandLookupKey(dbBrand.slug || dbBrand.name);
      const preset = defaultsByKey.get(key);
      const overrideLogo =
        logoOverrides[dbBrand.slug] ?? logoOverrides[key];
      const effectiveLogo =
        overrideLogo !== undefined ? overrideLogo : dbBrand.logo || '';
      return {
        id: dbBrand.id,
        name: preset?.name || dbBrand.name,
        slug: dbBrand.slug,
        slogan: preset?.slogan || 'Geprüfte Markenqualität',
        logo: effectiveLogo,
        linkUrl: `/shop?brand=${encodeURIComponent(dbBrand.slug)}`,
        productCount: getCatalogBrandProductCount(dbBrand),
      };
    });
  } else {
    const manualList =
      Array.isArray(config?.brands) && config.brands.length > 0
        ? config.brands
        : DEFAULT_BRAND_SHOWCASE_ITEMS.slice(0, maxBrands);

    resolvedBrands = manualList.slice(0, maxBrands).map((item, idx) => {
      const key = normalizeBrandLookupKey(item.slug || item.name);
      const dbBrand = catalogByKey.get(key);
      const canonicalSlug = dbBrand?.slug || item.slug || item.name.toLowerCase();
      const rawUrl = item.linkUrl?.trim();
      const safeLinkUrl =
        rawUrl && !rawUrl.startsWith('/shop?search=')
          ? rawUrl
          : `/shop?brand=${encodeURIComponent(canonicalSlug)}`;

      return {
        id: item.id || `br-manual-${idx}`,
        name: item.name,
        slug: canonicalSlug,
        slogan: item.slogan ?? '',
        logo:
          item.logo !== undefined
            ? item.logo
            : dbBrand?.logo || logoOverrides[canonicalSlug] || '',
        linkUrl: safeLinkUrl,
        productCount: dbBrand ? getCatalogBrandProductCount(dbBrand) : undefined,
      };
    });
  }

  return {
    eyebrow:
      config?.eyebrow !== undefined ? config.eyebrow : DEFAULT_BRAND_SHOWCASE_SETTINGS.eyebrow,
    title: config?.title !== undefined ? config.title : DEFAULT_BRAND_SHOWCASE_SETTINGS.title,
    description:
      config?.description !== undefined
        ? config.description
        : DEFAULT_BRAND_SHOWCASE_SETTINGS.description,
    sourceMode,
    maxBrands,
    brands: resolvedBrands,
    serviceEyebrow:
      config?.serviceEyebrow !== undefined
        ? config.serviceEyebrow
        : DEFAULT_BRAND_SHOWCASE_SETTINGS.serviceEyebrow,
    serviceTitle:
      config?.serviceTitle !== undefined
        ? config.serviceTitle
        : DEFAULT_BRAND_SHOWCASE_SETTINGS.serviceTitle,
    servicePerks:
      Array.isArray(config?.servicePerks) && config.servicePerks.length > 0
        ? config.servicePerks
        : DEFAULT_BRAND_SERVICE_PERKS,
    design: config?.design || {},
  };
}

