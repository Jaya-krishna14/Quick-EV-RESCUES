import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  Float, 
  PerspectiveCamera, 
  Environment, 
  ContactShadows, 
  PresentationControls,
  OrbitControls
} from '@react-three/drei';
import * as THREE from 'three';

// --- Detection Utility ---
const isSoftwareGl = (() => {
  if (typeof window === 'undefined') return false;
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  if (!gl) return true;
  const ext = (gl as WebGL2RenderingContext).getExtension('WEBGL_debug_renderer_info');
  const param = ext ? ext.UNMASKED_RENDERER_WEBGL : (gl as WebGL2RenderingContext).RENDERER;
  const gpu = String((gl as WebGL2RenderingContext).getParameter(param));
  return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
})();

// --- Sub-components ---

const EVScooter = () => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Custom animation loop for extra mouse interaction
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const { mouse } = state;
    // Gentle rotation based on mouse
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, mouse.x * 0.5, 0.1);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -mouse.y * 0.2, 0.1);
  });

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        {/* 1. Platform (Base) */}
        <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.5, 0.2, 0.8]} />
          <meshPhysicalMaterial color="#334155" roughness={0.7} metalness={0.3} />
        </mesh>

        {/* 2. Stem (Vertical Column) */}
        <mesh position={[1.1, 1.25, 0]} rotation={[0, 0, -Math.PI * 0.05]} castShadow>
          <cylinderGeometry args={[0.08, 0.1, 2.5, 12]} />
          <meshPhysicalMaterial color="#1e293b" roughness={0.2} metalness={0.8} clearcoat={1.0} />
        </mesh>

        {/* 3. Handlebars */}
        <mesh position={[1.2, 2.45, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 1.2, 12]} />
          <meshPhysicalMaterial color="#000000" roughness={0.9} />
        </mesh>

        {/* 4 & 5. Wheels */}
        <mesh position={[1.25, 0.35, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.35, 0.35, 0.25, 24]} />
          <meshPhysicalMaterial color="#111111" roughness={0.95} />
        </mesh>
        <mesh position={[-1.1, 0.35, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.35, 0.35, 0.25, 24]} />
          <meshPhysicalMaterial color="#111111" roughness={0.95} />
        </mesh>

        {/* 6. Battery Pack */}
        <mesh position={[0, 0.35, 0]} castShadow>
          <boxGeometry args={[1.2, 0.3, 0.7]} />
          <meshPhysicalMaterial color="#10b981" roughness={0.4} metalness={0.5} />
        </mesh>

        {/* 7. Headlight */}
        <mesh position={[1.25, 2.3, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshBasicMaterial color="#ffffff" />
          <pointLight color="#ffffff" intensity={2} distance={5} />
        </mesh>
      </Float>
    </group>
  );
};

const FloatingBolts = () => {
  const bolts = useMemo(() => {
    return Array.from({ length: 5 }).map(() => ({
      position: [
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 5
      ] as [number, number, number],
      speed: 0.5 + Math.random(),
      offset: Math.random() * Math.PI * 2
    }));
  }, []);

  return (
    <>
      {bolts.map((bolt, i) => (
        <Float key={i} speed={bolt.speed} rotationIntensity={2} floatIntensity={1} position={bolt.position}>
          <mesh>
            <octahedronGeometry args={[0.2, 0]} />
            <meshPhysicalMaterial 
              color="#10b981" 
              emissive="#10b981" 
              emissiveIntensity={0.5} 
              transparent 
              opacity={0.6} 
            />
          </mesh>
        </Float>
      ))}
    </>
  );
};

const CameraRig = () => {
  const { camera, mouse } = useThree();
  useFrame(() => {
    // Subtle parallax
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, 5 + mouse.x * 0.5, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 3 + mouse.y * 0.5, 0.05);
    camera.lookAt(0, 0, 0);
  });
  return null;
};

interface Scene3DProps {
  className?: string;
}

export const Scene3D: React.FC<Scene3DProps> = ({ className }) => {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        shadows={!isSoftwareGl}
        dpr={isSoftwareGl ? 1 : [1, 2]}
        camera={{ position: [5, 3, 8], fov: 45 }}
        gl={{ 
          antialias: !isSoftwareGl,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2
        }}
      >
        <color attach="background" args={['transparent' as any]} />
        
        {/* Lights */}
        <ambientLight intensity={0.4} />
        <spotLight 
          position={[10, 10, 10]} 
          angle={0.15} 
          penumbra={1} 
          intensity={1} 
          castShadow={!isSoftwareGl} 
        />
        <hemisphereLight args={['#0a192f', '#10b981', 0.6]} />

        {/* Environment for nice reflections */}
        <Environment preset="city" />

        {/* The EV Model */}
        <PresentationControls
          global
          rotation={[0, 0.3, 0]}
          polar={[-Math.PI / 4, Math.PI / 4]}
          azimuth={[-Math.PI / 4, Math.PI / 4]}
        >
          <EVScooter />
        </PresentationControls>

        {/* Decorative Elements */}
        <FloatingBolts />

        {/* Shadows & Ground */}
        <ContactShadows 
          position={[0, -0.05, 0]} 
          opacity={0.4} 
          scale={10} 
          blur={2} 
          far={4.5} 
        />

        {/* Interactive Controls & Rig */}
        {!isSoftwareGl && <CameraRig />}
        {isSoftwareGl && <OrbitControls enableZoom={false} />}
      </Canvas>
    </div>
  );
};

export default Scene3D;
