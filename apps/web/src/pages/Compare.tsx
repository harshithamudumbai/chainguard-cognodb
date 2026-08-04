import { useState } from 'react';
import { useProducts, useCompareProducts } from '../hooks/queries';
import { GraphViewer } from '../components/graph/GraphViewer';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { Table } from '../components/common/Table';
import { ArrowLeftRight, Link as LinkIcon, Info } from 'lucide-react';

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
    <div className="flex flex-col h-[calc(100vh-8rem)] gap-6 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div>
        <p className="text-muted text-sm max-w-4xl">
          Select two products to discover their hidden shared dependencies. This analysis calculates the intersection of their respective supply networks up to 4 hops deep, highlighting common vulnerabilities.
        </p>
      </div>

      {/* Product Selectors */}
      <div className="bg-card p-5 rounded-xl border border-card-border shadow-sm flex flex-col md:flex-row items-center gap-6 shrink-0 z-10 relative">
        <div className="flex-1 w-full relative">
          <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">First Product</label>
          <div className="relative">
            <select 
              className="w-full bg-background border border-card-border rounded-lg pl-4 pr-10 py-2.5 text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none appearance-none transition-colors"
              value={product1}
              onChange={(e) => setProduct1(e.target.value)}
              disabled={isLoadingProducts}
            >
              <option value="">-- Choose first product --</option>
              {products?.map(p => (
                <option key={p.id} value={p.id} disabled={p.id === product2}>{p.name}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        <div className="hidden md:flex mt-6 items-center justify-center bg-muted-light p-3 rounded-full text-muted border border-card-border shadow-sm">
          <ArrowLeftRight className="w-5 h-5" />
        </div>

        <div className="flex-1 w-full relative">
          <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Second Product</label>
          <div className="relative">
            <select 
              className="w-full bg-background border border-card-border rounded-lg pl-4 pr-10 py-2.5 text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none appearance-none transition-colors"
              value={product2}
              onChange={(e) => setProduct2(e.target.value)}
              disabled={isLoadingProducts}
            >
              <option value="">-- Choose second product --</option>
              {products?.map(p => (
                <option key={p.id} value={p.id} disabled={p.id === product1}>{p.name}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {!product1 || !product2 ? (
        <div className="flex-1 bg-card rounded-xl border border-card-border shadow-inner">
          <EmptyState 
            title="Product Comparison" 
            description="Select two different products from the dropdowns above to discover their hidden shared dependencies."
            icon={<ArrowLeftRight className="w-10 h-10 text-primary" />}
          />
        </div>
      ) : product1 === product2 ? (
         <div className="flex-1 bg-card rounded-xl border border-card-border shadow-inner">
           <EmptyState 
            title="Invalid Selection" 
            description="Please select two different products to compare."
            icon={<ArrowLeftRight className="w-10 h-10 text-danger" />}
          />
         </div>
      ) : isLoadingCompare ? (
        <div className="flex-1 bg-card rounded-xl border border-card-border shadow-inner flex items-center justify-center">
          <LoadingState message="Analyzing shared supply chain dependencies..." />
        </div>
      ) : isCompareError ? (
        <div className="flex-1 bg-card rounded-xl border border-card-border shadow-inner">
          <ErrorState 
            message="Failed to compare products." 
            code={(compareError as any)?.code}
            onRetry={refetchCompare}
          />
        </div>
      ) : compareData?.sharedEntities.length === 0 ? (
        <div className="flex-1 bg-card rounded-xl border border-card-border shadow-inner">
          <EmptyState 
            title="No Shared Dependencies" 
            description="These two products do not share any common suppliers, components, facilities, or countries within 4 hops."
            icon={<LinkIcon className="w-10 h-10 text-muted" />}
          />
        </div>
      ) : (
        <div className="flex-1 flex flex-col xl:flex-row gap-6 min-h-0">
          
          {/* Left Column: List of shared entities */}
          <div className="w-full xl:w-[450px] bg-card rounded-xl border border-card-border shadow-sm overflow-hidden flex flex-col shrink-0">
            <div className="p-5 border-b border-card-border bg-muted-light/30">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-primary" />
                Shared Dependencies ({compareData?.sharedEntities.length || 0})
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <Table
                data={compareData?.sharedEntities || []}
                keyExtractor={(e) => e.id}
                columns={[
                  {
                    header: "Type",
                    className: "w-24",
                    accessor: (e) => (
                      <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-muted-light text-muted">
                        {e.label}
                      </span>
                    )
                  },
                  {
                    header: "Entity Name",
                    accessor: (e) => (
                      <span className="font-semibold text-foreground">{e.name || e.id}</span>
                    )
                  }
                ]}
              />
            </div>
          </div>

          {/* Right Column: Graph showing connection paths */}
          <div className="flex-1 bg-background rounded-xl border border-card-border shadow-inner overflow-hidden relative min-h-[400px]"
               style={{ backgroundImage: 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
            <div className="absolute top-4 left-4 z-10 bg-card/90 backdrop-blur-sm p-3 border border-card-border rounded-lg shadow-sm max-w-xs">
              <div className="flex gap-2 items-start text-xs text-foreground">
                <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p>The graph visualizes the intersection paths from the shared dependencies to both products.</p>
              </div>
            </div>
            <GraphViewer data={compareData!.graph} direction="LR" />
          </div>

        </div>
      )}
    </div>
  );
}
