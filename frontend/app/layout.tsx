import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GraphPulse — Hierarchical Graph Analyzer',
  description:
    'Production-grade REST API explorer for processing directed-edge graphs with cycle detection, tree visualization, and real-time simulation.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
