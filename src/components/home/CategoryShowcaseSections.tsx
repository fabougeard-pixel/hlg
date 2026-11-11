'use client';

import React from 'react';
import CategoryShowcaseSection from './CategoryShowcaseSection';
import CategoryOverviewSection from './CategoryOverviewSection';
import { CatalogProductSummary } from './categorySectionData';

export default function CategoryShowcaseSections({
  catalogProducts = [],
}: {
  catalogProducts?: CatalogProductSummary[];
}) {
  return (
    <div className="space-y-4">
      <CategoryShowcaseSection config={{ preset: 'coffee' }} catalogProducts={catalogProducts} />
      <CategoryShowcaseSection config={{ preset: 'washing' }} catalogProducts={catalogProducts} />
      <CategoryShowcaseSection config={{ preset: 'cooling' }} catalogProducts={catalogProducts} />
      <CategoryShowcaseSection config={{ preset: 'vacuum' }} catalogProducts={catalogProducts} />
      <CategoryOverviewSection />
    </div>
  );
}
