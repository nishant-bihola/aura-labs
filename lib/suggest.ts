import { Transaction } from './types';

/**
 * Suggest a category by matching words in the new description against
 * the user's own past transactions. The more past transactions in a
 * category share words with the description, the higher it scores —
 * so the app gets smarter the more it's used.
 */
export function suggestCategory(
  description: string,
  transactions: Transaction[]
): string | null {
  const words = description
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2);
  if (words.length === 0) return null;

  const scores: Record<string, number> = {};
  for (const t of transactions) {
    if (t.type === 'income' || !t.description) continue;
    const past = t.description.toLowerCase();
    let hits = 0;
    for (const w of words) {
      if (past.includes(w)) hits++;
    }
    if (hits > 0) scores[t.category] = (scores[t.category] ?? 0) + hits;
  }

  let best: string | null = null;
  let bestScore = 0;
  for (const [cat, score] of Object.entries(scores)) {
    if (score > bestScore) {
      best = cat;
      bestScore = score;
    }
  }
  return best;
}
