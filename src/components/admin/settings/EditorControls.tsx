'use client';

import React from 'react';

export function EditorColorField({
  label,
  value,
  defaultValue,
  onChange,
}: {
  label: string;
  value?: string;
  defaultValue: string;
  onChange: (val: string) => void;
}) {
  const current = value || defaultValue;
  return (
    <div className="flex items-center justify-between gap-2 py-1">
      <span className="text-xs font-medium text-gray-700">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-mono text-gray-400 uppercase">{current}</span>
        <div className="relative w-8 h-7 rounded-md overflow-hidden border border-gray-300 shadow-2xs cursor-pointer shrink-0">
          <input
            type="color"
            value={current.startsWith('#') ? current : defaultValue}
            onChange={(e) => onChange(e.target.value)}
            className="absolute -top-2 -left-2 w-14 h-14 cursor-pointer border-0 p-0"
          />
        </div>
      </div>
    </div>
  );
}

export function EditorRangeField({
  label,
  value,
  defaultValue,
  min,
  max,
  unit = 'px',
  onChange,
}: {
  label: string;
  value?: number | string;
  defaultValue: number;
  min: number;
  max: number;
  unit?: string;
  onChange: (val: number) => void;
}) {
  const current = value !== undefined && value !== '' ? Number(value) : defaultValue;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="font-mono text-[11px] font-bold text-[#107b46]">
          {current}
          {unit}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={min}
          max={max}
          value={current}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 accent-[#107b46] cursor-pointer"
        />
        <input
          type="number"
          min={min}
          max={max}
          value={current}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-14 text-center text-xs p-1 border border-gray-300 rounded-md"
        />
      </div>
    </div>
  );
}

export function EditorToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-2.5 bg-stone-50 border border-stone-200 rounded-lg gap-2">
      <div className="min-w-0">
        <p className="text-xs font-bold text-gray-800">{label}</p>
        {description && <p className="text-[10px] text-gray-500">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`w-10 h-5 rounded-full transition-colors p-0.5 cursor-pointer shrink-0 ${
          checked ? 'bg-[#107b46]' : 'bg-gray-300'
        }`}
        aria-pressed={checked}
      >
        <div
          className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

