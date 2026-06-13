import { useState } from "react";
import placeholders from "../data/imagePlaceholders.json";

/**
 * Project image with the full modern pipeline baked in:
 * - serves WebP with a JPG/PNG fallback via <picture>
 * - shows an inlined blur placeholder (LQIP) instantly, then cross-fades to
 *   the real image on load — no empty boxes, no layout shift
 * - lazy-loads by default; pass `priority` for above-the-fold heroes
 *
 * Callers keep their own sized/aspect-ratio wrapper; this fills it.
 */
const LQIP = placeholders as Record<string, string>;

export default function Img({
  src,
  alt,
  className = "",
  imgClassName = "",
  priority = false,
  sizes,
  width,
  height,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  sizes?: string;
  width?: number | string;
  height?: number | string;
}) {
  const [loaded, setLoaded] = useState(false);
  const webp = src.replace(/\.(jpe?g|png)$/i, ".webp");
  const blur = LQIP[src];

  return (
    <span className={`block relative overflow-hidden ${className}`}>
      {blur && (
        <span
          aria-hidden
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${
            loaded ? "opacity-0" : "opacity-100"
          }`}
          style={{ backgroundImage: `url(${blur})`, filter: "blur(8px)", transform: "scale(1.1)" }}
        />
      )}
      {!loaded && !blur && (
        <span 
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse" 
        />
      )}
      <picture>
        <source srcSet={webp} type="image/webp" sizes={sizes} />
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          loading={priority ? "eager" : "lazy"}
          // @ts-expect-error fetchpriority is valid HTML, not yet in React types
          fetchpriority={priority ? "high" : "auto"}
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={`relative w-full h-full object-cover transition-opacity duration-700 ${
            loaded ? "opacity-100" : "opacity-0"
          } ${imgClassName}`}
          style={{
            aspectRatio: width && height ? `${width} / ${height}` : undefined
          }}
        />
      </picture>
    </span>
  );
}
