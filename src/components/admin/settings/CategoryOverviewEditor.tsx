'use client';

import React, { useState } from 'react';
import {
  AdminCategoryOption,
  DEFAULT_CATEGORY_OVERVIEW_SETTINGS,
  DEFAULT_OVERVIEW_CARDS,
  OverviewCardItem,
  SectionConfig,
} from '@/components/home/categorySectionData';
import { EditorModeTabs, ImageFramePicker } from './ImageFramePicker';
import { EditorColorField, EditorRangeField } from './EditorControls';

let overviewCardCounter = 1;

interface CategoryOverviewEditorProps {
  section: SectionConfig;
  updateSectionSettings: (
    id: string,
    keyOrUpdates: string | Record<string, unknown>,
    value?: unknown
  ) => void;
  handleUpload: (id: string, key: string) => void;
  categories?: AdminCategoryOption[];
}

export default function CategoryOverviewEditor({
  section,
  updateSectionSettings,
  handleUpload,
  categories = [],
}: CategoryOverviewEditorProps) {
  const [modeTab, setModeTab] = useState<'content' | 'design'>('content');
  const [contentSubTab, setContentSubTab] = useState<'header' | 'cards'>('header');
  const [activeCardIdx, setActiveCardIdx] = useState<number>(0);

  const settings = section.settings || {};
  const design = settings.design || {};

  const eyebrow =
    settings.eyebrow !== undefined ? settings.eyebrow : DEFAULT_CATEGORY_OVERVIEW_SETTINGS.eyebrow;
  const title =
    settings.title !== undefined ? settings.title : DEFAULT_CATEGORY_OVERVIEW_SETTINGS.title;
  const description =
    settings.description !== undefined
      ? settings.description
      : DEFAULT_CATEGORY_OVERVIEW_SETTINGS.description;
  const ctaText =
    settings.ctaText !== undefined ? settings.ctaText : DEFAULT_CATEGORY_OVERVIEW_SETTINGS.ctaText;
  const ctaUrl =
    settings.ctaUrl !== undefined ? settings.ctaUrl : DEFAULT_CATEGORY_OVERVIEW_SETTINGS.ctaUrl;

  const cards: OverviewCardItem[] =
    Array.isArray(settings.cards) && settings.cards.length > 0
      ? settings.cards
      : DEFAULT_OVERVIEW_CARDS;

  const safeIdx = Math.min(activeCardIdx, Math.max(0, cards.length - 1));
  const activeCard = cards[safeIdx];

  const updateField = (key: string, val: unknown) => {
    updateSectionSettings(section.id, key, val);
  };

  const updateDesign = (key: string, val: unknown) => {
    updateSectionSettings(section.id, 'design', { ...design, [key]: val });
  };

  const updateCardField = (index: number, fieldOrUpdates: string | Record<string, unknown>, val?: unknown) => {
    const next = cards.map((card, i) => {
      if (i !== index) return { ...card };
      if (typeof fieldOrUpdates === 'string') {
        return { ...card, [fieldOrUpdates]: val };
      }
      return { ...card, ...fieldOrUpdates };
    });
    updateSectionSettings(section.id, 'cards', next);
  };

  const addCard = () => {
    const next = [
      ...cards,
      {
        id: `ov-${overviewCardCounter++}`,
        title: 'Neue Kategorie',
        subtitle: 'Ausgewählte Markenqualität',
        priceLabel: 'Ab 199,00 €',
        emoji: '✨',
        image: '',
        ctaText: 'Modelle ansehen',
        linkUrl: '/shop',
      },
    ];
    updateSectionSettings(section.id, 'cards', next);
    setActiveCardIdx(next.length - 1);
  };

  const removeCard = (index: number) => {
    if (cards.length <= 1) return;
    const next = cards.filter((_, i) => i !== index);
    updateSectionSettings(section.id, 'cards', next);
    setActiveCardIdx(Math.max(0, index - 1));
  };

  return (
    <div className="flex flex-col h-full bg-white text-stone-800 -mx-3 -mt-3">
      {/* Header */}
      <div className="px-3.5 pt-3 pb-2.5 bg-gray-50/90 space-y-2">
        <h2 className="font-extrabold text-gray-900 text-xs">{eyebrow || 'Sortiment im Überblick'}</h2>

        {modeTab === 'content' && (
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => setContentSubTab('header')}
              className={`py-1.5 px-2 text-[11px] font-bold rounded-md border transition-all cursor-pointer ${
                contentSubTab === 'header'
                  ? 'bg-[#107b46] text-white border-[#107b46]'
                  : 'bg-white text-stone-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              Kopfzeile &amp; CTA
            </button>
            <button
              type="button"
              onClick={() => setContentSubTab('cards')}
              className={`py-1.5 px-2 text-[11px] font-bold rounded-md border transition-all cursor-pointer ${
                contentSubTab === 'cards'
                  ? 'bg-[#107b46] text-white border-[#107b46]'
                  : 'bg-white text-stone-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              Karten ({cards.length})
            </button>
          </div>
        )}
      </div>

      {/* Single Icon-Only Content / Design Tab Bar */}
      <EditorModeTabs mode={modeTab} onChange={setModeTab} />

      <div className="p-3.5 space-y-4 overflow-y-auto max-h-[calc(100vh-220px)]">
        {/* ============================================================ */}
        {/* CONTENT TAB — HEADER & CTA                                   */}
        {/* ============================================================ */}
        {modeTab === 'content' && contentSubTab === 'header' && (
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                Dachzeile (Eyebrow)
              </label>
              <input
                type="text"
                value={eyebrow}
                onChange={(e) => updateField('eyebrow', e.target.value)}
                className="w-full text-xs p-2 border border-gray-300 rounded-md focus:border-[#107b46] outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                Überschrift
              </label>
              <input
                type="text"
                value={title}
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
                value={description}
                onChange={(e) => updateField('description', e.target.value)}
                className="w-full text-xs p-2 border border-gray-300 rounded-md focus:border-[#107b46] outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                  Button-Text
                </label>
                <input
                  type="text"
                  value={ctaText}
                  onChange={(e) => updateField('ctaText', e.target.value)}
                  className="w-full text-xs p-2 border border-gray-300 rounded-md focus:border-[#107b46] outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                  Ziel-URL
                </label>
                <input
                  type="text"
                  value={ctaUrl}
                  onChange={(e) => updateField('ctaUrl', e.target.value)}
                  className="w-full text-xs p-2 border border-gray-300 rounded-md focus:border-[#107b46] outline-none font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* CONTENT TAB — CARDS                                          */}
        {/* ============================================================ */}
        {modeTab === 'content' && contentSubTab === 'cards' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-600 uppercase">
                Karten-Auswahl
              </span>
              <button
                type="button"
                onClick={addCard}
                className="text-[11px] font-bold text-[#107b46] hover:underline cursor-pointer"
              >
                + Karte hinzufügen
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {cards.map((c, idx) => (
                <button
                  key={c.id || idx}
                  type="button"
                  onClick={() => setActiveCardIdx(idx)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-md border transition-all cursor-pointer truncate max-w-[120px] ${
                    safeIdx === idx
                      ? 'bg-[#107b46] text-white border-[#107b46]'
                      : 'bg-white text-stone-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {idx + 1}. {c.title}
                </button>
              ))}
            </div>

            {activeCard && (
              <div className="space-y-3 border-t border-gray-200 pt-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                    Kategorie aus Katalog übernehmen
                  </label>
                  <select
                    value=""
                    onChange={(e) => {
                      const cat = categories.find((c) => c.slug === e.target.value);
                      if (cat) {
                        updateCardField(safeIdx, {
                          title: cat.name,
                          linkUrl: `/shop?category=${cat.slug}`,
                        });
                      }
                    }}
                    className="w-full text-xs p-2 border border-gray-300 rounded-md bg-white"
                  >
                    <option value="">-- Kategorie wählen --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.displayName || c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <ImageFramePicker
                  label="Kategorie-Bild"
                  imageUrl={activeCard.image}
                  onSelectClick={() => handleUpload(section.id, `overview_card_${safeIdx}`)}
                  onClearClick={() => updateCardField(safeIdx, 'image', '')}
                  objectFit="contain"
                  heightClass="h-24"
                />

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                      Emoji / Icon
                    </label>
                    <input
                      type="text"
                      value={activeCard.emoji || ''}
                      onChange={(e) => updateCardField(safeIdx, 'emoji', e.target.value)}
                      className="w-full text-xs p-2 border border-gray-300 rounded-md text-center"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                      Preis-Hinweis
                    </label>
                    <input
                      type="text"
                      value={activeCard.priceLabel}
                      onChange={(e) => updateCardField(safeIdx, 'priceLabel', e.target.value)}
                      placeholder="Ab 199,00 €"
                      className="w-full text-xs p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                    Kartentitel
                  </label>
                  <input
                    type="text"
                    value={activeCard.title}
                    onChange={(e) => updateCardField(safeIdx, 'title', e.target.value)}
                    className="w-full text-xs p-2 border border-gray-300 rounded-md font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                    Untertitel
                  </label>
                  <input
                    type="text"
                    value={activeCard.subtitle}
                    onChange={(e) => updateCardField(safeIdx, 'subtitle', e.target.value)}
                    className="w-full text-xs p-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                      CTA-Text
                    </label>
                    <input
                      type="text"
                      value={activeCard.ctaText}
                      onChange={(e) => updateCardField(safeIdx, 'ctaText', e.target.value)}
                      className="w-full text-xs p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                      Ziel-Link
                    </label>
                    <input
                      type="text"
                      value={activeCard.linkUrl}
                      onChange={(e) => updateCardField(safeIdx, 'linkUrl', e.target.value)}
                      className="w-full text-xs p-2 border border-gray-300 rounded-md font-mono"
                    />
                  </div>
                </div>

                {cards.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCard(safeIdx)}
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
                Raster &amp; Container
              </p>

              <div className="space-y-1">
                <span className="text-xs font-medium text-gray-700 block">Spalten (Desktop)</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['2', '3', '4'] as const).map((cols) => (
                    <button
                      key={cols}
                      type="button"
                      onClick={() => updateDesign('colsDesktop', cols)}
                      className={`py-1.5 text-xs font-bold rounded-md border cursor-pointer ${
                        (design.colsDesktop || settings.colsDesktop || '4') === cols
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
                label="Abstand Oben/Unten"
                value={design.paddingY}
                defaultValue={28}
                min={0}
                max={80}
                onChange={(val) => updateDesign('paddingY', val)}
              />
              <EditorRangeField
                label="Container Eckenradius"
                value={design.containerRadius}
                defaultValue={24}
                min={0}
                max={36}
                onChange={(val) => updateDesign('containerRadius', val)}
              />
              <EditorRangeField
                label="Karten Eckenradius"
                value={design.cardRadius}
                defaultValue={16}
                min={0}
                max={28}
                onChange={(val) => updateDesign('cardRadius', val)}
              />
            </div>

            <div className="space-y-2">
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
                label="Titel-Farbe"
                value={design.titleColor}
                defaultValue="#1c1917"
                onChange={(val) => updateDesign('titleColor', val)}
              />
              <EditorRangeField
                label="Titel-Schriftgröße"
                value={design.titleSize}
                defaultValue={24}
                min={16}
                max={36}
                onChange={(val) => updateDesign('titleSize', val)}
              />
              <EditorColorField
                label="Verlauf Startfarbe"
                value={design.containerBgFrom}
                defaultValue="#fafaf9"
                onChange={(val) => updateDesign('containerBgFrom', val)}
              />
              <EditorColorField
                label="Verlauf Endfarbe"
                value={design.containerBgTo}
                defaultValue="#ecfdf5"
                onChange={(val) => updateDesign('containerBgTo', val)}
              />
              <EditorColorField
                label="Container Rahmen"
                value={design.containerBorderColor}
                defaultValue="#e7e5e4"
                onChange={(val) => updateDesign('containerBorderColor', val)}
              />
              <EditorColorField
                label="Karten Hintergrund"
                value={design.cardBgColor}
                defaultValue="#ffffff"
                onChange={(val) => updateDesign('cardBgColor', val)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

