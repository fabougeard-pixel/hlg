'use client';

import React from 'react';
import Image from 'next/image';

interface BrandWordmarkSpec {
  label: string;
  color: string;
  accent?: string;
  style: 'circle-emblem' | 'badge' | 'caps-wide' | 'serif' | 'italic-bold' | 'split-accent' | 'clean-sans';
}

const BRAND_WORDMARKS: Record<string, BrandWordmarkSpec> = {
  bosch: {
    label: 'BOSCH',
    color: '#E20015',
    accent: '#4B5563',
    style: 'circle-emblem',
  },
  siemens: {
    label: 'SIEMENS',
    color: '#009999',
    style: 'caps-wide',
  },
  miele: {
    label: 'Miele',
    color: '#FFFFFF',
    accent: '#A6001A',
    style: 'badge',
  },
  samsung: {
    label: 'SAMSUNG',
    color: '#FFFFFF',
    accent: '#1428A0',
    style: 'badge',
  },
  aeg: {
    label: 'AEG',
    color: '#C8102E',
    accent: '#111827',
    style: 'split-accent',
  },
  delonghi: {
    label: "De'Longhi",
    color: '#003B71',
    accent: '#B45309',
    style: 'serif',
  },
  jura: {
    label: 'jura',
    color: '#1C1917',
    accent: '#DC2626',
    style: 'split-accent',
  },
  roborock: {
    label: 'roborock',
    color: '#18181B',
    accent: '#E1251B',
    style: 'split-accent',
  },
  kitchenaid: {
    label: 'KitchenAid',
    color: '#C8102E',
    style: 'italic-bold',
  },
  haier: {
    label: 'Haier',
    color: '#0C5DA8',
    style: 'italic-bold',
  },
  bauknecht: {
    label: 'Bauknecht',
    color: '#004B87',
    accent: '#009FE3',
    style: 'split-accent',
  },
  candy: {
    label: 'Candy',
    color: '#00A0DF',
    style: 'italic-bold',
  },
  lg: {
    label: 'LG',
    color: '#1F2937',
    accent: '#A50034',
    style: 'circle-emblem',
  },
  philips: {
    label: 'PHILIPS',
    color: '#0B5ED7',
    style: 'caps-wide',
  },
  melitta: {
    label: 'Melitta',
    color: '#FFFFFF',
    accent: '#E30613',
    style: 'badge',
  },
  kenwood: {
    label: 'KENWOOD',
    color: '#111827',
    accent: '#D97706',
    style: 'split-accent',
  },
  sage: {
    label: 'Sage',
    color: '#27272A',
    style: 'serif',
  },
  dreame: {
    label: 'dreame',
    color: '#18181B',
    accent: '#A16207',
    style: 'caps-wide',
  },
  beko: {
    label: 'beko',
    color: '#FFFFFF',
    accent: '#0072CE',
    style: 'badge',
  },
  krups: {
    label: 'KRUPS',
    color: '#111827',
    accent: '#E11D48',
    style: 'caps-wide',
  },
  bomann: {
    label: 'BOMANN',
    color: '#1E3A8A',
    style: 'caps-wide',
  },
  ninja: {
    label: 'NINJA',
    color: '#111827',
    accent: '#107b46',
    style: 'caps-wide',
  },
};

