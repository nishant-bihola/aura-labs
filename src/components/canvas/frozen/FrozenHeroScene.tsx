import { Suspense, useState, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import CrystalCore from "./CrystalCore";
import ShardField from "./ShardField";
import Snow from "./Snow";
import Atmosphere from "./Atmosphere";
import PostFX from "./PostFX";
import { heroProgress, heroPointer, isCoarsePointer } from "./progress";

/**
 * The frozen world behind the hero. The section's scroll progress
 * (0 → 1, written by Hero's rAF) scrubs a Catmull-Rom camera dolly:
 * distant approach → starboard orbit → low heroic angle → macro on
 * the core. Pointer adds damped parallax sway.
 */

const POSITIONS: [number, number, number][] = [
  [0.0, 0.35, 11.5], // distant approach
  [4.4, 1.2, 7.2], // starboard drift
  [6.2, -0.8, 2.6], // low heroic side angle
  [1.6, 1.6, 3.6], // closing arc
  [0.0, 0.4, 2.4], // macro on the core
];

const TARGETS: [number, number, number][] = [
  [0, 0.5, 0],
  [0, 0.7, 0],
  [0, 0.2, 0],
  [0, 0.6, 0],
  [0, 0.5, 0],
];

const FOVS = [46, 44, 50, 40, 33];

function CameraRig() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const [posCurve] = useState(
    () =>
      new THREE.CatmullRomCurve3(
        POSITIONS.map((p) => new THREE.Vector3(...p)),
        false,
        "centripetal"
      )
  );
  const [targetCurve] = useState(
    () =>
      new THREE.CatmullRomCurve3(
        TARGETS.map((p) => new THREE.Vector3(...p)),
        false,
        "centripetal"
      )
  );
  const [smooth] = useState(() => ({ t: 0, px: 0, py: 0, fov: FOVS[0] }));
  const [pos] = useState(() => new THREE.Vector3());
  const [target] = useState(() => new THREE.Vector3());

  useFrame((state, delta) => {
    const d = Math.min(delta, 1 / 30);
    const mobile = isCoarsePointer();

    // mobile drives parallax from touch, with a gentler throw than the mouse
    const sway = mobile ? 0.6 : 1;
    smooth.t = THREE.MathUtils.damp(smooth.t, heroProgress.value, 3.2, d);
    smooth.px = THREE.MathUtils.damp(smooth.px, heroPointer.x * sway, 2.6, d);
    smooth.py = THREE.MathUtils.damp(smooth.py, heroPointer.y * sway, 2.6, d);

    posCurve.getPoint(smooth.t, pos);
    targetCurve.getPoint(smooth.t, target);

    const time = state.clock.elapsedTime;
    camera.position.set(
      pos.x + smooth.px * 0.55 + Math.sin(time * 0.22) * 0.07,
      pos.y - smooth.py * 0.4 + Math.cos(time * 0.17) * 0.05,
      pos.z
    );
    camera.lookAt(
      target.x + smooth.px * 0.35,
      target.y - smooth.py * 0.25,
      target.z
    );

    const seg = smooth.t * (FOVS.length - 1);
    const i = Math.min(Math.floor(seg), FOVS.length - 2);
    const targetFov = THREE.MathUtils.lerp(FOVS[i], FOVS[i + 1], seg - i);
    smooth.fov = THREE.MathUtils.damp(smooth.fov, targetFov, 3, d);
    if (Math.abs(camera.fov - smooth.fov) > 0.01) {
      camera.fov = smooth.fov;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}

export default function FrozenHeroScene({
  onReady,
  onError,
  active = true,
}: {
  onReady?: () => void;
  onError?: () => void;
  active?: boolean;
}) {
  const mobile = isCoarsePointer();
  // iOS Safari runs out of GPU memory fast; cap DPR hard on coarse pointers.
  const [dpr, setDpr] = useState<[number, number] | number>(
    mobile ? Math.min(window.devicePixelRatio || 1, 1.5) : [1, 1.8]
  );

  const handleCreated = useCallback(
    ({ gl, scene }: { gl: THREE.WebGLRenderer; scene: THREE.Scene }) => {
      gl.toneMapping = THREE.ACESFilmicToneMapping;
      gl.toneMappingExposure = 1.15;
      scene.fog = new THREE.FogExp2("#04060a", 0.026);
      scene.background = new THREE.Color("#04060a");

      // Surface context-loss as a graceful fallback instead of a black canvas.
      const canvas = gl.domElement;
      canvas.addEventListener(
        "webglcontextlost",
        (e) => {
          e.preventDefault();
          onError?.();
        },
        { passive: false }
      );

      onReady?.();
    },
    [onReady, onError]
  );

  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden>
      <Canvas
        frameloop={active ? "always" : "never"}
        gl={{
          antialias: false,
          powerPreference: mobile ? "default" : "high-performance",
          alpha: false,
          stencil: false,
          depth: true,
          failIfMajorPerformanceCaveat: false,
        }}
        dpr={dpr}
        camera={{ position: [0, 0.35, 11.5], fov: 46, near: 0.1, far: 80 }}
        onCreated={handleCreated}
      >
        <PerformanceMonitor
          onDecline={() => setDpr(mobile ? 1 : 1)}
          onIncline={() => setDpr(mobile ? Math.min(window.devicePixelRatio || 1, 1.5) : [1, 1.8])}
        />

        <Suspense fallback={null}>
          <CameraRig />
          <Atmosphere />
          <CrystalCore />
          <ShardField />
          <Snow />

          {/* procedural studio — what the ice reflects/refracts */}
          {!isCoarsePointer() && (
            <Environment resolution={256} frames={1}>
              {/* Soft sky-blue overhead key light */}
              <Lightformer form="rect" intensity={3.5} color="#9fe0ff" position={[0, 6, -8]} scale={[12, 6, 1]} />
              
              {/* Warm golden light to complete the dispersion colors and add depth */}
              <Lightformer form="circle" intensity={4.0} color="#ffd48f" position={[-2, -5, -4]} scale={2.5} />
              
              {/* Vibrant deep indigo-purple side light */}
              <Lightformer form="rect" intensity={2.0} color="#7a3df0" position={[-8, 1, 3]} rotation={[0, Math.PI / 2.4, 0]} scale={[8, 4, 1]} />
              
              {/* Bright turquoise fill light */}
              <Lightformer form="circle" intensity={2.5} color="#baffe9" position={[7, -3, 4]} scale={3.5} />
              
              {/* High-intensity narrow white strip (the scintillation engine) */}
              <Lightformer form="rect" intensity={8.0} color="#ffffff" position={[2, 4, 5]} rotation={[0, -Math.PI / 4, 0]} scale={[0.4, 12, 1]} />
              
              {/* Saturated cyan edge accent */}
              <Lightformer form="rect" intensity={3.0} color="#00ffff" position={[5, 2, -3]} rotation={[0, Math.PI / 3, 0]} scale={[4, 2, 1]} />
              
              {/* Absorption blocker beneath the crystal */}
              <Lightformer form="rect" intensity={0.8} color="#0c1320" position={[0, -7, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[16, 16, 1]} />
            </Environment>
          )}

          <PostFX />
        </Suspense>
      </Canvas>
    </div>
  );
}
