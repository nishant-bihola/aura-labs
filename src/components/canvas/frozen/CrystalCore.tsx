import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";
import { iceVertex, iceFragment } from "./shaders";
import { heroProgress, isCoarsePointer, prefersReducedMotion } from "./progress";

/**
 * The Aura Core: a faceted brilliant-cut diamond.
 * Geometry is hand-built — a flat octagonal table, a two-tier crown of
 * star + bezel facets, and a deep pavilion of facets tapering to the culet.
 * De-indexed with flat normals so every facet catches light hard, which is
 * what gives a real gem its sparkle and fire.
 * Desktop renders true refraction (transmission); mobile / reduced-motion
 * fall back to the cheap fresnel-ice shader.
 */
function buildDiamond(sides: number) {
  const rTable = 0.58; // flat top radius
  const yTable = 0.62; // crown height (shallow, like a real cut)
  const rStar = 0.82; // mid crown ring (creates the star facets)
  const yStar = 0.34;
  const rGirdle = 1.0; // widest ring
  const yGirdleHigh = 0.1;
  const yGirdleLow = 0.02; // alternating ring → scalloped sparkle
  const yCulet = -1.18; // deep pointed pavilion

  const top = new THREE.Vector3(0, yTable, 0);
  const culet = new THREE.Vector3(0, yCulet, 0);

  const ring = (n: number, r: number, y: number, offset = 0) => {
    const out: THREE.Vector3[] = [];
    for (let i = 0; i < n; i++) {
      const a = ((i + offset) / n) * Math.PI * 2;
      out.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r));
    }
    return out;
  };

  const table = ring(sides, rTable, yTable);
  const star = ring(sides, rStar, yStar, 0.5); // rotated half-step
  // 2 girdle points per side → zig-zag brilliant girdle
  const girdle: THREE.Vector3[] = [];
  for (let j = 0; j < sides * 2; j++) {
    const a = (j / (sides * 2)) * Math.PI * 2;
    const y = j % 2 === 0 ? yGirdleHigh : yGirdleLow;
    girdle.push(new THREE.Vector3(Math.cos(a) * rGirdle, y, Math.sin(a) * rGirdle));
  }

  const verts: number[] = [];
  const tri = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3) => {
    verts.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
  };

  for (let i = 0; i < sides; i++) {
    const ni = (i + 1) % sides;
    const g0 = girdle[i * 2];
    const g1 = girdle[i * 2 + 1];
    const g2 = girdle[(i * 2 + 2) % (sides * 2)];

    // table fan
    tri(top, table[i], table[ni]);
    // crown — star facets (table edge down to the star ring)
    tri(table[i], star[i], table[ni]);
    // crown — bezel/kite facets (star ring down to the girdle zig-zag)
    tri(table[i], g0, star[i]);
    tri(star[i], g0, g1);
    tri(star[i], g1, table[ni]);
    tri(table[ni], g1, g2);
    // pavilion — facets converging on the culet
    tri(g0, culet, g1);
    tri(g1, culet, g2);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  geo.computeVertexNormals();
  return geo;
}

export default function CrystalCore() {
  const group = useRef<THREE.Group>(null);
  const mat = useRef<THREE.ShaderMaterial>(null);

  const mobile = isCoarsePointer();

  const diamond = useMemo(() => buildDiamond(8), []);

  const iceUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColorDeep: { value: new THREE.Color("#0a1826") },
      uColorIce: { value: new THREE.Color("#bfeaff") },
      uColorRim: { value: new THREE.Color("#eaffff") },
    }),
    []
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const p = heroProgress.value;

    if (group.current) {
      // steady turn so every facet sweeps the light, with a gentle tilt
      group.current.rotation.y = t * 0.32 + p * Math.PI * 1.1;
      group.current.rotation.z = Math.sin(t * 0.3) * 0.04;
      group.current.rotation.x = -0.12 + Math.sin(t * 0.23) * 0.03;
      group.current.position.y = Math.sin(t * 0.4) * 0.06;
    }
    if (mat.current) mat.current.uniforms.uTime.value = t;
  });

  const transmission = !mobile && !prefersReducedMotion();

  return (
    <group ref={group} scale={1.15}>
      <mesh geometry={diamond}>
        {transmission ? (
          <MeshTransmissionMaterial
            samples={6}
            resolution={256}
            thickness={0.9}
            ior={2.42}
            chromaticAberration={1.1}
            anisotropicBlur={0.06}
            roughness={0}
            clearcoat={1}
            clearcoatRoughness={0}
            distortion={0.05}
            distortionScale={0.2}
            temporalDistortion={0.02}
            attenuationDistance={3}
            attenuationColor="#dff2ff"
            color="#ffffff"
            envMapIntensity={2.2}
            iridescence={0.6}
            iridescenceIOR={1.5}
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
    </group>
  );
}
