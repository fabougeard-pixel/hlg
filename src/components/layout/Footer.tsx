'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import NewsletterFooterForm from './NewsletterFooterForm';

type FooterProps = {
  supportPhone?: string;
  supportEmail?: string;
  footerBgColor?: string;
  footerTextColor?: string;
  footerHeadingColor?: string;
  footerAddress1?: string;
  footerAddress2?: string;
  footerLocationsTitle?: string;
  footerNewsletterTitle?: string;
  footerNewsletterText?: string;
  footerNewsletterPlaceholder?: string;
  footerCallUsText?: string;
  footerCopyright?: string;
  footerSocialFacebook?: string;
  footerSocialTwitter?: string;
  footerSocialInstagram?: string;
  footerSocialLinkedin?: string;
  footerColumns?: Array<{ title: string; links: Array<{ label: string; url: string }> }>;
  categories?: Array<{ id: string; name: string; slug: string | null }>;
  footerLogoImage?: string;
  footerDescription?: string;
  footerShowAddress?: boolean;
  footerShowEmail?: boolean;
  footerShowPhone?: boolean;
  footerPaymentAmex?: boolean;
  footerPaymentApplePay?: boolean;
  footerPaymentGooglePay?: boolean;
  footerPaymentMastercard?: boolean;
  footerPaymentVisa?: boolean;
  footerPaymentOpay?: boolean;
  contactSlug?: string;
};

