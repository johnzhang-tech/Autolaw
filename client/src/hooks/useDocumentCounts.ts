import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface DocumentCount {
  transactionId: number;
  count: number;
}

export function useDocumentCounts(transactionIds: number[]) {
  return useQuery<Record<number, number>>({
    queryKey: ['/api/document-counts', transactionIds],
    queryFn: async () => {
      if (transactionIds.length === 0) return {};
      
      // Fetch document counts for all transactions
      const counts: Record<number, number> = {};
      
      await Promise.all(
        transactionIds.map(async (id) => {
          try {
            const documents = await apiRequest("GET", `/api/transactions/${id}/documents`);
            counts[id] = Array.isArray(documents) ? documents.length : 0;
          } catch (error) {
            console.error(`Failed to fetch documents for transaction ${id}:`, error);
            counts[id] = 0;
          }
        })
      );
      
      return counts;
    },
    enabled: transactionIds.length > 0,
    staleTime: 30000, // Cache for 30 seconds
  });
}