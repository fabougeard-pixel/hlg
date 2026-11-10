'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWishlistStore } from '@/store/wishlistStore';
import Price from '@/components/Price';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { getProductsByIds } from '@/actions/public';

type WishlistDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function WishlistDrawer({ isOpen, onClose }: WishlistDrawerProps) {
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { items, toggleItem, setIsOpen } = useWishlistStore();
  const t = useTranslations('Wishlist'); // we reuse the Wishlist namespace

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch products when drawer opens or items change
  useEffect(() => {
    async function loadWishlist() {
      if (items.length === 0) {
        setProducts([]);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const fetchedProducts = await getProductsByIds(items);
        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Erreur lors du chargement des favoris', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    if (isOpen) {
      loadWishlist();
    }
  }, [items, isOpen]);

  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/50 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 z-[101] w-full sm:w-[400px] h-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center">
            <div className="relative mr-2">
              <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="absolute -top-1 -right-2 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                {items.length}
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">{t('title') || 'My Favorites'}</h2>
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={onClose}
              aria-label={t('close') || "Close"}
              className="p-1 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 gap-4">
              <svg className="w-16 h-16 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              <p>{t('empty') || 'Your wishlist is currently empty.'}</p>
              <button 
                onClick={onClose}
                className="mt-4 px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition"
              >
                {t('continue_shopping') || 'Continue Shopping'}
              </button>
            </div>
          ) : (
            <>
              {isLoading && products.length === 0 ? (
                <div className="flex justify-center items-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
                </div>
              ) : (
                products.map((item) => (
                  <div key={item.id} className="flex gap-4 p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                    <div className="w-20 h-20 bg-gray-50 rounded-md overflow-hidden flex-shrink-0 relative">
                      {item.images && item.images[0] ? (
                        <Image src={item.images[0]} alt={item.title} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-2">
                        <Link href={`/produkt/${item.slug}`} onClick={onClose} className="font-semibold text-gray-900 truncate hover:text-orange-700">
                          {item.title}
                        </Link>
                        <button 
                          onClick={() => toggleItem(item.id)}
                          className="text-gray-500 hover:text-red-500 p-1 flex-shrink-0"
                          title="Remove"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                      <div className="font-bold text-gray-900">
                        <Price amount={item.price} />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        {items.length > 0 && (
          <div className="p-4 border-t border-gray-100 bg-gray-50 flex flex-col gap-3">
            <Link 
              href="/wishlist" 
              onClick={onClose}
              className="w-full block text-center bg-gray-900 text-white py-3 rounded-md font-bold hover:bg-gray-800 transition"
            >
              {t('title') || 'View Full Wishlist'}
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
