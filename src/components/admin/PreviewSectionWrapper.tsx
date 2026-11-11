'use client';

import React from 'react';

interface PreviewSectionWrapperProps {
  sectionId: string;
  sectionName: string;
  children: React.ReactNode;
}

export default function PreviewSectionWrapper({ sectionId, sectionName, children }: PreviewSectionWrapperProps) {
  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Notify the parent window (admin dashboard) that this section wants to be edited
    window.parent.postMessage({
      type: 'EDIT_SECTION',
      sectionId: sectionId,
      blockNum: 0
    }, '*');
  };

  return (
    <div className="relative group/preview w-full">
      {/* Overlay border and edit button that appears on hover */}
      <div className="absolute inset-0 pointer-events-none z-50 border-2 border-transparent group-hover/preview:border-orange-500 transition-colors duration-200">
        <button
          type="button"
          onClick={handleEditClick}
          className="absolute top-0 right-0 bg-orange-500 text-white px-2.5 py-2 rounded-bl-lg pointer-events-auto opacity-0 group-hover/preview:opacity-100 transition-opacity duration-200 hover:bg-orange-600 flex items-center gap-1.5 shadow-md cursor-pointer"
          title={`${sectionName} bearbeiten`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
        </button>
      </div>

      {/* The actual section content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
