import { useState } from 'react';
import { useProducts, useProductNetwork } from '../hooks/queries';
import { GraphViewer } from '../components/graph/GraphViewer';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { Network } from 'lucide-react';
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
      {/* Controls */}
      <div className="bg-card p-4 rounded-xl border border-card-hover flex items-end gap-4 shrink-0">
        <div className="flex-1 max-w-xs">
          <label className="block text-sm font-medium text-foreground/70 mb-1">Select Product</label>
          <select 
            className="w-full bg-background border border-card-hover rounded-md px-3 py-2 text-sm focus:border-primary focus:outline-none"
            value={selectedProductId}
            onChange={(e) => {
              setSelectedProductId(e.target.value);
              setSelectedNodeId(null);
            }}
            disabled={isLoadingProducts}
          >
            <option value="">-- Choose a product to explore --</option>
            {products?.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="w-32">
          <label className="block text-sm font-medium text-foreground/70 mb-1">Depth (Hops)</label>
          <select 
            className="w-full bg-background border border-card-hover rounded-md px-3 py-2 text-sm focus:border-primary focus:outline-none"
            value={hops}
            onChange={(e) => setHops(parseInt(e.target.value))}
            disabled={!selectedProductId}
          >
            <option value={1}>1 Hop</option>
            <option value={2}>2 Hops</option>
            <option value={3}>3 Hops</option>
            <option value={4}>4 Hops</option>
          </select>
        </div>
      </div>

      {/* Main Graph Area */}
      <div className="flex-1 flex gap-4 min-h-0">
        <div className="flex-1 bg-card/20 rounded-xl border border-card-hover overflow-hidden relative">
          {!selectedProductId ? (
            <EmptyState 
              title="Select a product" 
              description="Choose a product from the dropdown above to visualize its dependency network."
              icon={<Network className="w-10 h-10" />}
            />
          ) : isLoadingNetwork ? (
            <LoadingState message="Mapping supply chain network..." />
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
          <div className="w-80 bg-card rounded-xl border border-card-hover overflow-y-auto shrink-0 animate-in slide-in-from-right-4">
            <div className="p-4 border-b border-card-hover flex items-center justify-between sticky top-0 bg-card">
              <h3 className="font-semibold text-lg">{selectedNode.title}</h3>
              <button 
                onClick={() => setSelectedNodeId(null)}
                className="text-foreground/50 hover:text-foreground p-1"
              >
                &times;
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <span className="text-xs text-foreground/50 uppercase tracking-wider">Type</span>
                <div className="font-medium mt-1">{selectedNode.label}</div>
              </div>

              {Object.entries(selectedNode.properties).map(([key, value]) => {
                if (key === 'id' || key === 'name' || key === 'title') return null; // Skip obvious ones

                return (
                  <div key={key} className="border-t border-card-hover pt-3">
                    <span className="text-xs text-foreground/50 uppercase tracking-wider">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <div className="mt-1 break-words text-sm">
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
