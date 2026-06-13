import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";
import { iceVertex, iceFragment } from "./shaders";
import { heroProgress, isCoarsePointer, prefersReducedMotion } from "./progress";

/**
 * The Aura Core: a faceted brilliant-cut diamond.
 * Geometry is built by hand — a flat octagonal table, a zig-zag crown of
 * star/bezel facets, and a pavilion of triangles tapering to the culet.
 * De-indexed + flat normals so every facet catches light hard.
 * Desktop renders real refraction (transmission); mobile/reduced-motion
 * fall back to the cheap fresnel-ice shader.
 */
function buildDiamond(sides: number) {
  const yTop = 0.46; // table height
  const rTable = 0.6; // table (flat top) radius
  const rGirdle = 1.0; // widest ring
  const yGirdleHigh = 0.16;
  const yGirdleLow = 0.06; // alternating ring → scalloped sparkle
  const yCulet = -1.05; // bottom point
  const yScale = 1.18; // gentle vertical elongation

  const top = new THREE.Vector3(0, yTop * yScale, 0);
  const culet = new THREE.Vector3(0, yCulet * yScale, 0);

  const table: THREE.Vector3[] = [];
  for (let i = 0; i < sides; i++) {
    const a = (i / sides) * Math.PI * 2;
    table.push(new THREE.Vector3(Math.cos(a) * rTable, yTop * yScale, Math.sin(a) * rTable));
  }

  // 2 girdle points per table edge → zig-zag brilliant facets
  const girdle: THREE.Vector3[] = [];
  for (let j = 0; j < sides * 2; j++) {
    const a = (j / (sides * 2)) * Math.PI * 2;
    const y = (j % 2 === 0 ? yGirdleHigh : yGirdleLow) * yScale;
    girdle.push(new THREE.Vector3(Math.cos(a) * rGirdle, y, Math.sin(a) * rGirdle));
  }

  const verts: number[] = [];
  const push = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3) => {
    verts.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
  };

  for (let i = 0; i < sides; i++) {
    const ni = (i + 1) % sides;
    const g0 = girdle[i * 2];
    const g1 = girdle[i * 2 + 1];
    const g2 = girdle[(i * 2 + 2) % (sides * 2)];

    // table top fan
    push(top, table[i], table[ni]);
    // crown — star + bezel facets
    push(table[i], g0, g1);
    push(table[i], g1, table[ni]);
    push(table[ni], g1, g2);
    // pavilion — facets to the culet
    push(g0, culet, g1);
    push(g1, culet, g2);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  geo.computeVertexNormals();
  return geo;
}

export default function CrystalCore() {
  const group = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.ShaderMaterial>(null);

  const mobile = isCoarsePointer();

  const diamond = useMemo(() => buildDiamond(8), []);

  const iceUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColorDeep: { value: new THREE.Color("#081420") },
      uColorIce: { value: new THREE.Color("#8fd9ff") },
      uColorRim: { value: new THREE.Color("#c9f4ff") },
    }),
    []
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const p = heroProgress.value;

    if (group.current) {
      // steady turn so every facet sweeps the light
      group.current.rotation.y = t * 0.28 + p * Math.PI * 1.1;
      group.current.rotation.z = Math.sin(t * 0.3) * 0.03;
      group.current.position.y = Math.sin(t * 0.4) * 0.06;
    }
    if (inner.current) {
      // the light enthroned within — heartbeat that pulses harder near the
      // macro shot (p ≈ 0.8), driving the bloom pass
      const macro = 1 - Math.min(Math.abs(p - 0.8) * 5, 1);
      const beat = Math.sin(t * 2.1);
      const flicker = Math.sin(t * 7.3) * 0.04;
      const pulse = 1 + beat * 0.12 + flicker + macro * 0.5;
      inner.current.scale.setScalar(0.3 * pulse);
      inner.current.position.y = -0.1 + Math.sin(t * 0.8) * 0.05;
      const m = inner.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.7 + beat * 0.15 + macro * 0.25;
    }
    if (mat.current) mat.current.uniforms.uTime.value = t;
  });

  const transmission = !mobile && !prefersReducedMotion();

  return (
    <group ref={group}>
      {/* the diamond */}
      <mesh geometry={diamond}>
        {transmission ? (
          <MeshTransmissionMaterial
            samples={4}
            resolution={256}
            thickness={1.1}
            ior={2.4}
            chromaticAberration={0.9}
            anisotropicBlur={0.1}
            roughness={0.0}
            distortion={0.1}
            distortionScale={0.3}
            temporalDistortion={0.02}
            attenuationDistance={2.4}
            attenuationColor="#bfe6ff"
            color="#eaf6ff"
            envMapIntensity={1.6}
            iridescence={0.7}
            iridescenceIOR={1.4}
          />
        ) : (
          <shaderMaterial
            ref={mat}
            vertexShader={iceVertex}
            fragmentShader={iceFragment}
            uniforms={iceUniforms}
            transparent
          />
        )}
      </mesh>

      {/* the burning intelligence inside — feeds the bloom pass */}
      <mesh ref={inner}>
        <icosahedronGeometry args={[1, 2]} />
        <meshBasicMaterial color="#aef2ff" transparent toneMapped={false} />
      </mesh>
    </group>
  );
}
