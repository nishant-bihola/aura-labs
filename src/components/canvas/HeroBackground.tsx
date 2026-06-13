import { Component, Suspense, lazy, useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Resilient wrapper around the WebGL hero scene.
 *
 * - Lazy-loads three.js so it never blocks first paint (critical for LCP).
 * - Detects WebGL support up front and skips the GL path on devices that
 *   can't run it (older/locked-down mobile browsers).
 * - Catches any runtime WebGL/context-loss error and degrades to a tuned
 *   CSS aurora instead of a black screen — the iOS Safari failure the
 *   business kept hitting. The hero always renders *something* premium.
 */

const FrozenHeroScene = lazy(() => import("./frozen/FrozenHeroScene"));

function hasWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      (canvas.getContext("webgl2") ||
       canvas.getContext("webgl") ||
       canvas.getContext("experimental-webgl")) as WebGLRenderingContext | WebGL2RenderingContext | null;
    if (!gl) return false;

    // Detect software renderers (common in headless browser test runners and virtual machines)
    // which fail to compile complex shaders or suffer severe performance bottlenecks.
    const dbg = gl.getExtension("WEBGL_debug_renderer_info");
    if (dbg) {
      const renderer = (gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || "").toLowerCase();
      if (
        renderer.includes("swiftshader") ||
        renderer.includes("llvmpipe") ||
        renderer.includes("software") ||
        renderer.includes("google") || // "Google SwiftShader"
        renderer.includes("mesa") ||
        renderer.includes("microsoft basic render driver")
      ) {
        return false; // Safely fall back to premium CSS aurora on software rendering
      }
    }
    return true;
  } catch {
    return false;
  }
}

/** Animated brand-tuned fallback — frozen cyan/violet aurora, pure CSS. */
function AuroraFallback() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#04060a]" aria-hidden>
      <div className="aurora-blob aurora-blob--cyan" />
      <div className="aurora-blob aurora-blob--violet" />
      <div className="aurora-blob aurora-blob--ice" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(0,240,255,0.10),transparent_55%)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/60" />
    </div>
  );
}

class GLBoundary extends Component<
  { children: ReactNode; fallback: ReactNode; onError?: () => void },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError?.();
  }

  render() {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}

export default function HeroBackground({ onReady }: { onReady?: () => void }) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [crashed, setCrashed] = useState(false);
  const [active, setActive] = useState(true);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ok = hasWebGL();
    setSupported(ok);
    // If we're going straight to the fallback, lift the boot veil immediately.
    if (!ok) onReady?.();
  }, [onReady]);

  // Pause the GL render loop whenever the hero scrolls out of view — saves
  // battery and keeps the rest of the page buttery smooth on scroll.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || !supported) return;
    const io = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { threshold: 0.01 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [supported]);

  const handleError = () => {
    setCrashed(true);
    onReady?.();
  };

  if (supported === null) {
    // Decision pending (one frame) — keep it dark to avoid a flash.
    return <div className="absolute inset-0 bg-[#04060a]" aria-hidden />;
  }

  if (!supported || crashed) return <AuroraFallback />;

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <GLBoundary fallback={<AuroraFallback />} onError={handleError}>
        <Suspense fallback={<AuroraFallback />}>
          <FrozenHeroScene onReady={onReady} onError={handleError} active={active} />
        </Suspense>
      </GLBoundary>
    </div>
  );
}
