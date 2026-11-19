'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';

export type EquipmentCategory = 'pallets' | 'fireplaces' | 'climate';

export interface SimulatorProduct {
  id: string;
  title: string;
  slug: string;
  price: number;
  image: string;
  categoryName?: string;
  brand?: string;
  sku?: string;
}

export interface SimulatorProductsData {
  pallets: SimulatorProduct[];
  fireplaces: SimulatorProduct[];
  climate: SimulatorProduct[];
}

interface ShippingSimulatorProps {
  productsData?: SimulatorProductsData;
}

// Resilient default products if database is empty
const defaultProductsData: SimulatorProductsData = {
  pallets: [
    {
      id: '8cd0eb50-2bdf-416e-9b8b-4624404253a2',
      title: 'Palete de Lenha de Sobro +- 500 Kg',
      slug: 'palete-de-lenha-de-sobro-500-kg',
      price: 199.00,
      image: 'https://res.cloudinary.com/t7r98hdh/image/upload/v1794069072/lenha/woocommerce-import/uew0ltmcqaulf0z9cgyi.jpg',
      categoryName: 'Combustíveis',
      brand: 'HLG Hausgeräte',
      sku: 'PAL-SOBRO-500'
    },
    {
      id: 'fb-pellet-1',
      title: 'Palete de Pellets ENplus A1 (70 Sacos de 15kg - 1050kg)',
      slug: 'palete-pellets-enplus-a1-70-sacos',
      price: 369.90,
      image: 'https://res.cloudinary.com/t7r98hdh/image/upload/v1794069048/lenha/woocommerce-import/nhemnuopqbcehe1hoozw.jpg',
      categoryName: 'Pellets',
      brand: 'ENplus A1',
      sku: 'PEL-70SAC-1050'
    },
    {
      id: '81188737-1904-4d4c-bd96-01f2582a5747',
      title: 'Palete 48 sacos Sobro Parfer',
      slug: 'palete-48-sacos-sobro-parfer',
      price: 200.00,
      image: 'https://res.cloudinary.com/t7r98hdh/image/upload/v1794069063/lenha/woocommerce-import/hncbgttoh68k6ypmman9.jpg',
      categoryName: 'Combustíveis',
      brand: 'Parfer',
      sku: 'PAR-SOB-48'
    },
    {
      id: '6dbfd749-6b37-4bc7-b16b-45d721501d8c',
      title: 'Palete 48 sacos de lenha Popular Parfer',
      slug: 'palete-48-sacos-de-lenha-popular-parfer',
      price: 150.00,
      image: 'https://res.cloudinary.com/t7r98hdh/image/upload/v1794069058/lenha/woocommerce-import/mzx0ucldxrmtcnwoe7pe.jpg',
      categoryName: 'Combustíveis',
      brand: 'Parfer',
      sku: 'PAR-POP-48'
    },
    {
      id: 'fb-bigbag-1',
      title: 'Big Bag Lenha de Azinho 250 kg',
      slug: 'big-bag-lenha-de-azinho-250-kg',
      price: 189.00,
      image: 'https://res.cloudinary.com/t7r98hdh/image/upload/v1794068735/lenha/woocommerce-import/nrrj8l8kossbcovmlucq.jpg',
      categoryName: 'Combustíveis',
      brand: 'HLG Hausgeräte',
      sku: 'BB-AZINHO-250'
    }
  ],
  fireplaces: [
    {
      id: 'fb-fire-1',
      title: 'Recuperador de Calor a Lenha 14kW com Ventilação Forçada',
      slug: 'recuperador-calor-lenha-14kw-ventilado',
      price: 975.00,
      image: 'https://res.cloudinary.com/t7r98hdh/image/upload/v1794069321/lenha/woocommerce-import/xw2f6rymeahauygmv5lk.jpg',
      categoryName: 'Recuperadores',
      brand: 'Vulcano',
      sku: 'REC-14KW-VENT'
    },
    {
      id: 'fb-fire-2',
      title: 'Salamandra a Pellets 9kW Ventilada com Comando Wi-Fi',
      slug: 'salamandra-pellets-9kw-ventilada-wifi',
      price: 1090.00,
      image: 'https://res.cloudinary.com/t7r98hdh/image/upload/v1794069904/lenha/woocommerce-import/rgvkzaiphxkaibnnicek.jpg',
      categoryName: 'Salamandras',
      brand: 'EcoDesign',
      sku: 'SAL-PEL-9KW'
    },
    {
      id: 'fb-fire-3',
      title: 'Lareira Elétrica de Parede com Chama LED 1500W',
      slug: 'lareira-eletrica-parede-led-1500w',
      price: 449.00,
      image: 'https://res.cloudinary.com/t7r98hdh/image/upload/v1794070866/lenha/woocommerce-import/xxd3os9uirnmy8bob22t.jpg',
      categoryName: 'Lareiras',
      brand: 'HOMCOM',
      sku: 'LAR-LED-1500'
    },
    {
      id: 'fb-fire-4',
      title: 'Milão Lareira com Turbina 70cm',
      slug: 'milao-lareira-com-turbina-70cm',
      price: 940.00,
      image: 'https://res.cloudinary.com/t7r98hdh/image/upload/v1794069415/lenha/woocommerce-import/qxcim4xcgcybajcmvyoi.jpg',
      categoryName: 'Lareiras',
      brand: 'Milão',
      sku: 'LAR-MIL-70'
    }
  ],
  climate: [
    {
      id: 'fb-ac-1',
      title: 'Ar Condicionado Split Inverter 12.000 BTU R32 com Wi-Fi A+++',
      slug: 'ar-condicionado-split-inverter-12000-btu-r32',
      price: 529.00,
      image: 'https://res.cloudinary.com/t7r98hdh/image/upload/v1794070891/lenha/woocommerce-import/ip28kt7renygynww33k4.jpg',
      categoryName: 'Climatização',
      brand: 'INFINITON',
      sku: 'SPLIT-3726MF'
    },
    {
      id: 'fb-ac-2',
      title: 'Ar Condicionado Portátil Daitsu APD12FCX 12.000 BTU A',
      slug: 'ar-condicionado-portatil-daitsu-apd12fcx',
      price: 499.00,
      image: 'https://res.cloudinary.com/t7r98hdh/image/upload/v1794070942/lenha/woocommerce-import/ljpjrhyqwgn3khk9rar6.jpg',
      categoryName: 'Climatização',
      brand: 'Daitsu',
      sku: 'APD12FCX'
    },
    {
      id: 'fb-ac-3',
      title: 'Termoacumulador Reversível HTW 80L Wi-Fi',
      slug: 'termoacumulador-reversivel-htw-80l-wifi',
      price: 220.00,
      image: 'https://res.cloudinary.com/t7r98hdh/image/upload/v1794070921/lenha/woocommerce-import/vieutu8firjovxz8tldc.jpg',
      categoryName: 'Termoacumuladores',
      brand: 'HTW',
      sku: 'HTW-80L-WIFI'
    },
    {
      id: 'fb-ac-4',
      title: 'Ar Condicionado Cisampo Bodner 12000 BTU Inverter WiFi',
      slug: 'ar-condicionado-cisampo-bodner-12000-btu',
      price: 209.00,
      image: 'https://res.cloudinary.com/t7r98hdh/image/upload/v1794070928/lenha/woocommerce-import/ooykgvsxkvcpa94q1kyb.jpg',
      categoryName: 'Climatização',
      brand: 'Cisampo Bodner',
      sku: 'CB-12000-INV'
    }
  ]
};

