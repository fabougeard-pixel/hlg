import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface CategoryExplorerProps {
  categories?: Array<{ id: string; name: string; slug: string | null }>;
}

const defaultCategories = [
  {
    name: 'Waschmaschinen',
    href: '/shop?category=waschmaschinen',
    image: '/images/hero-appliances.jpg',
    desc: 'Frontlader & Toplader',
  },
  {
    name: 'Geschirrspüler',
    href: '/shop?category=geschirrspueler',
    image: '/images/hero-appliances.jpg',
    desc: 'Einbau & Standgeräte',
  },
  {
    name: 'Kühlen & Gefrieren',
    href: '/shop?category=kuehlen-gefrieren',
    image: '/images/hero-appliances.jpg',
    desc: 'Kühl-Gefrierkombis',
  },
  {
    name: 'Kaffeemaschinen',
    href: '/shop?category=kaffeemaschinen',
    image: '/images/hero-coffee-machine.jpg',
    desc: 'Vollautomaten & Siebträger',
  },
  {
    name: 'Herde & Backöfen',
    href: '/shop?category=herde',
    image: '/images/hero-appliances.jpg',
    desc: 'Induktion & Pyrolyse',
  },
  {
    name: 'Staubsauger',
    href: '/shop?category=staubsauger-reiniger',
    image: '/images/hero-appliances.jpg',
    desc: 'Akku & Saugroboter',
  },
];

export default function CategoryExplorer({ categories }: CategoryExplorerProps) {
  return (
    <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-end justify-between gap-3 mb-6 sm:mb-8">
        <div className="min-w-0">
          <span className="text-[#107b46] font-bold text-[11px] sm:text-xs uppercase tracking-wider block">HLG Sortiment</span>
          <h2 className="text-[17px] sm:text-2xl lg:text-3xl font-extrabold text-stone-900 tracking-tight leading-tight">Beliebte Kategorien entdecken</h2>
        </div>
        <Link 
          href="/shop" 
          className="text-xs sm:text-sm font-bold text-[#107b46] hover:text-[#0d693b] flex items-center gap-1 shrink-0 transition-colors group pb-0.5"
        >
          <span>Alle Kategorien</span>
          <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {defaultCategories.map((cat, idx) => (
          <Link
            key={idx}
            href={cat.href}
            className="group relative bg-white rounded-2xl border border-stone-200/90 p-3 sm:p-4 hover:border-[#107b46] hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col items-center text-center overflow-hidden"
          >
            {/* Real Product Image Container */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-center p-1.5 sm:p-2 mb-2 sm:mb-3 group-hover:bg-emerald-50/40 group-hover:border-emerald-200 transition-colors overflow-hidden">
              <Image
                src={cat.image}
                alt={cat.name}
                width={96}
                height={96}
                className="w-full h-full object-cover rounded-lg group-hover:scale-110 transition-transform duration-300"
                loading="lazy"
              />
            </div>

            {/* Title & Description */}
            <h3 className="font-bold text-stone-900 text-xs sm:text-sm group-hover:text-[#107b46] transition-colors line-clamp-1">
              {cat.name}
            </h3>
            <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">{cat.desc}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
