'use client';

import { useState } from 'react';
import Price from '@/components/Price';
import { 
  createShippingZone, updateShippingZone, deleteShippingZone,
  addShippingMethod, updateShippingMethod, deleteShippingMethod 
} from '@/actions/shipping';
import { COUNTRIES } from './countries';
import { useTranslations } from 'next-intl';
import {
  CANONICAL_SHIPPING_METHOD_TYPES,
  DEFAULT_GERMANY_FREE_SHIPPING_THRESHOLD,
  isFreeShippingMethod,
  isGermanyCountryName,
  isZeroRateShippingMethod,
  normalizeShippingMethodKind,
} from '@/lib/shipping';

export type ShippingMethod = {
  id: string;
  zoneId: string;
  type: string;
  rate: number;
  minOrderAmount: number | null;
  isActive: boolean;
};

export type ShippingZone = {
  id: string;
  name: string;
  isActive: boolean;
  methods: ShippingMethod[];
};

const METHOD_TYPES = [
  CANONICAL_SHIPPING_METHOD_TYPES.free,
  CANONICAL_SHIPPING_METHOD_TYPES.standard,
  CANONICAL_SHIPPING_METHOD_TYPES.express,
  CANONICAL_SHIPPING_METHOD_TYPES.collect,
];

export default function ShippingManager({ initialZones }: { initialZones: ShippingZone[] }) {
  const t = useTranslations('AdminShipping');
  const tCountries = useTranslations('Countries');
  const [zones, setZones] = useState<ShippingZone[]>(initialZones);
  
  // Zone State
  const [isAddingZone, setIsAddingZone] = useState(false);
  const [zoneName, setZoneName] = useState('');
  const [zoneIsActive, setZoneIsActive] = useState(true);
  
  // Method State
  const [addingMethodForZone, setAddingMethodForZone] = useState<string | null>(null);
  const [editingMethod, setEditingMethod] = useState<ShippingMethod | null>(null);
  const [methodType, setMethodType] = useState('Livraison standard');
  const [methodRate, setMethodRate] = useState<number | ''>('');
  const [methodMinAmount, setMethodMinAmount] = useState<number | ''>('');
  const [methodIsActive, setMethodIsActive] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // --- ZONES ---
  const handleSaveZone = async () => {
    if (!zoneName) return setError(t('error_country'));
    setLoading(true);
    setError('');
    
    const res = await createShippingZone({ name: zoneName, isActive: zoneIsActive });
    if (res.success && res.zone) {
      setZones([...zones, { ...res.zone, methods: [] }]);
      setIsAddingZone(false);
      setZoneName('');
      setZoneIsActive(true);
    } else {
      setError(res.error || t('error_create'));
    }
    setLoading(false);
  };

  const handleToggleZone = async (zone: ShippingZone) => {
    setLoading(true);
    const res = await updateShippingZone(zone.id, { isActive: !zone.isActive });
    if (res.success && res.zone) {
      setZones(zones.map(z => z.id === zone.id ? { ...z, isActive: res.zone.isActive } : z));
    }
    setLoading(false);
  };

  const handleDeleteZone = async (id: string) => {
    if (!confirm(t('confirm_delete_zone'))) return;
    setLoading(true);
    const res = await deleteShippingZone(id);
    if (res.success) {
      setZones(zones.filter(z => z.id !== id));
    }
    setLoading(false);
  };

  const getCanonicalOptionIfExactAlias = (rawType: string) => {
    const trimmed = rawType.trim().toLowerCase();
    if (trimmed === 'kostenlose lieferung' || trimmed === 'free shipping') {
      return CANONICAL_SHIPPING_METHOD_TYPES.free;
    }
    if (trimmed === 'standardlieferung' || trimmed === 'standard shipping') {
      return CANONICAL_SHIPPING_METHOD_TYPES.standard;
    }
    if (trimmed === 'express-lieferung' || trimmed === 'expresslieferung' || trimmed === 'express shipping') {
      return CANONICAL_SHIPPING_METHOD_TYPES.express;
    }
    if (trimmed === 'store-sammlung' || trimmed === 'abholung im geschäft' || trimmed === 'store pickup') {
      return CANONICAL_SHIPPING_METHOD_TYPES.collect;
    }
    return rawType;
  };

  const renderMethodLabel = (rawType: string) => {
    if (METHOD_TYPES.includes(rawType)) {
      const kind = normalizeShippingMethodKind(rawType);
      if (kind === 'free') return t('method_free');
      if (kind === 'standard') return t('method_standard');
      if (kind === 'express') return t('method_express');
      if (kind === 'collect') return t('method_collect');
    }
    return rawType;
  };

  // --- METHODS ---
  const resetMethodForm = () => {
    setAddingMethodForZone(null);
    setEditingMethod(null);
    setMethodType(CANONICAL_SHIPPING_METHOD_TYPES.standard);
    setMethodRate('');
    setMethodMinAmount('');
    setMethodIsActive(true);
    setError('');
  };

  const startEditMethod = (method: ShippingMethod) => {
    const mappedType = getCanonicalOptionIfExactAlias(method.type);
    setEditingMethod(method);
    setMethodType(mappedType);
    setMethodRate(isZeroRateShippingMethod(mappedType) ? 0 : method.rate);
    setMethodMinAmount(method.minOrderAmount ?? '');
    setMethodIsActive(method.isActive);
    setAddingMethodForZone(method.zoneId);
    setError('');
  };

  const handleSaveMethod = async () => {
    if (!methodType) return setError(t('error_type'));

    const isFree = isFreeShippingMethod(methodType);
    const isZeroRate = isZeroRateShippingMethod(methodType);
    const rateToSave = isZeroRate ? 0 : Number(methodRate);
    if (!isZeroRate && (methodRate === '' || Number.isNaN(Number(methodRate)))) {
      return setError(t('error_rate'));
    }

    const parsedMinAmount =
      isFree && methodMinAmount !== '' && Number.isFinite(Number(methodMinAmount)) && Number(methodMinAmount) > 0
        ? Number(methodMinAmount)
        : null;

    setLoading(true);
    setError('');

    if (editingMethod) {
      const res = await updateShippingMethod(editingMethod.id, {
        type: methodType,
        rate: rateToSave,
        minOrderAmount: parsedMinAmount,
        isActive: methodIsActive
      });
      if (res.success && res.method) {
        setZones(zones.map(z => {
          if (z.id === editingMethod.zoneId) {
            return { ...z, methods: z.methods.map(m => m.id === editingMethod.id ? res.method : m) };
          }
          return z;
        }));
        resetMethodForm();
      } else {
        setError(res.error || t('error'));
      }
    } else if (addingMethodForZone) {
      const res = await addShippingMethod(addingMethodForZone, {
        type: methodType,
        rate: rateToSave,
        minOrderAmount: parsedMinAmount,
        isActive: methodIsActive
      });
      if (res.success && res.method) {
        setZones(zones.map(z => {
          if (z.id === addingMethodForZone) {
            return { ...z, methods: [...z.methods, res.method] };
          }
          return z;
        }));
        resetMethodForm();
      } else {
        setError(res.error || t('error'));
      }
    }
    setLoading(false);
  };

  const handleDeleteMethod = async (zoneId: string, methodId: string) => {
    if (!confirm(t('confirm_delete_method'))) return;
    setLoading(true);
    const res = await deleteShippingMethod(methodId);
    if (res.success) {
      setZones(zones.map(z => {
        if (z.id === zoneId) {
          return { ...z, methods: z.methods.filter(m => m.id !== methodId) };
        }
        return z;
      }));
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">{t('delivery_zones')}</h2>
        {!isAddingZone && (
          <button
            onClick={() => setIsAddingZone(true)}
            className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 font-medium text-sm"
          >
            {t('add_destination')}
          </button>
        )}
      </div>

      {isAddingZone && (
        <div className="bg-gray-50 p-6 rounded-md border border-gray-200 mb-6">
          <h3 className="font-semibold mb-4 text-gray-800">{t('new_destination')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('destination_label')}</label>
              <select
                value={zoneName}
                onChange={(e) => setZoneName(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded-md"
              >
                <option value="">{t('select_country')}</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{tCountries(c) || c}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center mt-6">
              <input
                type="checkbox"
                id="zoneIsActive"
                checked={zoneIsActive}
                onChange={(e) => setZoneIsActive(e.target.checked)}
                className="w-4 h-4 text-orange-700 border-gray-300 rounded focus:ring-orange-500"
              />
              <label htmlFor="zoneIsActive" className="ml-2 text-sm text-gray-700 cursor-pointer">
                {t('zone_active')}
              </label>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={handleSaveZone}
              disabled={loading}
              className="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700 font-medium text-sm disabled:opacity-50"
            >
              {t('create_zone')}
            </button>
            <button
              onClick={() => { setIsAddingZone(false); setError(''); }}
              disabled={loading}
              className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-50 font-medium text-sm"
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      )}

      {zones.length === 0 ? (
        <p className="text-gray-500 text-sm italic">{t('no_zones')}</p>
      ) : (
        <div className="space-y-6">
          {zones.map(zone => (
            <div key={zone.id} className="border border-gray-200 rounded-md overflow-hidden bg-white">
              <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-gray-800 text-lg">{tCountries(zone.name) || zone.name}</h3>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${zone.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {zone.isActive ? t('active') : t('inactive')}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => handleToggleZone(zone)} className="text-sm text-gray-600 hover:text-gray-900">
                    {zone.isActive ? t('disable') : t('enable')}
                  </button>
                  <button onClick={() => handleDeleteZone(zone.id)} className="text-sm text-red-600 hover:text-red-800">
                    {t('delete')}
                  </button>
                </div>
              </div>
              
              <div className="p-4">
                <h4 className="font-semibold text-sm text-gray-700 mb-3">{t('shipping_methods')}</h4>
                
                {zone.methods.length > 0 ? (
                  <table className="w-full text-left text-sm mb-4">
                    <thead className="bg-gray-50 text-gray-600 font-medium">
                      <tr>
                        <th className="px-3 py-2">{t('col_label')}</th>
                        <th className="px-3 py-2">{t('col_rate')}</th>
                        <th className="px-3 py-2">{t('col_conditions')}</th>
                        <th className="px-3 py-2">{t('col_status')}</th>
                        <th className="px-3 py-2 text-right">{t('col_actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {zone.methods.map(method => (
                        <tr key={method.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 font-medium">
                            {renderMethodLabel(method.type)}
                          </td>
                          <td className="px-3 py-2">
                            {isZeroRateShippingMethod(method.type)
                              ? t('free')
                              : <Price amount={method.rate} showTax={false} />}
                          </td>
                          <td className="px-3 py-2 text-gray-500">
                            {isFreeShippingMethod(method.type) && method.minOrderAmount != null && method.minOrderAmount > 0
                              ? <><span className="mr-1">{t('from')}</span><Price amount={method.minOrderAmount} showTax={false} /></>
                              : '-'}
                          </td>
                          <td className="px-3 py-2">
                            <span className={method.isActive ? 'text-green-600' : 'text-gray-500'}>
                              {method.isActive ? t('active') : t('inactive')}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right">
                             <button onClick={() => startEditMethod(method)} className="text-blue-600 hover:underline mr-3">{t('edit')}</button>
                             <button onClick={() => handleDeleteMethod(zone.id, method.id)} className="text-red-600 hover:underline">{t('delete')}</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-sm text-gray-500 mb-4 italic">{t('no_methods')}</p>
                )}

                {addingMethodForZone === zone.id ? (
                  <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                    <h5 className="font-semibold text-sm mb-3 text-blue-900">
                      {editingMethod ? t('edit_method') : t('add_method')}
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">{t('col_label')}</label>
                        <select 
                          value={methodType} 
                          onChange={(e) => {
                            const nextType = e.target.value;
                            setMethodType(nextType);
                            if (isFreeShippingMethod(nextType)) {
                              setMethodRate(0);
                              if (!editingMethod && methodMinAmount === '' && isGermanyCountryName(zone.name)) {
                                setMethodMinAmount(DEFAULT_GERMANY_FREE_SHIPPING_THRESHOLD);
                              }
                            } else if (isZeroRateShippingMethod(nextType)) {
                              setMethodRate(0);
                            }
                          }}
                          className="w-full border border-gray-300 px-2 py-1.5 rounded text-sm bg-white"
                        >
                          {!METHOD_TYPES.includes(methodType) && methodType && (
                            <option value={methodType}>{methodType}</option>
                          )}
                          {METHOD_TYPES.map(type => (
                            <option key={type} value={type}>
                              {renderMethodLabel(type)}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {!isZeroRateShippingMethod(methodType) && (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">{t('rate_label')} (€)</label>
                          <input 
                            type="number" step="0.01" min="0" 
                            value={methodRate} 
                            onChange={(e) => {
                              const raw = e.target.value;
                              if (raw === '') {
                                setMethodRate('');
                              } else {
                                const parsed = parseFloat(raw);
                                setMethodRate(Number.isNaN(parsed) ? '' : parsed);
                              }
                            }}
                            className="w-full border border-gray-300 px-2 py-1.5 rounded text-sm bg-white"
                          />
                        </div>
                      )}

                      {isFreeShippingMethod(methodType) && (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">{t('min_amount_label')} (€)</label>
                          <input 
                            type="number" step="0.01" min="0" 
                            value={methodMinAmount} 
                            onChange={(e) => {
                              const raw = e.target.value;
                              if (raw === '') {
                                setMethodMinAmount('');
                              } else {
                                const parsed = parseFloat(raw);
                                setMethodMinAmount(Number.isNaN(parsed) ? '' : parsed);
                              }
                            }}
                            className="w-full border border-gray-300 px-2 py-1.5 rounded text-sm bg-white"
                            placeholder="z.B. 200.00"
                          />
                        </div>
                      )}

                      <div className="flex items-center sm:col-span-2 md:col-span-1 mt-5">
                        <input
                          type="checkbox"
                          checked={methodIsActive}
                          onChange={(e) => setMethodIsActive(e.target.checked)}
                          className="w-4 h-4 text-orange-700 rounded"
                        />
                        <label className="ml-2 text-sm text-gray-700">{t('active')}</label>
                      </div>
                    </div>
                    {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
                    <div className="flex gap-2">
                      <button onClick={handleSaveMethod} disabled={loading} className="bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700 text-sm">
                        {t('save')}
                      </button>
                      <button onClick={resetMethodForm} disabled={loading} className="bg-white border border-gray-300 text-gray-700 px-4 py-1.5 rounded hover:bg-gray-50 text-sm">
                        {t('cancel')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => { resetMethodForm(); setAddingMethodForZone(zone.id); }}
                    className="text-sm font-medium text-orange-700 hover:text-orange-800"
                  >
                    {t('add_method_for', { zone: tCountries(zone.name) || zone.name })}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
