'use client';

import React from 'react';

interface HeroPreviewEditButtonProps {
  sectionId: string;
  blockNum: number;
  label?: string;
}

export default function HeroPreviewEditButton({
  sectionId,
  blockNum,
  label,
}: HeroPreviewEditButtonProps) {
  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    window.parent.postMessage(
      {
        type: 'EDIT_SECTION',
        sectionId,
        blockNum,
      },
      '*'
    );
  };

  const tooltip =
    label || (blockNum === 0 ? 'Hero-Bereich (Höhe & Layout)' : `Block ${blockNum} bearbeiten`);

  return (
    <button
      type="button"
      onClick={handleEditClick}
      className="absolute top-3 right-3 z-[70] bg-[#107b46] text-white p-2 rounded-full pointer-events-auto opacity-0 group-hover/block:opacity-100 transition-all duration-200 hover:bg-[#0d693b] hover:scale-110 shadow-lg flex items-center gap-1.5 ring-2 ring-white cursor-pointer"
      title={tooltip}
      aria-label={tooltip}
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.2}
          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
        />
      </svg>
    </button>
  );
}
