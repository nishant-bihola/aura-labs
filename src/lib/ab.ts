import { track } from "@vercel/analytics";

/**
 * Tiny A/B helper. Assigns a stable variant per visitor (localStorage) and
 * reports assignment + conversion to Vercel Analytics so results show up under
 * Custom Events — no extra service required.
 */
export function getVariant(test: string, variants: string[]): string {
  if (!variants.length) return "";
  try {
    const key = `ab_${test}`;
    let v = localStorage.getItem(key);
    if (!v || !variants.includes(v)) {
      v = variants[Math.floor(Math.random() * variants.length)];
      localStorage.setItem(key, v);
      try { track("ab_assign", { test, variant: v }); } catch { /* ignore */ }
    }
    return v;
  } catch {
    return variants[0];
  }
}

export function trackConversion(test: string, variant: string) {
  try { track("ab_convert", { test, variant }); } catch { /* ignore */ }
}
