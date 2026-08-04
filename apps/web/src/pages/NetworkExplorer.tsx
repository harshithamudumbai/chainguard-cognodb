import { useState } from 'react';
import { useProducts, useProductNetwork } from '../hooks/queries';
import { GraphViewer } from '../components/graph/GraphViewer';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { Network, X } from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';

export function NetworkExplorer() {
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [hops, setHops] = useState<number>(3);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const { data: products, isLoading: isLoadingProducts } = useProducts();
  
  const { 
    data: networkData, 
    isLoading: isLoadingNetwork, 
    isError: isNetworkError,
    error: networkError,
    refetch: refetchNetwork
  } = useProductNetwork(selectedProductId, hops);

  const selectedNode = selectedNodeId && networkData?.nodes.find(n => n.id === selectedNodeId);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] gap-4 animate-in fade-in duration-500">
      
      {/* Page Header / Explanatory Text */}
      <div className="mb-2">
        <p className="text-muted text-sm max-w-4xl">
          Explore how products depend on components, suppliers, facilities, countries, and upstream partners across multiple hops. Uncover indirect risks hidden deep in your supply chain network.
        </p>
      </div>

      {/* Top Control Bar */}
      <div className="bg-card px-6 py-4 rounded-xl border border-card-border shadow-sm flex flex-col sm:flex-row sm:items-end gap-6 shrink-0 z-10 relative">
        <div className="flex-1 max-w-md">
          <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Select Product to Explore</label>
          <div className="relative">
            <select 
              className="w-full bg-background border border-card-border rounded-lg pl-4 pr-10 py-2.5 text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none appearance-none transition-colors"
              value={selectedProductId}
              onChange={(e) => {
                setSelectedProductId(e.target.value);
                setSelectedNodeId(null);
              }}
              disabled={isLoadingProducts}
            >
              <option value="">-- Choose a product --</option>
              {products?.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        <div className="w-40">
          <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Depth (Hops)</label>
          <div className="relative">
            <select 
              className="w-full bg-background border border-card-border rounded-lg pl-4 pr-10 py-2.5 text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none appearance-none transition-colors"
              value={hops}
              onChange={(e) => setHops(parseInt(e.target.value))}
              disabled={!selectedProductId}
            >
              <option value={1}>1 Hop (Direct)</option>
              <option value={2}>2 Hops</option>
              <option value={3}>3 Hops</option>
              <option value={4}>4 Hops (Deep)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        {networkData && (
          <div className="ml-auto flex gap-4 text-xs font-medium text-muted items-center bg-muted-light/50 px-4 py-2 rounded-lg border border-card-border">
            <div className="flex flex-col items-center px-2 border-r border-card-border">
              <span className="text-foreground text-lg font-bold">{networkData.nodes.length}</span>
              <span>Nodes</span>
            </div>
            <div className="flex flex-col items-center px-2">
              <span className="text-foreground text-lg font-bold">{networkData.edges.length}</span>
              <span>Relationships</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Graph Area & Details Panel */}
      <div className="flex-1 flex gap-4 min-h-0 relative">
        <div className="flex-1 bg-background rounded-xl border border-card-border shadow-inner overflow-hidden relative" 
             style={{ backgroundImage: 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
          
          {!selectedProductId ? (
            <EmptyState 
              title="Network Explorer" 
              description="Choose a product from the dropdown above to visualize its dependency network."
              icon={<Network className="w-10 h-10" />}
            />
          ) : isLoadingNetwork ? (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
              <LoadingState message="Mapping supply chain network..." />
            </div>
          ) : isNetworkError ? (
            <ErrorState 
              message="Failed to load product network." 
              code={(networkError as any)?.code}
              onRetry={refetchNetwork}
            />
          ) : (
             <GraphViewer data={networkData!} onNodeClick={setSelectedNodeId} />
          )}
        </div>

        {/* Node Details Sidebar */}
        {selectedNode && (
          <div className="w-80 bg-card rounded-xl border border-card-border shadow-elevated overflow-y-auto shrink-0 animate-in slide-in-from-right-4 z-20">
            <div className="p-5 border-b border-card-border flex items-center justify-between sticky top-0 bg-card/95 backdrop-blur-sm z-10">
              <div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider block mb-1">{selectedNode.label}</span>
                <h3 className="font-bold text-foreground leading-tight">{selectedNode.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedNodeId(null)}
                className="text-muted hover:text-foreground hover:bg-muted-light p-1.5 rounded-lg transition-colors"
                aria-label="Close details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-5">
              {Object.entries(selectedNode.properties).map(([key, value]) => {
                if (key === 'id' || key === 'name' || key === 'title') return null; // Skip obvious ones

                return (
                  <div key={key} className="border-b border-muted-light pb-4 last:border-0 last:pb-0">
                    <span className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1.5">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <div className="text-sm font-medium text-foreground">
                      {key.toLowerCase().includes('score') || key.toLowerCase().includes('criticality') || key.toLowerCase().includes('severity') || key.toLowerCase().includes('status') ? (
                        <StatusBadge status={String(value)} />
                      ) : (
                        String(value)
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