// Intelligently shorten long product titles according to user's formula:
// [Intitulé...] [Marque / Modèle...] [...Derniers mots]
function formatProductShortTitle(title: string, brand?: string, sku?: string): string {
  const clean = title.trim().replace(/\s+/g, ' ');
  const words = clean.split(' ');
  if (words.length <= 6) return clean;

  const head = words.slice(0, 3).join(' ');
  const tail = words.slice(-2).join(' ');

  // Look for technical specs in title like 14kW, 1500W, M-300, 1050kg, etc.
  const spec = words.find(w =>
    /\d+kw/i.test(w) ||
    /\d+w\b/i.test(w) ||
    /\d+kg/i.test(w) ||
    /\d+btu/i.test(w) ||
    /^[A-Z]{1,3}-\d+/i.test(w) ||
    /r32/i.test(w)
  );

  const middleItems = [brand, sku, spec].filter(Boolean) as string[];
  const uniqueMiddle = middleItems.filter((val, idx, arr) =>
    arr.indexOf(val) === idx &&
    !head.toLowerCase().includes(val.toLowerCase()) &&
    !tail.toLowerCase().includes(val.toLowerCase())
  ).join(' ');

  if (uniqueMiddle) {
    return `${head}... ${uniqueMiddle}... ${tail}`;
  }
  return `${head}... ${tail}`;
}

// Regional destinations without any km mentions (purely geographic & regional)
interface DestinationZone {
  key: string;
  name: string;
  region: string;
  country: 'PT' | 'ES' | 'FR' | 'DE' | 'ISLANDS';
  timeframe: string;
  timeframeExpress: string;
  isLocalNorth: boolean; // Braga, Porto, Viana
  zonePrismaName: string;
}

const DESTINATIONS: Record<string, DestinationZone> = {
  // Portugal Continental
  braga: {
    key: 'braga',
    name: 'Braga (Sede & Entrega Direta)',
    region: 'Zona Norte Proximidade',
    country: 'PT',
    timeframe: '3 a 5 dias úteis',
    timeframeExpress: '48 horas úteis (Expresso)',
    isLocalNorth: true,
    zonePrismaName: 'Portugal Continental'
  },
  porto: {
    key: 'porto',
    name: 'Porto & Grande Porto',
    region: 'Zona Norte Litoral',
    country: 'PT',
    timeframe: '3 a 5 dias úteis',
    timeframeExpress: '48 horas úteis (Expresso)',
    isLocalNorth: true,
    zonePrismaName: 'Portugal Continental'
  },
  viana: {
    key: 'viana',
    name: 'Viana do Castelo & Alto Minho',
    region: 'Zona Norte',
    country: 'PT',
    timeframe: '3 a 5 dias úteis',
    timeframeExpress: '48 horas úteis (Expresso)',
    isLocalNorth: true,
    zonePrismaName: 'Portugal Continental'
  },
  aveiro_coimbra: {
    key: 'aveiro_coimbra',
    name: 'Aveiro, Coimbra & Leiria',
    region: 'Região Centro Litoral',
    country: 'PT',
    timeframe: '3 a 5 dias úteis',
    timeframeExpress: '48 horas úteis (Expresso)',
    isLocalNorth: false,
    zonePrismaName: 'Portugal Continental'
  },
  lisboa_valetejo: {
    key: 'lisboa_valetejo',
    name: 'Lisboa, Setúbal & Vale do Tejo',
    region: 'Região Metropolitana de Lisboa',
    country: 'PT',
    timeframe: '3 a 5 dias úteis',
    timeframeExpress: '48 horas úteis (Expresso)',
    isLocalNorth: false,
    zonePrismaName: 'Portugal Continental'
  },
  vilareal_braganca: {
    key: 'vilareal_braganca',
    name: 'Vila Real & Bragança',
    region: 'Trás-os-Montes & Douro',
    country: 'PT',
    timeframe: '3 a 5 dias úteis',
    timeframeExpress: '48 horas úteis (Expresso)',
    isLocalNorth: false,
    zonePrismaName: 'Portugal Continental'
  },
  viseu_guarda: {
    key: 'viseu_guarda',
    name: 'Viseu, Guarda & Castelo Branco',
    region: 'Região Centro Interior & Beiras',
    country: 'PT',
    timeframe: '3 a 5 dias úteis',
    timeframeExpress: '48 horas úteis (Expresso)',
    isLocalNorth: false,
    zonePrismaName: 'Portugal Continental'
  },
  alentejo: {
    key: 'alentejo',
    name: 'Évora, Beja & Portalegre (Alentejo)',
    region: 'Região Alentejo',
    country: 'PT',
    timeframe: '3 a 5 dias úteis',
    timeframeExpress: '48 horas úteis (Expresso)',
    isLocalNorth: false,
    zonePrismaName: 'Portugal Continental'
  },
  faro: {
    key: 'faro',
    name: 'Faro & Algarve',
    region: 'Região Sul / Algarve',
    country: 'PT',
    timeframe: '3 a 5 dias úteis',
    timeframeExpress: '48 horas úteis (Expresso)',
    isLocalNorth: false,
    zonePrismaName: 'Portugal Continental'
  },

  // Ilhas
  ilhas: {
    key: 'ilhas',
    name: 'Açores & Madeira (Regiões Autónomas)',
    region: 'Ilhas (Transporte Marítimo)',
    country: 'ISLANDS',
    timeframe: '5 a 10 dias úteis (saída semanal)',
    timeframeExpress: '48 a 72 horas úteis (Aéreo Prioritário)',
    isLocalNorth: false,
    zonePrismaName: 'Ilhas (Açores e Madeira)'
  },

  // Espanha
  espanha: {
    key: 'espanha',
    name: 'Espanha Peninsular (Galiza, Madrid, etc.)',
    region: 'Espanha (Logística Ibérica)',
    country: 'ES',
    timeframe: '5 a 7 dias úteis',
    timeframeExpress: '72 horas úteis (Expresso)',
    isLocalNorth: false,
    zonePrismaName: 'Espanha Peninsular'
  },

  // França
  franca: {
    key: 'franca',
    name: 'França (Hexagone)',
    region: 'França (Transporte Internacional)',
    country: 'FR',
    timeframe: '5 a 7 dias úteis',
    timeframeExpress: '72 horas úteis (Expresso)',
    isLocalNorth: false,
    zonePrismaName: 'França'
  },

  // Alemanha
  alemanha: {
    key: 'alemanha',
    name: 'Alemanha (Deutschland - Europa Central)',
    region: 'Alemanha (Transporte Especializado Europa Central)',
    country: 'DE',
    timeframe: '5 a 7 dias úteis',
    timeframeExpress: '72 horas úteis (Expresso)',
    isLocalNorth: false,
    zonePrismaName: 'Alemanha'
  }
};

