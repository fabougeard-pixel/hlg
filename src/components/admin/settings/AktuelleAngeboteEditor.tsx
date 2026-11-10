'use client';

import { useState } from 'react';
import { SectionConfig } from '@/app/admin/(dashboard)/landing/LandingForm';
import Image from 'next/image';

interface AktuelleAngeboteEditorProps {
  section: SectionConfig;
  previewMode?: 'desktop' | 'tablet' | 'mobile';
  updateSectionSettings: (id: string, keyOrUpdates: string | Record<string, any>, value?: any) => void;
  handleUpload: (id: string, key: string) => void;
  allProducts?: any[];
  goBack?: () => void;
}

export default function AktuelleAngeboteEditor({
  section,
  updateSectionSettings,
  handleUpload,
  allProducts = [],
  goBack,
}: AktuelleAngeboteEditorProps) {
  const [activeTab, setActiveTab] = useState<'spotlight' | 'grid'>('spotlight');
  const [selectedCardIdx, setSelectedCardIdx] = useState<number>(0);
  const settings = section.settings || {};

  // Spotlight fields
  const spotlight = settings.spotlight || {};
  // 6 Small Cards array
  const deals: any[] = Array.isArray(settings.deals) && settings.deals.length === 6
    ? settings.deals
    : [
        {
          title: 'SIEMENS WN54C2A40 iQ700 Waschtrockner 10/6 kg',
          category: 'Waschtrockner',
          price: '861,94€',
          rawPrice: 861.94,
          compareAtPrice: '1 124,90€',
          discount: '-23%',
          image: '/images/deals/deal-1.jpg',
          slug: 'siemens-wn54c2a40-iq700-waschtrockner',
          energyRating: 'A',
          deliveryNote: 'Lieferung bis zum Verwendungsort',
        },
        {
          title: 'ROBOROCK S8 MAXV ULTRA WEISS MIT ALL-IN-ONE DOCK',
          category: 'Staubsauger & Reiniger',
          price: '1 303,80€',
          rawPrice: 1303.80,
          compareAtPrice: '1 740,55€',
          discount: '-25%',
          image: '/images/deals/deal-2.jpg',
          slug: 'roborock-s8-maxv-ultra-weiss',
          deliveryNote: 'Sofort lieferbar • 1-2 Werktage',
        },
        {
          title: 'NINTENDO Switch (OLED-Modell) Neon-Rot/Neon-Blau',
          category: 'Gaming',
          price: '271,90€',
          rawPrice: 271.90,
          compareAtPrice: '350,93€',
          discount: '-23%',
          image: '/images/deals/deal-3.jpg',
          slug: 'nintendo-switch-oled-modell-neon-rot-neon-blau',
          deliveryNote: 'Sofort lieferbar',
        },
        {
          title: 'KENWOOD Titanium Chef Patissier XL KWL90.594SI',
          category: 'Kleine Haushaltsgeräte',
          price: '729,60€',
          rawPrice: 729.60,
          compareAtPrice: '955,80€',
          discount: '-24%',
          image: '/images/deals/deal-4.jpg',
          slug: 'kenwood-titanium-chef-patissier-xl',
          deliveryNote: 'Auf Lager • 2-3 Werktage',
        },
        {
          title: 'KENWOOD Titanium Chef Patissier XL mit Zubehör',
          category: 'Kleine Haushaltsgeräte',
          price: '461,90€',
          rawPrice: 461.90,
          compareAtPrice: '749,93€',
          discount: '-38%',
          image: '/images/deals/deal-5.jpg',
          slug: 'kenwood-titanium-chef-patissier-xl-zubehoer',
          deliveryNote: 'Auf Lager • 2-3 Werktage',
        },
        {
          title: 'HAIER HSR5918DIPB SBS 90 SERIE 5 Side-by-Side',
          category: 'Kühlen & Gefrieren',
          price: '836,89€',
          rawPrice: 836.89,
          compareAtPrice: '1 108,79€',
          discount: '-25%',
          image: '/images/deals/deal-6.jpg',
          slug: 'haier-hsr5918dipb-sbs-90-serie-5',
          energyRating: 'E',
          deliveryNote: 'Kostenlose 2-Mann-Lieferung',
        },
      ];

  const updateSpotlightField = (field: string, val: any) => {
    const updatedSpotlight = { ...spotlight, [field]: val };
    updateSectionSettings(section.id, 'spotlight', updatedSpotlight);
  };

  const updateCardField = (index: number, field: string, val: any) => {
    const newDeals = [...deals];
    newDeals[index] = { ...newDeals[index], [field]: val };
    updateSectionSettings(section.id, 'deals', newDeals);
  };

  const handleSelectProductForSpotlight = (productId: string) => {
    const prod = allProducts.find((p) => p.id === productId);
    if (!prod) return;
    const catName = prod.categories?.[0]?.name || prod.categoryName || 'Haushaltsgeräte';
    const discount = prod.compareAtPrice && prod.compareAtPrice > prod.price
      ? `-${Math.round(((prod.compareAtPrice - prod.price) / prod.compareAtPrice) * 100)}%`
      : '';
    const savings = prod.compareAtPrice && prod.compareAtPrice > prod.price
      ? `${(prod.compareAtPrice - prod.price).toFixed(2).replace('.', ',')}€`
      : '';

    const updated = {
      ...spotlight,
      title: prod.title,
      category: catName,
      price: `${prod.price.toFixed(2).replace('.', ',')}€`,
      rawPrice: prod.price,
      compareAtPrice: prod.compareAtPrice ? `${prod.compareAtPrice.toFixed(2).replace('.', ',')}€` : '',
      discount,
      savings,
      slug: prod.slug,
      image: prod.images?.[0] || spotlight.image || '/images/deals/deal-spotlight.jpg',
      deliveryNote: spotlight.deliveryNote || 'Kostenlose',
      warrantyNote: spotlight.warrantyNote || '2 Jahre',
    };
    updateSectionSettings(section.id, 'spotlight', updated);
  };

  const handleSelectProductForCard = (index: number, productId: string) => {
    const prod = allProducts.find((p) => p.id === productId);
    if (!prod) return;
    const catName = prod.categories?.[0]?.name || prod.categoryName || 'Haushaltsgeräte';
    const discount = prod.compareAtPrice && prod.compareAtPrice > prod.price
      ? `-${Math.round(((prod.compareAtPrice - prod.price) / prod.compareAtPrice) * 100)}%`
      : '';

    const newDeals = [...deals];
    newDeals[index] = {
      ...newDeals[index],
      title: prod.title,
      category: catName,
      price: `${prod.price.toFixed(2).replace('.', ',')}€`,
      rawPrice: prod.price,
      compareAtPrice: prod.compareAtPrice ? `${prod.compareAtPrice.toFixed(2).replace('.', ',')}€` : '',
      discount,
      slug: prod.slug,
      image: prod.images?.[0] || newDeals[index].image,
    };
    updateSectionSettings(section.id, 'deals', newDeals);
  };

  const currentCard = deals[selectedCardIdx] || {};

  return (
    <div className="flex flex-col h-full bg-white text-stone-800">
      {/* Editor Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50/90">
        <div className="flex items-center justify-between gap-2 mb-2">
          <h2 className="font-extrabold text-gray-900 text-sm">Aktuelle Angebote bearbeiten</h2>
          {goBack && (
            <button
              type="button"
              onClick={goBack}
              className="text-xs text-stone-500 hover:text-stone-900 font-semibold cursor-pointer"
            >
              &larr; Zurück
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500">
          Legen Sie hier manuell die Angebote für die Standard-Ansicht (Alle Angebote) fest.
        </p>

        {/* Tab Switcher: Spotlight vs 6 Cards */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <button
            type="button"
            onClick={() => setActiveTab('spotlight')}
            className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
              activeTab === 'spotlight'
                ? 'bg-[#107b46] text-white border-[#107b46] shadow-xs'
                : 'bg-white text-stone-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Große Karte (Spotlight)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('grid')}
            className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
              activeTab === 'grid'
                ? 'bg-[#107b46] text-white border-[#107b46] shadow-xs'
                : 'bg-white text-stone-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            6 Kleine Karten (Raster)
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-230px)]">

        {/* 1. SPOTLIGHT CARD (Big Left Card) */}
        {activeTab === 'spotlight' && (
          <div className="space-y-4">
            {/* Quick Product Import from Catalog */}
            {allProducts.length > 0 && (
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Produkt aus Katalog wählen
                </label>
                <select
                  onChange={(e) => {
                    if (e.target.value) handleSelectProductForSpotlight(e.target.value);
                  }}
                  defaultValue=""
                  className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white text-gray-800"
                >
                  <option value="">-- Produkt auswählen zum automatischen Ausfüllen --</option>
                  {allProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.price ? `${p.price.toFixed(2)}€` : ''})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Image BG (Clean Frame + Upload, no URL text input) */}
            <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Image BG
              </label>
              <div className="flex items-center gap-3">
                <div className="w-24 h-24 rounded-xl border border-gray-300 overflow-hidden relative bg-white shrink-0 p-1">
                  <Image
                    src={spotlight.image || '/images/deals/deal-spotlight.jpg'}
                    alt="Image BG"
                    fill
                    className="object-contain p-1"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleUpload(section.id, 'spotlight_image')}
                  className="px-3.5 py-2 bg-[#107b46] hover:bg-[#0d693b] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  Bild auswählen
                </button>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Titel</label>
              <input
                type="text"
                value={spotlight.title ?? 'DELONGHI La Specialista Maestro Cold Brew EC9865.M'}
                onChange={(e) => updateSpotlightField('title', e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Kategorie</label>
              <input
                type="text"
                value={spotlight.category ?? 'Kaffeemaschinen'}
                onChange={(e) => updateSpotlightField('category', e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white"
              />
            </div>

            {/* Price & Compare At Price */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Preis</label>
                <input
                  type="text"
                  value={spotlight.price ?? '1 322,90€'}
                  onChange={(e) => updateSpotlightField('price', e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Streichpreis</label>
                <input
                  type="text"
                  value={spotlight.compareAtPrice ?? '1 599,00€'}
                  onChange={(e) => updateSpotlightField('compareAtPrice', e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white"
                />
              </div>
            </div>

            {/* Rabatt & Ersparnis */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Rabatt (z.B. -17%)</label>
                <input
                  type="text"
                  value={spotlight.discount ?? '-17%'}
                  onChange={(e) => updateSpotlightField('discount', e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Ersparnis (z.B. 276,10€)</label>
                <input
                  type="text"
                  value={spotlight.savings ?? '276,10€'}
                  onChange={(e) => updateSpotlightField('savings', e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white"
                />
              </div>
            </div>

            {/* Delivery & Warranty Badges */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Lieferung (Lkw-Icon)</label>
                <input
                  type="text"
                  value={spotlight.deliveryNote ?? 'Kostenlose'}
                  onChange={(e) => updateSpotlightField('deliveryNote', e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Garantie (Schild-Icon)</label>
                <input
                  type="text"
                  value={spotlight.warrantyNote ?? '2 Jahre'}
                  onChange={(e) => updateSpotlightField('warrantyNote', e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white"
                />
              </div>
            </div>

            {/* Slug */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Produkt-Slug (Link)</label>
              <input
                type="text"
                value={spotlight.slug ?? 'delonghi-la-specialista-maestro-cold-brew'}
                onChange={(e) => updateSpotlightField('slug', e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">
                Linkziel: /produkt/[slug]
              </span>
            </div>
          </div>
        )}

        {/* 2. 6 SMALL CARDS (Grid) */}
        {activeTab === 'grid' && (
          <div className="space-y-4">
            {/* Sub-Tabs for Card 1 to Card 6 */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {[0, 1, 2, 3, 4, 5].map((idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedCardIdx(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                    selectedCardIdx === idx
                      ? 'bg-[#107b46] text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  Karte {idx + 1}
                </button>
              ))}
            </div>

            {/* Quick Catalog Selector for Selected Card */}
            {allProducts.length > 0 && (
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Produkt für Karte {selectedCardIdx + 1} aus Katalog wählen
                </label>
                <select
                  onChange={(e) => {
                    if (e.target.value) handleSelectProductForCard(selectedCardIdx, e.target.value);
                  }}
                  defaultValue=""
                  className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white text-gray-800"
                >
                  <option value="">-- Produkt auswählen zum automatischen Ausfüllen --</option>
                  {allProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.price ? `${p.price.toFixed(2)}€` : ''})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Image BG (Clean Frame + Upload, no URL text input) */}
            <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Image BG (Karte {selectedCardIdx + 1})
              </label>
              <div className="flex items-center gap-3">
                <div className="w-20 h-20 rounded-xl border border-gray-300 overflow-hidden relative bg-white shrink-0 p-1">
                  <Image
                    src={currentCard.image || `/images/deals/deal-${selectedCardIdx + 1}.jpg`}
                    alt="Image BG"
                    fill
                    className="object-contain p-1"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleUpload(section.id, `card_${selectedCardIdx}_image`)}
                  className="px-3.5 py-2 bg-[#107b46] hover:bg-[#0d693b] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  Bild auswählen
                </button>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Titel</label>
              <input
                type="text"
                value={currentCard.title ?? ''}
                onChange={(e) => updateCardField(selectedCardIdx, 'title', e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Kategorie</label>
              <input
                type="text"
                value={currentCard.category ?? ''}
                onChange={(e) => updateCardField(selectedCardIdx, 'category', e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white"
              />
            </div>

            {/* Price & Compare At Price */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Preis</label>
                <input
                  type="text"
                  value={currentCard.price ?? ''}
                  onChange={(e) => updateCardField(selectedCardIdx, 'price', e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Streichpreis</label>
                <input
                  type="text"
                  value={currentCard.compareAtPrice ?? ''}
                  onChange={(e) => updateCardField(selectedCardIdx, 'compareAtPrice', e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white"
                />
              </div>
            </div>

            {/* Rabatt & Energieeffizienz */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Rabatt (z.B. -25%)</label>
                <input
                  type="text"
                  value={currentCard.discount ?? ''}
                  onChange={(e) => updateCardField(selectedCardIdx, 'discount', e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">EU-Energieklasse</label>
                <select
                  value={currentCard.energyRating ?? ''}
                  onChange={(e) => updateCardField(selectedCardIdx, 'energyRating', e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white text-gray-800"
                >
                  <option value="">Keine Angabe</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="E">E</option>
                  <option value="F">F</option>
                  <option value="G">G</option>
                </select>
              </div>
            </div>

            {/* Delivery Note */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Lieferhinweis</label>
              <input
                type="text"
                value={currentCard.deliveryNote ?? ''}
                onChange={(e) => updateCardField(selectedCardIdx, 'deliveryNote', e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Produkt-Slug</label>
              <input
                type="text"
                value={currentCard.slug ?? ''}
                onChange={(e) => updateCardField(selectedCardIdx, 'slug', e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">
                Linkziel: /produkt/[slug]
              </span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

