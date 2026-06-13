import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";
import { mergeBufferGeometries } from "three-stdlib";
import { createNoise3D } from "./noise";
import { iceVertex, iceFragment } from "./shaders";
import { heroProgress, isCoarsePointer, prefersReducedMotion } from "./progress";

/**
 * The Aura Crown: a procedurally carved ice crown — a faceted base band,
 * a rim, and a circle of alternating tall/short spikes, all displaced by
 * seeded 3D noise and de-indexed for hard flat-shaded facets.
 * Desktop renders real refraction (transmission); mobile falls back to a
 * custom fresnel-ice shader. The orbiting fragments + inner glow remain.
 */
function buildMonolith(seed: number, detail: number) {
  const noise = createNoise3D(seed);
  const geo = new THREE.IcosahedronGeometry(1, detail);
  const p = geo.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();

  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const n =
      noise(v.x * 1.1, v.y * 1.1, v.z * 1.1) * 0.32 +
      noise(v.x * 3.5, v.y * 3.5, v.z * 3.5) * 0.1;
    v.normalize().multiplyScalar(1 + n);
    p.setXYZ(i, v.x, v.y * 1.9, v.z); // vertical stretch → shard
  }

  const flat = geo.toNonIndexed();
  flat.computeVertexNormals();
  geo.dispose();
  return flat;
}

/** A regal ice crown: flared band + rim + radial spikes, carved by noise. */
function buildCrown(seed: number, segments: number) {
  const noise = createNoise3D(seed);
  const points = 10; // crown points (alternating tall/short)
  const ringRadius = 0.95;
  const parts: THREE.BufferGeometry[] = [];

  // Flared base band (open-ended faceted cylinder).
  const band = new THREE.CylinderGeometry(
    ringRadius * 1.08,
    ringRadius * 0.94,
    0.62,
    segments,
    2,
    true
  );
  band.translate(0, -0.72, 0);
  parts.push(band);

  // Rim that caps the band where the spikes spring from.
  const rim = new THREE.TorusGeometry(ringRadius * 1.04, 0.075, 8, segments);
  rim.rotateX(Math.PI / 2);
  rim.translate(0, -0.42, 0);
  parts.push(rim);

  // Radial spikes — alternating heights, faceted cones.
  for (let i = 0; i < points; i++) {
    const a = (i / points) * Math.PI * 2;
    const tall = i % 2 === 0 ? 1.7 : 1.05;
    const rad = i % 2 === 0 ? 0.17 : 0.13;
    const spike = new THREE.ConeGeometry(rad, tall, 5, 1);
    spike.translate(0, tall / 2 - 0.42, 0);
    spike.translate(Math.cos(a) * ringRadius, 0, Math.sin(a) * ringRadius);
    parts.push(spike);
  }

  const merged = mergeBufferGeometries(parts, false) as THREE.BufferGeometry;
  parts.forEach((g) => g.dispose());

  // Carve icy irregularity along the surface normals.
  const p = merged.attributes.position as THREE.BufferAttribute;
  const norm = merged.attributes.normal as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  const nrm = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    nrm.fromBufferAttribute(norm, i);
    const n =
      noise(v.x * 1.7, v.y * 1.7, v.z * 1.7) * 0.05 +
      noise(v.x * 5.2, v.y * 5.2, v.z * 5.2) * 0.018;
    v.addScaledVector(nrm, n);
    p.setXYZ(i, v.x, v.y, v.z);
  }

  const flat = merged.toNonIndexed();
  flat.computeVertexNormals();
  merged.dispose();
  return flat;
}

export default function CrystalCore() {
  const group = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.ShaderMaterial>(null);

  const mobile = isCoarsePointer();

  const crown = useMemo(() => buildCrown(7, mobile ? 20 : 36), [mobile]);
  const fragments = useMemo(
    () => [
      { geo: buildMonolith(13, 7), pos: [1.9, -0.7, 0.4] as const, s: 0.34, spin: 0.21 },
      { geo: buildMonolith(29, 7), pos: [-1.75, 0.9, -0.5] as const, s: 0.27, spin: -0.16 },
      { geo: buildMonolith(41, 7), pos: [0.7, 1.9, 0.9] as const, s: 0.2, spin: 0.27 },
      { geo: buildMonolith(53, 7), pos: [-0.9, -1.8, 0.8] as const, s: 0.24, spin: -0.23 },
    ],
    []
  );

  const iceUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColorDeep: { value: new THREE.Color("#081420") },
      uColorIce: { value: new THREE.Color("#8fd9ff") },
      uColorRim: { value: new THREE.Color("#c9f4ff") },
    }),
    []
  );

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const p = heroProgress.value;

    if (group.current) {
      // slow majestic spin + scroll-driven reveal, with a gentle floating tilt
      group.current.rotation.y = t * 0.05 + p * Math.PI * 1.1;
      group.current.rotation.z = Math.sin(t * 0.3) * 0.035;
      group.current.rotation.x = Math.sin(t * 0.23) * 0.025;
      group.current.position.y = Math.sin(t * 0.4) * 0.08;
    }
    if (inner.current) {
      // the light enthroned within the crown — heartbeat that pulses harder
      // near the macro shot (p ≈ 0.8), driving the bloom pass
      const macro = 1 - Math.min(Math.abs(p - 0.8) * 5, 1);
      const beat = Math.sin(t * 2.1);
      const flicker = Math.sin(t * 7.3) * 0.04;
      const pulse = 1 + beat * 0.14 + flicker + macro * 0.55;
      inner.current.scale.setScalar(0.4 * pulse);
      inner.current.position.y = -0.15 + Math.sin(t * 0.8) * 0.05;
      const m = inner.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.7 + beat * 0.18 + macro * 0.3;
    }
    if (mat.current) mat.current.uniforms.uTime.value = t;

    fragments.forEach((f, i) => {
      const mesh = group.current?.children[i + 2] as THREE.Mesh | undefined;
      if (!mesh) return;
      mesh.rotation.y += delta * f.spin;
      mesh.rotation.x += delta * f.spin * 0.6;
      const angle = t * 0.1 * (i % 2 ? 1 : -1) + i * 1.7;
      mesh.position.x = f.pos[0] * Math.cos(angle * 0.3);
      mesh.position.z = f.pos[2] + Math.sin(angle * 0.3) * 0.8;
      mesh.position.y = f.pos[1] + Math.sin(t * 0.5 + i * 2) * 0.15;
    });
  });

  const transmission = !mobile && !prefersReducedMotion();

  return (
    <group ref={group}>
      {/* the ice crown */}
      <mesh geometry={crown}>
        {transmission ? (
          <MeshTransmissionMaterial
            samples={6}
            resolution={384}
            thickness={1.6}
            ior={1.31}
            chromaticAberration={0.5}
            anisotropicBlur={0.25}
            roughness={0.08}
            distortion={0.25}
            distortionScale={0.4}
            temporalDistortion={0.06}
            attenuationDistance={1.8}
            attenuationColor="#7fc8ff"
            color="#c9eaff"
            envMapIntensity={1.2}
            iridescence={0.85}
            iridescenceIOR={1.3}
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

      {/* orbiting fracture fragments */}
      {fragments.map((f, i) => (
        <mesh key={i} geometry={f.geo} position={[...f.pos]} scale={f.s}>
          <meshStandardMaterial
            color="#0a1726"
            emissive="#2f6da8"
            emissiveIntensity={0.22}
            roughness={0.18}
            metalness={0.15}
            flatShading
            transparent
            opacity={0.85}
          />
        </mesh>
      ))}
    </group>
  );
}
