'use client';

import React from 'react';
import Link from 'next/link';

const brands = [
  { name: 'Bosch', slogan: 'Technik fürs Leben' },
  { name: 'Siemens', slogan: 'Die Zukunft zieht ein' },
  { name: 'Miele', slogan: 'Immer besser' },
  { name: 'Samsung', slogan: 'Smart Forward' },
  { name: 'AEG', slogan: 'Perfekt in Form & Funktion' },
  { name: "De'Longhi", slogan: 'Better Everyday' },
  { name: 'Jura', slogan: 'Kaffee-Tradition' },
  { name: 'Roborock', slogan: 'Smarte Saugroboter' },
  { name: 'KitchenAid', slogan: 'Kulinarische Meisterwerke' },
  { name: 'Haier', slogan: 'Intelligente Haushaltsgeräte' },
  { name: 'Bauknecht', slogan: 'Für ein gesundes Zuhause' },
  { name: 'Candy', slogan: 'Smarte Alltagshelfer' },
];

const servicePerks = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    ),
    title: 'Altgeräte-Entsorgung',
    desc: 'Kostenlose und fachgerechte Mitnahme Ihres alten Haushaltsgeräts bei Lieferung.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
      </svg>
    ),
    title: 'Anschluss & Montage',
    desc: 'Auf Wunsch professioneller Aufbau- und Anschlussservice direkt bei Ihnen zu Hause.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: '2 Jahre Herstellergarantie',
    desc: 'Voller Schutz auf alle Neu- und Markengeräte mit schnellem Reparaturservice.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    title: 'Bequemer Ratenkauf',
    desc: 'Flexible Zahlungsoptionen: PayPal, Klarna Ratenkauf, Rechnung und Sofortüberweisung.',
  },
];

export default function BrandShowcase() {
  return (
    <section className="py-14 bg-white border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-[#107b46] font-bold text-xs uppercase tracking-wider block">
            Geprüfte Markenqualität
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-1">
            Führende Hersteller bei HLG Hausgeräte
          </h2>
          <p className="text-sm text-stone-500 mt-2">
            Entdecken Sie innovative Spitzengeräte weltbekannter Qualitätshersteller mit voller Herstellergarantie.
          </p>
        </div>

        {/* Brand Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-14">
          {brands.map((brand, idx) => (
            <Link
              key={idx}
              href={`/shop?search=${encodeURIComponent(brand.name)}`}
              className="bg-stone-50 hover:bg-white border border-stone-200/80 hover:border-[#107b46] rounded-2xl p-4 text-center transition-all hover:shadow-md hover:-translate-y-0.5 group flex flex-col items-center justify-center min-h-[90px]"
            >
              <span className="text-base font-black text-stone-800 group-hover:text-[#107b46] transition-colors tracking-tight">
                {brand.name}
              </span>
              <span className="text-[10px] text-stone-400 group-hover:text-stone-600 transition-colors mt-0.5 line-clamp-1">
                {brand.slogan}
              </span>
            </Link>
          ))}
        </div>

        {/* Services & Guarantees Banner */}
        <div className="bg-stone-50 rounded-3xl border border-stone-200/90 p-6 sm:p-10 shadow-xs">
          <div className="text-center mb-8">
            <span className="text-[#107b46] font-extrabold text-xs uppercase tracking-wider block">
              Der HLG Vorteil
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight mt-1">
              Unser Rundum-Sorglos-Service für Großgeräte
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {servicePerks.map((perk, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-5 border border-stone-200/70 shadow-xs flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#107b46] flex items-center justify-center shrink-0 mb-3.5 border border-emerald-100">
                  {perk.icon}
                </div>
                <h4 className="font-extrabold text-stone-900 text-sm mb-1">
                  {perk.title}
                </h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  {perk.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

