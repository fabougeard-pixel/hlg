'use client';

import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useCurrency } from '@/components/CurrencyProvider';
import { validateCoupon } from '@/actions/checkout';
import Image from 'next/image';
import {
  DEFAULT_GERMANY_FREE_SHIPPING_THRESHOLD,
  findShippingZoneForCountry,
  getLocalizedShippingMethodLabel,
  getRemainingForShippingMethod,
  getZoneFreeShippingMethod,
  isShippingMethodEligible,
  resolveEffectiveShippingMethodId,
  type ShippingZoneLike,
} from '@/lib/shipping';

export interface CartShippingZone extends ShippingZoneLike {
  id: string;
  name: string;
  isActive: boolean;
  methods: Array<{
    id: string;
    type: string;
    rate: number;
    minOrderAmount: number | null;
    isActive: boolean;
  }>;
}

const emptySubscribe = () => () => {};

export default function CartClient({ zones }: { zones: CartShippingZone[] }) {
  const router = useRouter();
  const {
    items,
    removeItem,
    updateQuantity,
    getTotalPrice,
    coupon,
    setCoupon,
    customShipping,
    setCustomShipping,
  } = useCartStore();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [showCountrySelector, setShowCountrySelector] = useState(false);

  const t = useTranslations('Cart');
  const tCountries = useTranslations('Countries');
  const locale = useLocale();
  const { formatPrice } = useCurrency();

  const initialZone = findShippingZoneForCountry(zones, customShipping?.zoneName || 'Germany');
  const [selectedZoneName, setSelectedZoneName] = useState(initialZone?.name || '');

  const subtotal = getTotalPrice();
  const activeZone = findShippingZoneForCountry(zones, selectedZoneName || 'Germany');
  const activeMethods = activeZone?.methods || [];

  const [shippingMethodId, setShippingMethodId] = useState<string>('');
  const customMethodId = customShipping?.methodId;
  const effectiveShippingMethodId = resolveEffectiveShippingMethodId(
    activeMethods,
    shippingMethodId,
    customMethodId,
    subtotal
  );

  if (!mounted) return null;

  let discountAmount = 0;
  if (coupon) {
    if (coupon.type === 'PERCENTAGE') {
      discountAmount = subtotal * (coupon.value / 100);
    } else {
      discountAmount = coupon.value;
    }
  }

  const selectedMethod = activeMethods.find((m) => m.id === effectiveShippingMethodId);
  const selectedMethodEligible = selectedMethod ? isShippingMethodEligible(selectedMethod, subtotal) : false;
  const freeMethod = getZoneFreeShippingMethod(activeZone);
  const showFreeShippingBanner =
    items.length > 0 &&
    (freeMethod != null || zones.length === 0);
  const remainingForFreeShipping = freeMethod
    ? getRemainingForShippingMethod(freeMethod, subtotal)
    : Math.max(0, Math.round((DEFAULT_GERMANY_FREE_SHIPPING_THRESHOLD - subtotal) * 100) / 100);

  const shippingCost =
    items.length > 0 && selectedMethod && selectedMethodEligible ? selectedMethod.rate : 0;

  const total = Math.max(0, subtotal - discountAmount) + shippingCost;

  const handleApplyCoupon = async () => {
    setCouponError('');
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    const res = await validateCoupon(couponCode.trim());
    if (res.error) {
      setCouponError(res.error);
      setCoupon(null);
    } else if (res.coupon) {
      setCoupon(res.coupon as { code: string; type: 'PERCENTAGE' | 'FIXED_AMOUNT'; value: number });
      setCouponCode('');
    }
    setIsApplyingCoupon(false);
  };

  const handleProceedToCheckout = () => {
    if (activeZone && selectedMethod && selectedMethodEligible) {
      setCustomShipping({
        methodId: selectedMethod.id,
        zoneName: activeZone.name,
        rate: selectedMethod.rate,
        label: selectedMethod.type,
        district: activeZone.name,
      });
    } else {
      setCustomShipping(null);
    }
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Left Column: Cart Items or Empty State */}
          <div className="flex-grow">
            {items.length === 0 ? (
              <div className="space-y-4">
                <div className="bg-gray-50 border-t-2 border-blue-500 p-4 flex items-center text-gray-700 text-sm">
                  <svg className="w-5 h-5 text-blue-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {t('empty_cart')}
                </div>
                <Link
                  href="/"
                  className="inline-block bg-[#ff4500] hover:bg-[#e03e00] text-white font-medium px-6 py-2.5 rounded transition"
                >
                  {t('back_to_shop')}
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Desktop Table Header */}
                <div className="hidden md:grid grid-cols-12 gap-4 pb-3 border-b border-gray-200 text-sm font-bold text-gray-800">
                  <div className="col-span-1 text-center">{t('remove')}</div>
                  <div className="col-span-2 text-center">{t('image')}</div>
                  <div className="col-span-4">{t('product_title')}</div>
                  <div className="col-span-2 text-center">{t('price')}</div>
                  <div className="col-span-2 text-center">{t('quantity')}</div>
                  <div className="col-span-1 text-right">{t('total')}</div>
                </div>

                {/* Cart Items */}
                <div className="divide-y divide-gray-200 border-b border-gray-200">
                  {items.map((item) => (
                    <div
                      key={`${item.productId}-${item.variationId || ''}`}
                      className="py-4 flex flex-col md:grid md:grid-cols-12 gap-4 items-center"
                    >
                      {/* Remove Button */}
                      <div className="col-span-1 flex justify-center w-full md:w-auto mb-2 md:mb-0">
                        {!item.forcedByItemId && (
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-600 hover:text-red-800"
                            title={t('remove')}
                          >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        )}
                      </div>

                      {/* Image */}
                      <div className="col-span-2 flex justify-center">
                        <Link
                          href={`/produkt/${item.productId}`}
                          className="w-20 h-20 bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden"
                        >
                          {item.image ? (
                            <Image
                              width={800}
                              height={800}
                              src={item.image}
                              alt={item.title}
                              className="max-w-full max-h-full object-contain"
                            />
                          ) : (
                            <span className="text-xs text-gray-500">{t('image')}</span>
                          )}
                        </Link>
                      </div>

                      {/* Title */}
                      <div className="col-span-4 text-center md:text-left">
                        <Link
                          href={`/produkt/${item.productId}`}
                          className="text-gray-800 hover:text-[#ff4500] font-medium text-sm"
                        >
                          {item.title}
                        </Link>
                        {item.attributes && Object.keys(item.attributes).length > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            {Object.entries(item.attributes)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(', ')}
                          </div>
                        )}
                        {item.forcedByItemId && (
                          <div className="text-xs font-semibold text-orange-700 mt-1">
                            {t('force_sales_title')}
                          </div>
                        )}
                      </div>

                      {/* Price */}
                      <div className="col-span-2 text-center text-gray-700 text-sm">
                        {formatPrice(item.price)}
                      </div>

                      {/* Quantity */}
                      <div className="col-span-2 flex justify-center">
                        <div
                          className={`flex items-center border ${
                            item.forcedByItemId ? 'border-gray-200 opacity-50' : 'border-gray-300'
                          }`}
                        >
                          <button
                            onClick={() =>
                              !item.forcedByItemId &&
                              updateQuantity(item.id, Math.max(1, item.quantity - 1))
                            }
                            className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 transition bg-gray-50"
                            disabled={!!item.forcedByItemId}
                          >
                            -
                          </button>
                          <input
                            type="text"
                            readOnly
                            value={item.quantity}
                            className="w-10 py-1.5 text-center text-sm font-medium border-x border-gray-300 outline-none"
                          />
                          <button
                            onClick={() =>
                              !item.forcedByItemId && updateQuantity(item.id, item.quantity + 1)
                            }
                            className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 transition bg-gray-50"
                            disabled={!!item.forcedByItemId}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Total */}
                      <div className="col-span-1 text-center md:text-right text-gray-700 text-sm">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon Row */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-4">
                  <div className="w-full md:w-auto">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder={t('coupon_code')}
                        className="border border-gray-300 px-4 py-2 text-sm outline-none focus:border-gray-500 w-full sm:w-48 uppercase"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={isApplyingCoupon}
                        className="border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 transition w-full sm:w-auto whitespace-nowrap disabled:opacity-50"
                      >
                        {isApplyingCoupon ? '...' : t('apply_coupon')}
                      </button>
                    </div>
                    {couponError && <p className="text-xs text-red-600 mt-1">{couponError}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Order Summary */}
          <div className="w-full lg:w-[380px] flex-shrink-0">
            <div className="bg-[#f9f9f9] p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">{t('cart_total_title')}</h2>

              {showFreeShippingBanner && remainingForFreeShipping > 0 && (
                <div className="mb-4 p-3 rounded border border-emerald-200 bg-emerald-50 text-xs text-emerald-900">
                  Noch <strong>{formatPrice(remainingForFreeShipping)}</strong> bis zum kostenlosen
                  Versand!
                </div>
              )}

              {showFreeShippingBanner && remainingForFreeShipping === 0 && (
                <div className="mb-4 p-3 rounded border border-emerald-200 bg-emerald-50 text-xs text-emerald-800 font-medium">
                  Kostenloser Versand freigeschaltet!
                </div>
              )}

              <div className="border border-gray-200 bg-white mb-6 text-sm">
                {/* Subtotal */}
                <div className="flex justify-between items-center border-b border-gray-200 p-4 gap-4">
                  <div className="font-bold text-gray-800 break-words">{t('subtotal')}</div>
                  <div className="text-gray-700 whitespace-nowrap text-right">
                    {formatPrice(subtotal)}
                  </div>
                </div>

                {coupon && (
                  <div className="flex justify-between items-center border-b border-gray-200 p-4 gap-4 text-green-700">
                    <div className="font-medium flex items-center gap-2">
                      <span>{coupon.code}</span>
                      <button
                        type="button"
                        onClick={() => setCoupon(null)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        ×
                      </button>
                    </div>
                    <div className="whitespace-nowrap text-right font-medium">
                      -{formatPrice(discountAmount)}
                    </div>
                  </div>
                )}

                {/* Shipping Options */}
                {items.length > 0 && (
                  <div className="flex flex-col sm:flex-row border-b border-gray-200 p-4 gap-2">
                    <div className="sm:w-1/3 font-bold text-gray-800 pt-1">{t('shipping')}</div>
                    <div className="sm:w-2/3 space-y-2 text-gray-700">
                      {activeMethods.length === 0 ? (
                        <p className="text-xs text-gray-500">
                          Kostenloser Versand ab {formatPrice(DEFAULT_GERMANY_FREE_SHIPPING_THRESHOLD)}.
                        </p>
                      ) : (
                        activeMethods.map((method) => {
                          const eligible = isShippingMethodEligible(method, subtotal);
                          const label = getLocalizedShippingMethodLabel(method.type, locale);
                          return (
                            <label
                              key={method.id}
                              className={`flex items-start ${
                                eligible ? 'cursor-pointer' : 'cursor-not-allowed opacity-55'
                              }`}
                            >
                              <input
                                type="radio"
                                name="shipping"
                                value={method.id}
                                disabled={!eligible}
                                checked={effectiveShippingMethodId === method.id}
                                onChange={() => eligible && setShippingMethodId(method.id)}
                                className="mt-1 mr-2"
                              />
                              <span>
                                {label}
                                {method.minOrderAmount != null && method.minOrderAmount > 0 && (
                                  <span className="text-xs text-gray-500 ml-1">
                                    (ab {formatPrice(method.minOrderAmount)})
                                  </span>
                                )}
                                <br />
                                <span className="font-medium">
                                  {method.rate === 0 ? 'Kostenlos' : formatPrice(method.rate)}
                                </span>
                              </span>
                            </label>
                          );
                        })
                      )}

                      <p className="text-xs text-gray-500 mt-4 mb-2">
                        {activeZone
                          ? `${t('shipping_update_msg')} (${tCountries(activeZone.name) || activeZone.name})`
                          : t('shipping_update_msg')}
                      </p>

                      {zones.length > 1 && (
                        <div>
                          <button
                            type="button"
                            onClick={() => setShowCountrySelector(!showCountrySelector)}
                            className="text-gray-800 underline text-sm hover:text-gray-600"
                          >
                            {t('calculate_shipping')}
                          </button>

                          {showCountrySelector && (
                            <select
                              value={activeZone?.name || ''}
                              onChange={(e) => {
                                setSelectedZoneName(e.target.value);
                                setShippingMethodId('');
                              }}
                              className="mt-2 w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs bg-white"
                            >
                              {zones.map((z) => (
                                <option key={z.id} value={z.name}>
                                  {tCountries(z.name) || z.name}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Total */}
                <div className="flex justify-between p-4 bg-gray-50 items-center gap-4">
                  <div className="font-bold text-gray-800">{t('total')}</div>
                  <div className="text-lg font-bold text-gray-900 whitespace-nowrap text-right">
                    {formatPrice(total)}
                  </div>
                </div>
              </div>

              <button
                onClick={handleProceedToCheckout}
                disabled={items.length === 0}
                className="w-full bg-[#111] hover:bg-black text-white font-bold py-3.5 px-4 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('proceed_checkout')}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
