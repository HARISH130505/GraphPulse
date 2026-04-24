/**
 * graph-engine/graphBuilder.js
 *
 * Builds:
 *   - adjacency list  (parent → [children])
 *   - parent map      (child  → parent)   ← single-parent rule enforced here
 *   - node set        (all unique nodes)
 *
 * Single-parent rule: first valid edge wins; later edges that would assign
 * a second parent to an already-parented node are silently ignored.
 */

/**
 * @param {Array<{from: string, to: string}>} validEdges
 * @returns {{
 *   adjacency: Map<string, string[]>,
 *   parentMap:  Map<string, string>,
 *   nodes:      Set<string>
 * }}
 */
function buildGraph(validEdges) {
  /** @type {Map<string, string[]>} */
  const adjacency = new Map();
  /** @type {Map<string, string>} child → parent */
  const parentMap = new Map();
  /** @type {Set<string>} */
  const nodes = new Set();

  for (const { from, to } of validEdges) {
    // Register both nodes
    nodes.add(from);
    nodes.add(to);

    // Ensure adjacency entry exists for 'from'
    if (!adjacency.has(from)) adjacency.set(from, []);
    // Ensure adjacency entry exists for 'to' (leaf nodes need an entry too)
    if (!adjacency.has(to)) adjacency.set(to, []);

    // Single-parent rule: skip if 'to' already has a parent
    if (parentMap.has(to)) continue;

    parentMap.set(to, from);
    adjacency.get(from).push(to);
  }

  return { adjacency, parentMap, nodes };
}

module.exports = { buildGraph };
