'use client';

import { SimulationStep } from '@/lib/types';
import clsx from 'clsx';

const STEPS: { key: SimulationStep; label: string; desc: string; icon: string }[] = [
  { key: 'validating',      label: 'Validate',      desc: 'Check edge format & self-loops',    icon: '🔍' },
  { key: 'deduplicating',   label: 'Deduplicate',   desc: 'Remove repeated edges',             icon: '🧹' },
  { key: 'building-graph',  label: 'Build Graph',   desc: 'Construct adjacency + parent map',  icon: '🔗' },
  { key: 'detecting-cycles',label: 'Detect Cycles', desc: 'DFS back-edge traversal (O(V+E))', icon: '🔄' },
  { key: 'building-trees',  label: 'Build Trees',   desc: 'Forest construction & depth calc',  icon: '🌲' },
  { key: 'done',            label: 'Complete',      desc: 'Response ready',                    icon: '✅' },
];

interface SimulationStepperProps {
  current: SimulationStep;
}

export function SimulationStepper({ current }: SimulationStepperProps) {
  const currentIdx = STEPS.findIndex((s) => s.key === current);

  return (
    <div className="glass rounded-2xl p-5">
      <p className="text-[10px] font-600 text-[var(--text-muted)] uppercase tracking-wider mb-4">
        Simulation Pipeline
      </p>
      <div className="flex flex-col gap-2">
        {STEPS.map((step, idx) => {
          const isActive   = step.key === current;
          const isDone     = currentIdx > idx;
          const isPending  = currentIdx < idx && current !== 'idle';
          const isIdle     = current === 'idle';

          return (
            <div
              key={step.key}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300',
                isActive  && 'bg-[rgba(59,130,246,0.12)] border border-[rgba(59,130,246,0.3)]',
                isDone    && 'opacity-70',
                (isPending || isIdle) && 'opacity-30'
              )}
            >
              {/* Icon / check */}
              <div className={clsx(
                'w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0 transition-all',
                isActive  && 'bg-[rgba(59,130,246,0.2)] shadow-[0_0_12px_rgba(59,130,246,0.4)]',
                isDone    && 'bg-[rgba(16,185,129,0.15)]'
              )}>
                {isDone ? '✓' : step.icon}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className={clsx(
                  'text-sm font-600 leading-none mb-0.5',
                  isActive ? 'text-[var(--accent-blue)]' : isDone ? 'text-[var(--accent-green)]' : 'text-white'
                )}>
                  {step.label}
                </p>
                <p className="text-[11px] text-[var(--text-muted)] truncate">{step.desc}</p>
              </div>

              {/* Spinner for active */}
              {isActive && (
                <div className="w-4 h-4 border-2 border-[rgba(59,130,246,0.3)] border-t-[var(--accent-blue)] rounded-full animate-spin" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
