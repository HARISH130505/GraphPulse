/**
 * services/bfhlService.js
 *
 * Orchestrates the full pipeline:
 *   preprocess → build graph → build forest → build hierarchies → summary
 */

const { preprocessEdges } = require('../utils/validator');
const { buildGraph } = require('../graph-engine/graphBuilder');
const { buildForest } = require('../graph-engine/forestBuilder');
const { buildHierarchy } = require('../graph-engine/treeBuilder');

/**
 * @param {{
 *   data: string[],
 *   user_id: string,
 *   email_id: string,
 *   college_roll_number: string
 * }} payload
 * @returns {object}  full response
 */
function processBFHL(payload) {
  const startTime = Date.now();

  const {
    data: rawEntries,
    user_id = '',
    email_id = '',
    college_roll_number = '',
  } = payload;

  // ── Step 1: Preprocessing ───────────────────────────────────────────────
  const { validEdges, invalidEntries, duplicateEdges } =
    preprocessEdges(rawEntries);

  // ── Step 2: Build graph (adjacency + parentMap) ─────────────────────────
  const { adjacency, parentMap, nodes } = buildGraph(validEdges);

  // ── Step 3: Forest detection (components → roots) ───────────────────────
  const forest = buildForest(nodes, adjacency, parentMap);

  // ── Step 4: Build hierarchies per root ──────────────────────────────────
  const hierarchies = forest.map(({ root, isCyclic }) =>
    buildHierarchy(root, adjacency, isCyclic)
  );

  // ── Step 5: Summary ─────────────────────────────────────────────────────
  const acyclic = hierarchies.filter((h) => !h.has_cycle);
  const cyclic = hierarchies.filter((h) => h.has_cycle);

  // Largest tree root: max depth, tie-break lex smallest
  let largestTreeRoot = null;
  if (acyclic.length > 0) {
    const sorted = [...acyclic].sort((a, b) => {
      if (b.depth !== a.depth) return b.depth - a.depth;
      return a.root < b.root ? -1 : 1;
    });
    largestTreeRoot = sorted[0].root;
  }

  const summary = {
    total_trees: acyclic.length,
    total_cycles: cyclic.length,
    largest_tree_root: largestTreeRoot,
  };

  const elapsed = Date.now() - startTime;

  return {
    user_id,
    email_id,
    college_roll_number,
    hierarchies,
    invalid_entries: invalidEntries,
    duplicate_edges: duplicateEdges,
    summary,
    _meta: { processing_time_ms: elapsed },
  };
}

module.exports = { processBFHL };
