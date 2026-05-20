// hooks/useContentFilter.ts
import { useState, useCallback } from "react";

export function useContentFilter(initialFilters = {}) {
  const [filters, setFilters] = useState({
    searchQuery: "",
    genre: "all",
    musicKey: "all",
    bpm: { min: 60, max: 180 },
    sortBy: "createdAt",
    ...initialFilters
  });

  const updateFilter = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return { filters, updateFilter };
}