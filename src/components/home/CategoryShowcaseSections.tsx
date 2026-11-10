'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';

interface ProductItem {
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

// Official EU Energy Label Badge
function EnergyBadge({ rating }: { rating?: string }) {
  if (!rating) return null;
  const colors: Record<string, { bg: string, text: string }> = {
    'A': { bg: 'bg-[#009640]', text: 'text-white' },
    'A+++': { bg: 'bg-[#009640]', text: 'text-white' },
    'A+': { bg: 'bg-[#009640]', text: 'text-white' },
    'B': { bg: 'bg-[#54b848]', text: 'text-white' },
    'C': { bg: 'bg-[#bfd730]', text: 'text-stone-900' },
    'D': { bg: 'bg-[#ffcc00]', text: 'text-stone-900' },
    'E': { bg: 'bg-[#f5a623]', text: 'text-white' },
    'F': { bg: 'bg-[#f05a28]', text: 'text-white' },
    'G': { bg: 'bg-[#e30613]', text: 'text-white' },
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

// 1. WASCHMASCHINEN (Row of 5)
const washingMachines: ProductItem[] = [
  {
    id: 'wm-1',
    category: 'Waschmaschine',
    title: 'BAUKNECHT WMT 7122 C N Toplader 7kg 1200 U/Min',
    price: '449,99€',
    rawPrice: 449.99,
    rating: 5,
    ratingScore: '(4.80)',
    image: '/images/deals/bestseller-1.jpg',
    slug: 'bauknecht-wmt-7122-c-n-toplader',
    energyRating: 'C',
    deliveryNote: 'Auf Lager • 2-3 Werktage',
  },
  {
    id: 'wm-2',
    category: 'Waschmaschine',
    title: 'BAUKNECHT BPW 814 A Frontlader 8kg 1400 U/Min',
    price: '339,00€',
    rawPrice: 339.00,
    rating: 5,
    ratingScore: '(5.00)',
    image: '/images/deals/bestseller-2.jpg',
    slug: 'bauknecht-bpw-814-a-frontlader',
    energyRating: 'A',
    deliveryNote: 'Auf Lager • 2-3 Werktage',
  },
  {
    id: 'wm-3',
    category: 'Waschmaschine',
    title: 'MIELE WCA020 WCS Active Frontlader 7kg',
    price: '1 049,00€',
    rawPrice: 1049.00,
    rating: 5,
    ratingScore: '(4.95)',
    image: '/images/deals/deal-1.jpg',
    slug: 'miele-wca020-wcs-active',
    energyRating: 'A',
    deliveryNote: 'Kostenlose 2-Mann-Lieferung',
  },
  {
    id: 'wm-4',
    category: 'Waschmaschine',
    title: 'SAMSUNG WW90T534AAX Autodose 9kg AddWash',
    price: '599,00€',
    rawPrice: 599.00,
    rating: 5,
    ratingScore: '(4.70)',
    image: '/images/deals/bestseller-1.jpg',
    slug: 'samsung-ww90t534aax-autodose',
    energyRating: 'A',
    deliveryNote: 'Auf Lager • 2-3 Werktage',
  },
  {
    id: 'wm-5',
    category: 'Waschmaschine',
    title: 'BAUKNECHT WM 7 M100 Frontlader 7kg 1400 U/Min',
    price: '419,00€',
    rawPrice: 419.00,
    rating: 5,
    ratingScore: '(4.85)',
    image: '/images/deals/bestseller-2.jpg',
    slug: 'bauknecht-wm-7-m100-frontlader',
    energyRating: 'B',
    deliveryNote: 'Auf Lager • 2-3 Werktage',
  },
];

// 2. GESCHIRRSPÜLER (Row of 4)
const dishwashers: ProductItem[] = [
  {
    id: 'dw-1',
    category: 'Geschirrspüler',
    title: 'BOMANN TSG 7402 Kompakt Tischgeschirrspüler',
    price: '299,79€',
    rawPrice: 299.79,
    rating: 5,
    ratingScore: '(4.60)',
    image: '/images/deals/bestseller-3.jpg',
    slug: 'bomann-tsg-7402-tischgeschirrspueler',
  },
  {
    id: 'dw-2',
    category: 'Geschirrspüler',
    title: 'SIEMENS iQ300 SN23EI14VE Standgeschirrspüler 60cm',
    price: '449,00€',
    rawPrice: 449.00,
    rating: 5,
    ratingScore: '(5.00)',
    image: '/images/deals/deal-1.jpg',
    slug: 'siemens-iq300-sn23ei14ve-standgeschirrspueler',
  },
  {
    id: 'dw-3',
    category: 'Geschirrspüler',
    title: 'BOSCH Serie 4 SMV4HCX48E Vollintegriert 60cm',
    price: '549,00€',
    rawPrice: 549.00,
    rating: 5,
    ratingScore: '(4.80)',
    image: '/images/deals/bestseller-3.jpg',
    slug: 'bosch-serie-4-smv4hcx48e-vollintegriert',
  },
  {
    id: 'dw-4',
    category: 'Geschirrspüler',
    title: 'BEKO DFN05320W Unterbau-Geschirrspüler Weiß',
    price: '299,00€',
    rawPrice: 299.00,
    rating: 5,
    ratingScore: '(4.65)',
    image: '/images/deals/deal-6.jpg',
    slug: 'beko-dfn05320w-unterbau-geschirrspueler',
  },
];

// 3. KAFFEEMASCHINEN (Row of 4 with left banner)
const coffeeMachines: ProductItem[] = [
  {
    id: 'cf-1',
    category: 'Kaffeemaschinen',
    title: "DE'LONGHI La Specialista Prestigio EC9355.M",
    price: '549,00€',
    rawPrice: 549.00,
    rating: 5,
    ratingScore: '(4.90)',
    image: '/images/deals/deal-spotlight.jpg',
    slug: 'delonghi-la-specialista-prestigio',
  },
  {
    id: 'cf-2',
    category: 'Kaffeemaschinen',
    title: 'MOCCAMASTER KBG Select Filterkaffeemaschine Schwarz',
    price: '249,00€',
    rawPrice: 249.00,
    rating: 5,
    ratingScore: '(5.00)',
    image: '/images/deals/bestseller-4.jpg',
    slug: 'moccamaster-kbg-select-schwarz',
  },
  {
    id: 'cf-3',
    category: 'Kaffeemaschinen',
    title: 'GAGGIA Classic Pro Edelstahl Siebträgermaschine',
    price: '429,00€',
    rawPrice: 429.00,
    rating: 5,
    ratingScore: '(4.75)',
    image: '/images/deals/bestseller-4.jpg',
    slug: 'gaggia-classic-pro-edelstahl',
  },
  {
    id: 'cf-4',
    category: 'Kaffeemaschinen',
    title: 'SAGE the Barista Express Pastellgrün Siebträger',
    price: '599,00€',
    rawPrice: 599.00,
    rating: 5,
    ratingScore: '(4.85)',
    image: '/images/deals/deal-spotlight.jpg',
    slug: 'sage-the-barista-express-pastell',
  },
];

// 4. STAUBSAUGER & REINIGER (2 rows of 4)
const vacuums: ProductItem[] = [
  {
    id: 'vc-1',
    category: 'Staubsauger & Reiniger',
    title: 'ROBOROCK Q Revo MaxV mit All-in-One Docking',
    price: '799,00€',
    rawPrice: 799.00,
    rating: 5,
    ratingScore: '(4.90)',
    image: '/images/deals/deal-2.jpg',
    slug: 'roborock-q-revo-maxv',
  },
  {
    id: 'vc-2',
    category: 'Staubsauger & Reiniger',
    title: 'DREAME L10s Ultra Saug- und Wischroboter',
    price: '599,00€',
    rawPrice: 599.00,
    rating: 5,
    ratingScore: '(4.80)',
    image: '/images/deals/deal-2.jpg',
    slug: 'dreame-l10s-ultra',
  },
  {
    id: 'vc-3',
    category: 'Staubsauger & Reiniger',
    title: 'DREAME L20 Ultra Complete Saugroboter Weiß',
    price: '899,00€',
    rawPrice: 899.00,
    rating: 5,
    ratingScore: '(4.95)',
    image: '/images/deals/deal-2.jpg',
    slug: 'dreame-l20-ultra-complete',
  },
  {
    id: 'vc-4',
    category: 'Staubsauger & Reiniger',
    title: 'ECOVACS Deebot T20 OMNI mit Heißwasser-Moppwäsche',
    price: '699,00€',
    rawPrice: 699.00,
    rating: 5,
    ratingScore: '(4.70)',
    image: '/images/deals/deal-2.jpg',
    slug: 'ecovacs-deebot-t20-omni',
  },
  {
    id: 'vc-5',
    category: 'Staubsauger & Reiniger',
    title: 'IROBOT Roomba Combo j7+ Saug-Wisch-Roboter',
    price: '599,00€',
    rawPrice: 599.00,
    rating: 5,
    ratingScore: '(4.65)',
    image: '/images/deals/deal-2.jpg',
    slug: 'irobot-roomba-combo-j7-plus',
  },
  {
    id: 'vc-6',
    category: 'Staubsauger & Reiniger',
    title: 'ROBOROCK S8 Pro Ultra mit Trocknungsstation',
    price: '1 199,00€',
    rawPrice: 1199.00,
    rating: 5,
    ratingScore: '(5.00)',
    image: '/images/deals/deal-2.jpg',
    slug: 'roborock-s8-pro-ultra',
  },
  {
    id: 'vc-7',
    category: 'Staubsauger & Reiniger',
    title: 'ROBOROCK S8 MaxV Ultra All-in-One Weiß',
    price: '1 303,80€',
    rawPrice: 1303.80,
    compareAtPrice: '1 740,55€',
    discount: '-25%',
    rating: 5,
    ratingScore: '(4.80)',
    image: '/images/deals/deal-2.jpg',
    slug: 'roborock-s8-maxv-ultra-weiss',
  },
  {
    id: 'vc-8',
    category: 'Staubsauger & Reiniger',
    title: 'DYSON V15 Detect Absolute Akkusauger',
    price: '599,00€',
    rawPrice: 599.00,
    rating: 5,
    ratingScore: '(4.90)',
    image: '/images/deals/deal-2.jpg',
    slug: 'dyson-v15-detect-absolute',
  },
];

// 5. KÜCHENMASCHINEN (2 rows of 3)
const kitchenAppliances: ProductItem[] = [
  {
    id: 'km-1',
    category: 'Kleine Haushaltsgeräte',
    title: 'BOSCH Serie 2 MUMS2EW00 Küchenmaschine Weiß',
    price: '129,99€',
    rawPrice: 129.99,
    rating: 5,
    ratingScore: '(4.70)',
    image: '/images/deals/deal-4.jpg',
    slug: 'bosch-serie-2-mums2ew00',
  },
  {
    id: 'km-2',
    category: 'Kleine Haushaltsgeräte',
    title: 'SEVERIN KM 3897 Edelstahl Küchenmaschine 5.5L',
    price: '259,00€',
    rawPrice: 259.00,
    rating: 5,
    ratingScore: '(4.80)',
    image: '/images/deals/deal-4.jpg',
    slug: 'severin-km-3897-kuechenmaschine',
  },
  {
    id: 'km-3',
    category: 'Kleine Haushaltsgeräte',
    title: 'KENWOOD Titanium Chef Patissier XL KWL90.004SI',
    price: '729,60€',
    rawPrice: 729.60,
    compareAtPrice: '955,80€',
    discount: '-24%',
    rating: 5,
    ratingScore: '(4.63)',
    image: '/images/deals/deal-4.jpg',
    slug: 'kenwood-titanium-chef-patissier-xl-grau',
  },
  {
    id: 'km-4',
    category: 'Kleine Haushaltsgeräte',
    title: 'KENWOOD Titanium Chef Patissier XL mit Zubehör-Set',
    price: '461,90€',
    rawPrice: 461.90,
    compareAtPrice: '749,93€',
    discount: '-38%',
    rating: 5,
    ratingScore: '(4.80)',
    image: '/images/deals/deal-5.jpg',
    slug: 'kenwood-titanium-chef-patissier-xl-zubehoer',
  },
  {
    id: 'km-5',
    category: 'Kleine Haushaltsgeräte',
    title: 'KITCHENAID Artisan 5KSM175PS Empire Rot 4.8L',
    price: '499,00€',
    rawPrice: 499.00,
    rating: 5,
    ratingScore: '(5.00)',
    image: '/images/deals/bestseller-5.jpg',
    slug: 'kitchenaid-artisan-rot',
  },
  {
    id: 'km-6',
    category: 'Kleine Haushaltsgeräte',
    title: 'KITCHENAID Artisan 5KSM125 Creme 4.8L',
    price: '399,00€',
    rawPrice: 399.00,
    rating: 5,
    ratingScore: '(4.95)',
    image: '/images/deals/bestseller-6.jpg',
    slug: 'kitchenaid-artisan-gruen',
  },
];

// 6. KÜHLEN & GEFRIEREN (Row of 6 with left banner)
const fridges: ProductItem[] = [
  {
    id: 'fr-1',
    category: 'Kühlen & Gefrieren',
    title: 'SAMSUNG RB38T602ESA NoFrost Kühl-Gefrierkombi',
    price: '549,99€',
    rawPrice: 549.99,
    rating: 5,
    ratingScore: '(4.85)',
    image: '/images/deals/deal-6.jpg',
    slug: 'samsung-rb38t602esa-nofrost',
  },
  {
    id: 'fr-2',
    category: 'Kühlen & Gefrieren',
    title: 'BOSCH Serie 4 KGN39VWEA NoFrost Edelstahl',
    price: '659,00€',
    rawPrice: 659.00,
    rating: 5,
    ratingScore: '(5.00)',
    image: '/images/deals/deal-6.jpg',
    slug: 'bosch-serie-4-kgn39vwea-nofrost',
  },
  {
    id: 'fr-3',
    category: 'Kühlen & Gefrieren',
    title: 'LG Electronics GBB72PZDMN DoorCooling+ A+++',
    price: '679,00€',
    rawPrice: 679.00,
    compareAtPrice: '849,00€',
    discount: '-20%',
    rating: 5,
    ratingScore: '(4.90)',
    image: '/images/deals/deal-6.jpg',
    slug: 'lg-gbb72pzdmn-doorcooling',
  },
  {
    id: 'fr-4',
    category: 'Kühlen & Gefrieren',
    title: 'HAIER HSR5918DIPB SBS 90 SERIE 5 Side-by-Side',
    price: '836,89€',
    rawPrice: 836.89,
    compareAtPrice: '1 108,79€',
    discount: '-25%',
    rating: 5,
    ratingScore: '(5.00)',
    image: '/images/deals/deal-6.jpg',
    slug: 'haier-hsr5918dipb-sbs-90-serie-5',
  },
  {
    id: 'fr-5',
    category: 'Kühlen & Gefrieren',
    title: 'SIEMENS iQ300 KG39N2LEA Edelstahl NoFrost',
    price: '589,00€',
    rawPrice: 589.00,
    rating: 5,
    ratingScore: '(4.75)',
    image: '/images/deals/deal-6.jpg',
    slug: 'siemens-iq300-kg39n2lea',
  },
  {
    id: 'fr-6',
    category: 'Kühlen & Gefrieren',
    title: 'BAUKNECHT KGNF 203D Kühl-Gefrierkombi 368L',
    price: '519,00€',
    rawPrice: 519.00,
    rating: 5,
    ratingScore: '(4.80)',
    image: '/images/deals/deal-6.jpg',
    slug: 'bauknecht-kgnf-203d',
  },
];

// 7. WASCHTROCKNER (2 rows of 4)
const washerDryers: ProductItem[] = [
  {
    id: 'wd-1',
    category: 'Waschtrockner',
    title: 'BOSCH Serie 6 WNA134V0 Waschtrockner 8/5 kg',
    price: '699,00€',
    rawPrice: 699.00,
    rating: 5,
    ratingScore: '(4.85)',
    image: '/images/deals/deal-1.jpg',
    slug: 'bosch-serie-6-wna134v0',
  },
  {
    id: 'wd-2',
    category: 'Waschtrockner',
    title: 'SIEMENS WN54C2A40 iQ700 Waschtrockner 10/6 kg',
    price: '861,94€',
    rawPrice: 861.94,
    compareAtPrice: '1 124,90€',
    discount: '-23%',
    rating: 5,
    ratingScore: '(5.00)',
    image: '/images/deals/deal-1.jpg',
    slug: 'siemens-wn54c2a40-iq700-waschtrockner',
  },
  {
    id: 'wd-3',
    category: 'Waschtrockner',
    title: 'MIELE WTD160 WCS 8/5 kg Waschtrockner QuickPower',
    price: '1 429,00€',
    rawPrice: 1429.00,
    rating: 5,
    ratingScore: '(5.00)',
    image: '/images/deals/deal-1.jpg',
    slug: 'miele-wtd160-wcs',
  },
  {
    id: 'wd-4',
    category: 'Waschtrockner',
    title: 'AEG Serie 7000 ÖKOKombi ProSteam 9/6 kg',
    price: '799,00€',
    rawPrice: 799.00,
    rating: 5,
    ratingScore: '(4.80)',
    image: '/images/deals/bestseller-1.jpg',
    slug: 'aeg-serie-7000-oekokombi',
  },
  {
    id: 'wd-5',
    category: 'Waschtrockner',
    title: 'CANDY Smart Pro CSOW 4855TWE/1-S 8/5 kg',
    price: '399,00€',
    rawPrice: 399.00,
    rating: 5,
    ratingScore: '(4.60)',
    image: '/images/deals/bestseller-2.jpg',
    slug: 'candy-smart-pro-csow',
  },
  {
    id: 'wd-6',
    category: 'Waschtrockner',
    title: 'LG V700 FWV796STSE Inverter Direct Drive 9/6 kg',
    price: '589,00€',
    rawPrice: 589.00,
    rating: 5,
    ratingScore: '(4.90)',
    image: '/images/deals/bestseller-1.jpg',
    slug: 'lg-v700-fwv796stse',
  },
  {
    id: 'wd-7',
    category: 'Waschtrockner',
    title: 'SAMSUNG QuickDrive WD90T984ASH 9/6 kg AI Control',
    price: '1 049,00€',
    rawPrice: 1049.00,
    rating: 5,
    ratingScore: '(5.00)',
    image: '/images/deals/deal-1.jpg',
    slug: 'samsung-quickdrive-wd90t984ash',
  },
  {
    id: 'wd-8',
    category: 'Waschtrockner',
    title: 'BAUKNECHT WT Super Eco 86 1400 U/Min 8/6 kg',
    price: '499,00€',
    rawPrice: 499.00,
    rating: 5,
    ratingScore: '(4.75)',
    image: '/images/deals/bestseller-2.jpg',
    slug: 'bauknecht-wt-super-eco-86',
  },
];

// 8. GAMING (2 rows of 4)
const gaming: ProductItem[] = [
  {
    id: 'gm-1',
    category: 'Gaming',
    title: 'SONY PlayStation 5 Digital Slim 1TB Konsole',
    price: '449,99€',
    rawPrice: 449.99,
    rating: 5,
    ratingScore: '(5.00)',
    image: '/images/deals/deal-3.jpg',
    slug: 'sony-ps5-digital-slim',
  },
  {
    id: 'gm-2',
    category: 'Gaming',
    title: 'SONY PlayStation VR2 Virtual Reality Headset',
    price: '549,99€',
    rawPrice: 549.99,
    rating: 5,
    ratingScore: '(4.90)',
    image: '/images/deals/deal-3.jpg',
    slug: 'sony-ps-vr2-headset',
  },
  {
    id: 'gm-3',
    category: 'Gaming',
    title: 'SONY PlayStation 5 Disc Edition 1TB Weiß',
    price: '549,99€',
    rawPrice: 549.99,
    rating: 5,
    ratingScore: '(5.00)',
    image: '/images/deals/deal-3.jpg',
    slug: 'sony-ps5-disc-edition',
  },
  {
    id: 'gm-4',
    category: 'Gaming',
    title: 'SONY PlayStation Portal Remote-Player für PS5',
    price: '219,99€',
    rawPrice: 219.99,
    rating: 5,
    ratingScore: '(4.85)',
    image: '/images/deals/deal-3.jpg',
    slug: 'sony-playstation-portal',
  },
  {
    id: 'gm-5',
    category: 'Gaming',
    title: 'SONY PlayStation 4 Slim 500GB Jet Black',
    price: '199,00€',
    rawPrice: 199.00,
    rating: 5,
    ratingScore: '(4.95)',
    image: '/images/deals/deal-3.jpg',
    slug: 'sony-ps4-slim-500gb',
  },
  {
    id: 'gm-6',
    category: 'Gaming',
    title: 'SONY PlayStation 4 Pro 1TB Weiß Glacier White',
    price: '269,00€',
    rawPrice: 269.00,
    rating: 5,
    ratingScore: '(4.80)',
    image: '/images/deals/deal-3.jpg',
    slug: 'sony-ps4-pro-1tb-weiss',
  },
  {
    id: 'gm-7',
    category: 'Gaming',
    title: 'NINTENDO Switch (OLED-Modell) Neon-Rot/Neon-Blau',
    price: '271,90€',
    rawPrice: 271.90,
    compareAtPrice: '350,93€',
    discount: '-23%',
    rating: 5,
    ratingScore: '(4.94)',
    image: '/images/deals/deal-3.jpg',
    slug: 'nintendo-switch-oled-neon',
  },
  {
    id: 'gm-8',
    category: 'Gaming',
    title: 'MICROSOFT Xbox Series X 1TB Gaming-Konsole',
    price: '499,00€',
    rawPrice: 499.00,
    rating: 5,
    ratingScore: '(5.00)',
    image: '/images/deals/deal-3.jpg',
    slug: 'microsoft-xbox-series-x',
  },
];

// Helper: Product Card
function ProductCard({ item }: { item: ProductItem }) {
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
      price: item.rawPrice,
      image: item.image,
      quantity: 1,
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1800);
    cartStore.setIsOpen(true);
    toast.success('In den Warenkorb gelegt');
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 p-3 sm:p-4 hover:shadow-lg hover:border-emerald-200 transition-all flex flex-col justify-between group relative">
      {/* Top: Category & Wishlist */}
      <div className="flex items-center justify-between gap-1 mb-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[10px] sm:text-[11px] font-semibold text-stone-400 uppercase tracking-wider truncate">
            {item.category}
          </span>
          {item.energyRating && <EnergyBadge rating={item.energyRating} />}
        </div>
        <button
          type="button"
          onClick={handleToggleWishlist}
          className={`p-1 shrink-0 transition-colors cursor-pointer ${
            isWishlisted ? 'text-red-500' : 'text-stone-300 hover:text-red-500'
          }`}
          title="Favorit"
        >
          <svg className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 stroke-red-500' : 'fill-none stroke-current'}`} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Product Image */}
      <Link href={`/produto/${item.slug}`} className="relative aspect-square w-full max-h-[120px] my-2 flex items-center justify-center overflow-hidden">
        <Image
          src={item.image}
          alt={item.title}
          fill
          sizes="(max-width: 640px) 100vw, 200px"
          className="object-contain p-1 group-hover:scale-105 transition-transform duration-300"
        />
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

        {/* Red discount badge if present */}
        {item.discount && (
          <div className="mt-1">
            <span className="inline-block bg-[#dc2626] text-white text-[10px] font-black px-1.5 py-0.5 rounded-sm shadow-2xs">
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
          {item.ratingScore && <span className="text-[10px] text-stone-500 font-medium">{item.ratingScore}</span>}
        </div>

        {/* Title */}
        <Link href={`/produto/${item.slug}`}>
          <h4 className="text-xs font-bold text-stone-800 line-clamp-2 mt-1 leading-snug group-hover:text-[#107b46] transition-colors">
            {item.title}
          </h4>
        </Link>

        {/* Stock / Delivery Reassurance */}
        <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="truncate">{item.deliveryNote || 'Auf Lager • 2-3 Werktage'}</span>
        </div>
      </div>

      {/* Quick Add Button */}
      <div className="mt-2 pt-2 border-t border-stone-100">
        <button
          type="button"
          onClick={handleAddToCart}
          className={`w-full text-center text-xs font-bold py-1.5 rounded-lg border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            isAdded
              ? 'bg-[#107b46] text-white border-transparent'
              : 'text-stone-700 hover:text-white hover:bg-[#107b46] border-stone-200 hover:border-transparent'
          }`}
        >
          {isAdded ? (
            <>
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <span>✓ Im Korb</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span>In den Korb</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// Section Header with Green Indicator
function SectionHeader({ title, linkUrl }: { title: string; linkUrl: string }) {
  return (
    <div className="border-b border-stone-200/90 pb-3 mb-6 flex items-end justify-between">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
          {title}
        </h2>
        <div className="w-12 h-1 bg-[#107b46] rounded-full mt-2" />
      </div>
      <Link
        href={linkUrl}
        className="text-xs sm:text-sm font-bold text-stone-700 hover:text-[#107b46] bg-stone-50 hover:bg-emerald-50 px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 group border border-stone-200/80 hover:border-emerald-300 shadow-2xs"
      >
        <span>Alle ansehen</span>
        <span className="group-hover:translate-x-0.5 transition-transform text-[#107b46]">&rarr;</span>
      </Link>
    </div>
  );
}

export default function CategoryShowcaseSections() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 font-sans">
      
      {/* 1. KAFFEEMASCHINEN (Mit Split-Banner links & 4 Top-Modellen) */}
      <section>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Left Dark Coffee Banner */}
          <div className="lg:col-span-3 rounded-2xl overflow-hidden relative shadow-md min-h-[300px] flex flex-col justify-end p-6 bg-stone-900 group">
            <Image
              src="/images/hero-coffee-machine.jpg"
              alt="Die besten Kaffeemaschinen zum besten Preis"
              fill
              className="object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/95 via-stone-950/40 to-transparent" />
            <div className="relative z-10 text-white">
              <span className="inline-block bg-[#107b46] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full mb-2 uppercase tracking-wider">
                Barista Qualität
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white leading-tight drop-shadow-sm mb-3">
                Die besten Kaffeemaschinen zum besten Preis!
              </h3>
              <Link
                href="/shop?category=kaffeemaschinen"
                className="bg-white hover:bg-stone-100 text-stone-900 text-xs font-black px-4 py-2 rounded-full inline-flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <span>Jetzt entdecken</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>

          {/* Right 4 Coffee Machines */}
          <div className="lg:col-span-9 flex flex-col justify-between">
            <SectionHeader title="Kaffeemaschinen & Vollautomaten" linkUrl="/shop?category=kaffeemaschinen" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4 flex-1">
              {coffeeMachines.map((item) => (
                <ProductCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. WASCHMASCHINEN & WASCHTROCKNER */}
      <section>
        <SectionHeader title="Waschmaschinen & Frontlader" linkUrl="/shop?category=waschmaschinen" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {washingMachines.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* 3. KÜHLEN & GEFRIEREN (Mit Split-Banner links & 6 Modellen) */}
      <section>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Left Fridge Lifestyle Banner */}
          <div className="lg:col-span-3 rounded-2xl overflow-hidden relative shadow-md min-h-[380px] flex flex-col justify-end p-6 bg-stone-900 group">
            <Image
              src="/images/deals/banner-fridge.jpg"
              alt="Unsere Auswahl an Kühlgeräten 100% Energieeffizienz"
              fill
              className="object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/95 via-stone-950/40 to-transparent" />
            <div className="relative z-10 text-white">
              <span className="inline-block bg-[#107b46] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full mb-2 uppercase tracking-wider">
                Eco Design
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white leading-tight mb-3">
                Unsere Auswahl an Kühlgeräten – 100% Energieeffizienz
              </h3>
              <Link
                href="/shop?category=kuehlen-gefrieren"
                className="bg-white hover:bg-stone-100 text-stone-900 text-xs font-black px-4 py-2 rounded-full inline-flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <span>Modelle ansehen</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>

          {/* Right 6 Refrigerators (2x3) */}
          <div className="lg:col-span-9 flex flex-col justify-between">
            <SectionHeader title="Kühlen & Gefrieren (Side-by-Side & Kombi)" linkUrl="/shop?category=kuehlen-gefrieren" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-4 flex-1">
              {fridges.map((item) => (
                <ProductCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. STAUBSAUGER & SAUGROBOTER (1 Reihe mit 4 Top-Modellen) */}
      <section>
        <SectionHeader title="Staubsauger & Reinigungsroboter" linkUrl="/shop?category=staubsauger-reiniger" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {vacuums.slice(0, 4).map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* 5. WEITERE KATEGORIEN ENTDECKEN (Kompakte Schnell-Galerie Option B) */}
      <section className="bg-gradient-to-br from-stone-50 to-emerald-50/40 border border-stone-200/80 rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-black text-[#107b46] uppercase tracking-wider">
              Sortiment im Überblick
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight mt-1">
              Weitere Gerätekategorien entdecken
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-xl">
              Entdecken Sie unser gesamtes Portfolio führender Hersteller – sofort lieferbar mit 2 Jahren Garantie.
            </p>
          </div>
          <Link
            href="/shop"
            className="bg-[#107b46] hover:bg-[#0d693b] text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-full inline-flex items-center gap-2 transition-all shadow-sm shrink-0 self-start sm:self-auto"
          >
            <span>Gesamten Shop ansehen</span>
            <span>&rarr;</span>
          </Link>
        </div>

        {/* 4 Compact Category Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Geschirrspüler */}
          <Link
            href="/shop?category=geschirrspueler"
            className="group bg-white rounded-2xl border border-stone-200/90 p-4 hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center text-lg">
                🍽️
              </span>
              <span className="text-[11px] font-bold text-stone-400 group-hover:text-[#107b46] transition-colors">
                Ab 299,79 €
              </span>
            </div>
            <div>
              <h3 className="font-extrabold text-stone-900 text-sm group-hover:text-[#107b46] transition-colors">
                Geschirrspüler
              </h3>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Vollintegriert, Einbau &amp; Tischgeräte
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-stone-100 flex items-center text-xs font-bold text-[#107b46] group-hover:translate-x-1 transition-transform">
              <span>Modelle ansehen &rarr;</span>
            </div>
          </Link>

          {/* Card 2: Küchenmaschinen */}
          <Link
            href="/shop?category=kuechenmaschinen"
            className="group bg-white rounded-2xl border border-stone-200/90 p-4 hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center text-lg">
                🥣
              </span>
              <span className="text-[11px] font-bold text-stone-400 group-hover:text-[#107b46] transition-colors">
                Ab 232,82 €
              </span>
            </div>
            <div>
              <h3 className="font-extrabold text-stone-900 text-sm group-hover:text-[#107b46] transition-colors">
                Küchenmaschinen
              </h3>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Kenwood, KitchenAid &amp; Zubehör
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-stone-100 flex items-center text-xs font-bold text-[#107b46] group-hover:translate-x-1 transition-transform">
              <span>Modelle ansehen &rarr;</span>
            </div>
          </Link>

          {/* Card 3: Herde & Kochfelder */}
          <Link
            href="/shop?category=herde"
            className="group bg-white rounded-2xl border border-stone-200/90 p-4 hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center text-lg">
                🍳
              </span>
              <span className="text-[11px] font-bold text-stone-400 group-hover:text-[#107b46] transition-colors">
                Ab 350,79 €
              </span>
            </div>
            <div>
              <h3 className="font-extrabold text-stone-900 text-sm group-hover:text-[#107b46] transition-colors">
                Herde &amp; Induktion
              </h3>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Induktionskochfelder &amp; Backöfen
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-stone-100 flex items-center text-xs font-bold text-[#107b46] group-hover:translate-x-1 transition-transform">
              <span>Modelle ansehen &rarr;</span>
            </div>
          </Link>

          {/* Card 4: Gaming & Konsolen */}
          <Link
            href="/shop?category=gaming"
            className="group bg-white rounded-2xl border border-stone-200/90 p-4 hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center text-lg">
                🎮
              </span>
              <span className="text-[11px] font-bold text-stone-400 group-hover:text-[#107b46] transition-colors">
                Ab 199,00 €
              </span>
            </div>
            <div>
              <h3 className="font-extrabold text-stone-900 text-sm group-hover:text-[#107b46] transition-colors">
                Gaming &amp; Unterhaltung
              </h3>
              <p className="text-[11px] text-stone-500 mt-0.5">
                PS5, Switch OLED, Xbox &amp; VR
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-stone-100 flex items-center text-xs font-bold text-[#107b46] group-hover:translate-x-1 transition-transform">
              <span>Modelle ansehen &rarr;</span>
            </div>
          </Link>
        </div>
      </section>

    </div>
  );
}

