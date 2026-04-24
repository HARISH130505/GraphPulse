'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, Binary } from 'lucide-react';
import { Hierarchy } from '@/lib/types';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const DEPTH_COLORS = [
  'var(--accent-cyan)',
  'var(--accent-purple)',
  'var(--accent-blue)',
  'var(--accent-emerald)',
  'var(--accent-amber)',
  'var(--accent-rose)',
];

function TreeNode({
  label, children, depth, isCyclic
}: {
  label: string; children: Record<string, unknown>; depth: number; isCyclic: boolean;
}) {
  const [open, setOpen] = useState(depth < 2);
  const hasChildren = Object.keys(children).length > 0;
  const color = isCyclic ? 'var(--accent-rose)' : DEPTH_COLORS[depth % DEPTH_COLORS.length];

  return (
    <div className="select-none text-sm font-mono tracking-wide">
      <button
        onClick={() => hasChildren && setOpen((o) => !o)}
        className={clsx(
          'flex items-center gap-3 py-1.5 px-3 rounded-lg w-full text-left transition-colors duration-200',
          hasChildren ? 'hover:bg-white/5' : 'cursor-default'
        )}
      >
        {/* Connector/Icon */}
        <span className="w-4 h-4 flex-shrink-0 flex items-center justify-center opacity-70">
          {hasChildren ? (
            open ? <ChevronDown size={14} style={{ color }} /> : <ChevronRight size={14} style={{ color }} />
          ) : (
            <span className="w-1 h-1 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
          )}
        </span>

        {/* Node */}
        <span
          className="font-700 px-2 py-0.5 rounded-md border"
          style={{ 
            color, 
            background: `color-mix(in srgb, ${color} 10%, transparent)`,
            borderColor: `color-mix(in srgb, ${color} 30%, transparent)`
          }}
        >
          {label}
        </span>

        {/* Depth badge */}
        {!isCyclic && (
          <span className="text-[10px] text-white/30 ml-auto border border-white/5 rounded px-1.5 py-0.5">
            d:{depth}
          </span>
        )}
      </button>

      {/* Children */}
      <AnimatePresence initial={false}>
        {open && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="ml-[22px] pl-2 py-1 border-l border-white/10 relative">
              <div className="absolute top-0 bottom-0 left-[-1px] w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
              {Object.entries(children).map(([childLabel, grandChildren]) => (
                <TreeNode
                  key={childLabel}
                  label={childLabel}
                  children={grandChildren as Record<string, unknown>}
                  depth={depth + 1}
                  isCyclic={isCyclic}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
    <div className="glass-panel rounded-2xl p-6 flex flex-col gap-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/5">
            <Binary size={18} className="text-[var(--accent-purple)]" />
          </div>
          <div>
            <h3 className="text-lg font-700 text-white tracking-tight">Forest Explorer</h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Nested object representation</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {hierarchies.map((h, i) => (
          <button
            key={i}
            onClick={() => setActiveIdx(i)}
            className={clsx(
              'px-4 py-2 rounded-xl text-xs font-700 transition-all border duration-300',
              activeIdx === i
                ? h.has_cycle
                  ? 'bg-[var(--accent-rose)]/10 border-[var(--accent-rose)]/40 text-[var(--accent-rose)] shadow-[0_0_15px_rgba(251,113,133,0.2)]'
                  : 'bg-[var(--accent-cyan)]/10 border-[var(--accent-cyan)]/40 text-[var(--accent-cyan)] shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                : 'bg-black/20 border-white/5 text-white/50 hover:text-white/80 hover:border-white/20 hover:bg-white/5'
            )}
          >
            {h.has_cycle ? '🔄 ' : '🌲 '} 
            Root: {h.root}
          </button>
        ))}
      </div>

      {/* Tree content */}
      <div className="bg-[#030712] border border-white/5 rounded-xl p-4 flex-1 overflow-hidden relative shadow-inner">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay pointer-events-none" />
        
        <div className="h-full overflow-y-auto custom-scrollbar relative z-10 pr-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIdx}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="min-h-[200px]"
            >
              {active.has_cycle ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[200px] gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full blur-xl bg-[var(--accent-rose)]/20 animate-pulse" />
                    <span className="text-4xl relative z-10 drop-shadow-[0_0_10px_rgba(251,113,133,0.5)]">🔄</span>
                  </div>
                  <p className="text-[var(--accent-rose)] text-sm font-700 tracking-wide mt-2">Cyclic Component</p>
                  <p className="text-white/40 text-xs text-center max-w-[200px] leading-relaxed">
                    Root: <span className="font-mono text-white/80">{active.root}</span>
                    <br/>Infinite back-edge detected.
                  </p>
                </div>
              ) : (
                <TreeNode
                  label={active.root}
                  children={active.tree[active.root] as Record<string, unknown> || {}}
                  depth={0}
                  isCyclic={false}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Depth bar */}
      {!active.has_cycle && (
        <div className="flex items-center gap-4 bg-black/20 border border-white/5 px-4 py-3 rounded-xl">
          <span className="text-[10px] font-700 uppercase tracking-widest text-[var(--text-muted)]">Max Depth</span>
          <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (active.depth / 8) * 100)}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute top-0 bottom-0 left-0 bg-[var(--grad-primary)] shadow-[0_0_10px_rgba(34,211,238,0.5)]"
            />
          </div>
          <span className="text-xs font-mono font-700 text-[var(--accent-cyan)]">
            {active.depth}
          </span>
        </div>
      )}
    </div>
  );
}
