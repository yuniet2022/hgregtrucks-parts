import { useState, useCallback } from 'react';
import { trpc } from '@/providers/trpc';
import type { Part } from '../types/Part';

export type { Part };

export function useParts() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterMake, setFilterMake] = useState('');

  const utils = trpc.useUtils();

  // Fetch all parts from backend
  const { data: parts = [], isLoading: loading } = trpc.parts.list.useQuery();

  // Create part
  const createMutation = trpc.parts.create.useMutation({
    onSuccess: () => utils.parts.list.invalidate(),
  });

  // Update part
  const updateMutation = trpc.parts.update.useMutation({
    onSuccess: () => utils.parts.list.invalidate(),
  });

  // Delete part
  const deleteMutation = trpc.parts.delete.useMutation({
    onSuccess: () => utils.parts.list.invalidate(),
  });

  // Seed parts
  const seedMutation = trpc.parts.seed.useMutation({
    onSuccess: () => utils.parts.list.invalidate(),
  });

  const addPart = useCallback(
    (part: Omit<Part, 'id'>) => {
      createMutation.mutate(part as any);
    },
    [createMutation]
  );

  const updatePart = useCallback(
    (id: number, updates: Partial<Part>) => {
      updateMutation.mutate({ id, ...updates } as any);
    },
    [updateMutation]
  );

  const deletePart = useCallback(
    (id: number) => {
      deleteMutation.mutate({ id });
    },
    [deleteMutation]
  );

  const seedParts = useCallback(() => {
    seedMutation.mutate();
  }, [seedMutation]);

  // Client-side filtering
  const filtered = parts.filter((p) => {
    const q = searchTerm.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
    const matchCategory = !filterCategory || p.category === filterCategory;
    const matchMake = !filterMake || p.make === filterMake;
    return matchSearch && matchCategory && matchMake;
  });

  const categories = Array.from(new Set(parts.map((p) => p.category))).sort();
  const makes = Array.from(new Set(parts.map((p) => p.make))).sort();

  return {
    parts,
    filtered,
    loading,
    searchTerm,
    setSearchTerm,
    filterCategory,
    setFilterCategory,
    filterMake,
    setFilterMake,
    categories,
    makes,
    addPart,
    updatePart,
    deletePart,
    seedParts,
  };
}
