'use client';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateSettingsBatch } from '@/actions/settings';

export default function ShippingInfoForm({ initialSettings }: { initialSettings: Record<string, string> }) {
  const tSettings = useTranslations('AdminSettings');
  const router = useRouter();
  
  const [shippingInfo1, setShippingInfo1] = useState(initialSettings.SHIPPING_INFO_1 || '3–5 Werktage innerhalb Deutschlands');
  const [shippingInfo2, setShippingInfo2] = useState(initialSettings.SHIPPING_INFO_2 || '5–10 Werktage in der Eurozone');
  const [shippingInfo3, setShippingInfo3] = useState(initialSettings.SHIPPING_INFO_3 || 'Kostenloser Versand: Bestellungen ab 200,00 €');
  const [shippingInfo4, setShippingInfo4] = useState(initialSettings.SHIPPING_INFO_4 || 'Kostenlose Rücksendung: innerhalb von 30 Tagen');
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    await updateSettingsBatch({
      SHIPPING_INFO_1: shippingInfo1,
      SHIPPING_INFO_2: shippingInfo2,
      SHIPPING_INFO_3: shippingInfo3,
      SHIPPING_INFO_4: shippingInfo4
    });

    setMessage(tSettings('update_success'));
    setIsLoading(false);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{tSettings('nav_shipping') || 'Product shipping info'}</h2>
        <p className="text-gray-500 mt-1">{tSettings('settings_category_only') || 'Settings for this category only.'}</p>
      </div>
      {message && <div className="bg-green-50 text-green-700 p-4 rounded-md border border-green-200">{message}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('shipping_line_1')}</label>
          <input type="text" value={shippingInfo1} onChange={(e) => setShippingInfo1(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('shipping_line_2')}</label>
          <input type="text" value={shippingInfo2} onChange={(e) => setShippingInfo2(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('shipping_line_3')}</label>
          <input type="text" value={shippingInfo3} onChange={(e) => setShippingInfo3(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('shipping_line_4')}</label>
          <input type="text" value={shippingInfo4} onChange={(e) => setShippingInfo4(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <button type="submit" disabled={isLoading} className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400 text-sm font-semibold transition-colors">
          {isLoading ? tSettings('saving') : (tSettings('save_changes') || 'Save changes')}
        </button>
      </div>
    </form>
  );
}