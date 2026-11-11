'use client';

import { useState } from 'react';
import { SectionConfig } from '@/app/admin/(dashboard)/landing/LandingForm';
import { ImageFramePicker, EditorModeTabs } from './ImageFramePicker';
import {
  ANGEBOTE_FILTER_TABS,
  DEFAULT_TAB_DATA,
  TabFilterKey,
  resolveTabOffers,
} from '@/components/home/aktuelleAngeboteData';

interface AktuelleAngeboteEditorProps {
  section: SectionConfig;
  previewMode?: 'desktop' | 'tablet' | 'mobile';
  updateSectionSettings: (
    id: string,
    keyOrUpdates: string | Record<string, any>,
    value?: any
  ) => void;
  handleUpload: (id: string, key: string) => void;
  allProducts?: any[];
  goBack?: () => void;
}

export default function AktuelleAngeboteEditor({
  section,
  updateSectionSettings,
  handleUpload,
  allProducts = [],
}: AktuelleAngeboteEditorProps) {
  const [modeTab, setModeTab] = useState<'content' | 'design'>('content');
  const [activePill, setActivePill] = useState<TabFilterKey>('ALL');
  const [cardScope, setCardScope] = useState<'spotlight' | 'grid'>('spotlight');
  const [selectedCardIdx, setSelectedCardIdx] = useState<number>(0);
  const [catalogSearch, setCatalogSearch] = useState<string>('');

  const settings = section.settings || {};
  const { spotlight: currentSpotlight, deals: currentGrid } = resolveTabOffers(
    activePill,
    settings
  );
  const currentCard = currentGrid[selectedCardIdx] || DEFAULT_TAB_DATA[activePill].deals[0];

  const writeTabData = (updatedSpotlight?: any, updatedDeals?: any[]) => {
    if (activePill === 'ALL') {
      const updates: Record<string, any> = {};
      if (updatedSpotlight !== undefined) updates.spotlight = updatedSpotlight;
      if (updatedDeals !== undefined) updates.deals = updatedDeals;
      updateSectionSettings(section.id, updates);
    } else {
      const prevTabs = settings.tabsConfig || {};
      const prevTab = prevTabs[activePill] || {};
      updateSectionSettings(section.id, 'tabsConfig', {
        ...prevTabs,
        [activePill]: {
          ...prevTab,
          ...(updatedSpotlight !== undefined ? { spotlight: updatedSpotlight } : {}),
          ...(updatedDeals !== undefined ? { deals: updatedDeals } : {}),
        },
      });
    }
  };

  const updateSpotlightField = (field: string, val: any) => {
    const baseSpot =
      activePill === 'ALL'
        ? settings.spotlight || {}
        : settings.tabsConfig?.[activePill]?.spotlight || {};
    writeTabData({ ...currentSpotlight, ...baseSpot, [field]: val }, undefined);
  };

  const updateCardField = (index: number, field: string, val: any) => {
    const newDeals = currentGrid.map((d, i) => (i === index ? { ...d, [field]: val } : { ...d }));
    writeTabData(undefined, newDeals);
  };

  const applyCatalogProductToSpotlight = (prod: any) => {
    if (!prod) return;
    const catName = prod.categories?.[0]?.name || prod.categoryName || currentSpotlight.category;
    const discount =
      prod.compareAtPrice && prod.compareAtPrice > prod.price
        ? `-${Math.round(((prod.compareAtPrice - prod.price) / prod.compareAtPrice) * 100)}%`
        : '';
    const savings =
      prod.compareAtPrice && prod.compareAtPrice > prod.price
        ? `${(prod.compareAtPrice - prod.price).toFixed(2).replace('.', ',')}€`
        : '';

    writeTabData(
      {
        ...currentSpotlight,
        id: prod.id,
        title: prod.title,
        category: catName,
        price: `${prod.price.toFixed(2).replace('.', ',')}€`,
        rawPrice: prod.price,
        compareAtPrice: prod.compareAtPrice
          ? `${prod.compareAtPrice.toFixed(2).replace('.', ',')}€`
          : '',
        discount,
        savings,
        slug: prod.slug,
        image: prod.images?.[0] || currentSpotlight.image,
      },
      undefined
    );
    setCatalogSearch('');
  };

  const applyCatalogProductToCard = (index: number, prod: any) => {
    if (!prod) return;
    const catName = prod.categories?.[0]?.name || prod.categoryName || currentCard.category;
    const discount =
      prod.compareAtPrice && prod.compareAtPrice > prod.price
        ? `-${Math.round(((prod.compareAtPrice - prod.price) / prod.compareAtPrice) * 100)}%`
        : '';

    const newDeals = currentGrid.map((d, i) =>
      i === index
        ? {
            ...d,
            id: prod.id,
            title: prod.title,
            category: catName,
            price: `${prod.price.toFixed(2).replace('.', ',')}€`,
            rawPrice: prod.price,
            compareAtPrice: prod.compareAtPrice
              ? `${prod.compareAtPrice.toFixed(2).replace('.', ',')}€`
              : '',
            discount,
            slug: prod.slug,
            image: prod.images?.[0] || d.image,
          }
        : d
    );
    writeTabData(undefined, newDeals);
    setCatalogSearch('');
  };

  const matchingProducts = catalogSearch.trim()
    ? allProducts
        .filter((p) => p.title?.toLowerCase().includes(catalogSearch.toLowerCase()))
        .slice(0, 8)
    : [];

  const design = settings.design || {};
  const updateDesign = (key: string, val: any) => {
    updateSectionSettings(section.id, 'design', { ...design, [key]: val });
  };

  return (
    <div className="flex flex-col h-full bg-white text-stone-800 -mx-3 -mt-3">
      {/* Header + Category Pill Selector */}
      <div className="px-3.5 pt-3 pb-2.5 bg-gray-50/90 space-y-2">
        <h2 className="font-extrabold text-gray-900 text-xs">Aktuelle Angebote</h2>

        {/* 6 Pill Tabs: Alle Angebote | Waschen & Trocknen | Staubsauger | Küchengeräte | Kühlen | Gaming */}
        <div className="flex flex-wrap gap-1">
          {ANGEBOTE_FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActivePill(tab.key)}
              className={`px-2 py-1 text-[10px] font-bold rounded-md border transition-all cursor-pointer ${
                activePill === tab.key
                  ? 'bg-[#107b46] text-white border-[#107b46] shadow-2xs'
                  : 'bg-white text-stone-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Single Icon-Only Content / Design Tab Bar */}
      <EditorModeTabs mode={modeTab} onChange={setModeTab} />

      <div className="p-3.5 space-y-4 overflow-y-auto max-h-[calc(100vh-225px)]">
        {/* ============================================================ */}
        {/* CONTENT TAB                                                  */}
        {/* ============================================================ */}
        {modeTab === 'content' && (
          <div className="space-y-4">
            {/* Switch Spotlight Card vs 6 Grid Cards */}
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setCardScope('spotlight')}
                className={`py-1.5 px-2 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                  cardScope === 'spotlight'
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-white text-stone-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                Große Karte
              </button>
              <button
                type="button"
                onClick={() => setCardScope('grid')}
                className={`py-1.5 px-2 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                  cardScope === 'grid'
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-white text-stone-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                6 Kleine Karten
              </button>
            </div>

            {/* Sub-tabs for Card 1..6 when editing Grid */}
            {cardScope === 'grid' && (
              <div className="grid grid-cols-6 gap-1">
                {[0, 1, 2, 3, 4, 5].map((idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedCardIdx(idx)}
                    className={`py-1.5 text-[11px] font-bold rounded-md cursor-pointer transition-colors ${
                      selectedCardIdx === idx
                        ? 'bg-[#107b46] text-white shadow-2xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    #{idx + 1}
                  </button>
                ))}
              </div>
            )}

            {/* Quick Search from Product Catalog */}
            {allProducts.length > 0 && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Produkt aus Katalog suchen
                </label>
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder="Produktname eingeben..."
                  className="w-full text-xs p-2 border border-gray-300 rounded-lg bg-white"
                />
                {matchingProducts.length > 0 && (
                  <div className="max-h-36 overflow-y-auto border border-gray-200 rounded-lg bg-white divide-y divide-gray-100 shadow-sm">
                    {matchingProducts.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() =>
                          cardScope === 'spotlight'
                            ? applyCatalogProductToSpotlight(p)
                            : applyCatalogProductToCard(selectedCardIdx, p)
                        }
                        className="w-full text-left px-2.5 py-2 text-[11px] hover:bg-emerald-50 flex items-center justify-between gap-2 cursor-pointer"
                      >
                        <span className="font-medium truncate">{p.title}</span>
                        <span className="font-bold text-[#107b46] shrink-0">
                          {p.price ? `${p.price.toFixed(2).replace('.', ',')}€` : ''}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SPOTLIGHT FIELDS */}
            {cardScope === 'spotlight' && (
              <div className="space-y-3">
                <ImageFramePicker
                  label="Produktbild"
                  imageUrl={currentSpotlight.image}
                  onSelectClick={() => handleUpload(section.id, `aktuelle_${activePill}_spotlight`)}
                  onClearClick={() => updateSpotlightField('image', '')}
                  objectFit="contain"
                  heightClass="h-32"
                />

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Titel</label>
                  <input
                    type="text"
                    value={currentSpotlight.title}
                    onChange={(e) => updateSpotlightField('title', e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Kategorie</label>
                  <input
                    type="text"
                    value={currentSpotlight.category}
                    onChange={(e) => updateSpotlightField('category', e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Preis</label>
                    <input
                      type="text"
                      value={currentSpotlight.price}
                      onChange={(e) => updateSpotlightField('price', e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Streichpreis</label>
                    <input
                      type="text"
                      value={currentSpotlight.compareAtPrice}
                      onChange={(e) => updateSpotlightField('compareAtPrice', e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Rabatt</label>
                    <input
                      type="text"
                      value={currentSpotlight.discount}
                      onChange={(e) => updateSpotlightField('discount', e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Ersparnis</label>
                    <input
                      type="text"
                      value={currentSpotlight.savings ?? ''}
                      onChange={(e) => updateSpotlightField('savings', e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Lieferung</label>
                    <input
                      type="text"
                      value={currentSpotlight.deliveryNote ?? 'Kostenlose'}
                      onChange={(e) => updateSpotlightField('deliveryNote', e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Garantie</label>
                    <input
                      type="text"
                      value={currentSpotlight.warrantyNote ?? '2 Jahre'}
                      onChange={(e) => updateSpotlightField('warrantyNote', e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Produkt-Slug</label>
                  <input
                    type="text"
                    value={currentSpotlight.slug}
                    onChange={(e) => updateSpotlightField('slug', e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white"
                  />
                </div>
              </div>
            )}

            {/* SMALL GRID CARD FIELDS */}
            {cardScope === 'grid' && (
              <div className="space-y-3">
                <ImageFramePicker
                  label="Produktbild"
                  imageUrl={currentCard.image}
                  onSelectClick={() =>
                    handleUpload(section.id, `aktuelle_${activePill}_card_${selectedCardIdx}`)
                  }
                  onClearClick={() => updateCardField(selectedCardIdx, 'image', '')}
                  objectFit="contain"
                  heightClass="h-28"
                />

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Titel</label>
                  <input
                    type="text"
                    value={currentCard.title}
                    onChange={(e) => updateCardField(selectedCardIdx, 'title', e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Kategorie</label>
                  <input
                    type="text"
                    value={currentCard.category}
                    onChange={(e) => updateCardField(selectedCardIdx, 'category', e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Preis</label>
                    <input
                      type="text"
                      value={currentCard.price}
                      onChange={(e) => updateCardField(selectedCardIdx, 'price', e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Streichpreis</label>
                    <input
                      type="text"
                      value={currentCard.compareAtPrice}
                      onChange={(e) =>
                        updateCardField(selectedCardIdx, 'compareAtPrice', e.target.value)
                      }
                      className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Rabatt</label>
                    <input
                      type="text"
                      value={currentCard.discount}
                      onChange={(e) => updateCardField(selectedCardIdx, 'discount', e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Energieklasse</label>
                    <select
                      value={currentCard.energyRating ?? ''}
                      onChange={(e) =>
                        updateCardField(selectedCardIdx, 'energyRating', e.target.value)
                      }
                      className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white text-gray-800"
                    >
                      <option value="">Keine</option>
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

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Lieferhinweis</label>
                  <input
                    type="text"
                    value={currentCard.deliveryNote ?? ''}
                    onChange={(e) =>
                      updateCardField(selectedCardIdx, 'deliveryNote', e.target.value)
                    }
                    className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Produkt-Slug</label>
                  <input
                    type="text"
                    value={currentCard.slug}
                    onChange={(e) => updateCardField(selectedCardIdx, 'slug', e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* DESIGN TAB                                                   */}
        {/* ============================================================ */}
        {modeTab === 'design' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Sektions-Titel</label>
              <input
                type="text"
                value={settings.sectionTitle ?? 'Aktuelle Angebote'}
                onChange={(e) => updateSectionSettings(section.id, 'sectionTitle', e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Spotlight Badge</label>
              <input
                type="text"
                value={settings.spotlightBadgeText ?? 'DEAL DES TAGES'}
                onChange={(e) =>
                  updateSectionSettings(section.id, 'spotlightBadgeText', e.target.value)
                }
                className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-gray-700">Karten Eckenradius</span>
                <span className="font-mono text-[11px] font-bold text-[#107b46]">
                  {design.cardRadius ?? 16}px
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={32}
                value={design.cardRadius ?? 16}
                onChange={(e) => updateDesign('cardRadius', Number(e.target.value))}
                className="w-full accent-[#107b46] cursor-pointer"
              />
            </div>

            <div className="pt-2 border-t border-gray-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-700">Akzentfarbe</span>
                <input
                  type="color"
                  value={design.accentColor || '#107b46'}
                  onChange={(e) => updateDesign('accentColor', e.target.value)}
                  className="w-9 h-7 rounded border border-gray-300 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-700">Rabatt-Farbe</span>
                <input
                  type="color"
                  value={design.saleColor || '#dc2626'}
                  onChange={(e) => updateDesign('saleColor', e.target.value)}
                  className="w-9 h-7 rounded border border-gray-300 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-700">Hintergrundfarbe</span>
                <input
                  type="color"
                  value={design.sectionBg || '#ffffff'}
                  onChange={(e) => updateDesign('sectionBg', e.target.value)}
                  className="w-9 h-7 rounded border border-gray-300 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
