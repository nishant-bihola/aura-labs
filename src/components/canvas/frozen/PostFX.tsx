import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Noise,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { Vector2 } from "three";
import { isCoarsePointer, prefersReducedMotion } from "./progress";

/**
 * Film pass: soft bloom off the emissive core, a touch of chromatic
 * aberration, grain, and vignette.
 *
 * Note: we deliberately do NOT attach a ref to <ChromaticAberration>.
 * Under React 19 `ref` is delivered as a normal prop, and
 * @react-three/postprocessing memoizes effect props via
 * `JSON.stringify(props)` — a ref to a live postprocessing Effect has a
 * circular structure (parent ⇄ children) and throws. A static offset
 * keeps the look without the crash.
 */
const CA_OFFSET = new Vector2(0.0012, 0.0008);

export default function PostFX() {
  if (prefersReducedMotion() || isCoarsePointer()) return null;

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom
        intensity={0.85}
        luminanceThreshold={0.82}
        luminanceSmoothing={0.3}
        mipmapBlur
      />
      <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={CA_OFFSET} />
      <Noise opacity={0.05} blendFunction={BlendFunction.OVERLAY} />
      <Vignette eskil={false} offset={0.18} darkness={0.92} />
    </EffectComposer>
  );
}
