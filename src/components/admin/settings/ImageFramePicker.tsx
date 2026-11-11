'use client';

import React from 'react';
import Image from 'next/image';

interface ImageFramePickerProps {
  label: string;
  imageUrl?: string;
  onSelectClick: () => void;
  onClearClick: () => void;
  objectFit?: 'cover' | 'contain';
  heightClass?: string;
}

/**
 * Clickable image frame picker matching Elementor UX:
 * - Empty state: clickable frame with + / image icon to select or upload.
 * - Populated state: image preview with hover overlay showing edit (pencil) and remove (trash) icons.
 */
export function ImageFramePicker({
  label,
  imageUrl,
  onSelectClick,
  onClearClick,
  objectFit = 'cover',
  heightClass = 'h-28',
}: ImageFramePickerProps) {
  const hasImage = Boolean(imageUrl && imageUrl.trim().length > 0);

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
        {label}
      </label>

      {hasImage ? (
        <div
          onClick={onSelectClick}
          className={`relative w-full ${heightClass} rounded-xl border border-gray-300 overflow-hidden bg-stone-100 group cursor-pointer shadow-2xs`}
          title="Bild ändern"
        >
          <Image
            src={imageUrl!}
            alt={label}
            fill
            sizes="280px"
            className={objectFit === 'contain' ? 'object-contain p-2' : 'object-cover'}
          />

          {/* Hover overlay with Edit (pencil) and Delete (trash) icons */}
          <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectClick();
              }}
              className="w-8 h-8 rounded-full bg-white text-stone-800 hover:bg-[#107b46] hover:text-white flex items-center justify-center shadow-md transition-colors cursor-pointer"
              title="Bild ändern"
              aria-label="Bild ändern"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClearClick();
              }}
              className="w-8 h-8 rounded-full bg-white text-red-600 hover:bg-red-600 hover:text-white flex items-center justify-center shadow-md transition-colors cursor-pointer"
              title="Bild entfernen"
              aria-label="Bild entfernen"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={onSelectClick}
          className={`w-full ${heightClass} rounded-xl border-2 border-dashed border-stone-300 hover:border-[#107b46] bg-stone-50 hover:bg-emerald-50/40 flex flex-col items-center justify-center gap-1.5 text-stone-400 hover:text-[#107b46] transition-all cursor-pointer group`}
          title="Bild hinzufügen"
        >
          <svg
            className="w-6 h-6 transition-transform group-hover:scale-110"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-[11px] font-semibold">Bild hinzufügen</span>
        </button>
      )}
    </div>
  );
}

interface EditorModeTabsProps {
  mode: 'content' | 'design';
  onChange: (mode: 'content' | 'design') => void;
}

/**
 * Single horizontal icon-only tab strip for Content & Design settings.
 */
export function EditorModeTabs({ mode, onChange }: EditorModeTabsProps) {
  return (
    <div className="grid grid-cols-2 border-y border-gray-200 bg-white shrink-0">
      <button
        type="button"
        onClick={() => onChange('content')}
        title="Inhalt"
        aria-label="Inhalt"
        className={`py-2.5 flex items-center justify-center transition-colors cursor-pointer relative ${
          mode === 'content'
            ? 'text-slate-900 border-b-2 border-slate-900 bg-slate-50/50'
            : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50 border-b-2 border-transparent'
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
          />
        </svg>
      </button>

      <button
        type="button"
        onClick={() => onChange('design')}
        title="Design"
        aria-label="Design"
        className={`py-2.5 flex items-center justify-center transition-colors cursor-pointer relative ${
          mode === 'design'
            ? 'text-slate-900 border-b-2 border-slate-900 bg-slate-50/50'
            : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50 border-b-2 border-transparent'
        }`}
      >
        {/* Half-filled circle contrast icon matching Elementor Style tab */}
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="9" strokeWidth={2} />
          <path d="M12 3a9 9 0 0 0 0 18V3z" fill="currentColor" stroke="none" />
        </svg>
      </button>
    </div>
  );
}

