/**
 * graph-engine/cycleDetector.js
 *
 * O(V + E) cycle detection using iterative DFS with a recursion stack.
 * Detects back-edges in a directed graph.
 */

/**
 * Detects whether the subgraph reachable from `startNode` contains a cycle.
 *
 * @param {string}              startNode
 * @param {Map<string,string[]>} adjacency
 * @param {Set<string>}         globalVisited  — shared across all DFS calls in the forest
 * @returns {boolean}
 */
function hasCycleFromNode(startNode, adjacency, globalVisited) {
  // visited tracks nodes that have been fully explored
  const visited = new Set();
  // recursionStack tracks the current DFS path
  const recursionStack = new Set();

  /**
   * Inner recursive DFS.
   * @param {string} node
   * @returns {boolean}
   */
  function dfs(node) {
    visited.add(node);
    globalVisited.add(node);
    recursionStack.add(node);

    const children = adjacency.get(node) || [];
    for (const child of children) {
      if (!visited.has(child)) {
        if (dfs(child)) return true;
      } else if (recursionStack.has(child)) {
        // Back-edge found → cycle
        return true;
      }
    }

    recursionStack.delete(node);
    return false;
  }

  return dfs(startNode);
}

/**
 * Partitions the forest into cyclic and acyclic components.
 *
 * @param {string[]}             roots      — candidate roots (one per component)
 * @param {Map<string,string[]>} adjacency
 * @returns {{ cyclicRoots: string[], acyclicRoots: string[] }}
 */
function partitionComponents(roots, adjacency) {
  const cyclicRoots = [];
  const acyclicRoots = [];
  const globalVisited = new Set();

  for (const root of roots) {
    if (globalVisited.has(root)) continue;
    if (hasCycleFromNode(root, adjacency, globalVisited)) {
      cyclicRoots.push(root);
    } else {
      acyclicRoots.push(root);
    }
  }

  return { cyclicRoots, acyclicRoots };
}

module.exports = { hasCycleFromNode, partitionComponents };
