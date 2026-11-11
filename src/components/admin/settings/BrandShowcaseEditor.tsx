'use client';

import React, { useState } from 'react';
import {
  BrandShowcaseItem,
  CatalogBrandSummary,
  DEFAULT_BRAND_SERVICE_PERKS,
  DEFAULT_BRAND_SHOWCASE_ITEMS,
  DEFAULT_BRAND_SHOWCASE_SETTINGS,
  SectionConfig,
  ServicePerkIconKey,
  ServicePerkItem,
  resolveBrandShowcaseConfig,
} from '@/components/home/categorySectionData';
import { EditorModeTabs, ImageFramePicker } from './ImageFramePicker';
import { EditorColorField, EditorRangeField, EditorToggleRow } from './EditorControls';

let brandItemCounter = 1;
let perkItemCounter = 1;

const PERK_ICON_OPTIONS: Array<{ value: ServicePerkIconKey; label: string }> = [
  { value: 'trash', label: 'Entsorgung' },
  { value: 'wrench', label: 'Montage & Service' },
  { value: 'shield', label: 'Garantie' },
  { value: 'card', label: 'Zahlung / Raten' },
  { value: 'truck', label: 'Lieferung' },
  { value: 'sparkles', label: 'Qualität' },
];

interface BrandShowcaseEditorProps {
  section: SectionConfig;
  updateSectionSettings: (
    id: string,
    keyOrUpdates: string | Record<string, unknown>,
    value?: unknown
  ) => void;
  handleUpload: (id: string, key: string) => void;
  brands?: CatalogBrandSummary[];
}

