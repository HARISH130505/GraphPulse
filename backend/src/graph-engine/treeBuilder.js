/**
 * graph-engine/treeBuilder.js
 *
 * Builds:
 *   - nested object representation  { A: { B: { D: {} } } }
 *   - depth (longest root-to-leaf path, counted in nodes)
 */

/**
 * Recursively builds a nested tree object from the adjacency list.
 * Guards against infinite loops (shouldn't occur for acyclic components,
 * but the visited guard makes it safe).
 *
 * @param {string}              node
 * @param {Map<string,string[]>} adjacency
 * @param {Set<string>}         visited
 * @returns {Object}
 */
function buildTreeObject(node, adjacency, visited = new Set()) {
  if (visited.has(node)) return {};
  visited.add(node);

  const children = adjacency.get(node) || [];
  const subtree = {};

  for (const child of children) {
    subtree[child] = buildTreeObject(child, adjacency, visited);
  }

  return subtree;
}

/**
 * Computes the depth of a tree rooted at `node`.
 * Depth = number of nodes on the longest root-to-leaf path.
 *
 * @param {string}              node
 * @param {Map<string,string[]>} adjacency
 * @param {Map<string,number>}  memo
 * @returns {number}
 */
function computeDepth(node, adjacency, memo = new Map()) {
  if (memo.has(node)) return memo.get(node);

  const children = adjacency.get(node) || [];
  if (children.length === 0) {
    memo.set(node, 1);
    return 1;
  }

  let maxChildDepth = 0;
  for (const child of children) {
    const d = computeDepth(child, adjacency, memo);
    if (d > maxChildDepth) maxChildDepth = d;
  }

  const depth = 1 + maxChildDepth;
  memo.set(node, depth);
  return depth;
}

/**
 * Builds the full hierarchy object for a single root.
 *
 * @param {string}              root
 * @param {Map<string,string[]>} adjacency
 * @param {boolean}             isCyclic
 * @returns {{ root, tree, depth, has_cycle }}
 */
function buildHierarchy(root, adjacency, isCyclic) {
  if (isCyclic) {
    return { root, tree: {}, depth: 0, has_cycle: true };
  }

  const tree = { [root]: buildTreeObject(root, adjacency) };
  const depth = computeDepth(root, adjacency);

  return { root, tree, depth, has_cycle: false };
}

module.exports = { buildTreeObject, computeDepth, buildHierarchy };
