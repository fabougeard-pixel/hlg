'use client';
import React, { useState } from 'react';
import Image from 'next/image';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import QuickViewModal from '@/components/product/QuickViewModal';
import { useTranslations } from 'next-intl';
import Price from '@/components/Price';

const Star = ({ filled = true }: { filled?: boolean }) => (
  <svg
    className={`w-4 h-4 ${filled ? 'text-orange-600' : 'text-gray-300'}`}
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

export default function BestDealsCard({
  product,
  borderColor,
  btnBgColor,
  btnTextColor,
  btnHoverBgColor,
  btnHoverTextColor
}: {
  product: any;
  borderColor: string;
  btnBgColor: string;
  btnTextColor: string;
  btnHoverBgColor?: string;
  btnHoverTextColor?: string;
}) {
  const router = useRouter();
  const cartStore = useCartStore();
  const wishlistStore = useWishlistStore();
  const t = useTranslations('Home');
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const isWishlisted = wishlistStore.hasItem(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    cartStore.addItem({
      id: product.id,
      productId: product.id,
      title: product.title,
      price: product.rawPrice || 0,
      image: product.imageUrl || '',
      quantity: 1,
    });
    cartStore.setIsOpen(true);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const wasWishlisted = wishlistStore.hasItem(product.id);
    wishlistStore.toggleItem(product.id);
    if (!wasWishlisted) {
      wishlistStore.setIsOpen(true);
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickViewOpen(true);
  };

  return (
    <>
      <div
        onClick={() => router.push(`/produto/${product.slug || product.id}`)}
        className="flex-none w-[250px] md:w-[300px] p-5 flex flex-col group/card cursor-pointer hover:shadow-lg transition bg-white border rounded-lg snap-start relative"
        style={{ borderColor }}
      >
        {/* Product Image Area */}
        <div className="relative h-48 w-full bg-white mb-4 flex items-center justify-center overflow-hidden">
          {product.discount && (
            <span className="absolute top-0 left-0 bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded z-10">
              {product.discount}
            </span>
          )}

          {/* Image or Placeholder */}
          {product.imageUrl ? (
            <Image src={product.imageUrl} alt={product.title} title={product.title} width={600} height={600} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 250px" className="w-full h-full object-contain group-hover/card:scale-105 transition duration-500" />
          ) : (
            <div className="text-7xl group-hover/card:scale-110 transition duration-500">
              {product.imagePlaceholder}
            </div>
          )}

          {/* Action Icons: Wishlist, Quickview */}
          <div className="absolute top-2.5 right-2.5 flex flex-col items-center justify-center gap-1.5 z-20">
            <button
              type="button"
              onClick={handleToggleWishlist}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-md cursor-pointer ${isWishlisted
                  ? 'bg-red-600 text-white shadow-red-500/30 ring-2 ring-red-400'
                  : 'bg-white/95 text-stone-700 hover:bg-red-600 hover:text-white border border-stone-200/80 hover:border-red-600'
                }`}
              title={isWishlisted ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
              aria-label="Wishlist"
            >
              <svg className="w-4 h-4" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleQuickView}
              className="w-8 h-8 rounded-full bg-white/95 text-stone-700 hover:bg-red-600 hover:text-white border border-stone-200/80 hover:border-red-600 flex items-center justify-center transition-all shadow-md cursor-pointer"
              title="Vista Rápida"
              aria-label="Quick View"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="mt-auto">
          <div className="text-xs text-gray-500 mb-1 z-20 relative">
            {product.categories && product.categories.length > 0 ? (
              product.categories.map((c: any, idx: number) => (
                <React.Fragment key={c.slug || c.id || idx}>
                  <Link
                    href={`/product-category/${c.slug || c.id}`}
                    className="hover:text-orange-600 hover:underline transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {c.name}
                  </Link>
                  {idx < product.categories.length - 1 && <span className="text-gray-400">, </span>}
                </React.Fragment>
              ))
            ) : product.categorySlug ? (
              <Link
                href={`/product-category/${product.categorySlug}`}
                className="hover:text-orange-600 hover:underline transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {product.category}
              </Link>
            ) : (
              <span>{product.category}</span>
            )}
          </div>
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2 transition" title={product.title}>
            <Link href={`/produto/${product.slug || product.id}`} className="hover:text-orange-600" onClick={(e) => e.stopPropagation()}>
              {product.title}
            </Link>
          </h3>

          {/* Rating */}
          {product.ratingText && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} filled={i < product.rating} />
                ))}
              </div>
              <span className="text-xs text-gray-500 font-medium">
                {product.ratingText}
              </span>
            </div>
          )}
          <p className="font-bold text-gray-900">
            {product.rawPrice ? <Price amount={product.rawPrice} showTax={false} /> : product.price}
          </p>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        product={{ ...product, price: product.rawPrice || 0, images: product.imageUrl ? [product.imageUrl] : [] }}
      />
    </>
  );
}
