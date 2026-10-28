import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

const RescueVan = () => {
  return (
    <group position={[2.5, 0, -1]}>
      {/* 1. Chassis */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[4.5, 0.8, 2]} />
        <meshPhysicalMaterial color="#1e293b" roughness={0.1} metalness={0.8} />
      </mesh>

      {/* 2. Cabin */}
      <mesh position={[1.2, 1.2, 0]} castShadow>
        <boxGeometry args={[1.5, 1, 1.8]} />
        <meshPhysicalMaterial color="#334155" roughness={0.2} metalness={0.5} />
      </mesh>

      {/* 3. Cargo Box */}
      <mesh position={[-0.8, 1.3, 0]} castShadow>
        <boxGeometry args={[2.5, 1.4, 2]} />
        <meshPhysicalMaterial color="#10b981" roughness={0.5} metalness={0.2} />
      </mesh>

      {/* 4-7. Wheels */}
      {[
        [1.5, 0.35, 1],
        [1.5, 0.35, -1],
        [-1.5, 0.35, 1],
        [-1.5, 0.35, -1]
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.4, 0.4, 0.4, 24]} />
          <meshPhysicalMaterial color="#111111" roughness={0.9} />
        </mesh>
      ))}

      {/* 8-9. Emergency Lights */}
      <mesh position={[1.2, 1.75, 0.4]}>
        <boxGeometry args={[0.4, 0.1, 0.3]} />
        <meshBasicMaterial color="#ef4444" />
        <pointLight color="#ef4444" intensity={2} distance={5} />
      </mesh>
      <mesh position={[1.2, 1.75, -0.4]}>
        <boxGeometry args={[0.4, 0.1, 0.3]} />
        <meshBasicMaterial color="#3b82f6" />
        <pointLight color="#3b82f6" intensity={2} distance={5} />
      </mesh>
    </group>
  );
};

const BrokenCar = () => {
  const hoodRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!hoodRef.current) return;
    const t = state.clock.getElapsedTime();
    // Animating the hood opening/closing slightly like it's being inspected
    hoodRef.current.rotation.z = -Math.PI * 0.15 + Math.sin(t * 1.5) * 0.05;
  });

  return (
    <group position={[-2, 0, 1]}>
      {/* 1. Main Body */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[3.5, 0.7, 1.7]} />
        <meshPhysicalMaterial color="#475569" roughness={0.3} metalness={0.6} />
      </mesh>

      {/* 2. Cabin */}
      <mesh position={[-0.2, 0.9, 0]} castShadow>
        <boxGeometry args={[1.8, 0.5, 1.5]} />
        <meshPhysicalMaterial color="#1e293b" roughness={0} metalness={0.9} transparent opacity={0.7} />
      </mesh>

      {/* 3. Hood (Animated) */}
      <mesh ref={hoodRef} position={[1, 0.75, 0]} rotation={[0, 0, -Math.PI * 0.15]}>
        <boxGeometry args={[1.2, 0.05, 1.6]} />
        <meshPhysicalMaterial color="#475569" roughness={0.3} metalness={0.6} />
      </mesh>

      {/* 4-7. Wheels */}
      {[
        [1, 0.3, 0.8],
        [1, 0.3, -0.8],
        [-1, 0.3, 0.8],
        [-1, 0.3, -0.8]
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.25, 24]} />
          <meshPhysicalMaterial color="#111111" roughness={0.9} />
        </mesh>
      ))}

      {/* 8. Smoke Particle Placeholder (Glow) */}
      <mesh position={[1.2, 0.8, 0]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshBasicMaterial color="#94a3b8" transparent opacity={0.4} />
      </mesh>
    </group>
  );
};

export const MechanicScene = () => {
  return (
    <>
      <PerspectiveCamera makeDefault position={[8, 5, 10]} fov={35} />
      <Environment preset="city" />
      
      <ambientLight intensity={0.3} />
      <directionalLight 
        position={[5, 10, 5]} 
        intensity={1.2} 
        castShadow 
        shadow-mapSize={[1024, 1024]}
      />
      <hemisphereLight args={['#1e293b', '#3b82f6', 0.5]} />

      <group>
        <RescueVan />
        <BrokenCar />
      </group>

      <ContactShadows 
        position={[0, -0.01, 0]} 
        opacity={0.5} 
        scale={20} 
        blur={2.5} 
        far={5} 
      />
      
      {/* Asphalt Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshPhysicalMaterial color="#1e293b" roughness={0.8} />
      </mesh>
    </>
  );
};
