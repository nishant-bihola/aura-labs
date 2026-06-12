import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

export function DigitalCore() {
  const coreRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.2;
      coreRef.current.rotation.z = t * 0.1;
    }
    if (ringRef.current) {
      ringRef.current.rotation.x = t * 0.3;
      ringRef.current.rotation.y = t * 0.4;
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={1} color="#00f0ff" />
      <directionalLight position={[-10, -10, -10]} intensity={2} color="#bd00ff" />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      <Float speed={2} rotationIntensity={1} floatIntensity={2}>
        <Sphere ref={coreRef} args={[1.5, 64, 64]} scale={1.2}>
          <MeshDistortMaterial
            color="#050505"
            envMapIntensity={1}
            clearcoat={1}
            clearcoatRoughness={0.1}
            metalness={0.9}
            roughness={0.1}
            distort={0.4}
            speed={2}
            emissive="#00f0ff"
            emissiveIntensity={0.2}
          />
        </Sphere>

        <mesh ref={ringRef}>
          <torusGeometry args={[2.5, 0.02, 16, 100]} />
          <meshPhysicalMaterial 
            color="#bd00ff" 
            emissive="#bd00ff" 
            emissiveIntensity={2} 
            transparent 
            opacity={0.8} 
          />
        </mesh>
        
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[3.5, 0.01, 16, 100]} />
          <meshPhysicalMaterial 
            color="#00f0ff" 
            emissive="#00f0ff" 
            emissiveIntensity={1} 
            transparent 
            opacity={0.4} 
          />
        </mesh>
      </Float>
    </>
  );
}
