import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { 
  DashboardSummary, 
  HighImpactSupplier, 
  SinglePointOfFailure,
  Product,
  RiskEvent,
  RiskImpactData,
  GraphResponse,
  Supplier,
  AlternativeSupplier,
  ComparisonData
} from '../types/api';

export const useHealthCheck = () => {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => apiClient.get<{ status: string; database: string }>('/health'),
    retry: false,
    refetchInterval: 30000, // Check every 30s
  });
};

export const useDashboardSummary = () => {
  return useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: () => apiClient.get<DashboardSummary>('/dashboard/summary'),
  });
};

export const useHighImpactSuppliers = () => {
  return useQuery({
    queryKey: ['dashboard', 'high-impact-suppliers'],
    queryFn: () => apiClient.get<HighImpactSupplier[]>('/dashboard/high-impact-suppliers'),
  });
};

export const useSinglePointsOfFailure = () => {
  return useQuery({
    queryKey: ['dashboard', 'single-points-of-failure'],
    queryFn: () => apiClient.get<SinglePointOfFailure[]>('/dashboard/single-points-of-failure'),
  });
};

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => apiClient.get<Product[]>('/products'),
  });
};

export const useProduct = (id?: string) => {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => apiClient.get<Product>(`/products/${id}`),
    enabled: !!id,
  });
};

export const useProductNetwork = (id?: string, hops: number = 3) => {
  return useQuery({
    queryKey: ['products', id, 'network', hops],
    queryFn: () => apiClient.get<GraphResponse>(`/products/${id}/network?hops=${hops}`),
    enabled: !!id,
  });
};

export const useCompareProducts = (firstId?: string, secondId?: string) => {
  return useQuery({
    queryKey: ['products', 'compare', firstId, secondId],
    queryFn: () => apiClient.get<ComparisonData>(`/products/compare?firstProductId=${firstId}&secondProductId=${secondId}`),
    enabled: !!firstId && !!secondId,
  });
};

export const useRisks = () => {
  return useQuery({
    queryKey: ['risks'],
    queryFn: () => apiClient.get<RiskEvent[]>('/risks'),
  });
};

export const useRisk = (id?: string) => {
  return useQuery({
    queryKey: ['risks', id],
    queryFn: () => apiClient.get<RiskEvent>(`/risks/${id}`),
    enabled: !!id,
  });
};

export const useRiskImpact = (id?: string) => {
  return useQuery({
    queryKey: ['risks', id, 'impact'],
    queryFn: () => apiClient.get<RiskImpactData>(`/risks/${id}/impact`),
    enabled: !!id,
  });
};

export const useSuppliers = () => {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: () => apiClient.get<Supplier[]>('/suppliers'),
  });
};

export const useSupplier = (id?: string) => {
  return useQuery({
    queryKey: ['suppliers', id],
    queryFn: () => apiClient.get<Supplier>(`/suppliers/${id}`),
    enabled: !!id,
  });
};

export const useSupplierImpact = (id?: string) => {
  return useQuery({
    queryKey: ['suppliers', id, 'impact'],
    queryFn: () => apiClient.get<{ affectedProducts: Product[]; graph: GraphResponse }>(`/suppliers/${id}/impact`),
    enabled: !!id,
  });
};

export const useSupplierAlternatives = (supplierId?: string, componentId?: string) => {
  return useQuery({
    queryKey: ['suppliers', supplierId, 'alternatives', componentId],
    queryFn: () => {
      let url = `/suppliers/${supplierId}/alternatives`;
      if (componentId) url += `?componentId=${componentId}`;
      return apiClient.get<AlternativeSupplier[]>(url);
    },
    enabled: !!supplierId,
  });
};

export const useProductToRiskPath = (productId?: string, riskId?: string) => {
  return useQuery({
    queryKey: ['paths', 'product-to-risk', productId, riskId],
    queryFn: () => apiClient.get<GraphResponse>(`/paths/product-to-risk?productId=${productId}&riskId=${riskId}`),
    enabled: !!productId && !!riskId,
  });
};
