'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { Hierarchy } from '@/lib/types';
import clsx from 'clsx';

const DEPTH_COLORS = [
  'var(--accent-blue)',
  'var(--accent-purple)',
  'var(--accent-cyan)',
  'var(--accent-green)',
  'var(--accent-amber)',
  'var(--accent-red)',
];

function TreeNode({
  label,
  children,
  depth,
  isCyclic,
}: {
  label: string;
  children: Record<string, unknown>;
  depth: number;
  isCyclic: boolean;
}) {
  const [open, setOpen] = useState(depth < 2);
  const hasChildren = Object.keys(children).length > 0;
  const color = isCyclic ? 'var(--accent-red)' : DEPTH_COLORS[depth % DEPTH_COLORS.length];

  return (
    <div className="select-none">
      <button
        onClick={() => hasChildren && setOpen((o) => !o)}
        className={clsx(
          'flex items-center gap-2 py-1 px-2 rounded-lg w-full text-left transition-all',
          'hover:bg-[rgba(255,255,255,0.04)]',
          !hasChildren && 'cursor-default'
        )}
      >
        {/* Expand icon */}
        <span className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
          {hasChildren ? (
            open ? (
              <ChevronDown size={12} style={{ color }} />
            ) : (
              <ChevronRight size={12} style={{ color }} />
            )
          ) : (
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
          )}
        </span>

        {/* Node bubble */}
        <span
          className="font-mono text-sm font-700 w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: color + '22', color, border: `1px solid ${color}44` }}
        >
          {label}
        </span>

        {/* depth badge */}
        <span className="text-[10px] text-[var(--text-muted)] ml-auto font-mono">
          d:{depth}
        </span>
      </button>

      {/* Children */}
      {open && hasChildren && (
        <div
          className="ml-5 mt-0.5 border-l"
          style={{ borderColor: color + '33' }}
        >
          {Object.entries(children).map(([childLabel, grandChildren]) => (
            <div key={childLabel} className="ml-2">
              <TreeNode
                label={childLabel}
                children={grandChildren as Record<string, unknown>}
                depth={depth + 1}
                isCyclic={isCyclic}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface TreeViewerProps {
  hierarchies: Hierarchy[];
}

export function TreeViewer({ hierarchies }: TreeViewerProps) {
  const [activeIdx, setActiveIdx] = useState(0);

  if (hierarchies.length === 0) return null;

  const active = hierarchies[activeIdx];

  return (
    <div className="glass rounded-2xl p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-700 text-white">Tree Explorer</h3>
        <span className="tag tag-blue">{hierarchies.length} component{hierarchies.length !== 1 && 's'}</span>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {hierarchies.map((h, i) => (
          <button
            key={i}
            onClick={() => setActiveIdx(i)}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-xs font-600 transition-all border',
              activeIdx === i
                ? h.has_cycle
                  ? 'bg-[rgba(239,68,68,0.15)] border-[rgba(239,68,68,0.4)] text-[var(--accent-red)]'
                  : 'bg-[rgba(59,130,246,0.15)] border-[rgba(59,130,246,0.4)] text-[var(--accent-blue)]'
                : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-bright)]'
            )}
          >
            {h.has_cycle ? '🔄' : '🌲'} Root: {h.root}
            {!h.has_cycle && <span className="ml-1 opacity-60">d:{h.depth}</span>}
          </button>
        ))}
      </div>

      {/* Tree content */}
      <div className="bg-[rgba(0,0,0,0.25)] rounded-xl p-4 min-h-32">
        {active.has_cycle ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2">
            <span className="text-3xl">🔄</span>
            <p className="text-[var(--accent-red)] text-sm font-600">Cyclic Component</p>
            <p className="text-[var(--text-muted)] text-xs">
              Root: <span className="font-mono">{active.root}</span> — DFS back-edge detected
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            <TreeNode
              label={active.root}
              children={active.tree[active.root] as Record<string, unknown> || {}}
              depth={0}
              isCyclic={false}
            />
          </div>
        )}
      </div>

      {/* Depth bar */}
      {!active.has_cycle && (
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-[var(--text-muted)]">Depth</span>
          <div className="flex-1 h-1.5 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(100, (active.depth / 10) * 100)}%`,
                background: 'var(--grad-blue-purple)',
              }}
            />
          </div>
          <span className="text-[11px] font-mono font-600 text-[var(--accent-blue)]">
            {active.depth}
          </span>
        </div>
      )}
    </div>
  );
}
