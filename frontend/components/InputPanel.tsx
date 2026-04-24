'use client';

import { useState, useRef } from 'react';
import { Plus, X, Trash2, Download, Zap, Database } from 'lucide-react';
import { BFHLRequest } from '@/lib/types';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const PRESETS = [
  { label: 'Tree', icon: '🌲', data: ['A->B', 'A->C', 'B->D', 'B->E', 'C->F'] },
  { label: 'Forest', icon: '🌳', data: ['A->B', 'B->C', 'D->E', 'E->F', 'G->H'] },
  { label: 'Cycle', icon: '🔄', data: ['A->B', 'B->C', 'C->A', 'D->E'] },
  { label: 'Infinity', icon: '♾️', data: ['A->B', 'B->C', 'C->A'] },
  { label: 'Multi', icon: '🔀', data: ['A->B', 'C->B', 'B->D', 'A->C'] },
  { label: 'Messy', icon: '⚠️', data: ['A->B', 'A->B', 'a->b', 'AB->C', 'A->A'] },
];

interface InputPanelProps {
  onSubmit: (req: BFHLRequest) => void;
  loading: boolean;
}

export function InputPanel({ onSubmit, loading }: InputPanelProps) {
  const [entries, setEntries] = useState<string[]>(['A->B', 'B->C', 'C->D']);
  const [userId, setUserId] = useState('john_doe_42');
  const [email, setEmail] = useState('john@example.com');
  const [roll, setRoll] = useState('21BCE0001');
  const [newEntry, setNewEntry] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const addEntry = () => {
    const trimmed = newEntry.trim().toUpperCase();
    if (!trimmed) return;
    setEntries((prev) => [...prev, trimmed]);
    setNewEntry('');
    inputRef.current?.focus();
  };

  const removeEntry = (i: number) => setEntries((prev) => prev.filter((_, idx) => idx !== i));
  const loadPreset = (data: string[]) => setEntries(data);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') addEntry();
  };

  const exportJSON = () => {
    const blob = new Blob(
      [JSON.stringify({ user_id: userId, email_id: email, college_roll_number: roll, data: entries }, null, 2)],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'graphpulse-payload.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 md:p-8 flex flex-col gap-8 h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/5">
            <Database size={18} className="text-[var(--accent-cyan)]" />
          </div>
          <div>
            <h2 className="text-lg font-700 text-white tracking-tight">Data Ingestion</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Format: <code className="bg-white/5 px-1.5 py-0.5 rounded text-[var(--accent-cyan)] font-mono">A-&gt;B</code></p>
          </div>
        </div>
        <button onClick={exportJSON} className="btn-ghost" title="Export Payload">
          <Download size={14} /> Export
        </button>
      </div>

      {/* User fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'User ID', val: userId, set: setUserId, ph: 'your_username' },
          { label: 'Email', val: email, set: setEmail, ph: 'your_email' },
          { label: 'Register Number', val: roll, set: setRoll, ph: 'your_reg_num' },
        ].map(({ label, val, set, ph }) => (
          <div key={label} className="flex flex-col gap-1.5">
            <label className="text-[10px] font-700 text-[var(--text-muted)] uppercase tracking-widest pl-1">
              {label}
            </label>
            <input
              value={val}
              onChange={(e) => set(e.target.value)}
              placeholder={ph}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[var(--accent-cyan)] focus:bg-black/40 transition-all font-mono"
            />
          </div>
        ))}
      </div>

      {/* Edge Builder */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-700 text-[var(--text-muted)] uppercase tracking-widest pl-1">
            Edge Definitions ({entries.length})
          </label>
          <div className="flex gap-2">
            {PRESETS.map((p) => (
              <button key={p.label} onClick={() => loadPreset(p.data)} className="text-[10px] bg-white/5 hover:bg-white/10 px-2 py-1 rounded transition-colors text-white/80 hover:text-white" title={`Load ${p.label}`}>
                {p.icon} {p.label}
              </button>
            ))}
            <div className="w-px h-4 bg-white/10 self-center mx-1" />
            <button onClick={() => setEntries([])} className="text-[10px] text-[var(--accent-rose)]/70 hover:text-[var(--accent-rose)] transition-colors flex items-center gap-1">
              <Trash2 size={12} /> Clear
            </button>
          </div>
        </div>

        {/* Input Row */}
        <div className="flex gap-2 relative">
          <input
            ref={inputRef}
            value={newEntry}
            onChange={(e) => setNewEntry(e.target.value.toUpperCase())}
            onKeyDown={handleKeyDown}
            placeholder="e.g. A->B"
            className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder:text-white/40 focus:outline-none focus:border-[var(--accent-cyan)] focus:bg-black/40 transition-all shadow-inner"
          />
          <button onClick={addEntry} className="bg-white/10 hover:bg-white/20 text-white rounded-xl px-4 flex items-center justify-center transition-all">
            <Plus size={18} />
          </button>
        </div>

        {/* Chips Area */}
        <div className="bg-black/20 border border-white/5 rounded-xl p-3 min-h-[120px] max-h-[160px] overflow-y-auto flex flex-wrap gap-2 content-start">
          <AnimatePresence>
            {entries.length === 0 ? (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-white/50 italic w-full text-center py-8">
                No edges defined. Add some or pick a preset.
              </motion.p>
            ) : (
              entries.map((e, i) => (
                <motion.div
                  key={`${i}-${e}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8, filter: 'blur(4px)' }}
                  className="flex items-center gap-1.5 bg-[var(--accent-blue)]/10 border border-[var(--accent-blue)]/20 rounded-lg pl-3 pr-1 py-1 text-sm font-mono text-blue-200"
                >
                  {e}
                  <button onClick={() => removeEntry(i)} className="p-1 rounded-md hover:bg-white/10 text-white/60 hover:text-[var(--accent-rose)] transition-colors">
                    <X size={12} />
                  </button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Action */}
      <button
        onClick={() => onSubmit({ user_id: userId, email_id: email, college_roll_number: roll, data: entries })}
        disabled={loading || entries.length === 0}
        className="btn-premium w-full py-4 text-base tracking-wide mt-auto"
      >
        {loading ? (
          <>
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Processing Graph...
          </>
        ) : (
          <>
            <Zap size={18} className="text-white" />
            Compute Graph Topology
          </>
        )}
      </button>
    </div>
  );
}
