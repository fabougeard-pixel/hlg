import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPageBySlug } from '@/actions/pages';
import SafeHTML from '@/components/SafeHTML';
import { getContactSettings } from '@/actions/contactSettings';
import ContactPageContent from '@/components/contact/ContactPageContent';
import ShopPage from '@/app/shop/page';
import prisma from '@/lib/prisma';
import { SITE_URL } from '@/lib/site';
import { getCategoryByPathSegments, getCategoryCanonicalPath } from '@/lib/categories';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

const isUuid = (str: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);

const LEGAL_NAV = [
  { slug: 'devolucoes', label: 'Devoluções & Reembolso', icon: '🔄' },
  { slug: 'termos-e-condicoes', label: 'Termos & Condições', icon: '📜' },
  { slug: 'privacidade', label: 'Privacidade', icon: '🔒' },
  { slug: 'expedicao', label: 'Expedição & Entrega', icon: '🚚' },
  { slug: 'politica-de-garantia', label: 'Garantia', icon: '🛡️' },
  { slug: 'politica-de-faturacao', label: 'Faturação', icon: '🧾' },
];

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || "HLG Hausgeräte";

  if (!slug || slug.length === 0) {
    return { title: `Página não encontrada - ${storeName}` };
  }

  // 1. Single-segment: Check Contact and CMS Pages first
  if (slug.length === 1) {
    const singleSlug = slug[0];

    const contactSettings = await getContactSettings();
    if (singleSlug === contactSettings.slug) {
      return { title: contactSettings.title };
    }

    const { data: page } = await getPageBySlug(singleSlug);
    if (page && page.isPublished) {
      return {
        title: page.metaTitle ? page.metaTitle : `${page.title} - ${storeName}`,
        description: page.metaDescription || undefined,
        keywords: page.metaKeywords || undefined,
        openGraph: {
          title: page.metaTitle || page.title,
          description: page.metaDescription || undefined,
          url: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/${page.slug}`,
          siteName: storeName,
          type: 'website',
        }
      };
    }
  }

  // 2. Category matching (supports root categories, subcategories, sub-subcategories)
  const category = await getCategoryByPathSegments(slug);
  if (category) {
    const canonicalPath = await getCategoryCanonicalPath(category);
    return {
      title: category.metaTitle ? category.metaTitle : `${category.name} | ${storeName}`,
      description: category.metaDescription || `Compre produtos de ${category.name} com os melhores preços e entrega rápida na Lenha & Carvão Silva Dias.`,
      keywords: category.metaKeywords || undefined,
      alternates: {
        canonical: canonicalPath,
      },
      openGraph: {
        title: category.metaTitle || `${category.name} | ${storeName}`,
        description: category.metaDescription || `Compre produtos de ${category.name} na Lenha & Carvão Silva Dias.`,
        url: `${SITE_URL}${canonicalPath}`,
        siteName: storeName,
        type: 'website',
      }
    };
  }

  return {
    title: `Página não encontrada - ${storeName}`,
  };
}

export default async function CatchAllPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  if (!slug || slug.length === 0) {
    notFound();
  }

  // 1. Single-segment: Check Contact and CMS Pages
  if (slug.length === 1) {
    const singleSlug = slug[0];

    const contactSettings = await getContactSettings();
    if (singleSlug === contactSettings.slug) {
      return <ContactPageContent />;
    }

    const { data: page, success } = await getPageBySlug(singleSlug);
    if (success && page && page.isPublished) {
      const currentSlug = singleSlug;
      const isLegalSlug = LEGAL_NAV.some(item =>
        item.slug === currentSlug ||
        (currentSlug.startsWith('politica-de-') && item.slug.includes(currentSlug.replace('politica-de-', '')))
      ) || ['condicoes-gerais-de-venda', 'notas-legais'].includes(currentSlug);

      return (
        <div className="min-h-screen bg-stone-50/60 flex flex-col py-8 sm:py-12">
          <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-xs text-stone-500 mb-6 font-medium overflow-x-auto whitespace-nowrap">
              <Link href="/" className="hover:text-red-600 transition-colors">Início</Link>
              <span>/</span>
              {isLegalSlug && (
                <>
                  <span className="text-stone-600">Políticas Legais</span>
                  <span>/</span>
                </>
              )}
              <span className="text-stone-900 font-bold">{page.title}</span>
            </nav>

            {/* Hero Header Card */}
            <div className="bg-gradient-to-r from-stone-900 via-stone-900 to-stone-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-stone-800 mb-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 max-w-4xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/30 text-red-400 font-bold text-xs uppercase tracking-wider mb-4">
                  <span>{isLegalSlug ? '⚖️' : '📄'}</span>
                  <span>{isLegalSlug ? 'Rechtliche Informationen & Transparenz' : 'Offizielle Informationen'}</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
                  {page.title}
                </h1>
                <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
                  HLG Hausgeräte • Borseler Chaussee 123, 22453 Hamburg, Deutschland • Zuverlässige Lieferung &amp; Kundenservice.
                </p>
              </div>
            </div>

            {/* Legal Quick Nav Bar */}
            {isLegalSlug && (
              <div className="mb-8">
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                  {LEGAL_NAV.map((item) => {
                    const isActive = currentSlug === item.slug ||
                      (currentSlug === 'politica-de-devolucao-e-reembolso' && item.slug === 'devolucoes') ||
                      (currentSlug === 'condicoes-gerais-de-venda' && item.slug === 'termos-e-condicoes') ||
                      (currentSlug === 'politica-de-privacidade' && item.slug === 'privacidade') ||
                      (currentSlug === 'politica-de-expedicao' && item.slug === 'expedicao') ||
                      (currentSlug === 'politica-de-garantia-2' && item.slug === 'politica-de-garantia') ||
                      (currentSlug === 'faturacao' && item.slug === 'politica-de-faturacao');

                    return (
                      <Link
                        key={item.slug}
                        href={`/${item.slug}`}
                        className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-xs font-bold whitespace-nowrap transition-all shadow-xs ${
                          isActive
                            ? 'bg-red-600 text-white shadow-red-600/30 ring-2 ring-red-400/50'
                            : 'bg-white text-stone-700 hover:bg-stone-100 hover:text-stone-900 border border-stone-200/90'
                        }`}
                      >
                        <span className="text-sm sm:text-base">{item.icon}</span>
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Main Content Container */}
            <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-10 mb-10">
              <SafeHTML
                html={page.desktopContent || ''}
                className="hidden md:block w-full prose max-w-none text-stone-700 prose-headings:text-stone-900 prose-headings:font-bold prose-strong:text-stone-900 prose-a:text-red-600 hover:prose-a:underline"
              />
              <SafeHTML
                html={page.mobileContent || (page.desktopContent || '')}
                className="block md:hidden w-full prose max-w-none text-stone-700 prose-headings:text-stone-900 prose-headings:font-bold prose-strong:text-stone-900 prose-a:text-red-600 hover:prose-a:underline"
              />
            </div>

            {/* Support & Legal Assistance Card */}
            <div className="bg-gradient-to-r from-stone-900 via-stone-900 to-stone-950 rounded-3xl p-6 sm:p-8 text-white border border-stone-800 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center lg:text-left flex-1">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-400">
                  <span>💬</span> Apoio ao Cliente & Faturação
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  Dúvidas sobre Devoluções, Garantias ou Faturas?
                </h3>
                <p className="text-stone-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
                  Unser Kundenservice steht Ihnen bei allen Fragen zu Lieferungen, Rückgaben und Garantien zur Seite.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto shrink-0">
                <a
                  href="mailto:info@hlg-hausgeraete.de"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#107b46] hover:bg-[#0d693b] text-white font-bold text-sm whitespace-nowrap shadow-lg shadow-emerald-900/30 transition-all flex items-center justify-center gap-2.5 shrink-0"
                >
                  <svg className="w-4 h-4 shrink-0 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>E-Mail senden</span>
                </a>
                <Link
                  href="/kontakt"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-semibold text-sm whitespace-nowrap border border-stone-700 transition-all flex items-center justify-center gap-2.5 shrink-0"
                >
                  <svg className="w-4 h-4 shrink-0 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>Kontaktseite</span>
                </Link>
              </div>
            </div>

            {/* Bottom Copyright */}
            <div className="mt-8 pt-6 border-t border-stone-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500 text-center sm:text-left">
              <div>
                <span>© {new Date().getFullYear()} HLG Hausgeräte. Alle Rechte vorbehalten.</span>
              </div>
              <div className="flex items-center gap-4">
                <a
                  href="https://www.livroreclamacoes.pt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-stone-700 hover:text-red-600 font-semibold transition-colors"
                >
                  <span>Livro de Reclamações Online</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>

          </main>
        </div>
      );
    }
  }

  // 2. Category matching (e.g. /combustiveis, /combustiveis/lenha-e-pellets)
  const category = await getCategoryByPathSegments(slug);
  if (category) {
    const resolvedSearchParams = await searchParams;
    const activeCategory = resolvedSearchParams.category !== undefined 
      ? resolvedSearchParams.category 
      : (category.slug || category.id);

    const newSearchParams = Promise.resolve({
      ...resolvedSearchParams,
      category: activeCategory
    });

    return <ShopPage searchParams={newSearchParams} />;
  }

  // 3. Fallback: Page not found
  notFound();
}
