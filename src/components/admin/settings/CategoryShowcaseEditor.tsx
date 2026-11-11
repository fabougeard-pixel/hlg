'use client';

import React, { useState } from 'react';
import {
  AdminCategoryOption,
  CATEGORY_PRESET_DEFAULTS,
  CatalogProductSummary,
  CategoryProductItem,
  CategorySectionPreset,
  SectionConfig,
  resolveCategorySectionConfig,
} from '@/components/home/categorySectionData';
import { EditorModeTabs, ImageFramePicker } from './ImageFramePicker';
import { EditorColorField, EditorRangeField, EditorToggleRow } from './EditorControls';

let slotCounter = 1;

interface CategoryShowcaseEditorProps {
  section: SectionConfig;
  updateSectionSettings: (
    id: string,
    keyOrUpdates: string | Record<string, unknown>,
    value?: unknown
  ) => void;
  handleUpload: (id: string, key: string) => void;
  categories?: AdminCategoryOption[];
  allProducts?: CatalogProductSummary[];
}

export default function CategoryShowcaseEditor({
  section,
  updateSectionSettings,
  handleUpload,
  categories = [],
  allProducts = [],
}: CategoryShowcaseEditorProps) {
  const [modeTab, setModeTab] = useState<'content' | 'design'>('content');
  const [contentSubTab, setContentSubTab] = useState<'general' | 'banner' | 'products'>('general');
  const [activeCardIdx, setActiveCardIdx] = useState<number>(0);
  const [catalogSearch, setCatalogSearch] = useState<string>('');

  const settings = section.settings || {};
  const resolved = resolveCategorySectionConfig(settings, []);
  const design = resolved.design || {};

  // Ensure editable manual product list starts from explicit settings.products or preset defaults
  const editableProducts: CategoryProductItem[] =
    Array.isArray(settings.products) && settings.products.length > 0
      ? settings.products
      : CATEGORY_PRESET_DEFAULTS[resolved.preset].products;

  const safeIdx = Math.min(activeCardIdx, Math.max(0, editableProducts.length - 1));
  const activeCard = editableProducts[safeIdx];

  const updateField = (key: string, val: unknown) => {
    updateSectionSettings(section.id, key, val);
  };

  const updateDesign = (key: string, val: unknown) => {
    updateSectionSettings(section.id, 'design', { ...design, [key]: val });
  };

  const updateCardField = (index: number, field: string, val: unknown) => {
    const next = editableProducts.map((item, i) =>
      i === index ? { ...item, [field]: val } : { ...item }
    );
    updateSectionSettings(section.id, {
      products: next,
      sourceMode: 'MANUAL',
    });
  };

  const applyCatalogProductToSlot = (prod: CatalogProductSummary, targetIndex?: number) => {
    if (!prod) return;
    const catName = prod.categories?.[0]?.name || prod.categoryName || resolved.title;
    const compareAt =
      prod.compareAtPrice && prod.compareAtPrice > prod.price ? prod.compareAtPrice : undefined;
    const discount = compareAt
      ? `-${Math.round(((compareAt - prod.price) / compareAt) * 100)}%`
      : '';

    const mapped: CategoryProductItem = {
      id: prod.id,
      category: catName,
      title: prod.title,
      price: `${Number(prod.price || 0).toFixed(2).replace('.', ',')}€`,
      rawPrice: Number(prod.price || 0),
      compareAtPrice: compareAt ? `${Number(compareAt).toFixed(2).replace('.', ',')}€` : '',
      discount,
      rating: 5,
      ratingScore: '(5.00)',
      image: prod.images?.[0] || '',
      slug: prod.slug || '',
      energyRating: prod.title?.match(/\b([A-G]|\bA\+{1,3})\b/)?.[1]?.toUpperCase() || undefined,
      deliveryNote: 'Auf Lager • 2-3 Werktage',
    };

    const next = [...editableProducts];
    if (targetIndex !== undefined && targetIndex >= 0 && targetIndex < next.length) {
      next[targetIndex] = mapped;
      setActiveCardIdx(targetIndex);
    } else {
      next.push(mapped);
      setActiveCardIdx(next.length - 1);
    }

    updateSectionSettings(section.id, {
      products: next,
      sourceMode: 'MANUAL',
      maxProducts: Math.max(resolved.maxProducts, next.length),
    });
    setCatalogSearch('');
  };

  const addEmptyProductSlot = () => {
    const next = [
      ...editableProducts,
      {
        id: `manual-${slotCounter++}`,
        category: resolved.title,
        title: 'Neues Produkt',
        price: '0,00€',
        rawPrice: 0,
        compareAtPrice: '',
        discount: '',
        rating: 5,
        ratingScore: '(5.00)',
        image: '',
        slug: '',
        deliveryNote: 'Auf Lager • 2-3 Werktage',
      },
    ];
    updateSectionSettings(section.id, {
      products: next,
      sourceMode: 'MANUAL',
      maxProducts: Math.max(resolved.maxProducts, next.length),
    });
    setActiveCardIdx(next.length - 1);
  };

  const removeProductSlot = (index: number) => {
    const next = editableProducts.filter((_, i) => i !== index);
    updateSectionSettings(section.id, {
      products: next,
      sourceMode: 'MANUAL',
    });
    setActiveCardIdx(Math.max(0, index - 1));
  };

  const handlePresetSwitch = (preset: CategorySectionPreset) => {
    const base = CATEGORY_PRESET_DEFAULTS[preset];
    updateSectionSettings(section.id, {
      preset,
      title: base.title,
      linkText: base.linkText,
      linkUrl: base.linkUrl,
      categorySlug: base.categorySlug,
      sourceMode: base.sourceMode,
      showBanner: base.showBanner,
      bannerPosition: base.bannerPosition,
      bannerImage: base.bannerImage,
      bannerBadge: base.bannerBadge,
      bannerTitle: base.bannerTitle,
      bannerCtaText: base.bannerCtaText,
      bannerCtaUrl: base.bannerCtaUrl,
      colsDesktop: base.colsDesktop,
      maxProducts: base.maxProducts,
      products: base.products,
    });
    setActiveCardIdx(0);
  };

  const matchingProducts = catalogSearch.trim()
    ? allProducts
        .filter((p) => p.title?.toLowerCase().includes(catalogSearch.toLowerCase()))
        .slice(0, 8)
    : [];

  return (
    <div className="flex flex-col h-full bg-white text-stone-800 -mx-3 -mt-3">
      {/* Header */}
      <div className="px-3.5 pt-3 pb-2.5 bg-gray-50/90 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-extrabold text-gray-900 text-xs truncate">{resolved.title}</h2>
          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 shrink-0">
            {resolved.preset}
          </span>
        </div>

        {/* Sub-Tabs when in Content mode */}
        {modeTab === 'content' && (
          <div className="grid grid-cols-3 gap-1">
            {[
              { id: 'general' as const, label: 'Allgemein' },
              { id: 'banner' as const, label: 'Seitenbanner' },
              { id: 'products' as const, label: `Produkte (${editableProducts.length})` },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setContentSubTab(t.id)}
                className={`py-1.5 px-1 text-[10px] font-bold rounded-md border transition-all cursor-pointer truncate ${
                  contentSubTab === t.id
                    ? 'bg-[#107b46] text-white border-[#107b46] shadow-2xs'
                    : 'bg-white text-stone-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Single Icon-Only Content / Design Tab Bar */}
      <EditorModeTabs mode={modeTab} onChange={setModeTab} />

      <div className="p-3.5 space-y-4 overflow-y-auto max-h-[calc(100vh-220px)]">
        {/* ============================================================ */}
        {/* CONTENT TAB — GENERAL                                        */}
        {/* ============================================================ */}
        {modeTab === 'content' && contentSubTab === 'general' && (
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                Sektions-Titel
              </label>
              <input
                type="text"
                value={resolved.title}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full text-xs p-2 border border-gray-300 rounded-md focus:border-[#107b46] outline-none font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                  Link-Text
                </label>
                <input
                  type="text"
                  value={resolved.linkText}
                  onChange={(e) => updateField('linkText', e.target.value)}
                  className="w-full text-xs p-2 border border-gray-300 rounded-md focus:border-[#107b46] outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                  Ziel-URL
                </label>
                <input
                  type="text"
                  value={resolved.linkUrl}
                  onChange={(e) => updateField('linkUrl', e.target.value)}
                  className="w-full text-xs p-2 border border-gray-300 rounded-md focus:border-[#107b46] outline-none font-mono"
                />
              </div>
            </div>

            {/* Category Binding */}
            <div>
              <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                Shop-Kategorie verknüpfen
              </label>
              <select
                value={resolved.categorySlug}
                onChange={(e) => {
                  const slug = e.target.value;
                  const cat = categories.find((c) => c.slug === slug);
                  updateSectionSettings(section.id, {
                    categorySlug: slug,
                    linkUrl: slug ? `/shop?category=${slug}` : '/shop',
                    ...(cat && settings.title === undefined ? { title: cat.name } : {}),
                  });
                }}
                className="w-full text-xs p-2 border border-gray-300 rounded-md bg-white focus:border-[#107b46] outline-none"
              >
                <option value="">-- Kategorie wählen --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.displayName || cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Data Source Mode */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-[11px] font-bold text-gray-600 uppercase">
                Produkt-Quelle
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => updateField('sourceMode', 'MANUAL')}
                  className={`py-1.5 px-2 text-[11px] font-bold rounded-lg border cursor-pointer transition-all ${
                    resolved.sourceMode === 'MANUAL'
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-white text-stone-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  Manuell definiert
                </button>
                <button
                  type="button"
                  onClick={() => updateField('sourceMode', 'CATEGORY')}
                  className={`py-1.5 px-2 text-[11px] font-bold rounded-lg border cursor-pointer transition-all ${
                    resolved.sourceMode === 'CATEGORY'
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-white text-stone-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  Kategorie (Auto)
                </button>
              </div>
            </div>

            {/* Vorlage zurücksetzen */}
            <div className="pt-2 border-t border-gray-200">
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">
                Bereichs-Vorlage anwenden
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { key: 'coffee' as const, label: 'Kaffeemaschinen' },
                  { key: 'washing' as const, label: 'Waschmaschinen' },
                  { key: 'cooling' as const, label: 'Kühlen & Gefrieren' },
                  { key: 'vacuum' as const, label: 'Staubsauger' },
                ].map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => handlePresetSwitch(p.key)}
                    className={`py-1.5 px-2 text-[10px] font-bold rounded-md border text-left transition-all cursor-pointer truncate ${
                      resolved.preset === p.key
                        ? 'border-[#107b46] bg-emerald-50 text-[#107b46]'
                        : 'border-gray-200 bg-white text-stone-600 hover:bg-gray-50'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* CONTENT TAB — SIDE BANNER                                    */}
        {/* ============================================================ */}
        {modeTab === 'content' && contentSubTab === 'banner' && (
          <div className="space-y-3">
            <EditorToggleRow
              label="Seitenbanner anzeigen"
              description="Große Aktionskachel links oder rechts neben den Produkten"
              checked={resolved.showBanner}
              onChange={(next) => updateField('showBanner', next)}
            />

            {resolved.showBanner && (
              <>
                <ImageFramePicker
                  label="Image BG"
                  imageUrl={resolved.bannerImage}
                  onSelectClick={() => handleUpload(section.id, 'bannerImage')}
                  onClearClick={() => updateField('bannerImage', '')}
                  objectFit="cover"
                  heightClass="h-32"
                />

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                    Badge-Text
                  </label>
                  <input
                    type="text"
                    value={resolved.bannerBadge}
                    onChange={(e) => updateField('bannerBadge', e.target.value)}
                    className="w-full text-xs p-2 border border-gray-300 rounded-md focus:border-[#107b46] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                    Banner-Überschrift
                  </label>
                  <textarea
                    rows={2}
                    value={resolved.bannerTitle}
                    onChange={(e) => updateField('bannerTitle', e.target.value)}
                    className="w-full text-xs p-2 border border-gray-300 rounded-md focus:border-[#107b46] outline-none font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                      Button-Text
                    </label>
                    <input
                      type="text"
                      value={resolved.bannerCtaText}
                      onChange={(e) => updateField('bannerCtaText', e.target.value)}
                      className="w-full text-xs p-2 border border-gray-300 rounded-md focus:border-[#107b46] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                      Button-URL
                    </label>
                    <input
                      type="text"
                      value={resolved.bannerCtaUrl}
                      onChange={(e) => updateField('bannerCtaUrl', e.target.value)}
                      className="w-full text-xs p-2 border border-gray-300 rounded-md focus:border-[#107b46] outline-none font-mono"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* CONTENT TAB — PRODUCTS                                       */}
        {/* ============================================================ */}
        {modeTab === 'content' && contentSubTab === 'products' && (
          <div className="space-y-3">
            {resolved.sourceMode === 'CATEGORY' && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-900 space-y-1.5">
                <p className="font-semibold">
                  Automatischer Modus aktiv ({resolved.categorySlug || 'Alle'})
                </p>
                <p className="text-[10px] text-emerald-700">
                  Sobald Sie unten ein Produkt bearbeiten oder aus dem Katalog wählen, wird in den manuellen Modus gewechselt.
                </p>
              </div>
            )}

            {/* Card Slots Switcher */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-600 uppercase">
                  Karten-Slot ({editableProducts.length})
                </span>
                <button
                  type="button"
                  onClick={addEmptyProductSlot}
                  className="text-[11px] font-bold text-[#107b46] hover:underline cursor-pointer"
                >
                  + Karte hinzufügen
                </button>
              </div>

              <div className="flex flex-wrap gap-1">
                {editableProducts.map((p, idx) => (
                  <button
                    key={p.id || idx}
                    type="button"
                    onClick={() => setActiveCardIdx(idx)}
                    className={`w-7 h-7 text-[11px] font-bold rounded-md border transition-all cursor-pointer ${
                      safeIdx === idx
                        ? 'bg-[#107b46] text-white border-[#107b46]'
                        : 'bg-white text-stone-600 border-gray-200 hover:bg-gray-50'
                    }`}
                    title={p.title}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Catalog Search Autofill */}
            <div className="space-y-1.5 border-t border-gray-200 pt-3">
              <label className="block text-[10px] font-bold text-gray-500 uppercase">
                Produkt aus Katalog für Slot {safeIdx + 1} laden
              </label>
              <input
                type="text"
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                placeholder="Produktname eingeben..."
                className="w-full text-xs p-2 border border-gray-300 rounded-md focus:border-[#107b46] outline-none"
              />
              {matchingProducts.length > 0 && (
                <div className="max-h-36 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100 bg-white shadow-sm">
                  {matchingProducts.map((prod) => (
                    <button
                      key={prod.id}
                      type="button"
                      onClick={() => applyCatalogProductToSlot(prod, safeIdx)}
                      className="w-full text-left px-2.5 py-1.5 text-[11px] hover:bg-emerald-50 flex items-center justify-between gap-2 cursor-pointer"
                    >
                      <span className="truncate font-medium text-stone-800">{prod.title}</span>
                      <span className="text-[10px] font-bold text-[#107b46] shrink-0">
                        {prod.price ? `${Number(prod.price).toFixed(2).replace('.', ',')}€` : ''}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Active Slot Details */}
            {activeCard && (
              <div className="space-y-2.5 border-t border-gray-200 pt-3">
                <ImageFramePicker
                  label="Produktbild"
                  imageUrl={activeCard.image}
                  onSelectClick={() => handleUpload(section.id, `catprod_${safeIdx}`)}
                  onClearClick={() => updateCardField(safeIdx, 'image', '')}
                  objectFit="contain"
                  heightClass="h-28"
                />

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                    Produkttitel
                  </label>
                  <input
                    type="text"
                    value={activeCard.title}
                    onChange={(e) => updateCardField(safeIdx, 'title', e.target.value)}
                    className="w-full text-xs p-2 border border-gray-300 rounded-md focus:border-[#107b46] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                      Kategorie-Tag
                    </label>
                    <input
                      type="text"
                      value={activeCard.category}
                      onChange={(e) => updateCardField(safeIdx, 'category', e.target.value)}
                      className="w-full text-xs p-2 border border-gray-300 rounded-md focus:border-[#107b46] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                      EEK-Label
                    </label>
                    <input
                      type="text"
                      value={activeCard.energyRating || ''}
                      onChange={(e) => updateCardField(safeIdx, 'energyRating', e.target.value)}
                      placeholder="z. B. A"
                      className="w-full text-xs p-2 border border-gray-300 rounded-md focus:border-[#107b46] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                      Preis
                    </label>
                    <input
                      type="text"
                      value={activeCard.price}
                      onChange={(e) => {
                        const val = e.target.value;
                        const num = parseFloat(val.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
                        const next = editableProducts.map((item, i) =>
                          i === safeIdx ? { ...item, price: val, rawPrice: num } : { ...item }
                        );
                        updateSectionSettings(section.id, { products: next, sourceMode: 'MANUAL' });
                      }}
                      className="w-full text-xs p-1.5 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                      Streichpreis
                    </label>
                    <input
                      type="text"
                      value={activeCard.compareAtPrice || ''}
                      onChange={(e) => updateCardField(safeIdx, 'compareAtPrice', e.target.value)}
                      className="w-full text-xs p-1.5 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                      Rabatt
                    </label>
                    <input
                      type="text"
                      value={activeCard.discount || ''}
                      onChange={(e) => updateCardField(safeIdx, 'discount', e.target.value)}
                      placeholder="-25%"
                      className="w-full text-xs p-1.5 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                      Lieferhinweis
                    </label>
                    <input
                      type="text"
                      value={activeCard.deliveryNote || ''}
                      onChange={(e) => updateCardField(safeIdx, 'deliveryNote', e.target.value)}
                      className="w-full text-xs p-1.5 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                      Produkt-Slug
                    </label>
                    <input
                      type="text"
                      value={activeCard.slug}
                      onChange={(e) => updateCardField(safeIdx, 'slug', e.target.value)}
                      className="w-full text-xs p-1.5 border border-gray-300 rounded-md font-mono"
                    />
                  </div>
                </div>

                {editableProducts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeProductSlot(safeIdx)}
                    className="w-full py-1.5 text-[11px] font-bold text-red-600 hover:bg-red-50 border border-red-200 rounded-lg cursor-pointer"
                  >
                    Diese Karte entfernen
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* DESIGN TAB                                                   */}
        {/* ============================================================ */}
        {modeTab === 'design' && (
          <div className="space-y-4">
            <div className="space-y-2 border-b border-gray-200 pb-3">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Raster &amp; Layout
              </p>

              <div className="space-y-1">
                <span className="text-xs font-medium text-gray-700 block">Spalten (Desktop)</span>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['2', '3', '4', '5'] as const).map((cols) => (
                    <button
                      key={cols}
                      type="button"
                      onClick={() => updateField('colsDesktop', cols)}
                      className={`py-1.5 text-xs font-bold rounded-md border cursor-pointer ${
                        resolved.colsDesktop === cols
                          ? 'bg-[#107b46] text-white border-[#107b46]'
                          : 'bg-white text-stone-600 border-gray-200'
                      }`}
                    >
                      {cols}
                    </button>
                  ))}
                </div>
              </div>

              <EditorRangeField
                label="Max. Produkte anzeigen"
                value={resolved.maxProducts}
                defaultValue={4}
                min={1}
                max={12}
                unit=""
                onChange={(val) => updateField('maxProducts', val)}
              />

              <EditorRangeField
                label="Abstand Oben/Unten"
                value={design.paddingY}
                defaultValue={24}
                min={0}
                max={80}
                onChange={(val) => updateDesign('paddingY', val)}
              />

              <EditorToggleRow
                label="Seitenbanner aktiv"
                checked={resolved.showBanner}
                onChange={(next) => updateField('showBanner', next)}
              />

              {resolved.showBanner && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                      Banner Position
                    </span>
                    <div className="grid grid-cols-2 gap-1">
                      {(['left', 'right'] as const).map((pos) => (
                        <button
                          key={pos}
                          type="button"
                          onClick={() => updateField('bannerPosition', pos)}
                          className={`py-1 text-[10px] font-bold rounded border cursor-pointer ${
                            resolved.bannerPosition === pos
                              ? 'bg-[#107b46] text-white border-[#107b46]'
                              : 'bg-white text-stone-600 border-gray-200'
                          }`}
                        >
                          {pos === 'left' ? 'Links' : 'Rechts'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                      Banner Breite
                    </span>
                    <div className="grid grid-cols-2 gap-1">
                      {(['3', '4'] as const).map((w) => (
                        <button
                          key={w}
                          type="button"
                          onClick={() => updateDesign('bannerWidth', w)}
                          className={`py-1 text-[10px] font-bold rounded border cursor-pointer ${
                            (design.bannerWidth || '3') === w
                              ? 'bg-[#107b46] text-white border-[#107b46]'
                              : 'bg-white text-stone-600 border-gray-200'
                          }`}
                        >
                          {w}/12
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2 border-b border-gray-200 pb-3">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Farben &amp; Typografie
              </p>

              <EditorColorField
                label="Akzentfarbe"
                value={design.accentColor}
                defaultValue="#107b46"
                onChange={(val) => updateDesign('accentColor', val)}
              />
              <EditorColorField
                label="Aktionsfarbe (Rabatt)"
                value={design.saleColor}
                defaultValue="#dc2626"
                onChange={(val) => updateDesign('saleColor', val)}
              />
              <EditorColorField
                label="Titel-Farbe"
                value={design.titleColor}
                defaultValue="#1c1917"
                onChange={(val) => updateDesign('titleColor', val)}
              />
              <EditorRangeField
                label="Titel-Schriftgröße"
                value={design.titleSize}
                defaultValue={22}
                min={16}
                max={36}
                onChange={(val) => updateDesign('titleSize', val)}
              />
              <EditorColorField
                label="Sektions-Hintergrund"
                value={design.sectionBg}
                defaultValue="#ffffff"
                onChange={(val) => updateDesign('sectionBg', val)}
              />
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Karten &amp; Banner
              </p>

              <EditorRangeField
                label="Eckenradius Karten"
                value={design.cardRadius}
                defaultValue={16}
                min={0}
                max={28}
                onChange={(val) => updateDesign('cardRadius', val)}
              />
              <EditorColorField
                label="Karten-Rahmenfarbe"
                value={design.cardBorderColor}
                defaultValue="#e7e5e4"
                onChange={(val) => updateDesign('cardBorderColor', val)}
              />
              <EditorColorField
                label="Button Hintergrund"
                value={design.buttonBgColor}
                defaultValue="#ffffff"
                onChange={(val) => updateDesign('buttonBgColor', val)}
              />
              <EditorColorField
                label="Button Textfarbe"
                value={design.buttonTextColor}
                defaultValue="#374151"
                onChange={(val) => updateDesign('buttonTextColor', val)}
              />
              {resolved.showBanner && (
                <EditorRangeField
                  label="Banner Abdunklung"
                  value={design.bannerOverlayOpacity}
                  defaultValue={72}
                  min={15}
                  max={95}
                  unit="%"
                  onChange={(val) => updateDesign('bannerOverlayOpacity', val)}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

