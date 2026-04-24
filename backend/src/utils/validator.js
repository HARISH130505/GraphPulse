/**
 * utils/validator.js
 * Preprocessing pipeline: trim → validate → classify
 */

/** Regex: exactly "A->B" where A and B are single uppercase letters, A ≠ B */
const EDGE_PATTERN = /^[A-Z]->[A-Z]$/;

/**
 * Validates a raw string and classifies it.
 *
 * Returns:
 *   { valid: true,  edge: "A->B", from: "A", to: "B" }
 *   { valid: false, raw: "<original>" }
 */
function validateEdge(raw) {
  if (typeof raw !== 'string') return { valid: false, raw: String(raw) };

  const trimmed = raw.trim();

  // Empty string after trim
  if (!trimmed) return { valid: false, raw: raw };

  // Must match pattern
  if (!EDGE_PATTERN.test(trimmed)) return { valid: false, raw: trimmed };

  const [from, to] = [trimmed[0], trimmed[3]];

  // Self-loop guard (pattern already prevents A->A if the regex were looser, but explicit is safer)
  if (from === to) return { valid: false, raw: trimmed };

  return { valid: true, edge: trimmed, from, to };
}

/**
 * Full preprocessing pipeline.
 *
 * @param {string[]} rawEntries - the raw "data" array from the request body
 * @returns {{ validEdges: Array<{edge,from,to}>, invalidEntries: string[], duplicateEdges: string[] }}
 */
function preprocessEdges(rawEntries) {
  if (!Array.isArray(rawEntries)) {
    throw new TypeError('"data" must be an array of strings');
  }

  const validEdges = [];
  const invalidEntries = [];
  const duplicateEdges = [];
  const seenEdges = new Set();

  for (const raw of rawEntries) {
    const result = validateEdge(raw);

    if (!result.valid) {
      invalidEntries.push(result.raw);
      continue;
    }

    if (seenEdges.has(result.edge)) {
      // Only record first recurrence as duplicate, subsequent ones too
      duplicateEdges.push(result.edge);
      continue;
    }

    seenEdges.add(result.edge);
    validEdges.push({ edge: result.edge, from: result.from, to: result.to });
  }

  return { validEdges, invalidEntries, duplicateEdges };
}

module.exports = { validateEdge, preprocessEdges };
