export interface BFHLRequest {
  user_id: string;
  email_id: string;
  college_roll_number: string;
  data: string[];
}

export interface Hierarchy {
  root: string;
  tree: Record<string, unknown>;
  depth: number;
  has_cycle: boolean;
}

export interface Summary {
  total_trees: number;
  total_cycles: number;
  largest_tree_root: string | null;
}

export interface BFHLResponse {
  user_id: string;
  email_id: string;
  college_roll_number: string;
  hierarchies: Hierarchy[];
  invalid_entries: string[];
  duplicate_edges: string[];
  summary: Summary;
  _meta?: { processing_time_ms: number };
}

export type SimulationStep =
  | 'idle'
  | 'validating'
  | 'deduplicating'
  | 'building-graph'
  | 'detecting-cycles'
  | 'building-trees'
  | 'done';

export interface SimulationState {
  step: SimulationStep;
  stepIndex: number;
  total: number;
}
