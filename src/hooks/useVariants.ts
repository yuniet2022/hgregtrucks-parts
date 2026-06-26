import { trpc } from '@/providers/trpc';
import type { PartVariant } from '../types/Part';

export type { PartVariant };

export function useVariants(partId?: number) {
  const utils = trpc.useUtils();

  const { data: variants = [], isLoading: loading } = trpc.variants.listByPart.useQuery(
    { partId: partId! },
    { enabled: !!partId }
  );

  const createMutation = trpc.variants.create.useMutation({
    onSuccess: () => utils.variants.listByPart.invalidate({ partId: partId! }),
  });

  const updateMutation = trpc.variants.update.useMutation({
    onSuccess: () => utils.variants.listByPart.invalidate({ partId: partId! }),
  });

  const deleteMutation = trpc.variants.delete.useMutation({
    onSuccess: () => utils.variants.listByPart.invalidate({ partId: partId! }),
  });

  const batchUpdateMutation = trpc.variants.batchUpdate.useMutation({
    onSuccess: () => utils.variants.listByPart.invalidate({ partId: partId! }),
  });

  return {
    variants,
    loading,
    createVariant: createMutation.mutate,
    updateVariant: updateMutation.mutate,
    deleteVariant: deleteMutation.mutate,
    batchUpdate: batchUpdateMutation.mutate,
    isBatchUpdating: batchUpdateMutation.isPending,
  };
}
