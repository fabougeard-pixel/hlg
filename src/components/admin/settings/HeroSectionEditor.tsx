'use client';

import { useState } from 'react';
import { SectionConfig } from '@/app/admin/(dashboard)/landing/LandingForm';
import Image from "next/image";

interface HeroSectionEditorProps {
  section: SectionConfig;
  previewMode: 'desktop' | 'tablet' | 'mobile';
  updateSectionSettings: (id: string, keyOrUpdates: string | Record<string, any>, value?: any) => void;
  handleUpload: (id: string, key: string) => void;
  editingBlockNum?: number;
}

export default function HeroSectionEditor({ 
  section, 
  updateSectionSettings, 
  handleUpload 
}: HeroSectionEditorProps) {
  const [activeTab, setActiveTab] = useState<'block2' | 'block3'>('block2');
  const settings = section.settings || {};

  const handleFieldChange = (key: string, value: any) => {
    updateSectionSettings(section.id, key, value);
  };

  return (
    <div className="flex flex-col h-full bg-white text-stone-800">
      {/* Editor Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50/90">
        <h2 className="font-extrabold text-gray-900 text-sm">Hero-Bereich anpassen</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Block 1 zeigt die Kategorien. Hier können Sie Block 2 und Block 3 bearbeiten.
        </p>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <button
            type="button"
            onClick={() => setActiveTab('block2')}
            className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
              activeTab === 'block2'
                ? 'bg-[#107b46] text-white border-[#107b46] shadow-xs'
                : 'bg-white text-stone-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Block 2 (Hauptbanner)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('block3')}
            className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
              activeTab === 'block3'
                ? 'bg-[#107b46] text-white border-[#107b46] shadow-xs'
                : 'bg-white text-stone-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Block 3 (Highlight-Karte)
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-230px)]">

        {/* BLOC 2: HAUPTBANNER (MITTE) */}
        {activeTab === 'block2' && (
          <div className="space-y-4">
            
            {/* Image BG (Clean Frame + Upload, no redundant URL text box) */}
            <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Image BG
              </label>
              <div className="flex items-center gap-3">
                <div className="w-28 h-18 rounded-xl border border-gray-300 overflow-hidden relative bg-stone-900 shrink-0 shadow-xs">
                  <Image
                    src={settings.bannerImage || settings.bgImageUrl || '/images/hero-appliances.jpg'}
                    alt="Image BG"
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleUpload(section.id, 'bannerImage')}
                  className="px-3.5 py-2 bg-[#107b46] hover:bg-[#0d693b] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  Bild auswählen
                </button>
              </div>
            </div>

            {/* Badge */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Badge (z.B. Sonderangebot)</label>
              <input
                type="text"
                value={settings.badgeText ?? settings.campaignBadge ?? 'Sonderangebot'}
                onChange={(e) => {
                  handleFieldChange('badgeText', e.target.value);
                  handleFieldChange('campaignBadge', e.target.value);
                }}
                placeholder="z.B. Sonderangebot"
                className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#107b46]"
              />
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Haupttitel (Rot)</label>
              <input
                type="text"
                value={settings.title ?? settings.titleGradient ?? 'Ihre hochwertigen Haushaltsgeräte zu den besten Preisen!'}
                onChange={(e) => {
                  handleFieldChange('title', e.target.value);
                  handleFieldChange('titleGradient', e.target.value);
                }}
                placeholder="Titel eingeben..."
                className="w-full text-xs p-2.5 border border-gray-300 rounded-lg font-bold text-red-600 focus:ring-1 focus:ring-[#107b46]"
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Untertitel &amp; Beschreibung</label>
              <textarea
                rows={3}
                value={settings.subtitle ?? settings.description ?? 'Premium-Marken für Küche & Haushalt. Bis zu 40% sparen • Sofort versandbereit • 2 Jahre Garantie.'}
                onChange={(e) => {
                  handleFieldChange('subtitle', e.target.value);
                  handleFieldChange('description', e.target.value);
                }}
                placeholder="Beschreibung eingeben..."
                className="w-full text-xs p-2.5 border border-gray-300 rounded-lg leading-relaxed focus:ring-1 focus:ring-[#107b46]"
              />
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Vorteil 1</label>
                <input
                  type="text"
                  value={settings.trustBadge1 ?? 'Kostenloser Versand ab 50 €'}
                  onChange={(e) => handleFieldChange('trustBadge1', e.target.value)}
                  placeholder="z.B. Kostenloser Versand"
                  className="w-full text-xs p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Vorteil 2</label>
                <input
                  type="text"
                  value={settings.trustBadge2 ?? '2 Jahre Garantie'}
                  onChange={(e) => handleFieldChange('trustBadge2', e.target.value)}
                  placeholder="z.B. 2 Jahre Garantie"
                  className="w-full text-xs p-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            {/* Button */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Button-Text</label>
                <input
                  type="text"
                  value={settings.ctaText ?? settings.buttonText ?? 'Angebote anzeigen'}
                  onChange={(e) => {
                    handleFieldChange('ctaText', e.target.value);
                    handleFieldChange('buttonText', e.target.value);
                  }}
                  placeholder="z.B. Angebote anzeigen"
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Button-Link</label>
                <input
                  type="text"
                  value={settings.ctaUrl ?? settings.buttonLink ?? '/shop'}
                  onChange={(e) => {
                    handleFieldChange('ctaUrl', e.target.value);
                    handleFieldChange('buttonLink', e.target.value);
                  }}
                  placeholder="/shop"
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

          </div>
        )}

        {/* BLOC 3: HIGHLIGHT-KARTE (RECHTS) */}
        {activeTab === 'block3' && (
          <div className="space-y-4">
            
            {/* Image BG (Clean Frame + Upload, no redundant URL text box) */}
            <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Image BG
              </label>
              <div className="flex items-center gap-3">
                <div className="w-28 h-18 rounded-xl border border-gray-300 overflow-hidden relative bg-stone-900 shrink-0 shadow-xs">
                  <Image
                    src={settings.sideCardImage || settings.showcaseBgImage || '/images/hero-coffee-machine.jpg'}
                    alt="Image Highlight"
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleUpload(section.id, 'sideCardImage')}
                  className="px-3.5 py-2 bg-[#107b46] hover:bg-[#0d693b] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  Bild auswählen
                </button>
              </div>
            </div>

            {/* Badge */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Badge (Oben)</label>
              <input
                type="text"
                value={settings.sideCardBadge ?? '★ Bestseller der Woche'}
                onChange={(e) => handleFieldChange('sideCardBadge', e.target.value)}
                placeholder="z.B. ★ Bestseller der Woche"
                className="w-full text-xs p-2.5 border border-gray-300 rounded-lg"
              />
            </div>

            {/* Category / Slogan */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Kategorie / Slogan (Gelb)</label>
              <input
                type="text"
                value={settings.sideCardCategory ?? 'Genuss auf Knopfdruck'}
                onChange={(e) => handleFieldChange('sideCardCategory', e.target.value)}
                placeholder="z.B. Genuss auf Knopfdruck"
                className="w-full text-xs p-2.5 border border-gray-300 rounded-lg"
              />
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Titel</label>
              <input
                type="text"
                value={settings.sideCardTitle ?? 'Kaffeevollautomaten'}
                onChange={(e) => handleFieldChange('sideCardTitle', e.target.value)}
                placeholder="z.B. Kaffeevollautomaten"
                className="w-full text-xs p-2.5 border border-gray-300 rounded-lg font-bold"
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Untertitel</label>
              <textarea
                rows={2}
                value={settings.sideCardSubtitle ?? 'Perfekter Barista-Kaffee für Ihr Zuhause mit intuitiver Touch-Bedienung.'}
                onChange={(e) => handleFieldChange('sideCardSubtitle', e.target.value)}
                placeholder="Untertitel eingeben..."
                className="w-full text-xs p-2.5 border border-gray-300 rounded-lg leading-relaxed"
              />
            </div>

            {/* Link Text and URL */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Link-Text</label>
                <input
                  type="text"
                  value={settings.sideCardCtaText ?? 'Geräte entdecken'}
                  onChange={(e) => handleFieldChange('sideCardCtaText', e.target.value)}
                  placeholder="Geräte entdecken"
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Link-Ziel</label>
                <input
                  type="text"
                  value={settings.sideCardUrl ?? '/shop?category=kaffeemaschinen'}
                  onChange={(e) => handleFieldChange('sideCardUrl', e.target.value)}
                  placeholder="/shop?category=kaffeemaschinen"
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
