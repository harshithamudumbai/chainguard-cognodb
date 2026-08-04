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
import { cn } from '../../utils/cn';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes: FlowNode[], edges: FlowEdge[], direction = 'LR') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction, ranksep: 100, nodesep: 60 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 220, height: 50 }); // Approx node size
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? Position.Left : Position.Top;
    node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

    node.position = {
      x: nodeWithPosition.x - 220 / 2,
      y: nodeWithPosition.y - 50 / 2,
    };
  });

  return { nodes, edges };
};

const CustomNodeComponent = ({ data, selected }: any) => {
  let Icon = Package;
  let bgClass = "bg-card";
  let borderClass = "border-card-border";
  let textClass = "text-foreground";
  let iconBgClass = "bg-muted-light text-muted";

  switch (data.label) {
    case 'Product': 
      Icon = Package; 
      borderClass = "border-primary/40"; 
      bgClass = "bg-primary-light/50"; 
      iconBgClass = "bg-primary text-white";
      break;
    case 'Component': 
      Icon = Cpu; 
      borderClass = "border-blue-300"; 
      bgClass = "bg-blue-50"; 
      iconBgClass = "bg-blue-500 text-white";
      break;
    case 'Supplier': 
      Icon = Building2; 
      borderClass = "border-purple-300"; 
      bgClass = "bg-purple-50"; 
      iconBgClass = "bg-purple-500 text-white";
      break;
    case 'Facility': 
      Icon = Factory; 
      borderClass = "border-amber-300"; 
      bgClass = "bg-amber-50"; 
      iconBgClass = "bg-amber-500 text-white";
      break;
    case 'Country': 
      Icon = Globe; 
      borderClass = "border-emerald-300"; 
      bgClass = "bg-emerald-50"; 
      iconBgClass = "bg-emerald-500 text-white";
      break;
    case 'RiskEvent': 
      Icon = AlertTriangle; 
      borderClass = "border-danger"; 
      bgClass = "bg-danger-light/50"; 
      textClass = "text-danger font-bold";
      iconBgClass = "bg-danger text-white";
      break;
  }

  return (
    <div className={cn(
      "px-4 py-2.5 shadow-sm rounded-lg flex items-center gap-3 min-w-[200px] transition-all duration-200 border-2",
      bgClass, 
      borderClass,
      selected && "ring-2 ring-primary ring-offset-2 shadow-md scale-105"
    )}>
      <div className={cn("p-1.5 rounded-md", iconBgClass)}>
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <div className={cn("text-xs font-bold truncate", textClass)} title={data.title}>
          {data.title}
        </div>
        <div className="text-[10px] font-semibold text-muted uppercase tracking-wider mt-0.5">
          {data.label}
        </div>
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
  direction?: 'LR' | 'TB';
}

export function GraphViewer({ data, onNodeClick, direction = 'LR' }: GraphViewerProps) {
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
      labelStyle: { fill: '#64748b', fontWeight: 600, fontSize: 10 },
      labelBgStyle: { fill: '#ffffff', fillOpacity: 0.9, rx: 4, ry: 4 },
      labelBgPadding: [4, 2],
      animated: edge.type === 'AFFECTS',
      style: { stroke: edge.type === 'AFFECTS' ? '#ef4444' : '#94a3b8', strokeWidth: edge.type === 'AFFECTS' ? 2 : 1.5 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: edge.type === 'AFFECTS' ? '#ef4444' : '#94a3b8',
      },
    }));

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges,
      direction
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [data, setNodes, setEdges, direction]);

  const onNodeClickInternal = useCallback((_: any, node: FlowNode) => {
    if (onNodeClick) {
      onNodeClick(node.id);
    }
  }, [onNodeClick]);

  if (!data || data.nodes.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-muted">No graph data available to display.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClickInternal}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
      >
        <Controls className="bg-card border-card-border fill-foreground shadow-sm" />
        <MiniMap 
          nodeColor={(node: any) => {
            switch (node.data.label) {
              case 'Product': return '#4f46e5';
              case 'RiskEvent': return '#dc2626';
              default: return '#94a3b8';
            }
          }}
          maskColor="rgba(248, 250, 252, 0.7)"
          className="bg-card border-card-border"
        />
        <Background color="#cbd5e1" gap={20} size={1.5} />
      </ReactFlow>

      {/* Legend */}
      <div className="absolute bottom-6 left-6 bg-card/95 backdrop-blur-sm p-4 rounded-xl border border-card-border shadow-elevated text-xs font-medium flex gap-5 z-10">
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-primary-light border border-primary/40"></div>Product</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-blue-50 border border-blue-300"></div>Component</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-purple-50 border border-purple-300"></div>Supplier</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-amber-50 border border-amber-300"></div>Facility</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-emerald-50 border border-emerald-300"></div>Country</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-danger-light border border-danger"></div>Risk</div>
      </div>
    </div>
  );
}
