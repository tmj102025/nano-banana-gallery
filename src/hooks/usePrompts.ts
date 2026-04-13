import { useState, useEffect, useMemo } from 'react';
import type { Prompt, PromptsData } from '../types';

export function usePrompts() {
  const [data, setData] = useState<PromptsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/prompts.json')
      .then(r => r.json())
      .then((d: PromptsData) => {
        setData(d);
        setLoading(false);
      });
  }, []);

  return { data, loading };
}

export function useFilteredPrompts(
  prompts: Prompt[],
  searchQuery: string,
  selectedCategories: string[]
) {
  return useMemo(() => {
    let filtered = prompts;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        p =>
          p.title.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    if (selectedCategories.length > 0) {
      filtered = filtered.filter(p =>
        selectedCategories.some(cat => p.categories.includes(cat))
      );
    }

    return filtered;
  }, [prompts, searchQuery, selectedCategories]);
}
