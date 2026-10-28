import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

const CarModel = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    // Gentle vibration for "charging" or idling
    groupRef.current.position.y = Math.sin(t * 2) * 0.02;
  });

  return (
    <group ref={groupRef}>
      {/* 1. Main Body */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[4, 0.8, 1.8]} />
        <meshPhysicalMaterial color="#0f172a" roughness={0.1} metalness={0.8} />
      </mesh>

      {/* 2. Cabin/Roof */}
      <mesh position={[-0.2, 1.1, 0]} castShadow>
        <boxGeometry args={[2, 0.6, 1.6]} />
        <meshPhysicalMaterial 
          color="#1e293b" 
          roughness={0} 
          metalness={0.9} 
          transmission={0.5} 
          thickness={1}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* 3-6. Wheels */}
      {[
        [1.2, 0.3, 0.8],
        [1.2, 0.3, -0.8],
        [-1.2, 0.3, 0.8],
        [-1.2, 0.3, -0.8]
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.35, 0.35, 0.3, 24]} />
          <meshPhysicalMaterial color="#111111" roughness={0.9} />
        </mesh>
      ))}

      {/* 7-8. Headlights */}
      <mesh position={[1.95, 0.6, 0.5]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
        <pointLight color="#ffffff" intensity={1} distance={5} />
      </mesh>
      <mesh position={[1.95, 0.6, -0.5]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
        <pointLight color="#ffffff" intensity={1} distance={5} />
      </mesh>

      {/* 9. Charging Port Glow */}
      <mesh position={[-1.8, 0.6, 0.7]}>
        <boxGeometry args={[0.1, 0.3, 0.3]} />
        <meshBasicMaterial color="#10b981" />
        <pointLight color="#10b981" intensity={2} distance={3} />
      </mesh>
    </group>
  );
};

const ChargingPylon = () => {
  return (
    <group position={[0, 0, -2.5]}>
      {/* 1. Base */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <boxGeometry args={[1, 0.2, 1]} />
        <meshPhysicalMaterial color="#334155" roughness={0.8} />
      </mesh>

      {/* 2. Main Column */}
      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[0.6, 2, 0.6]} />
        <meshPhysicalMaterial color="#1e293b" roughness={0.2} metalness={0.7} />
      </mesh>

      {/* 3. Screen Panel */}
      <mesh position={[0, 1.4, 0.31]}>
        <boxGeometry args={[0.4, 0.6, 0.05]} />
        <meshBasicMaterial color="#10b981" />
      </mesh>

      {/* 4. "Cable" (Procedural connection) */}
      <mesh position={[-0.5, 0.8, 1.2]} rotation={[0.4, 0, 0.5]}>
        <cylinderGeometry args={[0.05, 0.05, 3, 8]} />
        <meshPhysicalMaterial color="#000000" roughness={1} />
      </mesh>
    </group>
  );
};

export const ChargingScene = () => {
  return (
    <>
      <PerspectiveCamera makeDefault position={[6, 4, 8]} fov={35} />
      <Environment preset="night" />
      
      <ambientLight intensity={0.2} />
      <spotLight 
        position={[10, 10, 10]} 
        angle={0.15} 
        penumbra={1} 
        intensity={1} 
        castShadow 
      />
      <hemisphereLight args={['#0a192f', '#10b981', 0.4]} />

      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        <group position={[0, 0, 0]}>
          <CarModel />
          <ChargingPylon />
        </group>
      </Float>

      <ContactShadows 
        position={[0, -0.01, 0]} 
        opacity={0.6} 
        scale={15} 
        blur={2} 
        far={4.5} 
      />
      
      {/* Road Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshPhysicalMaterial color="#0a0f1e" roughness={0.9} />
      </mesh>
    </>
  );
};
