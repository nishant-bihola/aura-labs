'use client';
import { useMemo } from 'react';
import { useStore } from './store';
import { DEFAULT_CATEGORIES, CategoryDef } from './types';

export function useCategories() {
  const customCategories = useStore((s) => s.customCategories);
  return useMemo(() => {
    const categories = [...DEFAULT_CATEGORIES, ...customCategories];
    const categoryMap = Object.fromEntries(
      categories.map((c) => [c.id, c])
    ) as Record<string, CategoryDef>;
    const categoryIds = categories.map((c) => c.id);
    return { categories, categoryMap, categoryIds };
  }, [customCategories]);
}