// Auto-detect Portuguese postal code
function detectDistrictFromPostalCode(code: string): string | null {
  const clean = code.replace(/\D/g, '');
  if (clean.length < 2) return null;
  const num = parseInt(clean.slice(0, 4), 10);
  const prefix2 = parseInt(clean.slice(0, 2), 10);

  if (num >= 4700 && num <= 4899) return 'braga';
  if ((num >= 4000 && num <= 4699) || (prefix2 >= 44 && prefix2 <= 46)) return 'porto';
  if (num >= 4900 && num <= 4999) return 'viana';
  if (num >= 5000 && num <= 5499) return 'vilareal_braganca';
  if ((num >= 3000 && num <= 3899) || (num >= 2400 && num <= 2499)) return 'aveiro_coimbra';
  if ((num >= 3500 && num <= 3699) || (num >= 6000 && num <= 6499)) return 'viseu_guarda';
  if (num >= 1000 && num <= 2999) return 'lisboa_valetejo';
  if (num >= 7000 && num <= 7999) return 'alentejo';
  if (num >= 8000 && num <= 8999) return 'faro';
  if (num >= 9000 && num <= 9999) return 'ilhas';

  return null;
}

export default function ShippingSimulator({ productsData }: ShippingSimulatorProps) {
  const router = useRouter();
  const cartStore = useCartStore();

  const [activeCategory, setActiveCategory] = useState<EquipmentCategory>('pallets');
  const [destinationScope, setDestinationScope] = useState<'nacional' | 'internacional'>('nacional');
  const [destinationKey, setDestinationKey] = useState<string>('braga');
  const [shippingSpeed, setShippingSpeed] = useState<'standard' | 'express'>('standard');
  const [postalCode, setPostalCode] = useState<string>('');
  const [palletQty, setPalletQty] = useState<number>(1);
  const [acQty, setAcQty] = useState<number>(1);

  // Combobox Search State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Products of active category
  const currentProducts = useMemo(() => {
    const list = productsData?.[activeCategory] || defaultProductsData[activeCategory];
    return list && list.length > 0 ? list : defaultProductsData[activeCategory];
  }, [productsData, activeCategory]);

  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [isStep2Collapsed, setIsStep2Collapsed] = useState<boolean>(false);

  // Active product (null until user selects an article)
  const activeProduct = useMemo(() => {
    if (!selectedProductId) return null;
    return currentProducts.find(p => p.id === selectedProductId) || null;
  }, [currentProducts, selectedProductId]);

  // Filter products by search query (name, brand, sku, or model)
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return currentProducts;
    const q = searchQuery.toLowerCase().trim();
    return currentProducts.filter(p => {
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchBrand = p.brand ? p.brand.toLowerCase().includes(q) : false;
      const matchSku = p.sku ? p.sku.toLowerCase().includes(q) : false;
      return matchTitle || matchBrand || matchSku;
    });
  }, [currentProducts, searchQuery]);

  const currentDestination = DESTINATIONS[destinationKey] || DESTINATIONS['braga'];
  const isLocalNorth = currentDestination.isLocalNorth;
  const isPortugalContinental = currentDestination.country === 'PT';

  // Real-time calculation strictly following business rules, international extensions & express option
  const calculation = useMemo(() => {
    const prodPrice = activeProduct?.price || 0;

    // METHOD UUIDs IN PRISMA FOR PORTUGAL CONTINENTAL:
    const METHOD_FREE_ID = 'ad2c6a8d-6768-4473-a047-dd5d461902de'; // Portes 0€
    const METHOD_15_ID = '1422c9b3-378a-4b52-b70a-53cf1f2bf0bd';   // Envio 15€
    const METHOD_16_ID = '0e0461cc-df55-468a-9e5a-a8d5d101ec89';   // Envio 16€
    const METHOD_18_ID = '9632573c-952e-4ee6-a115-4a56f55d5b48';   // Envio 18€
    const METHOD_EXPRESS_PT_ID = 'b32ab1c7-a946-4487-a935-08d8ac391618'; // Expresso PT 48h
    const METHOD_EXPRESS_ES_ID = '05320fbb-78e3-46bd-8c59-3881967d9a31'; // Expresso ES 72h
    const METHOD_EXPRESS_FR_ID = 'af223a10-66c1-46bc-9563-32fcbc43da53'; // Expresso FR 72h
    const METHOD_EXPRESS_DE_ID = '19e4f69c-5f10-450e-95d2-7a4ba89a775d'; // Expresso DE 72h
    const METHOD_DE_PALLET_ID = 'e8067ba7-e791-4b4f-9d8d-20529e0a2d07';
    const METHOD_DE_HEATER_ID = '1582773b-4950-44b6-ba75-c82bb931a870';
    const METHOD_DE_AC_ID = '6da18d2d-551f-40f1-a38e-25c542b30f00';
    const METHOD_EXPRESS_ISLANDS_ID = 'a68680f8-6fd4-448e-a740-6676cdf01906'; // Expresso Ilhas

    const isExpress = shippingSpeed === 'express';

    // 1. INTERNATIONAL DESTINATIONS (Espanha, França, Alemanha, Ilhas)
    if (!isPortugalContinental) {
      if (currentDestination.country === 'ES') {
        if (activeCategory === 'pallets') {
          if (isExpress) {
            const rateES = palletQty >= 5 ? 25.00 * palletQty : (35.00 * palletQty) + 20.00;
            return {
              rate: rateES,
              methodId: METHOD_EXPRESS_ES_ID,
              methodLabel: 'Envio Expresso Ibérico 72h (Paletes)',
              isFree: false,
              explanation: `Expedição expresso 72h para Espanha Peninsular: ${rateES.toFixed(2)} € com camião plataforma.`,
              badge: 'Expresso Ibérico 72h'
            };
          }
          const isFreeES = palletQty >= 5;
          const rateES = isFreeES ? 0 : palletQty >= 3 ? 35.00 * palletQty : 45.00 * palletQty;
          return {
            rate: rateES,
            methodId: isFreeES ? METHOD_FREE_ID : 'd3b01e17-08f0-4884-a51f-a13e687ab754',
            methodLabel: isFreeES ? 'Portes Grátis Espanha (5+ Paletes)' : 'Envio Internacional Espanha (Palete de Biomassa)',
            isFree: isFreeES,
            explanation: isFreeES
              ? '✓ Portes 100% Oferecidos para encomendas a partir de 5 paletes para Espanha Peninsular!'
              : `Taxa de transporte logístico para Espanha Peninsular: ${rateES.toFixed(2)} € no total (5 a 7 dias úteis).`,
            badge: isFreeES ? 'Oferta 5+ Paletes' : 'Logística Ibérica'
          };
        }
        if (activeCategory === 'fireplaces') {
          if (isExpress) {
            const rateES = prodPrice >= 700 ? 20.00 : 45.00;
            return {
              rate: rateES,
              methodId: METHOD_EXPRESS_ES_ID,
              methodLabel: 'Envio Expresso Ibérico 72h (Equipamento Térmico)',
              isFree: false,
              explanation: `Envio expresso 72h para equipamento térmico em Espanha Peninsular: ${rateES.toFixed(2)} €.`,
              badge: 'Expresso Ibérico 72h'
            };
          }
          const isFreeES = prodPrice >= 700;
          return {
            rate: isFreeES ? 0 : 35.00,
            methodId: isFreeES ? METHOD_FREE_ID : 'd3b01e17-08f0-4884-a51f-a13e687ab754',
            methodLabel: isFreeES ? 'Portes Grátis Espanha (Valor ≥ 700 €)' : 'Envio Equipamento Espanha',
            isFree: isFreeES,
            explanation: isFreeES
              ? '✓ Portes 100% Oferecidos para equipamentos térmicos superiores a 700 € para Espanha!'
              : 'Taxa fixa de envio para Espanha Peninsular: 35,00 € com entrega especializada (5 a 7 dias úteis).',
            badge: isFreeES ? 'Oferta Valor ≥ 700 €' : 'Taxa Especial 35 €'
          };
        }
        // Climate ES
        if (isExpress) {
          const rateES = acQty >= 2 ? 15.00 : 35.00;
          return {
            rate: rateES,
            methodId: METHOD_EXPRESS_ES_ID,
            methodLabel: 'Envio Expresso Ibérico 72h (Climatizador)',
            isFree: false,
            explanation: `Envio expresso 72h para climatizadores em Espanha Peninsular: ${rateES.toFixed(2)} €.`,
            badge: 'Expresso Ibérico 72h'
          };
        }
        const isFreeES = acQty >= 2;
        return {
          rate: isFreeES ? 0 : 25.00,
          methodId: isFreeES ? METHOD_FREE_ID : 'd3b01e17-08f0-4884-a51f-a13e687ab754',
          methodLabel: isFreeES ? 'Portes Grátis Espanha (2+ Climatizadores)' : 'Envio Climatizador Espanha',
          isFree: isFreeES,
          explanation: isFreeES
            ? '✓ Portes 100% Oferecidos para 2 ou mais aparelhos para Espanha Peninsular!'
            : 'Taxa de envio de 25,00 € para 1 aparelho para Espanha Peninsular (5 a 7 dias úteis).',
          badge: isFreeES ? 'Oferta 2+ Aparelhos' : 'Taxa 25 €'
        };
      }

      if (currentDestination.country === 'FR') {
        const baseRate = activeCategory === 'pallets' ? 75.00 * palletQty : activeCategory === 'fireplaces' ? 45.00 : 35.00;
        const rateFR = isExpress ? baseRate + 20.00 : baseRate;
        return {
          rate: rateFR,
          methodId: isExpress ? METHOD_EXPRESS_FR_ID : 'af223a10-66c1-46bc-9563-32fcbc43da53',
          methodLabel: isExpress ? 'Envio Expresso França (Prioritário 72h)' : 'Envio Internacional França (Camião com Plataforma)',
          isFree: false,
          explanation: isExpress
            ? `Transporte expresso internacional direto para França (72 horas úteis): ${rateFR.toFixed(2)} € com camião plataforma.`
            : `Transporte internacional regular direto para França com camião plataforma: ${rateFR.toFixed(2)} € (5 a 7 dias úteis).`,
          badge: isExpress ? 'Expresso França 72h' : 'Internacional França'
        };
      }

      if (currentDestination.country === 'DE') {
        const baseRate = activeCategory === 'pallets' ? 75.00 * palletQty : activeCategory === 'fireplaces' ? 45.00 : 35.00;
        const rateDE = isExpress ? baseRate + 20.00 : baseRate;
        const methodId = isExpress
          ? METHOD_EXPRESS_DE_ID
          : activeCategory === 'pallets'
            ? METHOD_DE_PALLET_ID
            : activeCategory === 'fireplaces'
              ? METHOD_DE_HEATER_ID
              : METHOD_DE_AC_ID;
        return {
          rate: rateDE,
          methodId,
          methodLabel: isExpress ? 'Envio Expresso Alemanha (Prioritário 72h)' : 'Envio Internacional Alemanha (Camião com Plataforma)',
          isFree: false,
          explanation: isExpress
            ? `Transporte expresso internacional prioritário para a Alemanha (72 horas úteis): ${rateDE.toFixed(2)} € com camião plataforma.`
            : `Transporte internacional regular direto para a Alemanha com camião plataforma: ${rateDE.toFixed(2)} € (5 a 7 dias úteis).`,
          badge: isExpress ? 'Expresso Alemanha 72h' : 'Internacional Alemanha'
        };
      }

      // Ilhas (Açores & Madeira)
      if (isExpress) {
        const rateIlhasExp = activeCategory === 'climate' ? 35.00 : 85.00;
        return {
          rate: rateIlhasExp,
          methodId: METHOD_EXPRESS_ISLANDS_ID,
          methodLabel: 'Envio Aéreo Expresso Açores & Madeira',
          isFree: false,
          explanation: `Envio aéreo expresso prioritário para os arquipélagos: ${rateIlhasExp.toFixed(2)} €.`,
          badge: 'Aéreo Expresso'
        };
      }
      const rateIlhas = activeCategory === 'climate' ? 25.00 : 75.00;
      return {
        rate: rateIlhas,
        methodId: 'e668b996-010d-471d-938b-90a5bd3f5de6',
        methodLabel: 'Envio Marítimo Açores & Madeira',
        isFree: false,
        explanation: `Transporte marítimo regular com saída semanal dos portos de Leixões ou Lisboa: ${rateIlhas.toFixed(2)} €.`,
        badge: 'Transitário Marítimo'
      };
    }

    // 2. PORTUGAL CONTINENTAL

    // A) PALETTES
    if (activeCategory === 'pallets') {
      if (isExpress) {
        if (palletQty >= 3) {
          return {
            rate: 19.00,
            methodId: METHOD_EXPRESS_PT_ID,
            methodLabel: 'Envio Expresso Prioritário (3+ Paletes)',
            isFree: false,
            explanation: 'Envio expresso prioritário 48h úteis para 3 ou mais paletes com transporte dedicado e plataforma.',
            badge: 'Expresso 48h'
          };
        }
        if (palletQty === 2) {
          const rateExp = isLocalNorth ? 15.00 : 25.00;
          return {
            rate: rateExp,
            methodId: METHOD_EXPRESS_PT_ID,
            methodLabel: 'Envio Expresso de 2 Paletes (48h)',
            isFree: false,
            explanation: `Envio expresso prioritário 48h úteis com camião plataforma para 2 paletes: ${rateExp.toFixed(2)} € no total.`,
            badge: 'Expresso 48h'
          };
        }
        const costExp = destinationKey === 'braga' ? 10.00 : isLocalNorth ? 18.00 : 25.00;
        return {
          rate: costExp,
          methodId: METHOD_EXPRESS_PT_ID,
          methodLabel: 'Envio Expresso 48h com Camião Plataforma',
          isFree: false,
          explanation: `Envio expresso prioritário 48h úteis para 1 palete com agendamento direto e plataforma elevatória: ${costExp.toFixed(2)} €.`,
          badge: 'Expresso 48h'
        };
      }

      // Standard Pallets
      if (palletQty >= 3) {
        return {
          rate: 0,
          methodId: METHOD_FREE_ID,
          methodLabel: 'Portes 100% Grátis (A partir de 3 paletes)',
          isFree: true,
          explanation: '✓ Portes 100% Oferecidos para 3 ou mais paletes em todo o território nacional!',
          badge: 'Oferta 3+ Paletes'
        };
      }
      if (palletQty === 2) {
        if (isLocalNorth) {
          return {
            rate: 0,
            methodId: METHOD_FREE_ID,
            methodLabel: 'Portes Grátis (Zona Norte)',
            isFree: true,
            explanation: '✓ Portes 100% Oferecidos para 2 paletes na Zona Norte!',
            badge: 'Oferta Zona Norte'
          };
        } else {
          return {
            rate: 16.00,
            methodId: METHOD_16_ID,
            methodLabel: 'Envio Especial de 2 Paletes',
            isFree: false,
            explanation: 'Tarifa especial reduzida de 16,00 € no total para as duas paletes (8,00 € / palete).',
            badge: 'Tarifa Especial 16 €'
          };
        }
      }
      // 1 palette standard: max 15€
      const cost = destinationKey === 'braga' ? 0 : isLocalNorth ? 10.00 : 15.00;
      return {
        rate: cost,
        methodId: cost === 0 ? METHOD_FREE_ID : METHOD_15_ID,
        methodLabel: cost === 0 ? 'Portes Grátis Diretos (Braga)' : 'Envio de 1 Palete com Camião Plataforma',
        isFree: cost === 0,
        explanation: cost === 0
          ? '✓ Entrega direta gratuita na área de Braga!'
          : `Taxa de transporte de ${cost.toFixed(2)} € para 1 palete com descarga por plataforma elevatória (máximo 15 €).`,
        badge: cost === 0 ? 'Oferta Sede' : 'Máximo 15 €'
      };
    }

    // B) CHEMINÉES / LAREIRAS / RECUPERADORES / SALAMANDRAS / FOGÕES
    if (activeCategory === 'fireplaces') {
      if (isExpress) {
        const rateExp = prodPrice >= 500 ? 18.00 : 28.00;
        return {
          rate: rateExp,
          methodId: METHOD_EXPRESS_PT_ID,
          methodLabel: 'Envio Expresso 48h de Equipamento Térmico',
          isFree: false,
          explanation: `Envio expresso prioritário 48h úteis para equipamento térmico: taxa de ${rateExp.toFixed(2)} € com agendamento dedicado.`,
          badge: 'Expresso 48h'
        };
      }
      if (prodPrice >= 500) {
        return {
          rate: 0,
          methodId: METHOD_FREE_ID,
          methodLabel: 'Portes 100% Grátis (Equipamento ≥ 500 €)',
          isFree: true,
          explanation: '✓ Portes 100% Oferecidos em todo o Portugal Continental para equipamentos a partir de 500 €!',
          badge: 'Oferta Valor ≥ 500 €'
        };
      } else {
        return {
          rate: 18.00,
          methodId: METHOD_18_ID,
          methodLabel: 'Envio de Equipamento Térmico (Valor < 500 €)',
          isFree: false,
          explanation: 'Taxa fixa especializada de 18,00 € para equipamentos com valor inferior a 500 €.',
          badge: 'Taxa Fixa 18 €'
        };
      }
    }

    // C) CLIMATISEURS / CLIMATIZAÇÃO
    if (activeCategory === 'climate') {
      if (isExpress) {
        const rateExp = acQty >= 2 || prodPrice > 300 ? 15.00 : 25.00;
        return {
          rate: rateExp,
          methodId: METHOD_EXPRESS_PT_ID,
          methodLabel: 'Envio Expresso 48h de Climatizador',
          isFree: false,
          explanation: `Envio expresso prioritário 48h úteis para climatização: taxa de ${rateExp.toFixed(2)} €.`,
          badge: 'Expresso 48h'
        };
      }
      if (acQty >= 2) {
        return {
          rate: 0,
          methodId: METHOD_FREE_ID,
          methodLabel: 'Portes 100% Grátis (A partir de 2 Climatizadores)',
          isFree: true,
          explanation: '✓ Portes 100% Oferecidos para encomendas de 2 ou mais climatizadores!',
          badge: 'Oferta 2+ Unidades'
        };
      }
      if (prodPrice > 300) {
        return {
          rate: 0,
          methodId: METHOD_FREE_ID,
          methodLabel: 'Portes Grátis (Climatizador > 300 €)',
          isFree: true,
          explanation: '✓ Portes 100% Oferecidos para climatizadores com valor superior a 300 €!',
          badge: 'Oferta Valor > 300 €'
        };
      } else {
        return {
          rate: 18.00,
          methodId: METHOD_18_ID,
          methodLabel: 'Envio de Climatizador (Valor ≤ 300 €)',
          isFree: false,
          explanation: 'Taxa fixa de envio de 18,00 € para 1 aparelho com valor até 300 €.',
          badge: 'Taxa Fixa 18 €'
        };
      }
    }

    return {
      rate: 15.00,
      methodId: METHOD_15_ID,
      methodLabel: 'Envio com Plataforma',
      isFree: false,
      explanation: 'Envio com camião plataforma elevatória.',
      badge: 'Envio Padrão'
    };
  }, [activeCategory, destinationKey, isLocalNorth, isPortugalContinental, palletQty, acQty, activeProduct, currentDestination, shippingSpeed]);

  // Handle direct order & checkout redirect
  const handleOrderAndCheckout = () => {
    if (!activeProduct) {
      setIsStep2Collapsed(false);
      setIsDropdownOpen(true);
      const step2El = document.getElementById('step-2-product');
      if (step2El) {
        step2El.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const quantity = activeCategory === 'pallets' ? palletQty : activeCategory === 'climate' ? acQty : 1;

    // 1. Add product to Cart Store
    cartStore.addItem({
      id: activeProduct.id,
      productId: activeProduct.id,
      slug: activeProduct.slug,
      title: activeProduct.title,
      price: activeProduct.price,
      image: activeProduct.image,
      quantity: quantity
    });

    // Close drawer so it doesn't block direct checkout
    cartStore.setIsOpen(false);

    // 2. Set custom calibrated shipping in Cart Store
    cartStore.setCustomShipping({
      methodId: calculation.methodId,
      zoneName: currentDestination.zonePrismaName,
      rate: calculation.rate,
      label: calculation.methodLabel,
      district: currentDestination.name,
      postalCode: postalCode || undefined
    });

    // 3. Direct Redirect to Checkout
    router.push('/checkout');
  };

  const conciseProductTitle = useMemo(() => {
    if (!activeProduct) return 'Artigo';
    const t = activeProduct.title.trim();
    return t.length > 18 ? t.slice(0, 18).trim() + '...' : t;
  }, [activeProduct]);

  return (
    <section id="simulador-envio" className="py-16 max-w-7xl mx-auto px-4 scroll-mt-24">
      <div className="bg-gradient-to-br from-stone-900 via-stone-850 to-stone-900 rounded-3xl p-6 sm:p-10 md:p-12 text-white relative overflow-hidden shadow-2xl border border-stone-700/80">

        {/* Glow ambient background accents */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Equipment Category, Searchable Combobox & Destination */}
          <div className={`${activeProduct ? 'lg:col-span-7' : 'lg:col-span-12 max-w-2xl mx-auto'} space-y-6 transition-all duration-300`}>

            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/80 border border-red-500/40 text-white font-extrabold text-[11px] uppercase tracking-wider mb-2 shadow-sm">
                <span>🚛</span>
                <span className="text-white font-bold tracking-wide">Calculador de Frete Calibrado HLG Hausgeräte</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Simulador de Envio & Logística
              </h2>
              <p className="text-stone-300 text-sm mt-2 leading-relaxed">
                Consulte as tarifas e condições de entrega direta para paletes, recuperadores e climatizadores em Portugal Continental e destinos internacionais com camião plataforma.
              </p>
            </div>

            {/* 1. Category Tabs */}
            <div>
              <label className="text-[11px] font-bold text-stone-300 uppercase tracking-wider block mb-2">
                1. Selecione o Tipo de Equipamento
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory('pallets');
                    setSelectedProductId('');
                    setIsStep2Collapsed(false);
                    setSearchQuery('');
                    setIsDropdownOpen(true);
                  }}
                  className={`py-3 px-2 sm:px-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 ${activeCategory === 'pallets'
                    ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/30'
                    : 'bg-stone-800/80 border-stone-700 text-stone-300 hover:bg-stone-700/70 hover:text-white'
                    }`}
                >
                  <span className="text-lg">🪵</span>
                  <span>Paletes & Lenha</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory('fireplaces');
                    setSelectedProductId('');
                    setIsStep2Collapsed(false);
                    setSearchQuery('');
                    setIsDropdownOpen(true);
                  }}
                  className={`py-3 px-2 sm:px-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 ${activeCategory === 'fireplaces'
                    ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/30'
                    : 'bg-stone-800/80 border-stone-700 text-stone-300 hover:bg-stone-700/70 hover:text-white'
                    }`}
                >
                  <span className="text-lg">🔥</span>
                  <span>Recuperadores & Fogões</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory('climate');
                    setSelectedProductId('');
                    setIsStep2Collapsed(false);
                    setSearchQuery('');
                    setIsDropdownOpen(true);
                  }}
                  className={`py-3 px-2 sm:px-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 ${activeCategory === 'climate'
                    ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/30'
                    : 'bg-stone-800/80 border-stone-700 text-stone-300 hover:bg-stone-700/70 hover:text-white'
                    }`}
                >
                  <span className="text-lg">❄️</span>
                  <span>Climatizadores</span>
                </button>
              </div>
            </div>

            {/* 2. Artigo a Simular: Collapsed State vs Expanded Searchable Combobox */}
            {isStep2Collapsed && activeProduct ? (
              <div className="bg-stone-850/90 p-3.5 sm:p-4 rounded-2xl border border-stone-700/80 shadow-md transition-all">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-black">✓</span>
                    2. Artigo Selecionado
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsStep2Collapsed(false);
                      setIsDropdownOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-stone-700/80 hover:bg-stone-700 border border-stone-600 text-stone-200 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <svg className="w-3.5 h-3.5 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    <span>Alterar Artigo</span>
                  </button>
                </div>

                <div className="flex items-center gap-3.5 bg-stone-900/90 p-3 rounded-xl border border-stone-700/70">
                  <div className="w-12 h-12 rounded-lg bg-stone-800 flex items-center justify-center overflow-hidden shrink-0 relative border border-stone-700">
                    {activeProduct.image ? (
                      <Image
                        src={activeProduct.image}
                        alt={activeProduct.title}
                        fill
                        unoptimized={activeProduct.image.startsWith('http')}
                        className="object-contain p-1"
                      />
                    ) : (
                      <span className="text-xl">
                        {activeCategory === 'pallets' ? '🪵' : activeCategory === 'fireplaces' ? '🔥' : '❄️'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold text-red-400 tracking-wider">
                        {activeProduct.categoryName || 'HLG Hausgeräte'}
                      </span>
                      {activeProduct.sku && (
                        <span className="text-[10px] text-stone-400 font-mono">
                          SKU: {activeProduct.sku}
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-white text-xs sm:text-sm truncate">{activeProduct.title}</h4>
                    <span className="text-emerald-400 font-extrabold text-sm block mt-0.5">
                      {activeProduct.price.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div id="step-2-product" className="bg-stone-800/60 p-4 rounded-2xl border border-stone-700/70 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-stone-300 uppercase tracking-wider block">
                    2. Artigo a Simular ({currentProducts.length} disponíveis)
                  </label>
                  <span className="text-[10px] text-stone-400">
                    Clique na caixa ou escreva para pesquisar
                  </span>
                </div>

                {/* Combobox Input with Fixed Bounds */}
                <div className="relative w-full" ref={dropdownRef}>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={
                        searchQuery !== ''
                          ? searchQuery
                          : activeProduct
                            ? `${formatProductShortTitle(activeProduct.title, activeProduct.brand, activeProduct.sku)} — ${activeProduct.price.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}`
                            : ''
                      }
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setIsDropdownOpen(true);
                      }}
                      onClick={() => {
                        setIsDropdownOpen(true);
                      }}
                      onFocus={(e) => {
                        setIsDropdownOpen(true);
                        e.target.select();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setIsDropdownOpen(false);
                        } else if (e.key === 'Enter') {
                          if (filteredProducts.length > 0) {
                            setSelectedProductId(filteredProducts[0].id);
                            setSearchQuery('');
                            setIsDropdownOpen(false);
                          }
                        }
                      }}
                      placeholder="Selecionar ou pesquisar um produto..."
                      className="w-full px-4 py-3 pr-16 bg-stone-900 border border-stone-600 rounded-xl text-xs sm:text-sm text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-red-500 truncate cursor-pointer"
                    />

                    {/* Right Action Buttons: Clear (x) and Chevron */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery('');
                          }}
                          title="Limpar pesquisa"
                          className="text-stone-400 hover:text-white p-1 rounded-md transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="text-stone-400 hover:text-white transition-colors cursor-pointer p-1"
                      >
                        <svg className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Floating Options Dropdown (Never breaks or stretches the column) */}
                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 max-h-64 overflow-y-auto bg-stone-900 border border-stone-700 rounded-xl shadow-2xl z-50 divide-y divide-stone-800/80 no-scrollbar">
                      {filteredProducts.length === 0 ? (
                        <div className="p-4 text-center text-xs text-stone-400">
                          Nenhum artigo encontrado para &quot;{searchQuery}&quot;
                        </div>
                      ) : (
                        filteredProducts.map((p) => {
                          const isSelected = p.id === activeProduct?.id;
                          const formattedLabel = formatProductShortTitle(p.title, p.brand, p.sku);
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setSelectedProductId(p.id);
                                setSearchQuery('');
                                setIsDropdownOpen(false);
                              }}
                              className={`w-full text-left p-3 flex items-center justify-between gap-3 hover:bg-stone-800 transition-colors cursor-pointer ${isSelected ? 'bg-stone-800/90 border-l-4 border-red-500' : ''
                                }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-9 h-9 rounded-lg bg-stone-800 shrink-0 relative overflow-hidden flex items-center justify-center">
                                  {p.image ? (
                                    <Image src={p.image} alt="" fill unoptimized={p.image.startsWith('http')} className="object-contain p-0.5" />
                                  ) : (
                                    <span className="text-sm">
                                      {activeCategory === 'pallets' ? '🪵' : activeCategory === 'fireplaces' ? '🔥' : '❄️'}
                                    </span>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <span className="font-bold text-white text-xs block truncate max-w-[210px] sm:max-w-[340px]">
                                    {formattedLabel}
                                  </span>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    {p.brand && (
                                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-stone-800 text-stone-300 font-semibold">
                                        {p.brand}
                                      </span>
                                    )}
                                    {p.sku && (
                                      <span className="text-[10px] text-stone-400 font-mono">
                                        SKU: {p.sku}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <span className="text-xs sm:text-sm font-extrabold text-emerald-400 shrink-0">
                                {p.price.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
                              </span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>

                {/* Selected Product Card Preview & Button Continuar / Seguinte */}
                {activeProduct && (
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center gap-3.5 bg-stone-900/90 p-3 rounded-xl border border-stone-700/80">
                      <div className="w-14 h-14 rounded-lg bg-stone-800 flex items-center justify-center overflow-hidden shrink-0 relative border border-stone-700">
                        {activeProduct.image ? (
                          <Image
                            src={activeProduct.image}
                            alt={activeProduct.title}
                            fill
                            unoptimized={activeProduct.image.startsWith('http')}
                            className="object-contain p-1"
                          />
                        ) : (
                          <span className="text-2xl">
                            {activeCategory === 'pallets' ? '🪵' : activeCategory === 'fireplaces' ? '🔥' : '❄️'}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold text-red-400 tracking-wider">
                            {activeProduct.categoryName || 'HLG Hausgeräte'}
                          </span>
                          {activeProduct.sku && (
                            <span className="text-[10px] text-stone-400 font-mono">
                              SKU: {activeProduct.sku}
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-white text-xs sm:text-sm line-clamp-1">{activeProduct.title}</h4>
                        <span className="text-emerald-400 font-extrabold text-sm block mt-0.5">
                          {activeProduct.price.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
                        </span>
                      </div>
                    </div>

                    {/* Button Continuar / Seguinte */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsStep2Collapsed(true);
                        setTimeout(() => {
                          const step3 = document.getElementById('step-3-destination');
                          if (step3) {
                            step3.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                          }
                        }, 120);
                      }}
                      className="w-full py-3.5 px-4 bg-red-600 hover:bg-red-700 active:scale-98 text-white font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer mt-1"
                    >
                      <span>Continuar para Destino de Entrega</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 3. Destination, 4. Speed & 5. Quantity displayed when Step 2 is validated/collapsed */}
            {isStep2Collapsed ? (
              <div id="step-3-destination" className="space-y-6 pt-1 transition-all">
                {/* 3. Destination Scope & Zone Selector (Nacional / Internacional) */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-stone-300 uppercase tracking-wider block">
                      3. Destino de Entrega
                    </label>
                    <div className="inline-flex rounded-lg p-0.5 bg-stone-900 border border-stone-700">
                      <button
                        type="button"
                        onClick={() => {
                          setDestinationScope('nacional');
                          if (destinationKey === 'espanha' || destinationKey === 'franca' || destinationKey === 'alemanha') {
                            setDestinationKey('braga');
                          }
                        }}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${destinationScope === 'nacional'
                          ? 'bg-red-600 text-white shadow'
                          : 'text-stone-400 hover:text-white'
                          }`}
                      >
                        🇵🇹 Nacional
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDestinationScope('internacional');
                          if (destinationKey !== 'espanha' && destinationKey !== 'franca' && destinationKey !== 'alemanha') {
                            setDestinationKey('espanha');
                          }
                        }}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${destinationScope === 'internacional'
                          ? 'bg-red-600 text-white shadow'
                          : 'text-stone-400 hover:text-white'
                          }`}
                      >
                        🌍 Internacional
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    {destinationScope === 'nacional' ? (
                      <>
                        {/* Postal Code input for PT */}
                        <div className="sm:col-span-4">
                          <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                            Código Postal (PT)
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: 4700-001"
                            maxLength={8}
                            value={postalCode}
                            onChange={(e) => {
                              const val = e.target.value;
                              setPostalCode(val);
                              const detected = detectDistrictFromPostalCode(val);
                              if (detected) setDestinationKey(detected);
                            }}
                            className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-600 rounded-xl text-sm text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
                          />
                        </div>

                        {/* Portuguese Regions dropdown */}
                        <div className="sm:col-span-8">
                          <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                            Zona de Entrega Nacional
                          </label>
                          <select
                            value={destinationKey}
                            onChange={(e) => setDestinationKey(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-600 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
                          >
                            <option value="braga">Braga (Sede & Entrega Direta)</option>
                            <option value="porto">Porto & Grande Porto</option>
                            <option value="viana">Viana do Castelo & Alto Minho</option>
                            <option value="aveiro_coimbra">Aveiro, Coimbra & Leiria</option>
                            <option value="lisboa_valetejo">Lisboa, Setúbal & Vale do Tejo</option>
                            <option value="vilareal_braganca">Vila Real & Bragança (Trás-os-Montes)</option>
                            <option value="viseu_guarda">Viseu, Guarda & Castelo Branco</option>
                            <option value="alentejo">Évora, Beja & Portalegre (Alentejo)</option>
                            <option value="faro">Faro & Algarve</option>
                            <option value="ilhas">Açores & Madeira (Regiões Autónomas)</option>
                          </select>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* International Served Countries dropdown */}
                        <div className="sm:col-span-12">
                          <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                            País de Destino Internacional
                          </label>
                          <select
                            value={destinationKey}
                            onChange={(e) => setDestinationKey(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-600 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
                          >
                            <option value="espanha">🇪🇸 Espanha Peninsular (Galiza, Madrid, Andaluzia - Logística Ibérica)</option>
                            <option value="franca">🇫🇷 França (Hexagone - Transporte Especializado)</option>
                            <option value="alemanha">🇩🇪 Alemanha (Deutschland - Transporte Especializado Europa Central)</option>
                          </select>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* 4. Modalidade de Envio (Standard vs Expresso) */}
                <div>
                  <label className="text-[11px] font-bold text-stone-300 uppercase tracking-wider block mb-1.5">
                    4. Modalidade de Envio
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setShippingSpeed('standard')}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 ${shippingSpeed === 'standard'
                        ? 'bg-stone-800 border-red-500 text-white ring-1 ring-red-500 shadow-md'
                        : 'bg-stone-900/60 border-stone-700 text-stone-400 hover:text-white'
                        }`}
                    >
                      <span>🚛</span>
                      <span>{destinationScope === 'internacional' ? 'Standard (5 a 7 dias úteis)' : 'Standard (3 a 5 dias úteis)'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShippingSpeed('express')}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 ${shippingSpeed === 'express'
                        ? 'bg-amber-600/20 border-amber-500 text-amber-300 ring-1 ring-amber-500 shadow-md shadow-amber-500/20'
                        : 'bg-stone-900/60 border-stone-700 text-stone-400 hover:text-white'
                        }`}
                    >
                      <span>⚡</span>
                      <span>{destinationScope === 'internacional' ? 'Expresso (72h úteis)' : 'Expresso (48h úteis)'}</span>
                    </button>
                  </div>
                </div>

                {/* 5. Quantity Selector */}
                {activeCategory === 'pallets' && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[11px] font-bold text-stone-300 uppercase tracking-wider">
                        5. Quantidade de Paletes
                      </label>
                      <span className="text-[11px] text-amber-400 font-semibold">
                        ⭐ Portes 100% Grátis a partir de 3 paletes
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[1, 2, 3, 4].map((qty) => (
                        <button
                          key={qty}
                          type="button"
                          onClick={() => setPalletQty(qty)}
                          className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${palletQty === qty
                            ? 'bg-red-600 border-red-500 text-white shadow-md'
                            : 'bg-stone-800/80 border-stone-700 text-stone-300 hover:bg-stone-700/80 hover:text-white'
                            }`}
                        >
                          {qty === 4 ? '4+ Paletes' : `${qty} Palete${qty > 1 ? 's' : ''}`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeCategory === 'climate' && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[11px] font-bold text-stone-300 uppercase tracking-wider">
                        5. Quantidade de Climatizadores
                      </label>
                      <span className="text-[11px] text-amber-400 font-semibold">
                        ⭐ Portes 100% Grátis a partir de 2 aparelhos
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3].map((qty) => (
                        <button
                          key={qty}
                          type="button"
                          onClick={() => setAcQty(qty)}
                          className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${acQty === qty
                            ? 'bg-red-600 border-red-500 text-white shadow-md'
                            : 'bg-stone-800/80 border-stone-700 text-stone-300 hover:bg-stone-700/80 hover:text-white'
                            }`}
                        >
                          {qty === 3 ? '3+ Aparelhos' : `${qty} Climatizador${qty > 1 ? 'es' : ''}`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-stone-900/40 border border-stone-800/80 text-center text-xs text-stone-400 flex items-center justify-center gap-2">
                <span className="text-stone-500">🔒</span>
                <span>
                  {activeProduct
                    ? 'Clique em «Continuar para Destino de Entrega» para avançar para a Etapa 3.'
                    : 'A Etapa 3 (Destino de Entrega) ficará disponível após selecionar um produto acima.'}
                </span>
              </div>
            )}

          </div>

          {/* Right Column: Dynamic Calibrated Price & Direct Checkout (Only shown after product is selected) */}
          {activeProduct && (
            <div className="lg:col-span-5 bg-stone-800/90 rounded-2xl p-6 border border-stone-700 shadow-xl flex flex-col justify-between animate-fadeIn transition-all duration-300">
              <div className="space-y-4">

                <div className="flex items-start justify-between border-b border-stone-700 pb-3">
                  <div>
                    <span className="text-xs text-stone-400 block font-semibold">Destino Selecionado</span>
                    <h4 className="font-extrabold text-white text-base mt-0.5">{currentDestination.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-stone-700/80 text-stone-300 border border-stone-600">
                        {currentDestination.region}
                      </span>
                    </div>
                  </div>
                  <span className="text-2xl">
                    {currentDestination.country === 'PT' ? '🇵🇹' : currentDestination.country === 'ES' ? '🇪🇸' : currentDestination.country === 'FR' ? '🇫🇷' : currentDestination.country === 'DE' ? '🇩🇪' : '🏝️'}
                  </span>
                </div>

                {/* Price Display */}
                <div className="bg-stone-900/90 rounded-xl p-4 border border-stone-700/80 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-stone-400 block uppercase font-bold tracking-wider">
                      Custo de Envio Calibrado
                    </span>
                    {calculation.isFree ? (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-2xl sm:text-3xl font-black text-emerald-400">GRÁTIS</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/30">
                          {calculation.badge}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl sm:text-3xl font-black text-white">
                          {calculation.rate.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-stone-800 text-stone-300 font-bold border border-stone-700">
                          {calculation.badge}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="w-12 h-12 rounded-xl bg-stone-800 flex items-center justify-center text-2xl shrink-0">
                    {calculation.isFree ? '🎁' : shippingSpeed === 'express' ? '⚡' : '🚛'}
                  </div>
                </div>

                {/* Rule Explanation Banner */}
                <div className="p-3.5 rounded-xl bg-stone-900/60 border border-stone-700 text-xs text-stone-300 leading-relaxed space-y-1">
                  <span className="font-bold text-white block">Condições de Envio:</span>
                  <p>{calculation.explanation}</p>
                </div>

                {/* Delivery Details */}
                <div className="space-y-2 text-xs border-t border-stone-700/60 pt-3">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-stone-400">Modalidade:</span>
                    <span className="text-white font-bold">
                      {shippingSpeed === 'express' ? '⚡ Expresso Prioritário' : '🚛 Standard com Plataforma'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-stone-400">Prazo Estimado:</span>
                    <span className="text-white font-bold">
                      {shippingSpeed === 'express' ? currentDestination.timeframeExpress : currentDestination.timeframe}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-stone-400">Descarga com Hayon:</span>
                    <span className="text-emerald-400 font-bold">Incluída à Porta</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-stone-400">Aviso Prévio por Telefone:</span>
                    <span className="text-white font-bold">Sim, prévio ao envio</span>
                  </div>
                </div>

              </div>

              {/* Direct Order Button leading directly to Checkout */}
              <div className="mt-6 pt-2">
                <button
                  type="button"
                  onClick={handleOrderAndCheckout}
                  className="w-full py-3.5 px-4 rounded-xl font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 active:scale-[0.99] text-white shadow-red-600/30"
                >
                  <span className="whitespace-nowrap truncate max-w-[240px] sm:max-w-[280px]">
                    Encomendar {conciseProductTitle}
                  </span>
                  <span className="shrink-0 text-base font-bold">&rarr;</span>
                </button>
                <p className="text-[11px] text-stone-400 text-center mt-2.5">
                  Redirecionamento imediato para o Checkout com taxa de{' '}
                  <span className="text-emerald-400 font-semibold">
                    {calculation.rate === 0 ? '0,00 € (Grátis)' : `${calculation.rate.toFixed(2)} €`}
                  </span>{' '}
                  aplicada
                </p>
              </div>

            </div>
          )}

        </div>

      </div>
    </section>
  );
}
