'use client';

import { BFHLResponse } from '@/lib/types';
import { AlertTriangle, Copy, GitBranch, Clock, Code2, Network, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface InsightDashboardProps {
  data: BFHLResponse;
}

function StatCard({
  label, value, sub, accent, icon, delay
}: {
  label: string; value: string | number; sub?: string; accent: string; icon: React.ReactNode; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="glass-panel rounded-2xl p-5 flex flex-col gap-3 group hover:-translate-y-1 transition-transform duration-300"
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-800 text-[var(--text-muted)] uppercase tracking-widest">
          {label}
        </span>
        <div className="p-2 rounded-xl transition-colors duration-300" style={{ backgroundColor: `${accent}15`, color: accent }}>
          {icon}
        </div>
      </div>
      <div>
        <div className="text-3xl font-800 tracking-tight" style={{ color: accent, textShadow: `0 0 20px ${accent}40` }}>
          {value}
        </div>
        {sub && <p className="text-xs text-[var(--text-secondary)] mt-1 font-mono">{sub}</p>}
      </div>
    </motion.div>
  );
}

export function InsightDashboard({ data }: InsightDashboardProps) {
  const [copied, setCopied] = useState(false);

  const copyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'graphpulse-result.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          label="Forest Trees"
          value={data.summary.total_trees}
          sub="Acyclic components"
          accent="var(--accent-cyan)"
          icon={<GitBranch size={18} />}
          delay={0.1}
        />
        <StatCard
          label="Detected Cycles"
          value={data.summary.total_cycles}
          sub="Cyclic back-edges"
          accent="var(--accent-rose)"
          icon={<Network size={18} />}
          delay={0.2}
        />
        <StatCard
          label="Primary Root"
          value={data.summary.largest_tree_root ?? '—'}
          sub="Max depth lex-tie"
          accent="var(--accent-purple)"
          icon={<Code2 size={18} />}
          delay={0.3}
        />
        <StatCard
          label="Compute Time"
          value={`${data._meta?.processing_time_ms ?? 0}ms`}
          sub="API round-trip"
          accent="var(--accent-emerald)"
          icon={<Clock size={18} />}
          delay={0.4}
        />
      </div>

      {/* Warnings & Duplicates */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-[var(--accent-amber)]" />
            <span className="text-sm font-700 text-white tracking-wide">Invalid Entries</span>
            <span className="tag tag-amber ml-auto">{data.invalid_entries.length}</span>
          </div>
          {data.invalid_entries.length === 0 ? (
            <div className="flex items-center gap-2 text-[var(--accent-emerald)] bg-[var(--accent-emerald)]/10 px-3 py-2 rounded-lg">
              <CheckCircle2 size={14} />
              <p className="text-xs font-600">All entries validated successfully</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 max-h-[100px] overflow-y-auto pr-2">
              {data.invalid_entries.map((e, i) => (
                <span key={i} className="px-2 py-1 bg-[var(--accent-amber)]/10 border border-[var(--accent-amber)]/20 text-[var(--accent-amber)] rounded font-mono text-[11px] truncate max-w-full">
                  {e || '<empty>'}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Copy size={16} className="text-[var(--accent-purple)]" />
            <span className="text-sm font-700 text-white tracking-wide">Duplicate Edges</span>
            <span className="tag tag-purple ml-auto">{data.duplicate_edges.length}</span>
          </div>
          {data.duplicate_edges.length === 0 ? (
            <div className="flex items-center gap-2 text-[var(--accent-emerald)] bg-[var(--accent-emerald)]/10 px-3 py-2 rounded-lg">
              <CheckCircle2 size={14} />
              <p className="text-xs font-600">No duplicate paths detected</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 max-h-[100px] overflow-y-auto pr-2">
              {data.duplicate_edges.map((e, i) => (
                <span key={i} className="px-2 py-1 bg-[var(--accent-purple)]/10 border border-[var(--accent-purple)]/20 text-[var(--accent-purple)] rounded font-mono text-[11px]">
                  {e}
                </span>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Raw JSON */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        className="glass-panel rounded-2xl p-5 flex-1 flex flex-col"
      >
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Code2 size={16} className="text-[var(--text-muted)]" />
            <span className="text-sm font-700 text-white">API Response Payload</span>
          </div>
          <div className="flex gap-2">
            <button onClick={copyJSON} className="btn-ghost text-xs py-1">
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button onClick={downloadJSON} className="btn-ghost text-xs py-1">
              Download
            </button>
          </div>
        </div>
        <div className="bg-[#030712] border border-white/5 rounded-xl p-4 flex-1 overflow-hidden relative">
          <pre className="text-[11px] font-mono text-[var(--accent-cyan)] leading-relaxed h-full overflow-auto pr-2 custom-scrollbar">
            {JSON.stringify(data, null, 2)}
          </pre>
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#030712] to-transparent pointer-events-none" />
        </div>
      </motion.div>
    </div>
  );
}