export default function BrandShowcaseEditor({
  section,
  updateSectionSettings,
  handleUpload,
  brands: catalogBrands = [],
}: BrandShowcaseEditorProps) {
  const [modeTab, setModeTab] = useState<'content' | 'design'>('content');
  const [contentSubTab, setContentSubTab] = useState<'header' | 'brands' | 'perks'>('brands');
  const [activeBrandIdx, setActiveBrandIdx] = useState<number>(0);
  const [activePerkIdx, setActivePerkIdx] = useState<number>(0);

  const settings = section.settings || {};
  const design = settings.design || {};
  const resolved = resolveBrandShowcaseConfig(settings, catalogBrands);

  const sourceMode: 'AUTO' | 'MANUAL' = resolved.sourceMode;
  const maxBrands = resolved.maxBrands;

  const manualBrands: BrandShowcaseItem[] =
    Array.isArray(settings.brands) && settings.brands.length > 0
      ? settings.brands
      : DEFAULT_BRAND_SHOWCASE_ITEMS.slice(0, 12);

  const displayBrands = sourceMode === 'AUTO' ? resolved.brands : manualBrands;
  const safeBrandIdx = Math.min(activeBrandIdx, Math.max(0, displayBrands.length - 1));
  const activeBrand = displayBrands[safeBrandIdx];

  const perks: ServicePerkItem[] =
    Array.isArray(settings.servicePerks) && settings.servicePerks.length > 0
      ? settings.servicePerks
      : DEFAULT_BRAND_SERVICE_PERKS;
  const safePerkIdx = Math.min(activePerkIdx, Math.max(0, perks.length - 1));
  const activePerk = perks[safePerkIdx];

  const updateField = (key: string, val: unknown) => {
    updateSectionSettings(section.id, key, val);
  };

  const updateDesign = (key: string, val: unknown) => {
    updateSectionSettings(section.id, 'design', { ...design, [key]: val });
  };

  const updateManualBrand = (
    index: number,
    fieldOrUpdates: string | Record<string, unknown>,
    val?: unknown
  ) => {
    const next = manualBrands.map((b, i) => {
      if (i !== index) return { ...b };
      if (typeof fieldOrUpdates === 'string') {
        return { ...b, [fieldOrUpdates]: val };
      }
      return { ...b, ...fieldOrUpdates };
    });
    updateSectionSettings(section.id, 'brands', next);
  };

  const switchToManualFromCatalog = () => {
    updateSectionSettings(section.id, {
      sourceMode: 'MANUAL',
      brands: resolved.brands.map((b) => ({
        id: b.id,
        name: b.name,
        slug: b.slug,
        slogan: b.slogan || '',
        logo: b.logo || '',
        linkUrl: b.linkUrl || `/shop?brand=${encodeURIComponent(b.slug)}`,
      })),
    });
  };

  const addManualBrand = () => {
    const next = [
      ...manualBrands,
      {
        id: `br-custom-${brandItemCounter++}`,
        name: 'Neue Marke',
        slug: 'neue-marke',
        slogan: 'Geprüfte Markenqualität',
        logo: '',
        linkUrl: '/shop',
      },
    ];
    updateSectionSettings(section.id, { sourceMode: 'MANUAL', brands: next });
    setActiveBrandIdx(next.length - 1);
  };

  const removeManualBrand = (index: number) => {
    if (manualBrands.length <= 1) return;
    const next = manualBrands.filter((_, i) => i !== index);
    updateSectionSettings(section.id, 'brands', next);
    setActiveBrandIdx(Math.max(0, index - 1));
  };

  const clearAutoLogoOverride = (slug: string) => {
    const nextOverrides = { ...(settings.brandLogoOverrides || {}) };
    delete nextOverrides[slug];
    updateSectionSettings(section.id, 'brandLogoOverrides', nextOverrides);
  };

  const updatePerkField = (index: number, field: keyof ServicePerkItem, val: string) => {
    const next = perks.map((p, i) => (i === index ? { ...p, [field]: val } : { ...p }));
    updateSectionSettings(section.id, 'servicePerks', next);
  };

  const addPerk = () => {
    const next: ServicePerkItem[] = [
      ...perks,
      {
        id: `perk-custom-${perkItemCounter++}`,
        iconKey: 'shield',
        title: 'Neuer Service-Vorteil',
        desc: 'Kurze Beschreibung Ihres Kundenservices.',
      },
    ];
    updateSectionSettings(section.id, 'servicePerks', next);
    setActivePerkIdx(next.length - 1);
  };

  const removePerk = (index: number) => {
    if (perks.length <= 1) return;
    const next = perks.filter((_, i) => i !== index);
    updateSectionSettings(section.id, 'servicePerks', next);
    setActivePerkIdx(Math.max(0, index - 1));
  };

  return (
    <div className="flex flex-col h-full bg-white text-stone-800 -mx-3 -mt-3">
      {/* Header & Sub-Tabs */}
      <div className="px-3.5 pt-3 pb-2.5 bg-gray-50/90 space-y-2">
        <h2 className="font-extrabold text-gray-900 text-xs">
          {resolved.eyebrow || 'Geprüfte Markenqualität'}
        </h2>

        {modeTab === 'content' && (
          <div className="grid grid-cols-3 gap-1">
            {(
              [
                { id: 'brands', label: `Marken (${displayBrands.length})` },
                { id: 'header', label: 'Kopfzeile' },
                { id: 'perks', label: `Vorteile (${perks.length})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setContentSubTab(tab.id)}
                className={`py-1.5 px-1.5 text-[10px] font-bold rounded-md border transition-all cursor-pointer truncate ${
                  contentSubTab === tab.id
                    ? 'bg-[#107b46] text-white border-[#107b46]'
                    : 'bg-white text-stone-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Single Icon-Only Content / Design Tab Bar */}
      <EditorModeTabs mode={modeTab} onChange={setModeTab} />

      <div className="p-3.5 space-y-4 overflow-y-auto max-h-[calc(100vh-220px)]">
        {/* ============================================================ */}
        {/* CONTENT TAB — HEADER                                         */}
        {/* ============================================================ */}
        {modeTab === 'content' && contentSubTab === 'header' && (
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                Dachzeile (Eyebrow)
              </label>
              <input
                type="text"
                value={resolved.eyebrow}
                onChange={(e) => updateField('eyebrow', e.target.value)}
                placeholder={DEFAULT_BRAND_SHOWCASE_SETTINGS.eyebrow}
                className="w-full text-xs p-2 border border-gray-300 rounded-md focus:border-[#107b46] outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                Überschrift
              </label>
              <input
                type="text"
                value={resolved.title}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full text-xs p-2 border border-gray-300 rounded-md focus:border-[#107b46] outline-none font-semibold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                Beschreibung
              </label>
              <textarea
                rows={3}
                value={resolved.description}
                onChange={(e) => updateField('description', e.target.value)}
                className="w-full text-xs p-2 border border-gray-300 rounded-md focus:border-[#107b46] outline-none"
              />
            </div>

            <EditorRangeField
              label="Max. Anzahl Marken"
              value={maxBrands}
              defaultValue={12}
              min={4}
              max={24}
              unit=""
              onChange={(val) => updateField('maxBrands', val)}
            />
          </div>
        )}

        {/* ============================================================ */}
        {/* CONTENT TAB — BRANDS & LOGOS                                 */}
        {/* ============================================================ */}
        {modeTab === 'content' && contentSubTab === 'brands' && (
          <div className="space-y-3">
            {/* Source mode toggle */}
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => updateField('sourceMode', 'AUTO')}
                className={`py-1.5 px-2 text-[11px] font-bold rounded-md border transition-all cursor-pointer ${
                  sourceMode === 'AUTO'
                    ? 'bg-[#107b46] text-white border-[#107b46]'
                    : 'bg-white text-stone-600 border-gray-200'
                }`}
              >
                Katalog (Auto)
              </button>
              <button
                type="button"
                onClick={() => updateField('sourceMode', 'MANUAL')}
                className={`py-1.5 px-2 text-[11px] font-bold rounded-md border transition-all cursor-pointer ${
                  sourceMode === 'MANUAL'
                    ? 'bg-[#107b46] text-white border-[#107b46]'
                    : 'bg-white text-stone-600 border-gray-200'
                }`}
              >
                Manuell ({manualBrands.length})
              </button>
            </div>

            {sourceMode === 'AUTO' ? (
              <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-lg space-y-2 text-[11px] text-emerald-900">
                <p className="leading-snug">
                  Marken mit aktiven Produkten werden automatisch nach Artikelanzahl verlinkt (
                  <code className="font-mono">/shop?brand=...</code>).
                </p>
                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={switchToManualFromCatalog}
                    className="text-[10px] font-bold text-[#107b46] hover:underline cursor-pointer"
                  >
                    Reihenfolge manuell bearbeiten &rarr;
                  </button>
                  <a
                    href="/admin/brands"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] font-bold text-stone-700 hover:underline"
                  >
                    Marken verwalten
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={switchToManualFromCatalog}
                  className="text-[10px] font-bold text-stone-600 hover:text-[#107b46] hover:underline cursor-pointer"
                >
                  Aus Katalog laden
                </button>
                <button
                  type="button"
                  onClick={addManualBrand}
                  className="text-[11px] font-bold text-[#107b46] hover:underline cursor-pointer"
                >
                  + Marke hinzufügen
                </button>
              </div>
            )}

            {/* Brand Selector Pills */}
            <div className="flex flex-wrap gap-1.5">
              {displayBrands.map((b, idx) => (
                <button
                  key={b.id || b.slug || idx}
                  type="button"
                  onClick={() => setActiveBrandIdx(idx)}
                  className={`px-2 py-1 text-[11px] font-bold rounded-md border transition-all cursor-pointer truncate max-w-[125px] ${
                    safeBrandIdx === idx
                      ? 'bg-[#107b46] text-white border-[#107b46]'
                      : 'bg-white text-stone-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {idx + 1}. {b.name}
                </button>
              ))}
            </div>

            {/* Active Brand Editor */}
            {activeBrand && (
              <div className="space-y-3 border-t border-gray-200 pt-3">
                {sourceMode === 'MANUAL' && catalogBrands.length > 0 && (
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                      Marke aus Katalog übernehmen
                    </label>
                    <select
                      value=""
                      onChange={(e) => {
                        const selected = catalogBrands.find((cb) => cb.slug === e.target.value);
                        if (selected) {
                          updateManualBrand(safeBrandIdx, {
                            name: selected.name,
                            slug: selected.slug,
                            linkUrl: `/shop?brand=${encodeURIComponent(selected.slug)}`,
                            logo: selected.logo || '',
                          });
                        }
                      }}
                      className="w-full text-xs p-2 border border-gray-300 rounded-md bg-white"
                    >
                      <option value="">-- Marke wählen --</option>
                      {catalogBrands.map((cb) => (
                        <option key={cb.id} value={cb.slug}>
                          {cb.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <ImageFramePicker
                  label={`Marken-Logo (${activeBrand.name})`}
                  imageUrl={
                    sourceMode === 'AUTO'
                      ? settings.brandLogoOverrides?.[activeBrand.slug] ?? activeBrand.logo
                      : activeBrand.logo
                  }
                  onSelectClick={() =>
                    handleUpload(
                      section.id,
                      sourceMode === 'AUTO'
                        ? `brand_override_${activeBrand.slug}`
                        : `brand_logo_${safeBrandIdx}`
                    )
                  }
                  onClearClick={() =>
                    sourceMode === 'AUTO'
                      ? clearAutoLogoOverride(activeBrand.slug)
                      : updateManualBrand(safeBrandIdx, 'logo', '')
                  }
                  objectFit="contain"
                  heightClass="h-24"
                />
                <p className="text-[10px] text-stone-500 leading-snug">
                  Ohne eigenes Bild wird das Logo aus <code className="font-mono">/admin/brands</code> oder das integrierte Vektor-Logo verwendet.
                </p>

                {sourceMode === 'MANUAL' && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                          Markenname
                        </label>
                        <input
                          type="text"
                          value={activeBrand.name}
                          onChange={(e) => updateManualBrand(safeBrandIdx, 'name', e.target.value)}
                          className="w-full text-xs p-2 border border-gray-300 rounded-md font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                          Slug
                        </label>
                        <input
                          type="text"
                          value={activeBrand.slug}
                          onChange={(e) => {
                            const nextSlug = e.target.value;
                            updateManualBrand(safeBrandIdx, {
                              slug: nextSlug,
                              linkUrl: `/shop?brand=${encodeURIComponent(nextSlug)}`,
                            });
                          }}
                          className="w-full text-xs p-2 border border-gray-300 rounded-md font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                        Slogan (optional)
                      </label>
                      <input
                        type="text"
                        value={activeBrand.slogan || ''}
                        onChange={(e) => updateManualBrand(safeBrandIdx, 'slogan', e.target.value)}
                        className="w-full text-xs p-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                        Ziel-Link
                      </label>
                      <input
                        type="text"
                        value={
                          activeBrand.linkUrl ||
                          `/shop?brand=${encodeURIComponent(activeBrand.slug)}`
                        }
                        onChange={(e) => updateManualBrand(safeBrandIdx, 'linkUrl', e.target.value)}
                        className="w-full text-xs p-2 border border-gray-300 rounded-md font-mono"
                      />
                    </div>

                    {manualBrands.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeManualBrand(safeBrandIdx)}
                        className="w-full py-1.5 text-[11px] font-bold text-red-600 hover:bg-red-50 border border-red-200 rounded-lg cursor-pointer"
                      >
                        Diese Marke entfernen
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* CONTENT TAB — HLG VORTEIL PERKS                              */}
        {/* ============================================================ */}
        {modeTab === 'content' && contentSubTab === 'perks' && (
          <div className="space-y-3">
            <EditorToggleRow
              label="HLG Vorteil-Banner"
              description="Service-Leistungen unter den Marken anzeigen"
              checked={design.showServiceBanner !== false}
              onChange={(val) => updateDesign('showServiceBanner', val)}
            />

            <div>
              <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                Vorteil-Dachzeile
              </label>
              <input
                type="text"
                value={resolved.serviceEyebrow}
                onChange={(e) => updateField('serviceEyebrow', e.target.value)}
                className="w-full text-xs p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                Vorteil-Überschrift
              </label>
              <input
                type="text"
                value={resolved.serviceTitle}
                onChange={(e) => updateField('serviceTitle', e.target.value)}
                className="w-full text-xs p-2 border border-gray-300 rounded-md font-semibold"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <span className="text-[11px] font-bold text-gray-600 uppercase">Service-Karten</span>
              <button
                type="button"
                onClick={addPerk}
                className="text-[11px] font-bold text-[#107b46] hover:underline cursor-pointer"
              >
                + Vorteil hinzufügen
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {perks.map((p, idx) => (
                <button
                  key={p.id || idx}
                  type="button"
                  onClick={() => setActivePerkIdx(idx)}
                  className={`px-2 py-1 text-[11px] font-bold rounded-md border transition-all cursor-pointer truncate max-w-[125px] ${
                    safePerkIdx === idx
                      ? 'bg-[#107b46] text-white border-[#107b46]'
                      : 'bg-white text-stone-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {idx + 1}. {p.title}
                </button>
              ))}
            </div>

            {activePerk && (
              <div className="space-y-2.5 border-t border-gray-200 pt-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                    Symbol
                  </label>
                  <select
                    value={activePerk.iconKey}
                    onChange={(e) =>
                      updatePerkField(safePerkIdx, 'iconKey', e.target.value)
                    }
                    className="w-full text-xs p-2 border border-gray-300 rounded-md bg-white"
                  >
                    {PERK_ICON_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                    Titel
                  </label>
                  <input
                    type="text"
                    value={activePerk.title}
                    onChange={(e) => updatePerkField(safePerkIdx, 'title', e.target.value)}
                    className="w-full text-xs p-2 border border-gray-300 rounded-md font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                    Beschreibung
                  </label>
                  <textarea
                    rows={2}
                    value={activePerk.desc}
                    onChange={(e) => updatePerkField(safePerkIdx, 'desc', e.target.value)}
                    className="w-full text-xs p-2 border border-gray-300 rounded-md"
                  />
                </div>

                {perks.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePerk(safePerkIdx)}
                    className="w-full py-1.5 text-[11px] font-bold text-red-600 hover:bg-red-50 border border-red-200 rounded-lg cursor-pointer"
                  >
                    Diesen Vorteil entfernen
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
                Raster &amp; Darstellung
              </p>

              <div className="space-y-1">
                <span className="text-xs font-medium text-gray-700 block">Spalten (Desktop)</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['4', '5', '6'] as const).map((cols) => (
                    <button
                      key={cols}
                      type="button"
                      onClick={() => updateDesign('colsDesktop', cols)}
                      className={`py-1.5 text-xs font-bold rounded-md border cursor-pointer ${
                        String(design.colsDesktop || '6') === cols
                          ? 'bg-[#107b46] text-white border-[#107b46]'
                          : 'bg-white text-stone-600 border-gray-200'
                      }`}
                    >
                      {cols} Spalten
                    </button>
                  ))}
                </div>
              </div>

              <EditorRangeField
                label="Logo-Höhe"
                value={design.logoHeight}
                defaultValue={38}
                min={24}
                max={56}
                onChange={(val) => updateDesign('logoHeight', val)}
              />

              <EditorToggleRow
                label="Produktanzahl anzeigen"
                checked={design.showProductCount !== false}
                onChange={(val) => updateDesign('showProductCount', val)}
              />

              <EditorToggleRow
                label="Slogan unter Logo anzeigen"
                checked={design.showSlogan === true}
                onChange={(val) => updateDesign('showSlogan', val)}
              />

              <EditorToggleRow
                label="HLG Vorteil-Banner anzeigen"
                checked={design.showServiceBanner !== false}
                onChange={(val) => updateDesign('showServiceBanner', val)}
              />
            </div>

            <div className="space-y-2 border-b border-gray-200 pb-3">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Abstände &amp; Radien
              </p>
              <EditorRangeField
                label="Abstand Oben/Unten"
                value={design.paddingY}
                defaultValue={56}
                min={16}
                max={96}
                onChange={(val) => updateDesign('paddingY', val)}
              />
              <EditorRangeField
                label="Karten Eckenradius"
                value={design.cardRadius}
                defaultValue={16}
                min={0}
                max={28}
                onChange={(val) => updateDesign('cardRadius', val)}
              />
              <EditorRangeField
                label="Titel-Schriftgröße"
                value={design.titleSize}
                defaultValue={30}
                min={18}
                max={42}
                onChange={(val) => updateDesign('titleSize', val)}
              />
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Farben
              </p>
              <EditorColorField
                label="Akzentfarbe"
                value={design.accentColor}
                defaultValue="#107b46"
                onChange={(val) => updateDesign('accentColor', val)}
              />
              <EditorColorField
                label="Titel-Farbe"
                value={design.titleColor}
                defaultValue="#1c1917"
                onChange={(val) => updateDesign('titleColor', val)}
              />
              <EditorColorField
                label="Sektions-Hintergrund"
                value={design.sectionBg}
                defaultValue="#ffffff"
                onChange={(val) => updateDesign('sectionBg', val)}
              />
              <EditorColorField
                label="Karten Hintergrund"
                value={design.cardBgColor}
                defaultValue="#ffffff"
                onChange={(val) => updateDesign('cardBgColor', val)}
              />
              <EditorColorField
                label="Karten Rahmen"
                value={design.cardBorderColor}
                defaultValue="#e7e5e4"
                onChange={(val) => updateDesign('cardBorderColor', val)}
              />
              <EditorColorField
                label="Vorteil-Banner Hintergrund"
                value={design.bannerBgColor}
                defaultValue="#fafaf9"
                onChange={(val) => updateDesign('bannerBgColor', val)}
              />
              <EditorColorField
                label="Vorteil-Banner Rahmen"
                value={design.bannerBorderColor}
                defaultValue="#e7e5e4"
                onChange={(val) => updateDesign('bannerBorderColor', val)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

