import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

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

interface Roadside3DContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const Roadside3DContainer: React.FC<Roadside3DContainerProps> = ({ children, className }) => {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        shadows={!isSoftwareGl}
        dpr={isSoftwareGl ? 1 : [1, 2]}
        gl={{ 
          antialias: !isSoftwareGl,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2
        }}
      >
        <color attach="background" args={['transparent' as any]} />
        {children}
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2.5}
        />
      </Canvas>
    </div>
  );
};
