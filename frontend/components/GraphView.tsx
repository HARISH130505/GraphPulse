'use client';

import { useCallback, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  MarkerType,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Hierarchy } from '@/lib/types';
import { Monitor } from 'lucide-react';

const DEPTH_COLORS = [
  'var(--accent-cyan)',
  'var(--accent-purple)',
  'var(--accent-blue)',
  'var(--accent-emerald)',
  'var(--accent-amber)',
  'var(--accent-rose)',
];

// Fallback exact hexes if CSS vars don't parse well in ReactFlow elements directly
const HEX_COLORS = [
  '#22d3ee', // cyan
  '#c084fc', // purple
  '#60a5fa', // blue
  '#34d399', // emerald
  '#fbbf24', // amber
  '#fb7185', // rose
];

function getDepthMap(
  node: string,
  tree: Record<string, unknown>,
  depth = 0,
  map: Map<string, number> = new Map()
): Map<string, number> {
  map.set(node, depth);
  const children = tree as Record<string, Record<string, unknown>>;
  for (const child of Object.keys(children)) {
    getDepthMap(child, children[child] as Record<string, unknown>, depth + 1, map);
  }
  return map;
}

function buildLayout(
  root: string,
  tree: Record<string, unknown>,
  isCyclic: boolean
): { nodes: Node[]; edges: Edge[] } {
  if (isCyclic) {
    return {
      nodes: [
        {
          id: root,
          position: { x: 200, y: 150 },
          data: { label: root },
          style: {
            background: 'rgba(251, 113, 133, 0.1)',
            border: '1px solid rgba(251, 113, 133, 0.4)',
            color: '#fb7185',
            borderRadius: '12px',
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 700,
            fontSize: 16,
            padding: '12px 24px',
            boxShadow: '0 0 30px rgba(251, 113, 133, 0.3)',
            backdropFilter: 'blur(8px)',
          },
        },
      ],
      edges: [],
    };
  }

  const depthMap = getDepthMap(root, { [root]: tree });
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const byDepth = new Map<number, string[]>();
  for (const [node, d] of depthMap) {
    if (!byDepth.has(d)) byDepth.set(d, []);
    byDepth.get(d)!.push(node);
  }

  const X_GAP = 180;
  const Y_GAP = 120;

  for (const [depth, nodesAtDepth] of byDepth) {
    const totalWidth = (nodesAtDepth.length - 1) * X_GAP;
    nodesAtDepth.forEach((nodeId, i) => {
      const hexColor = HEX_COLORS[depth % HEX_COLORS.length];
      nodes.push({
        id: nodeId,
        position: {
          x: i * X_GAP - totalWidth / 2 + 300,
          y: depth * Y_GAP + 60,
        },
        data: { label: nodeId },
        style: {
          background: `rgba(0,0,0,0.6)`,
          border: `1px solid ${hexColor}66`,
          color: '#fff',
          borderRadius: '12px',
          fontFamily: 'JetBrains Mono, monospace',
          fontWeight: 700,
          fontSize: 15,
          padding: '10px 20px',
          boxShadow: `inset 0 0 20px ${hexColor}15, 0 10px 30px -10px rgba(0,0,0,0.8)`,
          textShadow: `0 0 10px ${hexColor}`,
          minWidth: 60,
          textAlign: 'center',
          backdropFilter: 'blur(12px)',
        },
      });
    });
  }

  function collectEdges(parentId: string, subtree: Record<string, unknown>) {
    for (const childId of Object.keys(subtree)) {
      const parentColor = HEX_COLORS[depthMap.get(parentId)! % HEX_COLORS.length];
      edges.push({
        id: `${parentId}-${childId}`,
        source: parentId,
        target: childId,
        animated: true,
        style: {
          stroke: parentColor,
          strokeWidth: 2,
          opacity: 0.6,
          filter: `drop-shadow(0 0 4px ${parentColor})`
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: parentColor,
        },
      });
      collectEdges(childId, (subtree as Record<string, Record<string, unknown>>)[childId]);
    }
  }

  collectEdges(root, tree);
  return { nodes, edges };
}

interface GraphViewProps {
  hierarchies: Hierarchy[];
}

export function GraphView({ hierarchies }: GraphViewProps) {
  const allNodes = useMemo<Node[]>(() => {
    const result: Node[] = [];
    for (const h of hierarchies) {
      const subtree = h.has_cycle ? {} : (h.tree[h.root] as Record<string, unknown>) ?? {};
      const { nodes } = buildLayout(h.root, subtree, h.has_cycle);
      result.push(...nodes);
    }
    return result;
  }, [hierarchies]);

  const allEdges = useMemo<Edge[]>(() => {
    const result: Edge[] = [];
    for (const h of hierarchies) {
      if (h.has_cycle) continue;
      const subtree = (h.tree[h.root] as Record<string, unknown>) ?? {};
      const { edges } = buildLayout(h.root, subtree, false);
      result.push(...edges);
    }
    return result;
  }, [hierarchies]);

  const [nodes, setNodes, onNodesChange] = useNodesState(allNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(allEdges);

  useEffect(() => {
    setNodes(allNodes);
    setEdges(allEdges);
  }, [allNodes, allEdges, setNodes, setEdges]);

  return (
    <div className="glass-panel rounded-2xl overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] border border-white/10" style={{ height: 500 }}>
      {/* Header bar */}
      <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/5">
            <Monitor size={18} className="text-[var(--accent-blue)]" />
          </div>
          <div>
            <span className="text-base font-700 text-white tracking-tight">Topology Canvas</span>
            <span className="ml-3 tag tag-cyan">{hierarchies.length} Component{hierarchies.length !== 1 && 's'}</span>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--accent-cyan)] shadow-[0_0_8px_var(--accent-cyan)]"/>
            <span className="text-[10px] text-white/50 uppercase tracking-widest font-600">Acyclic</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--accent-rose)] shadow-[0_0_8px_var(--accent-rose)]"/>
            <span className="text-[10px] text-white/50 uppercase tracking-widest font-600">Cyclic</span>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div style={{ height: 435 }} className="relative bg-[#030712]">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none z-0" />
        
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          fitViewOptions={{ padding: 0.4 }}
          proOptions={{ hideAttribution: true }}
          className="z-10"
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={24}
            size={2}
            color="rgba(255,255,255,0.06)"
          />
          <Controls showInteractive={false} className="border-white/10 shadow-xl" />
          <MiniMap
            nodeColor={(n) => (n.style?.color as string) || '#fff'}
            maskColor="rgba(3, 7, 18, 0.7)"
            style={{
              background: 'rgba(11, 15, 25, 0.9)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            }}
          />
        </ReactFlow>
      </div>
    </div>
  );
}
