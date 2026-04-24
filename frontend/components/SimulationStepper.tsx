'use client';

import { SimulationStep } from '@/lib/types';
import clsx from 'clsx';
import { motion } from 'framer-motion';

const STEPS: { key: SimulationStep; label: string; desc: string; icon: string }[] = [
  { key: 'validating',      label: 'Format Validation',     desc: 'Regex parsing & self-loop check', icon: '🔍' },
  { key: 'deduplicating',   label: 'Edge Deduplication',    desc: 'Isolate unique directed edges',   icon: '🧹' },
  { key: 'building-graph',  label: 'Topology Graph',        desc: 'Build adjacency & parent maps',   icon: '🔗' },
  { key: 'detecting-cycles',label: 'Cycle Detection',       desc: 'O(V+E) DFS back-edge scan',       icon: '🔄' },
  { key: 'building-trees',  label: 'Forest Construction',   desc: 'Root assignment & depth calc',    icon: '🌲' },
  { key: 'done',            label: 'Analysis Complete',     desc: 'Payload ready for render',        icon: '✅' },
];

interface SimulationStepperProps {
  current: SimulationStep;
}

export function SimulationStepper({ current }: SimulationStepperProps) {
  const currentIdx = STEPS.findIndex((s) => s.key === current);

  return (
    <div className="glass-panel rounded-2xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-lg font-700 text-white tracking-tight">Execution Pipeline</h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Real-time algorithmic state</p>
        </div>
        <div className={clsx("w-2 h-2 rounded-full", current === 'idle' || current === 'done' ? "bg-white/20" : "bg-[var(--accent-cyan)] shadow-[0_0_10px_rgba(34,211,238,0.8)] animate-pulse")} />
      </div>

      <div className="flex flex-col gap-3 flex-1 justify-center">
        {STEPS.map((step, idx) => {
          const isActive   = step.key === current;
          const isDone     = currentIdx > idx;
          const isPending  = currentIdx < idx && current !== 'idle';
          const isIdle     = current === 'idle';

          return (
            <motion.div
              key={step.key}
              initial={false}
              animate={{
                opacity: isIdle || isPending ? 0.3 : 1,
                scale: isActive ? 1.02 : 1,
                backgroundColor: isActive ? 'rgba(34,211,238,0.1)' : 'rgba(255,255,255,0.02)',
                borderColor: isActive ? 'rgba(34,211,238,0.3)' : 'rgba(255,255,255,0.05)',
              }}
              className="flex items-center gap-4 px-4 py-3 rounded-xl border relative overflow-hidden"
            >
              {/* Active glow sweep */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(34,211,238,0.1)] to-transparent"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                />
              )}

              {/* Icon */}
              <div className={clsx(
                'w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0 transition-all z-10',
                isActive  ? 'bg-[var(--accent-cyan)]/20 shadow-[0_0_15px_rgba(34,211,238,0.3)] border border-[var(--accent-cyan)]/30' : 
                isDone    ? 'bg-[var(--accent-emerald)]/10 text-[var(--accent-emerald)]' : 
                'bg-black/20 text-white/50'
              )}>
                {isDone ? '✓' : step.icon}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0 z-10">
                <p className={clsx(
                  'text-sm font-700 leading-none mb-1.5 tracking-wide',
                  isActive ? 'text-[var(--accent-cyan)]' : isDone ? 'text-[var(--accent-emerald)]' : 'text-white/80'
                )}>
                  {step.label}
                </p>
                <p className="text-[11px] text-[var(--text-muted)] truncate font-mono">{step.desc}</p>
              </div>

              {/* Spinner */}
              {isActive && (
                <div className="w-5 h-5 border-2 border-[var(--accent-cyan)]/30 border-t-[var(--accent-cyan)] rounded-full animate-spin z-10" />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
