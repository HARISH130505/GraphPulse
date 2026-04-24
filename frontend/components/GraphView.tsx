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

const DEPTH_COLORS = [
  '#3b82f6',
  '#8b5cf6',
  '#06b6d4',
  '#10b981',
  '#f59e0b',
  '#ec4899',
];

/** Recursively compute depth map: node → depth */
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

/** Layout nodes in a simple layered BFS layout */
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
            background: 'rgba(239,68,68,0.15)',
            border: '2px solid rgba(239,68,68,0.6)',
            color: '#fca5a5',
            borderRadius: 10,
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 700,
            fontSize: 16,
            padding: '10px 16px',
            boxShadow: '0 0 20px rgba(239,68,68,0.3)',
          },
        },
      ],
      edges: [],
    };
  }

  const depthMap = getDepthMap(root, { [root]: tree });
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Group by depth
  const byDepth = new Map<number, string[]>();
  for (const [node, d] of depthMap) {
    if (!byDepth.has(d)) byDepth.set(d, []);
    byDepth.get(d)!.push(node);
  }

  const X_GAP = 140;
  const Y_GAP = 100;

  for (const [depth, nodesAtDepth] of byDepth) {
    const totalWidth = (nodesAtDepth.length - 1) * X_GAP;
    nodesAtDepth.forEach((nodeId, i) => {
      const color = DEPTH_COLORS[depth % DEPTH_COLORS.length];
      nodes.push({
        id: nodeId,
        position: {
          x: i * X_GAP - totalWidth / 2 + 300,
          y: depth * Y_GAP + 40,
        },
        data: { label: nodeId },
        style: {
          background: `${color}22`,
          border: `2px solid ${color}66`,
          color,
          borderRadius: 10,
          fontFamily: 'JetBrains Mono, monospace',
          fontWeight: 700,
          fontSize: 15,
          padding: '8px 14px',
          boxShadow: `0 0 16px ${color}33`,
          minWidth: 50,
          textAlign: 'center',
        },
      });
    });
  }

  // Build edges by traversing tree
  function collectEdges(parentId: string, subtree: Record<string, unknown>) {
    for (const childId of Object.keys(subtree)) {
      edges.push({
        id: `${parentId}-${childId}`,
        source: parentId,
        target: childId,
        animated: false,
        style: {
          stroke: DEPTH_COLORS[depthMap.get(parentId)! % DEPTH_COLORS.length] + 'aa',
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: DEPTH_COLORS[depthMap.get(parentId)! % DEPTH_COLORS.length] + 'aa',
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
    <div className="glass rounded-2xl overflow-hidden" style={{ height: 400 }}>
      <div className="px-5 py-3 border-b border-[var(--border)] flex items-center gap-2">
        <span className="text-sm font-700 text-white">Graph Visualization</span>
        <span className="tag tag-blue">{hierarchies.length} component{hierarchies.length !== 1 && 's'}</span>
        <span className="ml-auto text-[11px] text-[var(--text-muted)]">Drag to pan · Scroll to zoom</span>
      </div>
      <div style={{ height: 356 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          proOptions={{ hideAttribution: true }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="rgba(255,255,255,0.06)"
          />
          <Controls showInteractive={false} />
          <MiniMap
            nodeColor={(n) =>
              (n.style?.border as string)?.match(/#[0-9a-f]+/i)?.[0] ?? '#3b82f6'
            }
            style={{
              background: 'rgba(10,11,15,0.8)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8,
            }}
          />
        </ReactFlow>
      </div>
    </div>
  );
}
