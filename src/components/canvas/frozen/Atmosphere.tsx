import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  auroraVertex,
  auroraFragment,
  frostVertex,
  frostFragment,
} from "./shaders";

/**
 * Environmental dressing: a vast aurora veil far upstage, a frost-mist
 * disc beneath the monolith, and the light rig — tuned to the Aura
 * Labs brand (cyan key, violet rim).
 */
export default function Atmosphere() {
  const auroraMat = useRef<THREE.ShaderMaterial>(null);
  const frostMat = useRef<THREE.ShaderMaterial>(null);

  const auroraUniforms = useMemo(
    () => ({ uTime: { value: 0 }, uIntensity: { value: 0.85 } }),
    []
  );
  const frostUniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (auroraMat.current) auroraMat.current.uniforms.uTime.value = t;
    if (frostMat.current) frostMat.current.uniforms.uTime.value = t;
  });

  return (
    <group>
      {/* aurora veil, far behind everything */}
      <mesh position={[0, 4, -26]}>
        <planeGeometry args={[70, 26]} />
        <shaderMaterial
          ref={auroraMat}
          vertexShader={auroraVertex}
          fragmentShader={auroraFragment}
          uniforms={auroraUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* frost mist under the core */}
      <mesh position={[0, -3.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[26, 26]} />
        <shaderMaterial
          ref={frostMat}
          vertexShader={frostVertex}
          fragmentShader={frostFragment}
          uniforms={frostUniforms}
          transparent
          depthWrite={false}
        />
      </mesh>

      {/* light rig — brand cyan key / violet rim */}
      <ambientLight intensity={0.12} color="#16344c" />
      <directionalLight position={[6, 8, 4]} intensity={1.5} color="#9fe8ff" />
      <directionalLight position={[-7, 2, -4]} intensity={0.95} color="#8b3df5" />
      <pointLight position={[0, 0.5, 0]} intensity={2.2} color="#7fe3ff" distance={9} decay={2} />
      <pointLight position={[0, -4, 6]} intensity={0.55} color="#bd00ff" distance={14} decay={2} />
    </group>
  );
}
