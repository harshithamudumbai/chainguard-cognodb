import { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
  type Node as FlowNode,
  type Edge as FlowEdge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { GraphResponse } from '../../types/api';
import dagre from 'dagre';
import { Package, Cpu, Building2, Factory, Globe, AlertTriangle } from 'lucide-react';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes: FlowNode[], edges: FlowEdge[], direction = 'LR') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 172, height: 36 }); // Approx node size
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? Position.Left : Position.Top;
    node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    node.position = {
      x: nodeWithPosition.x - 172 / 2,
      y: nodeWithPosition.y - 36 / 2,
    };
  });

  return { nodes, edges };
};

const CustomNodeComponent = ({ data }: any) => {
  let Icon = Package;
  let bgClass = "bg-card";
  let borderClass = "border-card-hover";
  let textClass = "text-foreground";

  switch (data.label) {
    case 'Product': Icon = Package; borderClass = "border-primary/50"; bgClass = "bg-primary/10"; break;
    case 'Component': Icon = Cpu; borderClass = "border-blue-400/50"; bgClass = "bg-blue-400/10"; break;
    case 'Supplier': Icon = Building2; borderClass = "border-purple-400/50"; bgClass = "bg-purple-400/10"; break;
    case 'Facility': Icon = Factory; borderClass = "border-amber-400/50"; bgClass = "bg-amber-400/10"; break;
    case 'Country': Icon = Globe; borderClass = "border-emerald-400/50"; bgClass = "bg-emerald-400/10"; break;
    case 'RiskEvent': Icon = AlertTriangle; borderClass = "border-danger/50"; bgClass = "bg-danger/10"; textClass = "text-danger"; break;
  }

  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-card border-2 ${borderClass} flex items-center gap-2 min-w-[150px]`}>
      <div className={`p-1 rounded-md ${bgClass} ${textClass}`}>
        <Icon size={16} />
      </div>
      <div>
        <div className="text-xs font-bold truncate max-w-[120px] text-foreground" title={data.title}>{data.title}</div>
        <div className="text-[10px] text-foreground/50">{data.label}</div>
      </div>
    </div>
  );
};

const nodeTypes = {
  custom: CustomNodeComponent,
};

interface GraphViewerProps {
  data: GraphResponse;
  onNodeClick?: (nodeId: string) => void;
}

export function GraphViewer({ data, onNodeClick }: GraphViewerProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<FlowEdge>([]);

  useEffect(() => {
    if (!data) return;

    const initialNodes: FlowNode[] = data.nodes.map((node) => ({
      id: node.id,
      type: 'custom',
      position: { x: 0, y: 0 },
      data: { label: node.label, title: node.title, properties: node.properties },
    }));

    const initialEdges: FlowEdge[] = data.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.type,
      labelStyle: { fill: '#cbd5e1', fontWeight: 600, fontSize: 10 },
      labelBgStyle: { fill: '#1e293b' },
      animated: edge.type === 'AFFECTS',
      style: { stroke: edge.type === 'AFFECTS' ? '#ef4444' : '#64748b' },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: edge.type === 'AFFECTS' ? '#ef4444' : '#64748b',
      },
    }));

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [data, setNodes, setEdges]);

  const onNodeClickInternal = useCallback((_: any, node: FlowNode) => {
    if (onNodeClick) {
      onNodeClick(node.id);
    }
  }, [onNodeClick]);

  if (!data || data.nodes.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-card/20 rounded-xl border-2 border-dashed border-card-hover">
        <p className="text-foreground/50">No graph data available to display.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-card-hover relative bg-[#0f172a]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClickInternal}
        fitView
        colorMode="dark"
        minZoom={0.1}
      >
        <Controls className="bg-card border-card-hover fill-foreground" />
        <MiniMap 
          nodeColor={(node: any) => {
            switch (node.data.label) {
              case 'Product': return '#3b82f6';
              case 'RiskEvent': return '#ef4444';
              default: return '#334155';
            }
          }}
          maskColor="rgba(15, 23, 42, 0.7)"
          className="bg-card"
        />
        <Background color="#334155" gap={16} />
      </ReactFlow>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur p-3 rounded-lg border border-card-hover text-xs flex gap-4 shadow-lg z-10">
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-primary/20 border border-primary/50"></div>Product</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-blue-400/20 border border-blue-400/50"></div>Component</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-purple-400/20 border border-purple-400/50"></div>Supplier</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-amber-400/20 border border-amber-400/50"></div>Facility</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-emerald-400/20 border border-emerald-400/50"></div>Country</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-danger/20 border border-danger/50"></div>Risk</div>
      </div>
      
      {/* Stats */}
      <div className="absolute top-4 left-4 bg-card/90 backdrop-blur px-3 py-1.5 rounded-lg border border-card-hover text-xs text-foreground/70 z-10">
        {data.nodes.length} nodes · {data.edges.length} relationships
      </div>
    </div>
  );
}
