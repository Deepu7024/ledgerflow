import React from 'react';
import { Category } from '../types';
import { CATEGORY_STYLES } from '../constants';

export default function CategoryBadge({ category }: { category: Category }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${CATEGORY_STYLES[category]}`}
    >
      {category}
    </span>
  );
}
