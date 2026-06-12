import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { heroProgress, isCoarsePointer } from "./progress";

/**
 * A drifting belt of faceted ice debris around the core — instanced
 * octahedra, individually tumbling, with a faint cool emissive so the
 * bloom pass catches their edges as the camera threads through.
 */
export default function ShardField() {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const count = isCoarsePointer() ? 70 : 200;

  const shards = useMemo(() => {
    const rng = (() => {
      let s = 1337;
      return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
    })();

    return Array.from({ length: count }, () => {
      const radius = 3.2 + rng() * 9;
      const theta = rng() * Math.PI * 2;
      return {
        radius,
        theta,
        y: (rng() - 0.5) * 9,
        scale: 0.03 + rng() * 0.12,
        stretch: 1.4 + rng() * 2.2,
        speed: 0.02 + rng() * 0.05,
        tumble: (rng() - 0.5) * 0.8,
        phase: rng() * Math.PI * 2,
      };
    });
  }, [count]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime;
    const p = heroProgress.value;

    for (let i = 0; i < shards.length; i++) {
      const s = shards[i];
      const angle = s.theta + t * s.speed + p * 0.6;
      dummy.position.set(
        Math.cos(angle) * s.radius,
        s.y + Math.sin(t * 0.3 + s.phase) * 0.4,
        Math.sin(angle) * s.radius
      );
      dummy.rotation.set(t * s.tumble + s.phase, t * s.tumble * 0.7, s.phase);
      dummy.scale.set(s.scale, s.scale * s.stretch, s.scale);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color="#0a1828"
        emissive="#3a78b5"
        emissiveIntensity={0.22}
        roughness={0.2}
        metalness={0.2}
        flatShading
        transparent
        opacity={0.8}
      />
    </instancedMesh>
  );
}
