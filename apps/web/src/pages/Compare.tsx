import { useState } from 'react';
import { useProducts, useCompareProducts } from '../hooks/queries';
import { GraphViewer } from '../components/graph/GraphViewer';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { ArrowLeftRight, Link as LinkIcon } from 'lucide-react';

export function Compare() {
  const [product1, setProduct1] = useState<string>('');
  const [product2, setProduct2] = useState<string>('');

  const { data: products, isLoading: isLoadingProducts } = useProducts();
  
  const { 
    data: compareData, 
    isLoading: isLoadingCompare, 
    isError: isCompareError,
    error: compareError,
    refetch: refetchCompare
  } = useCompareProducts(product1, product2);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] gap-4 animate-in fade-in duration-500">
      
      {/* Product Selectors */}
      <div className="bg-card p-4 rounded-xl border border-card-hover flex flex-wrap items-end gap-4 shrink-0">
        <div className="flex-1 min-w-[250px]">
          <label className="block text-sm font-medium text-foreground/70 mb-2">First Product</label>
          <select 
            className="w-full bg-background border border-card-hover rounded-md px-3 py-2 text-sm focus:border-primary focus:outline-none"
            value={product1}
            onChange={(e) => setProduct1(e.target.value)}
            disabled={isLoadingProducts}
          >
            <option value="">-- Choose first product --</option>
            {products?.map(p => (
              <option key={p.id} value={p.id} disabled={p.id === product2}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="hidden md:flex mb-2 text-foreground/40 px-4">
          <ArrowLeftRight className="w-6 h-6" />
        </div>

        <div className="flex-1 min-w-[250px]">
          <label className="block text-sm font-medium text-foreground/70 mb-2">Second Product</label>
          <select 
            className="w-full bg-background border border-card-hover rounded-md px-3 py-2 text-sm focus:border-primary focus:outline-none"
            value={product2}
            onChange={(e) => setProduct2(e.target.value)}
            disabled={isLoadingProducts}
          >
            <option value="">-- Choose second product --</option>
            {products?.map(p => (
              <option key={p.id} value={p.id} disabled={p.id === product1}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {!product1 || !product2 ? (
        <EmptyState 
          title="Compare Products" 
          description="Select two different products to discover their hidden shared dependencies across the supply chain."
          icon={<ArrowLeftRight className="w-10 h-10 text-primary" />}
        />
      ) : product1 === product2 ? (
         <EmptyState 
          title="Invalid Selection" 
          description="Please select two different products to compare."
          icon={<ArrowLeftRight className="w-10 h-10 text-danger" />}
        />
      ) : isLoadingCompare ? (
        <LoadingState message="Analyzing shared supply chain dependencies..." />
      ) : isCompareError ? (
        <ErrorState 
          message="Failed to compare products." 
          code={(compareError as any)?.code}
          onRetry={refetchCompare}
        />
      ) : compareData?.sharedEntities.length === 0 ? (
        <EmptyState 
          title="No Shared Dependencies" 
          description="These two products do not share any common suppliers, components, facilities, or countries within 4 hops."
          icon={<LinkIcon className="w-10 h-10 text-foreground/40" />}
        />
      ) : (
        <div className="flex-1 flex flex-col xl:flex-row gap-6 min-h-0">
          
          {/* Left Column: List of shared entities */}
          <div className="w-full xl:w-[350px] bg-card rounded-xl border border-card-hover overflow-hidden flex flex-col shrink-0">
            <div className="p-4 border-b border-card-hover bg-card/50">
              <h3 className="font-semibold flex items-center gap-2 text-primary">
                <LinkIcon className="w-4 h-4" />
                Shared Dependencies ({compareData?.sharedEntities.length || 0})
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {compareData?.sharedEntities.map(entity => (
                <div key={entity.id} className="p-3 border border-card-hover rounded-lg bg-background flex flex-col">
                  <span className="text-xs text-primary mb-1 uppercase tracking-wider">{entity.label}</span>
                  <span className="font-medium text-sm">{entity.name || entity.id}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Graph showing connection paths */}
          <div className="flex-1 bg-card/20 rounded-xl border border-card-hover overflow-hidden min-h-[400px]">
            <GraphViewer data={compareData!.graph} />
          </div>

        </div>
      )}
    </div>
  );
}
