// Query-biased snippet generation for plain SQL/LIKE search results.
// Mirrors the Luhn (1958) significance-clustering approach used by the
// Python search_engine (core/engine.py:generate_snippet): pick the sentence
// whose query-term occurrences cluster most densely, then window around it.

type Span = [number, number];

const CLUSTER_GAP_CHARS = 40;

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?…])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function findTermSpans(sentence: string, terms: string[]): Span[] {
  const lower = sentence.toLowerCase();
  const spans: Span[] = [];
  for (const term of terms) {
    if (!term) continue;
    let idx = lower.indexOf(term);
    while (idx !== -1) {
      spans.push([idx, idx + term.length]);
      idx = lower.indexOf(term, idx + term.length);
    }
  }
  spans.sort((a, b) => a[0] - b[0]);
  return spans;
}

function scoreSentence(sentence: string, terms: string[]): { score: number; cluster: Span[] } {
  const spans = findTermSpans(sentence, terms);
  if (spans.length === 0) return { score: 0, cluster: [] };

  const clusters: Span[][] = [[spans[0]]];
  for (let i = 1; i < spans.length; i++) {
    const current = clusters[clusters.length - 1];
    if (spans[i][0] - current[current.length - 1][1] <= CLUSTER_GAP_CHARS) {
      current.push(spans[i]);
    } else {
      clusters.push([spans[i]]);
    }
  }

  let bestScore = 0;
  let bestCluster = clusters[0];
  for (const cluster of clusters) {
    const count = cluster.length;
    const spanLen = cluster[cluster.length - 1][1] - cluster[0][0];
    const score = spanLen > 0 ? (count * count) / spanLen : count;
    if (score > bestScore) {
      bestScore = score;
      bestCluster = cluster;
    }
  }
  return { score: bestScore, cluster: bestCluster };
}

export interface SnippetResult {
  text: string;
  matched_terms: string[];
}

export function generateSnippet(sourceText: string, query: string, maxChars = 220): SnippetResult {
  const terms = Array.from(
    new Set(
      query
        .toLowerCase()
        .split(/\s+/)
        .filter((t) => t.length >= 2)
    )
  );

  if (!sourceText) {
    return { text: '', matched_terms: [] };
  }
  if (terms.length === 0) {
    const text = sourceText.slice(0, maxChars);
    return { text: text + (sourceText.length > maxChars ? '...' : ''), matched_terms: [] };
  }

  const sentences = splitSentences(sourceText);
  const candidates = sentences.length > 0 ? sentences : [sourceText];

  let bestScore = -1;
  let bestSentence = candidates[0];
  let bestCluster: Span[] = [];
  for (const sentence of candidates) {
    const { score, cluster } = scoreSentence(sentence, terms);
    if (score > bestScore) {
      bestScore = score;
      bestSentence = sentence;
      bestCluster = cluster;
    }
  }

  if (bestScore <= 0) {
    const text = bestSentence.slice(0, maxChars);
    return { text: text + (bestSentence.length > maxChars ? '...' : ''), matched_terms: [] };
  }

  const clusterStart = bestCluster[0][0];
  const clusterEnd = bestCluster[bestCluster.length - 1][1];
  const mid = Math.floor((clusterStart + clusterEnd) / 2);
  let start = Math.max(0, mid - Math.floor(maxChars / 2));
  let end = Math.min(bestSentence.length, start + maxChars);
  start = Math.max(0, end - maxChars);

  let text = bestSentence.slice(start, end).trim();
  if (start > 0) text = '...' + text;
  if (end < bestSentence.length) text = text + '...';

  const bestSentenceLower = bestSentence.toLowerCase();
  const matchedTerms = terms.filter((t) => bestSentenceLower.includes(t));

  return { text, matched_terms: matchedTerms };
}
