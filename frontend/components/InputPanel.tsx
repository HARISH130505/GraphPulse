'use client';

import { useState, useRef } from 'react';
import { Plus, X, Play, Trash2, Download, ChevronRight, Zap } from 'lucide-react';
import { BFHLRequest } from '@/lib/types';
import clsx from 'clsx';

const PRESETS = [
  {
    label: 'Simple Tree',
    icon: '🌲',
    data: ['A->B', 'A->C', 'B->D', 'B->E', 'C->F'],
  },
  {
    label: 'Forest',
    icon: '🌳',
    data: ['A->B', 'B->C', 'D->E', 'E->F', 'G->H'],
  },
  {
    label: 'With Cycle',
    icon: '🔄',
    data: ['A->B', 'B->C', 'C->A', 'D->E'],
  },
  {
    label: 'Pure Cycle',
    icon: '♾️',
    data: ['A->B', 'B->C', 'C->A'],
  },
  {
    label: 'Multi-Parent',
    icon: '🔀',
    data: ['A->B', 'C->B', 'B->D', 'A->C'],
  },
  {
    label: 'Duplicates',
    icon: '📋',
    data: ['A->B', 'A->B', 'B->C', 'A->B', 'C->D'],
  },
  {
    label: 'Invalid Mix',
    icon: '⚠️',
    data: ['A->B', 'a->b', 'AB->C', 'A->A', 'A->B', 'C->D', ''],
  },
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

  const removeEntry = (i: number) =>
    setEntries((prev) => prev.filter((_, idx) => idx !== i));

  const loadPreset = (preset: (typeof PRESETS)[0]) => {
    setEntries(preset.data);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') addEntry();
  };

  const handleSubmit = () => {
    onSubmit({
      user_id: userId,
      email_id: email,
      college_roll_number: roll,
      data: entries,
    });
  };

  const exportJSON = () => {
    const blob = new Blob(
      [JSON.stringify({ user_id: userId, email_id: email, college_roll_number: roll, data: entries }, null, 2)],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'graphpulse-input.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass rounded-2xl p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-700 text-white">Input Builder</h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Add directed edges in <span className="font-mono text-[var(--accent-cyan)]">A-&gt;B</span> format
          </p>
        </div>
        <button onClick={exportJSON} className="btn-ghost text-xs">
          <Download size={13} /> Export
        </button>
      </div>

      {/* User fields */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'User ID', val: userId, set: setUserId, ph: 'john_doe' },
          { label: 'Email', val: email, set: setEmail, ph: 'you@email.com' },
          { label: 'Roll No.', val: roll, set: setRoll, ph: '21BCE0001' },
        ].map(({ label, val, set, ph }) => (
          <div key={label} className="flex flex-col gap-1">
            <label className="text-[10px] font-600 text-[var(--text-muted)] uppercase tracking-wider">
              {label}
            </label>
            <input
              value={val}
              onChange={(e) => set(e.target.value)}
              placeholder={ph}
              className="w-full bg-[rgba(255,255,255,0.04)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-blue)] transition-colors font-mono"
            />
          </div>
        ))}
      </div>

      {/* Presets */}
      <div>
        <p className="text-[10px] font-600 text-[var(--text-muted)] uppercase tracking-wider mb-2">
          Quick Presets
        </p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => loadPreset(p)}
              className="btn-ghost text-xs px-3 py-1.5"
            >
              {p.icon} {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Edge list */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-600 text-[var(--text-muted)] uppercase tracking-wider">
            Edges ({entries.length})
          </p>
          <button
            onClick={() => setEntries([])}
            className="text-[var(--text-muted)] hover:text-[var(--accent-red)] transition-colors flex items-center gap-1 text-xs"
          >
            <Trash2 size={11} /> Clear all
          </button>
        </div>

        <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
          {entries.map((e, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 bg-[rgba(59,130,246,0.1)] border border-[rgba(59,130,246,0.2)] rounded-lg px-3 py-1 text-sm font-mono text-blue-300 animate-scale-in"
            >
              <span>{e}</span>
              <button
                onClick={() => removeEntry(i)}
                className="text-[rgba(255,255,255,0.3)] hover:text-[var(--accent-red)] transition-colors"
              >
                <X size={11} />
              </button>
            </div>
          ))}
          {entries.length === 0 && (
            <p className="text-sm text-[var(--text-muted)] italic">No edges added yet…</p>
          )}
        </div>
      </div>

      {/* Add new edge */}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          value={newEntry}
          onChange={(e) => setNewEntry(e.target.value.toUpperCase())}
          onKeyDown={handleKeyDown}
          placeholder="e.g. A->B"
          className="flex-1 bg-[rgba(255,255,255,0.04)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm font-mono text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-blue)] transition-colors"
        />
        <button onClick={addEntry} className="btn-ghost px-3">
          <Plus size={16} />
        </button>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading || entries.length === 0}
        className={clsx('btn-primary w-full justify-center py-3 text-base', loading && 'opacity-70')}
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Analyzing…
          </>
        ) : (
          <>
            <Zap size={16} />
            Analyze Graph
          </>
        )}
      </button>
    </div>
  );
}
