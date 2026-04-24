'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BFHLRequest, BFHLResponse, SimulationStep } from '@/lib/types';
import { processBFHL } from '@/lib/api';
import { InputPanel } from '@/components/InputPanel';
import { SimulationStepper } from '@/components/SimulationStepper';
import { InsightDashboard } from '@/components/InsightDashboard';
import { TreeViewer } from '@/components/TreeViewer';
import { GraphView } from '@/components/GraphView';
import { AlertCircle, Activity, Sparkles } from 'lucide-react';

const SIMULATION_STEPS: SimulationStep[] = [
  'validating',
  'deduplicating',
  'building-graph',
  'detecting-cycles',
  'building-trees',
  'done',
];

const STEP_DELAY = 500; // slightly longer for smoother animation feel

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

    let apiResponse: BFHLResponse | null = null;
    let apiError: string | null = null;

    const apiPromise = processBFHL(req)
      .then((r) => { apiResponse = r; })
      .catch((e) => { apiError = e.message; });

    for (const step of SIMULATION_STEPS) {
      setSimStep(step);
      if (step !== 'done') await sleep(STEP_DELAY);
    }

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
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* ── Immersive Aurora Background ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-aurora"
             style={{ background: 'var(--accent-cyan)' }} />
        <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-aurora"
             style={{ background: 'var(--accent-purple)', animationDirection: 'reverse', animationDuration: '25s' }} />
        <div className="absolute bottom-[-20%] left-[20%] w-[60vw] h-[60vw] rounded-full mix-blend-screen filter blur-[150px] opacity-10 animate-aurora"
             style={{ background: 'var(--accent-blue)', animationDuration: '30s' }} />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-white/5 bg-black/20 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                <Activity className="text-[var(--accent-cyan)]" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-800 tracking-tight text-white">GraphPulse</h1>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5 uppercase tracking-[0.2em] font-600">
                  Analysis Engine
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 glass-panel rounded-full px-4 py-2"
            >
              <div className="live-dot" />
              <span className="text-[11px] font-mono text-[var(--text-secondary)]">
                System Online
              </span>
            </motion.div>
          </div>
        </header>

        {/* Hero */}
        {!result && !loading && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center pt-20 pb-12 px-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-[var(--accent-cyan)] font-mono mb-6">
              <Sparkles size={14} /> Next-Gen Graph Processing
            </div>
            <h2 className="text-5xl md:text-6xl font-800 tracking-tight mb-6 leading-tight">
              Visualize Hierarchies <br />
              <span className="gradient-text">In Real-Time.</span>
            </h2>
            <p className="text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto">
              Inject directed edges, compute O(V+E) cycle detection, and explore multi-tree forests through a stunning interactive canvas.
            </p>
          </motion.div>
        )}

        <main className="max-w-7xl mx-auto w-full px-6 pb-20 pt-8 flex flex-col gap-8 flex-1">
          {/* Top Config Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <motion.div 
              className="lg:col-span-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <InputPanel onSubmit={runSimulation} loading={loading} />
            </motion.div>
            <motion.div 
              className="lg:col-span-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <SimulationStepper current={simStep} />
            </motion.div>
          </div>

          {/* Error Alert */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="glass-panel border-[var(--accent-rose)]/30 bg-[var(--accent-rose)]/5 p-5 rounded-2xl flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-[var(--accent-rose)]/20 mt-0.5">
                    <AlertCircle className="text-[var(--accent-rose)]" size={20} />
                  </div>
                  <div>
                    <h3 className="font-600 text-white text-sm">Analysis Failed</h3>
                    <p className="text-sm text-[var(--text-secondary)] mt-1 font-mono">{error}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results Grid */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, staggerChildren: 0.1 }}
                className="flex flex-col gap-8"
              >
                {/* Main Graph View spans full width */}
                <motion.div>
                  <GraphView hierarchies={result.hierarchies} />
                </motion.div>

                {/* Split view for Tree and Insights */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <motion.div>
                    <TreeViewer hierarchies={result.hierarchies} />
                  </motion.div>
                  <motion.div>
                    <InsightDashboard data={result} />
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