export function normalizeBrandKey(nameOrSlug: string): string {
  return nameOrSlug
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

interface BrandLogoMarkProps {
  name: string;
  slug?: string;
  logo?: string | null;
  height?: number;
}

/**
 * Renders an uploaded brand logo (raster or SVG) when set in Admin/Landing Editor,
 * falling back to a crisp vector brand wordmark SVG so cards always display as brand logos.
 */
export default function BrandLogoMark({
  name,
  slug,
  logo,
  height = 38,
}: BrandLogoMarkProps) {
  const trimmedLogo = typeof logo === 'string' ? logo.trim() : '';

  if (trimmedLogo) {
    const isSvg = /\.svg(\?|$)/i.test(trimmedLogo);
    return (
      <div
        className="relative w-full max-w-[140px] flex items-center justify-center"
        style={{ height: `${Math.max(28, Math.min(64, height + 6))}px` }}
      >
        <Image
          src={trimmedLogo}
          alt={name}
          fill
          sizes="140px"
          unoptimized={isSvg}
          className="object-contain transition-transform duration-200 group-hover:scale-105"
        />
      </div>
    );
  }

  const key = normalizeBrandKey(slug || name) || normalizeBrandKey(name);
  const spec = BRAND_WORDMARKS[key] || {
    label: name,
    color: '#1c1917',
    style: 'clean-sans' as const,
  };

  const svgHeight = Math.max(26, Math.min(56, height));

  if (spec.style === 'badge') {
    const bgColor = spec.accent || spec.color;
    return (
      <svg
        viewBox="0 0 180 48"
        role="img"
        aria-label={name}
        style={{ height: `${svgHeight}px` }}
        className="w-auto max-w-[144px] transition-transform duration-200 group-hover:scale-105"
      >
        <rect x="14" y="6" width="152" height="36" rx="8" fill={bgColor} />
        <text
          x="90"
          y="30"
          textAnchor="middle"
          fill={spec.color}
          fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif"
          fontWeight="800"
          fontSize="19"
          letterSpacing="1.4"
        >
          {spec.label}
        </text>
      </svg>
    );
  }

  if (spec.style === 'circle-emblem') {
    const emblemStroke = spec.accent || spec.color;
    return (
      <svg
        viewBox="0 0 180 48"
        role="img"
        aria-label={name}
        style={{ height: `${svgHeight}px` }}
        className="w-auto max-w-[148px] transition-transform duration-200 group-hover:scale-105"
      >
        <circle cx="28" cy="24" r="13" fill="none" stroke={emblemStroke} strokeWidth="2.8" />
        <circle cx="28" cy="24" r="5" fill="none" stroke={emblemStroke} strokeWidth="2.2" />
        <line x1="19" y1="15" x2="24" y2="20" stroke={emblemStroke} strokeWidth="2" />
        <line x1="37" y1="33" x2="32" y2="28" stroke={emblemStroke} strokeWidth="2" />
        <text
          x="105"
          y="30"
          textAnchor="middle"
          fill={spec.color}
          fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif"
          fontWeight="900"
          fontSize="20"
          letterSpacing="1.6"
        >
          {spec.label}
        </text>
      </svg>
    );
  }

  if (spec.style === 'split-accent') {
    return (
      <svg
        viewBox="0 0 180 48"
        role="img"
        aria-label={name}
        style={{ height: `${svgHeight}px` }}
        className="w-auto max-w-[146px] transition-transform duration-200 group-hover:scale-105"
      >
        <text
          x="90"
          y="29"
          textAnchor="middle"
          fill={spec.color}
          fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif"
          fontWeight="900"
          fontSize="21"
          letterSpacing="1.1"
        >
          {spec.label}
        </text>
        <rect
          x="52"
          y="36"
          width="76"
          height="3.2"
          rx="1.6"
          fill={spec.accent || spec.color}
        />
      </svg>
    );
  }

  const isSerif = spec.style === 'serif';
  const isItalic = spec.style === 'italic-bold';
  const isWide = spec.style === 'caps-wide';

  return (
    <svg
      viewBox="0 0 180 48"
      role="img"
      aria-label={name}
      style={{ height: `${svgHeight}px` }}
      className="w-auto max-w-[148px] transition-transform duration-200 group-hover:scale-105"
    >
      <text
        x="90"
        y="31"
        textAnchor="middle"
        fill={spec.color}
        fontFamily={
          isSerif
            ? "Georgia, 'Times New Roman', serif"
            : "system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif"
        }
        fontWeight={isSerif ? '700' : '900'}
        fontStyle={isItalic ? 'italic' : 'normal'}
        fontSize={spec.label.length > 9 ? '18' : '21'}
        letterSpacing={isWide ? '2.2' : '0.4'}
      >
        {spec.label}
      </text>
    </svg>
  );
}

