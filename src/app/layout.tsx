import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import prisma from "@/lib/prisma";
import CurrencyProvider from "@/components/CurrencyProvider";
import { defaultCurrencyOptions } from "@/lib/formatPrice";
import DeferredWidgets from "@/components/layout/DeferredWidgets";
import StoreLayout from "@/components/layout/StoreLayout";
import ThemeProvider from "@/components/layout/ThemeProvider";
import ZoomController from "@/components/layout/ZoomController";
import GoogleAnalytics from '@/components/layout/GoogleAnalytics';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import { PostHogProvider } from '@/components/providers/PostHogProvider';
import { Toaster } from 'react-hot-toast';
import { getCachedSettings, getCachedCategoriesTree, getCachedProductCounts } from '@/lib/cache';
import { safeJsonLd } from '@/lib/security';
import { SITE_URL } from '@/lib/site';
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const storeName = process.env.NEXT_PUBLIC_STORE_NAME || "HLG Hausgeräte";

export async function generateMetadata(): Promise<Metadata> {
  const settingsDb = await prisma.setting.findMany({
    where: { key: { in: ['FAVICON_IMAGE', 'HOME_META_TITLE', 'HOME_META_DESCRIPTION', 'HEADER_LOGO_IMAGE', 'GOOGLE_SITE_VERIFICATION'] } }
  });
  
  const settingsMap = settingsDb.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>);
  const faviconUrl = settingsMap['FAVICON_IMAGE'] || '/LOGO-HLG-HAUSGERAETE.png';
  const title = settingsMap['HOME_META_TITLE'] || `${storeName} | Hochwertige Haushaltsgeräte zu besten Preisen`;
  const description = settingsMap['HOME_META_DESCRIPTION'] || "Entdecken Sie hochwertige Haushaltsgeräte zu den besten Preisen bei HLG Hausgeräte. Waschmaschinen, Geschirrspüler, Kaffeemaschinen, Kühlschränke und mehr.";
  const ogImage = settingsMap['HEADER_LOGO_IMAGE'] || '/LOGO-HLG-HAUSGERAETE.png';

  const baseUrl = SITE_URL;

  return {
    metadataBase: new URL(baseUrl),
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      url: baseUrl,
      siteName: storeName,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${storeName} preview`,
        }
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: [ogImage],
    },
    icons: faviconUrl ? {
      icon: [
        { url: faviconUrl },
        { url: faviconUrl, type: 'image/png' },
        { url: faviconUrl, type: 'image/x-icon' },
      ],
      shortcut: [faviconUrl],
      apple: [
        { url: faviconUrl },
      ],
    } : undefined,
    verification: settingsMap['GOOGLE_SITE_VERIFICATION'] ? {
      google: settingsMap['GOOGLE_SITE_VERIFICATION']
    } : undefined
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const messages = await getMessages();
  const locale = await getLocale();
  
  let userRole: 'ADMIN' | 'CUSTOMER' | null = null;
  
  const settingsMap = await getCachedSettings();
  
  const currencyOptions = {
    currencySymbol: settingsMap.currencySymbol || defaultCurrencyOptions.currencySymbol,
    currencyPosition: (settingsMap.currencyPosition as any) || defaultCurrencyOptions.currencyPosition,
    thousandSeparator: settingsMap.thousandSeparator !== undefined ? settingsMap.thousandSeparator : defaultCurrencyOptions.thousandSeparator,
    decimalSeparator: settingsMap.decimalSeparator || defaultCurrencyOptions.decimalSeparator,
    taxIncludedInPrice: settingsMap.TAX_INCLUDED_IN_PRICE === 'true',
    defaultVatRate: Number(settingsMap.DEFAULT_VAT_RATE) || 20,
  };
  const contactSlug = settingsMap.CONTACT_SLUG || 'kontakt';
  const defaultMenuLinks = [
    { label: 'Startseite', url: '/' },
    { label: 'Shop', url: '/shop' },
    { label: 'Kontakt', url: `/${contactSlug}` },
    { label: 'Rückgabe & Erstattung', url: '/rueckgabe-und-erstattung' },
  ];

  let menuLinks = defaultMenuLinks;
  try {
    if (settingsMap.HEADER_MENU_LINKS) {
      menuLinks = JSON.parse(settingsMap.HEADER_MENU_LINKS);
    }
  } catch (e) {
    console.error("Erreur parsing HEADER_MENU_LINKS", e);
  }
  
  const defaultFooterColumns = [
    { title: 'Kundenservice', links: [{ label: 'Kontakt', url: `/${contactSlug}` }, { label: 'Rückgabe & Erstattung', url: '/rueckgabe-und-erstattung' }] },
    { title: 'Mein Konto', links: [{ label: 'Shop', url: '/shop' }, { label: 'Warenkorb', url: '/cart' }] }
  ];
  let footerColumns = defaultFooterColumns;
  try {
    if (settingsMap.FOOTER_COLUMNS) {
      footerColumns = JSON.parse(settingsMap.FOOTER_COLUMNS);
    }
  } catch (e) {}

  const defaultTopBarLinks = [
    { label: 'Bestellung verfolgen', icon: 'truck', url: '/order-tracking' },
  ];
  let topBarLinks = defaultTopBarLinks;
  try {
    if (settingsMap.TOP_BAR_LINKS) {
      topBarLinks = JSON.parse(settingsMap.TOP_BAR_LINKS);
    }
  } catch (e) {}

  // Remove Store location and ensure Order Tracking is in German
  topBarLinks = (topBarLinks || [])
    .filter((link: any) => !link.label?.toLowerCase().includes('store') && !link.url?.includes('store-locator'))
    .map((link: any) => {
      if (link.label?.toLowerCase().includes('order') || link.label?.toLowerCase().includes('track') || link.url?.includes('order-tracking') || link.label?.toLowerCase().includes('rastrear')) {
        return { ...link, label: 'Bestellung verfolgen' };
      }
      return link;
    });

  const { newCount: newProductsCount, hotCount: hotProductsCount, saleCount: saleProductsCount } = await getCachedProductCounts();

  const storeSettings = {
    announcement: settingsMap.HEADER_ANNOUNCEMENT_TEXT || settingsMap.HEADER_ANNOUNCEMENT || 'Willkommen bei HLG Hausgeräte • Kostenloser Versand ab 200 € • 2 Jahre Garantie',
    logoImage: settingsMap.HEADER_LOGO_IMAGE && settingsMap.HEADER_LOGO_IMAGE !== '/logo.png' && settingsMap.HEADER_LOGO_IMAGE !== '/logo.jpg' ? settingsMap.HEADER_LOGO_IMAGE : '/LOGO-HLG-HAUSGERAETE.png',
    supportPhone: settingsMap.FOOTER_SUPPORT_PHONE ?? settingsMap.HEADER_SUPPORT_PHONE ?? '0800 123 4567',
    supportEmail: settingsMap.FOOTER_SUPPORT_EMAIL ?? settingsMap.HEADER_SUPPORT_EMAIL ?? 'info@hlg-hausgeraete.de',
    menuLinks: menuLinks,
    topBarLinks: topBarLinks,
    loginText: settingsMap.LOGIN_TEXT || 'Anmelden',
    myAccountText: settingsMap.MY_ACCOUNT_TEXT || 'Mein Konto',
    adminDashboardText: settingsMap.ADMIN_DASHBOARD_TEXT || 'Admin-Dashboard',
    topBarBgColor: settingsMap.TOP_BAR_BG_COLOR || '#ffffff',
    topBarTextColor: settingsMap.TOP_BAR_TEXT_COLOR || '#4b5563',
    footerBgColor: settingsMap.FOOTER_BG_COLOR || '#0f172a',
    footerTextColor: settingsMap.FOOTER_TEXT_COLOR || '#d1d5db',
    footerHeadingColor: settingsMap.FOOTER_HEADING_COLOR || '#ffffff',
    footerAddress1: settingsMap.FOOTER_ADDRESS_1 ?? 'Deutschland',
    footerAddress2: settingsMap.FOOTER_ADDRESS_2 ?? 'Zuverlässige Lieferung direkt zu Ihnen nach Hause',
    footerLocationsTitle: settingsMap.FOOTER_LOCATIONS_TITLE || 'Liefergebiet',
    footerNewsletterTitle: settingsMap.FOOTER_NEWSLETTER_TITLE || 'HLG Hausgeräte Newsletter',
    footerNewsletterText: settingsMap.FOOTER_NEWSLETTER_TEXT || 'Abonnieren Sie unseren Newsletter für exklusive Angebote und Gutscheine.',
    footerNewsletterPlaceholder: settingsMap.FOOTER_NEWSLETTER_PLACEHOLDER || 'Ihre E-Mail-Adresse...',
    footerCallUsText: settingsMap.FOOTER_CALL_US_TEXT || 'Kundenservice',
    footerCopyright: settingsMap.FOOTER_COPYRIGHT || `© 2026 ${storeName}. Alle Rechte vorbehalten.`,
    footerSocialFacebook: settingsMap.FOOTER_SOCIAL_FACEBOOK || '#',
    footerSocialTwitter: settingsMap.FOOTER_SOCIAL_TWITTER || '#',
    footerSocialInstagram: settingsMap.FOOTER_SOCIAL_INSTAGRAM || '#',
    footerSocialLinkedin: settingsMap.FOOTER_SOCIAL_LINKEDIN || '#',
    footerColumns: footerColumns,
    footerLogoImage: settingsMap.FOOTER_LOGO_IMAGE || '/LOGO-HLG-HAUSGERAETE.png',
    footerDescription: settingsMap.FOOTER_DESCRIPTION || 'HLG Hausgeräte ist Ihr zuverlässiger Fachhändler für moderne Haushaltsgeräte. Entdecken Sie erstklassige Waschmaschinen, Geschirrspüler, Herde, Kaffeemaschinen und Kühlgeräte führender Marken zu Spitzenpreisen.',
    footerShowAddress: settingsMap.FOOTER_SHOW_ADDRESS !== 'false',
    footerShowEmail: settingsMap.FOOTER_SHOW_EMAIL !== 'false',
    footerShowPhone: settingsMap.FOOTER_SHOW_PHONE !== 'false',
    footerPaymentAmex: settingsMap.FOOTER_PAYMENT_AMEX !== 'false',
    footerPaymentApplePay: settingsMap.FOOTER_PAYMENT_APPLE_PAY !== 'false',
    footerPaymentGooglePay: settingsMap.FOOTER_PAYMENT_GOOGLE_PAY !== 'false',
    footerPaymentMastercard: settingsMap.FOOTER_PAYMENT_MASTERCARD !== 'false',
    footerPaymentVisa: settingsMap.FOOTER_PAYMENT_VISA !== 'false',
    footerPaymentOpay: settingsMap.FOOTER_PAYMENT_OPAY !== 'false',
    categories: await getCachedCategoriesTree(),
    maintenanceMode: settingsMap.MAINTENANCE_MODE === 'true',
    maintenanceTitle: settingsMap.MAINTENANCE_TITLE || 'Geschäft in Wartung',
    maintenanceMessage: settingsMap.MAINTENANCE_MESSAGE || 'Wir aktualisieren derzeit unseren Katalog. Wir sind in Kürze wieder für Sie da!',
    maintenanceImage: settingsMap.MAINTENANCE_IMAGE || '',
    searchBorderColor: settingsMap.SEARCH_BORDER_COLOR || '#d1d5db',
    searchPlaceholder: settingsMap.SEARCH_PLACEHOLDER || 'Produkt suchen .....',
    searchBtnText: settingsMap.SEARCH_BTN_TEXT || 'Suchen',
    searchBtnBgColor: settingsMap.SEARCH_BTN_BG_COLOR || '#f59e0b',
    searchBtnTextColor: settingsMap.SEARCH_BTN_TEXT_COLOR || '#111827',
    showNew: newProductsCount > 0,
    showHot: hotProductsCount >= 3,
    showSale: saleProductsCount > 0,
    mobileAboutTitle: settingsMap.MOBILE_ABOUT_TITLE || 'HLG Hausgeräte',
    mobileAboutDesc: settingsMap.MOBILE_ABOUT_DESC || 'Ihre hochwertigen Haushaltsgeräte zu den besten Preisen!',
    mobileMenuLinks: (() => {
      try {
        return settingsMap.MOBILE_MENU_LINKS ? JSON.parse(settingsMap.MOBILE_MENU_LINKS) : menuLinks;
      } catch {
        return menuLinks;
      }
    })(),
    mobileContactAddress: (
      (settingsMap.MOBILE_CONTACT_ADDRESS && !settingsMap.MOBILE_CONTACT_ADDRESS.includes('123 Main'))
        ? settingsMap.MOBILE_CONTACT_ADDRESS.trim()
        : (settingsMap.FOOTER_ADDRESS_1?.trim() || settingsMap.CONTACT_ADDRESS?.trim() || '')
    ),
    mobileContactPhone: (
      (settingsMap.MOBILE_CONTACT_PHONE && !settingsMap.MOBILE_CONTACT_PHONE.includes('123 456') && !settingsMap.MOBILE_CONTACT_PHONE.includes('253 000'))
        ? settingsMap.MOBILE_CONTACT_PHONE.trim()
        : (settingsMap.FOOTER_SUPPORT_PHONE?.trim() || settingsMap.HEADER_SUPPORT_PHONE?.trim() || settingsMap.CONTACT_PHONE?.trim() || '')
    ),
    mobileContactEmail: (
      (settingsMap.MOBILE_CONTACT_EMAIL && !settingsMap.MOBILE_CONTACT_EMAIL.includes('example.com'))
        ? settingsMap.MOBILE_CONTACT_EMAIL.trim()
        : (settingsMap.FOOTER_SUPPORT_EMAIL?.trim() || settingsMap.HEADER_SUPPORT_EMAIL?.trim() || settingsMap.CONTACT_EMAIL_DISPLAY?.trim() || '')
    ),
    mobileContactWebsite: settingsMap.MOBILE_CONTACT_WEBSITE && !settingsMap.MOBILE_CONTACT_WEBSITE.includes('example.com')
      ? settingsMap.MOBILE_CONTACT_WEBSITE
      : '',
    mobileHeaderBorderColor: settingsMap.MOBILE_HEADER_BORDER_COLOR || '#d1d5db',
    allCategoriesBgColor: settingsMap.ALL_CATEGORIES_BG_COLOR || '#111827', // text-gray-900 by default
    allCategoriesTextColor: settingsMap.ALL_CATEGORIES_TEXT_COLOR || '#ffffff', // text-white
    contactSlug: contactSlug,
  };

  const rawFont = settingsMap.GLOBAL_FONT_FAMILY || 'Inter';
  const globalFont = /^[A-Za-z0-9 \-]{1,50}$/.test(rawFont) ? rawFont : 'Inter';
  const fontUrl = `https://fonts.googleapis.com/css2?family=${globalFont.replace(/ /g, '+')}:wght@300;400;500;600;700;800&display=swap`;

  return (
    <html
      lang={locale}
      className={`${inter.variable} h-full antialiased`}
    >
      <head>
        <link rel="alternate" type="application/rss+xml" title={`${storeName} - Blog RSS`} href="/rss.xml" />
        {settingsMap.FAVICON_IMAGE && (
          <>
            <link rel="icon" href={settingsMap.FAVICON_IMAGE} />
            <link rel="shortcut icon" href={settingsMap.FAVICON_IMAGE} />
            <link rel="apple-touch-icon" href={settingsMap.FAVICON_IMAGE} />
          </>
        )}
        {globalFont !== 'Inter' && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link href={fontUrl} rel="stylesheet" />
            <style>{`
              :root {
                --font-inter: '${globalFont}', sans-serif;
              }
              body, .font-sans {
                font-family: '${globalFont}', sans-serif !important;
              }
            `}</style>
          </>
        )}
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": storeName,
              "image": settingsMap.HEADER_LOGO_IMAGE || '/logo.jpg',
              "url": SITE_URL,
              "telephone": settingsMap.FOOTER_SUPPORT_PHONE ?? settingsMap.HEADER_SUPPORT_PHONE,
              "email": settingsMap.FOOTER_SUPPORT_EMAIL ?? settingsMap.HEADER_SUPPORT_EMAIL,
              "address": {
                "@type": "PostalAddress",
                "streetAddress": settingsMap.FOOTER_ADDRESS_1 || 'Borseler Chaussee 123',
                "addressCountry": settingsMap.STORE_COUNTRY || "DE",
                "addressLocality": "Hamburg"
              },
              "description": "HLG Hausgeräte - Ihr Fachhändler für Haushaltsgeräte, Küchenmaschinen, Kaffeemaschinen und Unterhaltungselektronik."
            })
          }}
        />
        <ThemeProvider themeColor={settingsMap.THEME_COLOR || '#107b46'} />
        <ZoomController />
        <NextIntlClientProvider messages={messages} locale={locale}>
          <PostHogProvider>
            <CurrencyProvider options={currencyOptions}>
              <StoreLayout settings={storeSettings} userRole={userRole}>
                <Toaster position="bottom-right" />
                {children}
                <DeferredWidgets 
                  chatEnabled={settingsMap.CHAT_ENABLED !== 'false'} 
                  chatStoreName={settingsMap.CHAT_STORE_NAME || settingsMap.STORE_NAME || 'HLG Hausgeräte'} 
                  chatStoreIcon={settingsMap.CHAT_STORE_ICON || settingsMap.HEADER_LOGO_IMAGE || settingsMap.FAVICON_IMAGE || '/LOGO-HLG-HAUSGERAETE.png'} 
                />
              </StoreLayout>
            </CurrencyProvider>
          </PostHogProvider>
        </NextIntlClientProvider>
        <GoogleAnalytics gaId={settingsMap.GOOGLE_ANALYTICS_ID} />
      </body>
    </html>
  );
}
