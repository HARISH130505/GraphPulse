'use client';

import { BFHLResponse } from '@/lib/types';
import { AlertTriangle, Copy, GitBranch, Clock } from 'lucide-react';
import clsx from 'clsx';
import { useState } from 'react';

interface InsightDashboardProps {
  data: BFHLResponse;
}

function StatCard({
  label,
  value,
  sub,
  accent,
  icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className="glass rounded-xl p-4 flex flex-col gap-2 animate-fade-in-up"
      style={{ borderColor: accent + '33' }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-600 text-[var(--text-muted)] uppercase tracking-wider">
          {label}
        </span>
        <span style={{ color: accent }}>{icon}</span>
      </div>
      <div className="text-3xl font-800" style={{ color: accent }}>
        {value}
      </div>
      {sub && <p className="text-xs text-[var(--text-muted)]">{sub}</p>}
    </div>
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
    <div className="flex flex-col gap-4 animate-fade-in-up">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Trees"
          value={data.summary.total_trees}
          sub="Acyclic components"
          accent="var(--accent-blue)"
          icon={<GitBranch size={16} />}
        />
        <StatCard
          label="Cycles"
          value={data.summary.total_cycles}
          sub="Cyclic components"
          accent="var(--accent-red)"
          icon={<span className="text-base">🔄</span>}
        />
        <StatCard
          label="Largest Root"
          value={data.summary.largest_tree_root ?? '—'}
          sub="By depth, lex tie-break"
          accent="var(--accent-purple)"
          icon={<span className="text-base">👑</span>}
        />
        <StatCard
          label="Process Time"
          value={`${data._meta?.processing_time_ms ?? 0}ms`}
          sub="API round-trip"
          accent="var(--accent-cyan)"
          icon={<Clock size={16} />}
        />
      </div>

      {/* Invalid + Duplicates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Invalid */}
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={14} className="text-[var(--accent-amber)]" />
            <span className="text-sm font-600 text-[var(--accent-amber)]">
              Invalid Entries
            </span>
            <span className="tag tag-amber ml-auto">{data.invalid_entries.length}</span>
          </div>
          {data.invalid_entries.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)] italic">None — all entries valid ✓</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {data.invalid_entries.map((e, i) => (
                <span key={i} className="tag tag-amber font-mono text-[11px]">
                  {e || '<empty>'}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Duplicates */}
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Copy size={14} className="text-[var(--accent-cyan)]" />
            <span className="text-sm font-600 text-[var(--accent-cyan)]">
              Duplicate Edges
            </span>
            <span className="tag tag-cyan ml-auto">{data.duplicate_edges.length}</span>
          </div>
          {data.duplicate_edges.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)] italic">No duplicates found ✓</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {data.duplicate_edges.map((e, i) => (
                <span key={i} className="tag tag-cyan font-mono text-[11px]">{e}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Raw JSON */}
      <div className="glass rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-600 text-white">Raw API Response</span>
          <div className="flex gap-2">
            <button onClick={copyJSON} className="btn-ghost text-xs">
              {copied ? '✓ Copied!' : 'Copy JSON'}
            </button>
            <button onClick={downloadJSON} className="btn-ghost text-xs">
              Download
            </button>
          </div>
        </div>
        <pre className="text-[11px] font-mono text-[var(--text-secondary)] bg-[rgba(0,0,0,0.3)] rounded-lg p-3 overflow-auto max-h-64 leading-relaxed">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}
