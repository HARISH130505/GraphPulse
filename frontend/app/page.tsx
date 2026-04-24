'use client';

import { useState, useCallback } from 'react';
import { BFHLRequest, BFHLResponse, SimulationStep } from '@/lib/types';
import { processBFHL } from '@/lib/api';
import { InputPanel } from '@/components/InputPanel';
import { SimulationStepper } from '@/components/SimulationStepper';
import { InsightDashboard } from '@/components/InsightDashboard';
import { TreeViewer } from '@/components/TreeViewer';
import { GraphView } from '@/components/GraphView';

const SIMULATION_STEPS: SimulationStep[] = [
  'validating',
  'deduplicating',
  'building-graph',
  'detecting-cycles',
  'building-trees',
  'done',
];

const STEP_DELAY = 400; // ms per step

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [simStep, setSimStep] = useState<SimulationStep>('idle');
  const [result, setResult] = useState<BFHLResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const runSimulation = useCallback(async (req: BFHLRequest) => {
    setLoading(true);
    setError(null);
    setResult(null);

    // Start simulation steps animation
    let apiResponse: BFHLResponse | null = null;
    let apiError: string | null = null;

    // Kick off API call immediately (in background)
    const apiPromise = processBFHL(req)
      .then((r) => { apiResponse = r; })
      .catch((e) => { apiError = e.message; });

    // Animate steps
    for (const step of SIMULATION_STEPS) {
      setSimStep(step);
      if (step !== 'done') await sleep(STEP_DELAY);
    }

    // Wait for API if still running
    await apiPromise;

    setLoading(false);

    if (apiError) {
      setError(apiError);
      setSimStep('idle');
    } else if (apiResponse) {
      setResult(apiResponse);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Hero Header ──────────────────────────────────────────── */}
      <header className="relative overflow-hidden border-b border-[var(--border)]">
        {/* Glow blobs */}
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: 'var(--accent-blue)' }}
        />
        <div
          className="absolute -top-20 right-20 w-64 h-64 rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{ background: 'var(--accent-purple)' }}
        />

        <div className="relative max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
              style={{ background: 'var(--grad-blue-purple)', boxShadow: 'var(--shadow-glow-blue)' }}>
              ⚡
            </div>
            <div>
              <h1 className="text-xl font-800 gradient-text leading-none">GraphPulse</h1>
              <p className="text-[10px] text-[var(--text-muted)] mt-0.5 uppercase tracking-widest">
                Hierarchy Analyzer
              </p>
            </div>
          </div>

          {/* Status pill */}
          <div className="flex items-center gap-2 glass rounded-full px-4 py-2">
            <div className="live-dot" />
            <span className="text-xs text-[var(--text-secondary)] font-500">
              API: localhost:3000
            </span>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative max-w-7xl mx-auto px-6 pb-8 pt-2 text-center">
          <p className="text-4xl font-800 leading-tight mb-3">
            <span className="gradient-text">Graph Intelligence</span>
            <br />
            <span className="text-[var(--text-secondary)] text-2xl font-400">
              at every node
            </span>
          </p>
          <p className="text-sm text-[var(--text-muted)] max-w-xl mx-auto">
            Parse directed edges → detect cycles → build hierarchies → visualize everything.
            Powered by O(V+E) DFS algorithms.
          </p>
        </div>
      </header>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 flex flex-col gap-8">

        {/* Top row: Input + Stepper */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <InputPanel onSubmit={runSimulation} loading={loading} />
          </div>
          <div>
            <SimulationStepper current={simStep} />
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="glass-bright rounded-2xl p-5 border-[rgba(239,68,68,0.4)] animate-fade-in-up"
            style={{ borderColor: 'rgba(239,68,68,0.4)' }}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-600 text-[var(--accent-red)]">API Error</p>
                <p className="text-sm text-[var(--text-secondary)] mt-0.5">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="flex flex-col gap-6 animate-fade-in-up">
            {/* Graph Visualization */}
            <GraphView hierarchies={result.hierarchies} />

            {/* Tree Explorer + Dashboard side by side on large screens */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TreeViewer hierarchies={result.hierarchies} />
              <div className="flex flex-col gap-4">
                <InsightDashboard data={result} />
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!result && !loading && !error && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center animate-fade-in-up">
            <div className="text-7xl animate-float">🕸️</div>
            <p className="text-xl font-700 gradient-text">Ready to analyze</p>
            <p className="text-sm text-[var(--text-muted)] max-w-sm">
              Add directed edges above or pick a preset, then click{' '}
              <strong className="text-white">Analyze Graph</strong> to see the magic.
            </p>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {['Cycle detection', 'Forest construction', 'Depth calculation', 'Tree visualization'].map(
                (f) => (
                  <span key={f} className="tag tag-blue">{f}</span>
                )
              )}
            </div>
          </div>
        )}
      </main>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="border-t border-[var(--border)] py-5 text-center">
        <p className="text-xs text-[var(--text-muted)]">
          GraphPulse · O(V+E) DFS · Node.js + Next.js · Built with ⚡
        </p>
      </footer>
    </div>
  );
}
