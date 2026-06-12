import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Noise,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import type { ChromaticAberrationEffect } from "postprocessing";
import { heroProgress, isCoarsePointer, prefersReducedMotion } from "./progress";

/**
 * Film pass: soft bloom off the emissive core, chromatic aberration
 * that swells slightly with scroll depth, grain, vignette.
 */
export default function PostFX() {
  const caRef = useRef<ChromaticAberrationEffect>(null);
  const lastP = useRef(0);

  useFrame(() => {
    const ca = caRef.current;
    if (!ca) return;
    // velocity-reactive lens stress
    const v = Math.min(Math.abs(heroProgress.value - lastP.current) * 0.35, 0.004);
    lastP.current = lastP.current + (heroProgress.value - lastP.current) * 0.12;
    const base = 0.0011;
    ca.offset.set(base + v, (base + v) * 0.6);
  });

  if (prefersReducedMotion()) return null;

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom
        intensity={isCoarsePointer() ? 0.5 : 0.85}
        luminanceThreshold={0.82}
        luminanceSmoothing={0.3}
        mipmapBlur
      />
      <ChromaticAberration ref={caRef} blendFunction={BlendFunction.NORMAL} />
      <Noise opacity={0.05} blendFunction={BlendFunction.OVERLAY} />
      <Vignette eskil={false} offset={0.18} darkness={0.92} />
    </EffectComposer>
  );
}
