/**
 * Compact seeded 3D value-noise (trilinear, hash-based) — deterministic
 * across reloads so the monolith silhouette never changes between visits.
 * Quality is plenty for vertex displacement; not used in shaders.
 */
export function createNoise3D(seed: number) {
  const hash = (x: number, y: number, z: number) => {
    let h = seed + x * 374761393 + y * 668265263 + z * 2147483647;
    h = (h ^ (h >> 13)) * 1274126177;
    h = h ^ (h >> 16);
    return (h & 0x7fffffff) / 0x7fffffff;
  };

  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  return (x: number, y: number, z: number): number => {
    const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
    const xf = x - xi, yf = y - yi, zf = z - zi;
    const u = fade(xf), v = fade(yf), w = fade(zf);

    const c000 = hash(xi, yi, zi), c100 = hash(xi + 1, yi, zi);
    const c010 = hash(xi, yi + 1, zi), c110 = hash(xi + 1, yi + 1, zi);
    const c001 = hash(xi, yi, zi + 1), c101 = hash(xi + 1, yi, zi + 1);
    const c011 = hash(xi, yi + 1, zi + 1), c111 = hash(xi + 1, yi + 1, zi + 1);

    const x00 = lerp(c000, c100, u), x10 = lerp(c010, c110, u);
    const x01 = lerp(c001, c101, u), x11 = lerp(c011, c111, u);

    return lerp(lerp(x00, x10, v), lerp(x01, x11, v), w) * 2 - 1;
  };
}