export default function Footer({
  supportEmail = 'info@hlg-hausgeraete.de',
  footerAddress1 = 'Borseler Chaussee 123, 22453 Hamburg, Deutschland',
  footerNewsletterTitle = 'Unser Newsletter',
  footerNewsletterText = 'Erhalten Sie 10 € Rabatt, wenn Sie sich für unseren Newsletter anmelden!',
  footerNewsletterPlaceholder = 'Geben Sie Ihre E-Mail ein',
  footerCopyright = '© 2026 HLG HAUSGERÄTE. Alle Rechte vorbehalten!',
  footerLogoImage = '/LOGO-HLG-HAUSGERAETE.png',
  footerDescription = 'Unsere Verpflichtungen: Schnelle, korrekte Lieferung und ein Kundenservice, der Ihnen zur Seite steht. Mehr als ein Team, das auf Ihre Bedürfnisse hört und bereit ist, Sie bei Ihren Projekten zu beraten und zu begleiten.',
}: FooterProps) {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (id: string) => {
    setOpenSection((prev) => (prev === id ? null : id));
  };

  const legalLinks = [
    { label: 'AGB', url: '/agb' },
    { label: 'Über uns', url: '/ueber-uns' },
    { label: 'Impressum', url: '/impressum' },
    { label: 'Lieferzeiten', url: '/lieferzeiten' },
    { label: 'Zahlungsinfos', url: '/zahlungsinformationen' },
    { label: 'Rückgabe- und Widerrufsbelehrung', url: '/rueckgabe-und-erstattung' },
    { label: 'Kontakt', url: '/kontakt' },
  ];

  const accountLinks = [
    { label: 'Mein Konto', url: '/account' },
    { label: 'Warenkorb', url: '/cart' },
    { label: 'Meine Bestellungen', url: '/account/orders' },
    { label: 'Checkout', url: '/checkout' },
    { label: 'Vergleiche', url: '/compare' },
    { label: 'Wunschliste', url: '/wishlist' },
    { label: 'Datenschutzrichtlinie', url: '/datenschutz' },
    { label: 'Nutzungsbedingungen der Website', url: '/nutzungsbedingungen' },
  ];

  const categoryLinks = [
    { label: 'Gaming', url: '/shop?category=gaming' },
    { label: 'Geschirrspüler', url: '/shop?category=geschirrspueler' },
    { label: 'Herde', url: '/shop?category=herde' },
    { label: 'Kaffeemaschinen', url: '/shop?category=kaffeemaschinen' },
    { label: 'Küchenmaschinen', url: '/shop?category=kuechenmaschinen' },
    { label: 'Staubsauger & Reiniger', url: '/shop?category=staubsauger-reiniger' },
    { label: 'Waschmaschinen', url: '/shop?category=waschmaschinen' },
    { label: 'Waschtrockner', url: '/shop?category=waschtrockner' },
  ];

  return (
    <footer className="font-sans bg-white border-t border-stone-200">
      {/* Main 5-Column Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-8">

          {/* Column 1: Logo & Company Description & Contacts */}
          <div className="lg:col-span-1 space-y-4">
            <Link href="/" className="inline-block">
              <Image
                src={footerLogoImage}
                alt="HLG HAUSGERÄTE"
                width={190}
                height={50}
                className="h-10 w-auto object-contain"
              />
            </Link>

            <p className="text-xs text-stone-600 leading-relaxed">
              {footerDescription}
            </p>

            <div className="space-y-2.5 text-xs text-stone-600 pt-2 border-t border-stone-100">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-[#107b46] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{footerAddress1}</span>
              </div>

              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#107b46] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href={`mailto:${supportEmail}`} className="hover:text-[#107b46] transition truncate">
                  {supportEmail}
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Rechtliche Links */}
          <div className="lg:col-span-1 border-t border-stone-100 pt-4 md:border-none md:pt-0">
            <button
              type="button"
              onClick={() => toggleSection('legal')}
              className="w-full flex md:hidden items-center justify-between font-extrabold text-sm text-stone-900 mb-2"
            >
              <span>Rechtliche Links</span>
              <svg className={`w-4 h-4 transition-transform ${openSection === 'legal' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <h4 className="hidden md:block font-extrabold text-sm text-stone-900 mb-4">
              Rechtliche Links
            </h4>
            <ul className={`space-y-2.5 text-xs text-stone-600 ${openSection === 'legal' ? 'block pb-3' : 'hidden md:block'}`}>
              {legalLinks.map((link, idx) => (
                <li key={idx}>
                  <Link href={link.url} className="hover:text-[#107b46] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Konto */}
          <div className="lg:col-span-1 border-t border-stone-100 pt-4 md:border-none md:pt-0">
            <button
              type="button"
              onClick={() => toggleSection('account')}
              className="w-full flex md:hidden items-center justify-between font-extrabold text-sm text-stone-900 mb-2"
            >
              <span>Konto</span>
              <svg className={`w-4 h-4 transition-transform ${openSection === 'account' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <h4 className="hidden md:block font-extrabold text-sm text-stone-900 mb-4">
              Konto
            </h4>
            <ul className={`space-y-2.5 text-xs text-stone-600 ${openSection === 'account' ? 'block pb-3' : 'hidden md:block'}`}>
              {accountLinks.map((link, idx) => (
                <li key={idx}>
                  <Link href={link.url} className="hover:text-[#107b46] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Alle Kategorien */}
          <div className="lg:col-span-1 border-t border-stone-100 pt-4 md:border-none md:pt-0">
            <button
              type="button"
              onClick={() => toggleSection('categories')}
              className="w-full flex md:hidden items-center justify-between font-extrabold text-sm text-stone-900 mb-2"
            >
              <span>Alle Kategorien</span>
              <svg className={`w-4 h-4 transition-transform ${openSection === 'categories' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <h4 className="hidden md:block font-extrabold text-sm text-stone-900 mb-4">
              Alle Kategorien
            </h4>
            <ul className={`space-y-2.5 text-xs text-stone-600 ${openSection === 'categories' ? 'block pb-3' : 'hidden md:block'}`}>
              {categoryLinks.map((link, idx) => (
                <li key={idx}>
                  <Link href={link.url} className="hover:text-[#107b46] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Unser Newsletter */}
          <div className="lg:col-span-1 border-t border-stone-100 pt-4 md:border-none md:pt-0">
            <h4 className="font-extrabold text-sm text-stone-900 mb-2">
              {footerNewsletterTitle}
            </h4>
            <p className="text-xs text-stone-600 mb-4 leading-relaxed">
              {footerNewsletterText}
            </p>
            <NewsletterFooterForm placeholder={footerNewsletterPlaceholder} />
          </div>

        </div>
      </div>

      {/* Bottom Dark Copyright & Payments Bar */}
      <div className="bg-[#111827] text-white py-4 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          {/* Copyright */}
          <p className="text-stone-300 font-medium text-center sm:text-left">
            {footerCopyright}
          </p>

          {/* Payment Badges */}
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-[#ffb3c7] text-[#000000] font-black text-[10px] rounded-md tracking-wider">
              Klarna.
            </span>
            <span className="px-2.5 py-1 bg-white text-[#1a1f71] font-black text-[11px] rounded-md tracking-wider italic">
              VISA
            </span>
            <span className="px-2.5 py-1 bg-[#222] text-white font-black text-[10px] rounded-md tracking-wider flex items-center gap-0.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#eb001b] inline-block -mr-1" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#f79e1b] inline-block" />
            </span>
            <span className="px-2.5 py-1 bg-[#0061a8] text-white font-black text-[10px] rounded-md tracking-wider">
              maestro.
            </span>
            <span className="px-2.5 py-1 bg-[#003087] text-[#0079C1] font-black text-[10px] rounded-md tracking-wider bg-white">
              <span className="text-[#003087]">Pay</span><span className="text-[#0079C1]">Pal</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
