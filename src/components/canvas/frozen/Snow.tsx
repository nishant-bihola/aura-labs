import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { snowVertex, snowFragment } from "./shaders";
import { isCoarsePointer } from "./progress";

/** GPU snowfall — all motion lives in the vertex shader. */
export default function Snow() {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const count = isCoarsePointer() ? 400 : 1200;

  const { positions, scales, speeds, offsets } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const speeds = new Float32Array(count);
    const offsets = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 24;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
      scales[i] = 0.6 + Math.random() * 1.8;
      speeds[i] = 0.4 + Math.random() * 1.1;
      offsets[i] = Math.random();
    }
    return { positions, scales, speeds, offsets };
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uColor: { value: new THREE.Color("#cfeeff") },
    }),
    []
  );

  useFrame((state) => {
    if (!mat.current) return;
    mat.current.uniforms.uTime.value = state.clock.elapsedTime;
    mat.current.uniforms.uPixelRatio.value = state.gl.getPixelRatio();
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aScale" args={[scales, 1]} />
        <bufferAttribute attach="attributes-aSpeed" args={[speeds, 1]} />
        <bufferAttribute attach="attributes-aOffset" args={[offsets, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={mat}
        vertexShader={snowVertex}
        fragmentShader={snowFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
