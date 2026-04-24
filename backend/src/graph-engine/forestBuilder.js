/**
 * graph-engine/forestBuilder.js
 *
 * Handles multi-component (forest) logic:
 *   1. Find all connected components via BFS/DFS
 *   2. Identify roots for each component:
 *      - Normal: nodes with no parent
 *      - Pure-cycle: lexicographically smallest node
 *   3. Classify each component as cyclic or acyclic
 */

const { hasCycleFromNode } = require('./cycleDetector');

/**
 * Groups nodes into connected components (ignoring edge direction for reachability).
 *
 * @param {Set<string>}          nodes
 * @param {Map<string,string[]>} adjacency
 * @param {Map<string,string>}   parentMap
 * @returns {string[][]}   array of node arrays, one per component
 */
function findComponents(nodes, adjacency, parentMap) {
  const visited = new Set();
  const components = [];

  // Build undirected adjacency for component traversal
  const undirected = new Map();
  for (const node of nodes) undirected.set(node, new Set());

  for (const [parent, children] of adjacency) {
    for (const child of children) {
      undirected.get(parent).add(child);
      undirected.get(child).add(parent);
    }
  }

  for (const node of nodes) {
    if (visited.has(node)) continue;

    const component = [];
    const stack = [node];

    while (stack.length) {
      const cur = stack.pop();
      if (visited.has(cur)) continue;
      visited.add(cur);
      component.push(cur);

      for (const neighbor of (undirected.get(cur) || [])) {
        if (!visited.has(neighbor)) stack.push(neighbor);
      }
    }

    component.sort(); // deterministic ordering
    components.push(component);
  }

  return components;
}

/**
 * For a given component, determine the root node(s).
 *
 * @param {string[]}           component
 * @param {Map<string,string>} parentMap
 * @returns {string[]}  root nodes (usually 1; multiple if isolated nodes)
 */
function getRootsForComponent(component, parentMap) {
  const roots = component.filter((n) => !parentMap.has(n));
  return roots;
}

/**
 * Main forest builder.
 *
 * @param {Set<string>}          nodes
 * @param {Map<string,string[]>} adjacency
 * @param {Map<string,string>}   parentMap
 * @returns {Array<{ root: string, isCyclic: boolean }>}
 */
function buildForest(nodes, adjacency, parentMap) {
  if (nodes.size === 0) return [];

  const components = findComponents(nodes, adjacency, parentMap);
  const forest = [];

  for (const component of components) {
    const roots = getRootsForComponent(component, parentMap);
    const globalVisited = new Set();

    if (roots.length === 0) {
      // Pure-cycle component — pick lex-smallest node as virtual root
      const virtualRoot = component[0]; // already sorted
      const isCyclic = hasCycleFromNode(virtualRoot, adjacency, globalVisited);
      forest.push({ root: virtualRoot, isCyclic: true });
    } else {
      for (const root of roots) {
        const isCyclic = hasCycleFromNode(root, adjacency, globalVisited);
        forest.push({ root, isCyclic });
      }
    }
  }

  return forest;
}

module.exports = { buildForest, findComponents };
