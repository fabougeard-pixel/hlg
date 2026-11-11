'use client';

import { useState, useEffect } from 'react';
import { SectionConfig } from '@/app/admin/(dashboard)/landing/LandingForm';
import { ImageFramePicker, EditorModeTabs } from './ImageFramePicker';

interface HeroSectionEditorProps {
  section: SectionConfig;
  previewMode: 'desktop' | 'tablet' | 'mobile';
  updateSectionSettings: (id: string, keyOrUpdates: string | Record<string, any>, value?: any) => void;
  handleUpload: (id: string, key: string) => void;
  editingBlockNum?: number;
}

function normalizeHexForPicker(val: string, fallback: string): string {
  const clean = val.trim();
  if (/^#[0-9a-f]{6}$/i.test(clean)) return clean.toLowerCase();
  if (/^#[0-9a-f]{3}$/i.test(clean)) {
    const [, r, g, b] = clean;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return /^#[0-9a-f]{6}$/i.test(fallback) ? fallback.toLowerCase() : '#000000';
}

function ColorField({
  label,
  value,
  defaultValue,
  onChange,
}: {
  label: string;
  value?: string;
  defaultValue: string;
  onChange: (val: string) => void;
}) {
  const [hexDraft, setHexDraft] = useState<string | null>(null);
  const current = typeof value === 'string' && value.trim() ? value.trim() : defaultValue;
  const displayHex = hexDraft ?? current;

  return (
    <div className="flex items-center justify-between gap-2 py-1">
      <span className="text-xs font-medium text-gray-700">{label}</span>
      <div className="flex items-center gap-1.5">
        <input
          type="text"
          value={displayHex}
          onFocus={() => setHexDraft(current)}
          onChange={(e) => {
            const next = e.target.value;
            setHexDraft(next);
            const trimmed = next.trim();
            if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(trimmed)) {
              onChange(trimmed);
            }
          }}
          onBlur={() => {
            const trimmed = (hexDraft ?? '').trim();
            if (trimmed.length > 0) {
              onChange(trimmed);
            }
            setHexDraft(null);
          }}
          aria-label={`${label} Hex`}
          className="w-[68px] text-[10px] font-mono text-gray-600 uppercase px-1.5 py-1 border border-gray-200 rounded bg-white focus:border-[#107b46] focus:outline-none"
        />
        <div className="relative w-8 h-7 rounded-md overflow-hidden border border-gray-300 shadow-2xs cursor-pointer shrink-0">
          <input
            type="color"
            value={normalizeHexForPicker(current, defaultValue)}
            onChange={(e) => {
              setHexDraft(null);
              onChange(e.target.value);
            }}
            className="absolute -top-2 -left-2 w-14 h-14 cursor-pointer border-0 p-0"
          />
        </div>
      </div>
    </div>
  );
}

function RangeNumberField({
  label,
  value,
  defaultValue,
  min,
  max,
  unit = 'px',
  onChange,
}: {
  label: string;
  value?: number | string;
  defaultValue: number;
  min: number;
  max: number;
  unit?: string;
  onChange: (val: number) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const parsed = value !== undefined && value !== null && value !== '' ? Number(value) : NaN;
  const current = Number.isFinite(parsed) ? parsed : defaultValue;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="font-mono text-[11px] font-bold text-[#107b46]">
          {current}
          {unit}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={min}
          max={max}
          value={Math.min(max, Math.max(min, current))}
          onChange={(e) => {
            setDraft(null);
            onChange(Number(e.target.value));
          }}
          className="flex-1 accent-[#107b46] cursor-pointer"
        />
        <input
          type="number"
          min={min}
          max={max}
          value={draft ?? String(current)}
          onFocus={() => setDraft(String(current))}
          onChange={(e) => {
            const raw = e.target.value;
            setDraft(raw);
            if (raw.trim() === '') return;
            const n = Number(raw);
            if (Number.isFinite(n) && n >= min && n <= max) {
              onChange(n);
            }
          }}
          onBlur={() => {
            const raw = (draft ?? '').trim();
            if (raw !== '') {
              const n = Number(raw);
              if (Number.isFinite(n)) {
                onChange(Math.min(max, Math.max(min, n)));
              }
            }
            setDraft(null);
          }}
          className="w-14 text-center text-xs p-1 border border-gray-300 rounded-md"
        />
      </div>
    </div>
  );
}

export default function HeroSectionEditor({
  section,
  updateSectionSettings,
  handleUpload,
  editingBlockNum = 0,
}: HeroSectionEditorProps) {
  const [activeBlock, setActiveBlock] = useState<number>(editingBlockNum || 0);
  const [modeTab, setModeTab] = useState<'content' | 'design'>('content');
  const settings = section.settings || {};

  // Sync whenever user clicks a block pencil in the preview
  useEffect(() => {
    if (editingBlockNum !== undefined) {
      setActiveBlock(editingBlockNum);
    }
  }, [editingBlockNum]);

  const handleFieldChange = (key: string, value: any) => {
    updateSectionSettings(section.id, key, value);
  };

  const handleMultiChange = (updates: Record<string, any>) => {
    updateSectionSettings(section.id, updates);
  };

  const block2ImageUrl =
    settings.bannerImage !== undefined
      ? settings.bannerImage
      : settings.bgImageUrl !== undefined
        ? settings.bgImageUrl
        : '/images/hero-appliances.jpg';

  const block3ImageUrl =
    settings.sideCardImage !== undefined
      ? settings.sideCardImage
      : settings.showcaseBgImage !== undefined
        ? settings.showcaseBgImage
        : '/images/hero-coffee-machine.jpg';

  const blockTabs = [
    { id: 0, label: 'Hero' },
    { id: 1, label: 'Block 1' },
    { id: 2, label: 'Block 2' },
    { id: 3, label: 'Block 3' },
  ];

  const blockTitles: Record<number, string> = {
    0: 'Hero-Container (Gesamt)',
    1: 'Block 1 (Kategorien)',
    2: 'Block 2 (Hauptbanner)',
    3: 'Block 3 (Highlight-Karte)',
  };

  return (
    <div className="flex flex-col h-full bg-white text-stone-800 -mx-3 -mt-3">
      {/* Block Switcher Header */}
      <div className="px-3.5 pt-3 pb-2.5 bg-gray-50/90 space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-gray-900 text-xs">{blockTitles[activeBlock]}</h2>
        </div>

        <div className="grid grid-cols-4 gap-1">
          {blockTabs.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setActiveBlock(b.id)}
              className={`py-1.5 px-1 text-[11px] font-bold rounded-md border transition-all cursor-pointer ${
                activeBlock === b.id
                  ? 'bg-[#107b46] text-white border-[#107b46] shadow-2xs'
                  : 'bg-white text-stone-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Single Icon-Only Content / Design Tab Bar (Elementor style) */}
      <EditorModeTabs mode={modeTab} onChange={setModeTab} />

      {/* Scrollable Fields Area */}
      <div className="p-3.5 space-y-4 overflow-y-auto max-h-[calc(100vh-210px)]">
        {/* ============================================================ */}
        {/* BLOCK 0: OVERALL HERO (Height, Spacing, Visibility, Layout)  */}
        {/* ============================================================ */}
        {activeBlock === 0 && modeTab === 'content' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2.5 bg-stone-50 border border-stone-200 rounded-lg">
              <div>
                <p className="text-xs font-bold text-gray-800">Mini-Warenkorb (Schwebend)</p>
                <p className="text-[10px] text-gray-500">Grünes Einkaufswagen-Widget anzeigen</p>
              </div>
              <button
                type="button"
                onClick={() => handleFieldChange('showMiniCart', settings.showMiniCart === false)}
                className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                  settings.showMiniCart !== false ? 'bg-[#107b46]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all ${
                    settings.showMiniCart !== false ? 'left-5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-stone-50 border border-stone-200 rounded-lg">
              <div>
                <p className="text-xs font-bold text-gray-800">Mobile Kategorie-Leiste</p>
                <p className="text-[10px] text-gray-500">Kategorien unter dem Banner auf Mobilgeräten</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleFieldChange('showMobileCategories', settings.showMobileCategories === false)
                }
                className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                  settings.showMobileCategories !== false ? 'bg-[#107b46]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all ${
                    settings.showMobileCategories !== false ? 'left-5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            <p className="text-[11px] text-gray-500 leading-relaxed bg-blue-50/60 border border-blue-100 rounded-lg p-2.5">
              Hinweis: Klicken Sie auf das Stift-Symbol direkt über <strong>Block 1</strong>,{' '}
              <strong>Block 2</strong> oder <strong>Block 3</strong> in der Vorschau, um die Inhalte
              jedes Blocks einzeln anzupassen.
            </p>
          </div>
        )}

        {activeBlock === 0 && modeTab === 'design' && (
          <div className="space-y-4">
            <RangeNumberField
              label="Mindesthöhe (Hero)"
              value={settings.heroMinHeight}
              defaultValue={460}
              min={320}
              max={750}
              onChange={(v) => handleFieldChange('heroMinHeight', v)}
            />

            <RangeNumberField
              label="Abstand Oben & Unten"
              value={settings.heroPaddingY}
              defaultValue={24}
              min={0}
              max={80}
              onChange={(v) => handleFieldChange('heroPaddingY', v)}
            />

            <RangeNumberField
              label="Spaltenabstand (Gap)"
              value={settings.heroGap}
              defaultValue={20}
              min={8}
              max={48}
              onChange={(v) => handleFieldChange('heroGap', v)}
            />

            <div className="pt-2 border-t border-gray-100">
              <ColorField
                label="Bereich-Hintergrund"
                value={settings.heroBgColor === 'transparent' ? '#ffffff' : settings.heroBgColor}
                defaultValue="#ffffff"
                onChange={(v) => handleFieldChange('heroBgColor', v)}
              />
              {settings.heroBgColor && settings.heroBgColor !== 'transparent' && (
                <button
                  type="button"
                  onClick={() => handleFieldChange('heroBgColor', 'transparent')}
                  className="text-[10px] text-gray-500 hover:text-gray-800 underline cursor-pointer mt-1"
                >
                  Transparent zurücksetzen
                </button>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* BLOCK 1: CATEGORIES SIDEBAR                                  */}
        {/* ============================================================ */}
        {activeBlock === 1 && modeTab === 'content' && (
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Überschrift</label>
              <input
                type="text"
                value={settings.block1Title ?? 'Alle Kategorien'}
                onChange={(e) => handleFieldChange('block1Title', e.target.value)}
                className="w-full text-xs p-2 border border-gray-300 rounded-lg"
              />
            </div>

            <RangeNumberField
              label="Maximale Anzahl Kategorien"
              value={settings.block1MaxItems}
              defaultValue={8}
              min={3}
              max={12}
              unit=""
              onChange={(v) => handleFieldChange('block1MaxItems', v)}
            />

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Footer-Link Text</label>
              <input
                type="text"
                value={settings.block1FooterText ?? 'Alle Kategorien ansehen'}
                onChange={(e) => handleFieldChange('block1FooterText', e.target.value)}
                className="w-full text-xs p-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Footer-Link Ziel</label>
              <input
                type="text"
                value={settings.block1FooterUrl ?? '/shop'}
                onChange={(e) => handleFieldChange('block1FooterUrl', e.target.value)}
                className="w-full text-xs p-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        )}

        {activeBlock === 1 && modeTab === 'design' && (
          <div className="space-y-3.5">
            <RangeNumberField
              label="Eckenradius"
              value={settings.block1BorderRadius}
              defaultValue={16}
              min={0}
              max={32}
              onChange={(v) => handleFieldChange('block1BorderRadius', v)}
            />

            <RangeNumberField
              label="Schriftgröße Titel"
              value={settings.block1TitleSize}
              defaultValue={14}
              min={10}
              max={28}
              onChange={(v) => handleFieldChange('block1TitleSize', v)}
            />

            <RangeNumberField
              label="Schriftgröße Kategorien"
              value={settings.block1TextSize}
              defaultValue={13}
              min={10}
              max={22}
              onChange={(v) => handleFieldChange('block1TextSize', v)}
            />

            <RangeNumberField
              label="Schriftgröße Footer-Link"
              value={settings.block1FooterSize}
              defaultValue={12}
              min={10}
              max={20}
              onChange={(v) => handleFieldChange('block1FooterSize', v)}
            />

            <div className="pt-2 border-t border-gray-100 space-y-1.5">
              <ColorField
                label="Hintergrundfarbe"
                value={settings.block1BgColor}
                defaultValue="#ffffff"
                onChange={(v) => handleFieldChange('block1BgColor', v)}
              />
              <ColorField
                label="Rahmenfarbe"
                value={settings.block1BorderColor}
                defaultValue="#e7e5e4"
                onChange={(v) => handleFieldChange('block1BorderColor', v)}
              />
              <ColorField
                label="Akzentfarbe"
                value={settings.block1AccentColor}
                defaultValue="#107b46"
                onChange={(v) => handleFieldChange('block1AccentColor', v)}
              />
              <ColorField
                label="Titelfarbe"
                value={settings.block1TitleColor}
                defaultValue="#1c1917"
                onChange={(v) => handleFieldChange('block1TitleColor', v)}
              />
              <ColorField
                label="Textfarbe Liste"
                value={settings.block1TextColor}
                defaultValue="#44403c"
                onChange={(v) => handleFieldChange('block1TextColor', v)}
              />
              <ColorField
                label="Footer-Link Farbe"
                value={settings.block1FooterColor}
                defaultValue={settings.block1AccentColor || '#107b46'}
                onChange={(v) => handleFieldChange('block1FooterColor', v)}
              />
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* BLOCK 2: MAIN CENTER BANNER                                  */}
        {/* ============================================================ */}
        {activeBlock === 2 && modeTab === 'content' && (
          <div className="space-y-3.5">
            <ImageFramePicker
              label="Image BG"
              imageUrl={block2ImageUrl}
              onSelectClick={() => handleUpload(section.id, 'bannerImage')}
              onClearClick={() => handleMultiChange({ bannerImage: '', bgImageUrl: '' })}
              objectFit="cover"
            />

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Badge</label>
              <input
                type="text"
                value={settings.badgeText ?? settings.campaignBadge ?? 'Sonderangebot'}
                onChange={(e) =>
                  handleMultiChange({ badgeText: e.target.value, campaignBadge: e.target.value })
                }
                className="w-full text-xs p-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Titel</label>
              <input
                type="text"
                value={
                  settings.title ??
                  settings.titleGradient ??
                  'Ihre hochwertigen Haushaltsgeräte zu den besten Preisen!'
                }
                onChange={(e) =>
                  handleMultiChange({ title: e.target.value, titleGradient: e.target.value })
                }
                className="w-full text-xs p-2 border border-gray-300 rounded-lg font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Untertitel</label>
              <textarea
                rows={3}
                value={
                  settings.subtitle ??
                  settings.description ??
                  'Premium-Marken für Küche & Haushalt. Bis zu 40% sparen • Sofort versandbereit • 2 Jahre Garantie.'
                }
                onChange={(e) =>
                  handleMultiChange({ subtitle: e.target.value, description: e.target.value })
                }
                className="w-full text-xs p-2 border border-gray-300 rounded-lg leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Vorteil 1</label>
                <input
                  type="text"
                  value={settings.trustBadge1 ?? 'Kostenloser Versand ab 200 €'}
                  onChange={(e) => handleFieldChange('trustBadge1', e.target.value)}
                  className="w-full text-xs p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Vorteil 2</label>
                <input
                  type="text"
                  value={settings.trustBadge2 ?? '2 Jahre Garantie'}
                  onChange={(e) => handleFieldChange('trustBadge2', e.target.value)}
                  className="w-full text-xs p-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Button-Text</label>
                <input
                  type="text"
                  value={settings.ctaText ?? settings.buttonText ?? 'Angebote anzeigen'}
                  onChange={(e) =>
                    handleMultiChange({ ctaText: e.target.value, buttonText: e.target.value })
                  }
                  className="w-full text-xs p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Button-Link</label>
                <input
                  type="text"
                  value={settings.ctaUrl ?? settings.buttonLink ?? '/shop'}
                  onChange={(e) =>
                    handleMultiChange({ ctaUrl: e.target.value, buttonLink: e.target.value })
                  }
                  className="w-full text-xs p-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        {activeBlock === 2 && modeTab === 'design' && (
          <div className="space-y-3.5">
            <RangeNumberField
              label="Badge-Schriftgröße"
              value={settings.block2BadgeSize}
              defaultValue={11}
              min={9}
              max={22}
              onChange={(v) => handleFieldChange('block2BadgeSize', v)}
            />

            <RangeNumberField
              label="Titelgröße"
              value={settings.block2TitleSize}
              defaultValue={34}
              min={14}
              max={64}
              onChange={(v) => handleFieldChange('block2TitleSize', v)}
            />

            <RangeNumberField
              label="Untertitelgröße"
              value={settings.block2SubtitleSize}
              defaultValue={14}
              min={10}
              max={28}
              onChange={(v) => handleFieldChange('block2SubtitleSize', v)}
            />

            <RangeNumberField
              label="Vorteile-Schriftgröße"
              value={settings.block2TrustSize}
              defaultValue={11}
              min={9}
              max={22}
              onChange={(v) => handleFieldChange('block2TrustSize', v)}
            />

            <RangeNumberField
              label="Button-Schriftgröße"
              value={settings.block2BtnSize}
              defaultValue={15}
              min={11}
              max={26}
              onChange={(v) => handleFieldChange('block2BtnSize', v)}
            />

            <RangeNumberField
              label="Innenabstand (Padding)"
              value={settings.block2Padding}
              defaultValue={28}
              min={8}
              max={56}
              onChange={(v) => handleFieldChange('block2Padding', v)}
            />

            <RangeNumberField
              label="Eckenradius"
              value={settings.block2BorderRadius}
              defaultValue={16}
              min={0}
              max={32}
              onChange={(v) => handleFieldChange('block2BorderRadius', v)}
            />

            <RangeNumberField
              label="Overlay Deckkraft"
              value={settings.block2OverlayOpacity}
              defaultValue={85}
              min={0}
              max={100}
              unit="%"
              onChange={(v) => handleFieldChange('block2OverlayOpacity', v)}
            />

            <RangeNumberField
              label="Text-Box Deckkraft"
              value={settings.block2CardBgOpacity}
              defaultValue={75}
              min={0}
              max={100}
              unit="%"
              onChange={(v) => handleFieldChange('block2CardBgOpacity', v)}
            />

            <div className="pt-2 border-t border-gray-100 space-y-1.5">
              <ColorField
                label="Hintergrundfarbe"
                value={settings.block2BgColor}
                defaultValue="#f5f5f4"
                onChange={(v) => handleFieldChange('block2BgColor', v)}
              />
              <ColorField
                label="Overlay-Farbe"
                value={settings.block2OverlayColor}
                defaultValue="#ffffff"
                onChange={(v) => handleFieldChange('block2OverlayColor', v)}
              />
              <ColorField
                label="Badge Hintergrund"
                value={settings.block2BadgeBg}
                defaultValue="#e01b1b"
                onChange={(v) => handleFieldChange('block2BadgeBg', v)}
              />
              <ColorField
                label="Badge Text"
                value={settings.block2BadgeTextColor}
                defaultValue="#ffffff"
                onChange={(v) => handleFieldChange('block2BadgeTextColor', v)}
              />
              <ColorField
                label="Titelfarbe"
                value={settings.block2TitleColor}
                defaultValue="#dc2626"
                onChange={(v) => handleFieldChange('block2TitleColor', v)}
              />
              <ColorField
                label="Untertitelfarbe"
                value={settings.block2SubtitleColor}
                defaultValue="#44403c"
                onChange={(v) => handleFieldChange('block2SubtitleColor', v)}
              />
              <ColorField
                label="Vorteile Textfarbe"
                value={settings.block2TrustColor}
                defaultValue="#44403c"
                onChange={(v) => handleFieldChange('block2TrustColor', v)}
              />
              <ColorField
                label="Vorteile Häkchen-Farbe"
                value={settings.block2TrustIconColor}
                defaultValue="#107b46"
                onChange={(v) => handleFieldChange('block2TrustIconColor', v)}
              />
              <ColorField
                label="Button Hintergrund"
                value={settings.block2BtnBg}
                defaultValue="#f59e0b"
                onChange={(v) => handleFieldChange('block2BtnBg', v)}
              />
              <ColorField
                label="Button Text"
                value={settings.block2BtnTextColor}
                defaultValue="#0c0a09"
                onChange={(v) => handleFieldChange('block2BtnTextColor', v)}
              />
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* BLOCK 3: RIGHT HIGHLIGHT CARD                                */}
        {/* ============================================================ */}
        {activeBlock === 3 && modeTab === 'content' && (
          <div className="space-y-3.5">
            <ImageFramePicker
              label="Image BG"
              imageUrl={block3ImageUrl}
              onSelectClick={() => handleUpload(section.id, 'sideCardImage')}
              onClearClick={() => handleMultiChange({ sideCardImage: '', showcaseBgImage: '' })}
              objectFit="cover"
            />

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Badge (Oben)</label>
              <input
                type="text"
                value={settings.sideCardBadge ?? '★ Bestseller der Woche'}
                onChange={(e) => handleFieldChange('sideCardBadge', e.target.value)}
                className="w-full text-xs p-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Kategorie / Slogan</label>
              <input
                type="text"
                value={settings.sideCardCategory ?? 'Genuss auf Knopfdruck'}
                onChange={(e) => handleFieldChange('sideCardCategory', e.target.value)}
                className="w-full text-xs p-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Titel</label>
              <input
                type="text"
                value={settings.sideCardTitle ?? 'Kaffeevollautomaten'}
                onChange={(e) => handleFieldChange('sideCardTitle', e.target.value)}
                className="w-full text-xs p-2 border border-gray-300 rounded-lg font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Untertitel</label>
              <textarea
                rows={2}
                value={
                  settings.sideCardSubtitle ??
                  'Perfekter Barista-Kaffee für Ihr Zuhause mit intuitiver Touch-Bedienung.'
                }
                onChange={(e) => handleFieldChange('sideCardSubtitle', e.target.value)}
                className="w-full text-xs p-2 border border-gray-300 rounded-lg leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Link-Text</label>
                <input
                  type="text"
                  value={settings.sideCardCtaText ?? 'Geräte entdecken'}
                  onChange={(e) => handleFieldChange('sideCardCtaText', e.target.value)}
                  className="w-full text-xs p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Link-Ziel</label>
                <input
                  type="text"
                  value={settings.sideCardUrl ?? '/shop?category=kaffeemaschinen'}
                  onChange={(e) => handleFieldChange('sideCardUrl', e.target.value)}
                  className="w-full text-xs p-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        {activeBlock === 3 && modeTab === 'design' && (
          <div className="space-y-3.5">
            <RangeNumberField
              label="Badge-Schriftgröße"
              value={settings.block3BadgeSize}
              defaultValue={10}
              min={8}
              max={20}
              onChange={(v) => handleFieldChange('block3BadgeSize', v)}
            />

            <RangeNumberField
              label="Slogan-Schriftgröße"
              value={settings.block3CategorySize}
              defaultValue={11}
              min={9}
              max={22}
              onChange={(v) => handleFieldChange('block3CategorySize', v)}
            />

            <RangeNumberField
              label="Titelgröße"
              value={settings.block3TitleSize}
              defaultValue={18}
              min={12}
              max={36}
              onChange={(v) => handleFieldChange('block3TitleSize', v)}
            />

            <RangeNumberField
              label="Untertitelgröße"
              value={settings.block3SubtitleSize}
              defaultValue={12}
              min={9}
              max={24}
              onChange={(v) => handleFieldChange('block3SubtitleSize', v)}
            />

            <RangeNumberField
              label="Link-Schriftgröße"
              value={settings.block3LinkSize}
              defaultValue={12}
              min={9}
              max={24}
              onChange={(v) => handleFieldChange('block3LinkSize', v)}
            />

            <RangeNumberField
              label="Eckenradius"
              value={settings.block3BorderRadius}
              defaultValue={16}
              min={0}
              max={32}
              onChange={(v) => handleFieldChange('block3BorderRadius', v)}
            />

            <RangeNumberField
              label="Overlay Dunkelheit"
              value={settings.block3OverlayOpacity}
              defaultValue={90}
              min={0}
              max={100}
              unit="%"
              onChange={(v) => handleFieldChange('block3OverlayOpacity', v)}
            />

            <div className="pt-2 border-t border-gray-100 space-y-1.5">
              <ColorField
                label="Hintergrundfarbe"
                value={settings.block3BgColor}
                defaultValue="#1c1917"
                onChange={(v) => handleFieldChange('block3BgColor', v)}
              />
              <ColorField
                label="Badge Hintergrund"
                value={settings.block3BadgeBg}
                defaultValue="#ffffff"
                onChange={(v) => handleFieldChange('block3BadgeBg', v)}
              />
              <ColorField
                label="Badge Text"
                value={settings.block3BadgeTextColor}
                defaultValue="#1c1917"
                onChange={(v) => handleFieldChange('block3BadgeTextColor', v)}
              />
              <ColorField
                label="Slogan Farbe"
                value={settings.block3CategoryColor}
                defaultValue="#fbbf24"
                onChange={(v) => handleFieldChange('block3CategoryColor', v)}
              />
              <ColorField
                label="Titelfarbe"
                value={settings.block3TitleColor}
                defaultValue="#ffffff"
                onChange={(v) => handleFieldChange('block3TitleColor', v)}
              />
              <ColorField
                label="Untertitelfarbe"
                value={settings.block3SubtitleColor}
                defaultValue="#d6d3d1"
                onChange={(v) => handleFieldChange('block3SubtitleColor', v)}
              />
              <ColorField
                label="Link Farbe"
                value={settings.block3LinkColor}
                defaultValue="#fbbf24"
                onChange={(v) => handleFieldChange('block3LinkColor', v)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
