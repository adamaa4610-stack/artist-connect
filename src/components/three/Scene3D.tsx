'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import CanvasLoader from './CanvasLoader';

interface Scene3DProps {
  children: React.ReactNode;
  className?: string;
  cameraPosition?: [number, number, number];
}

export default function Scene3D({
  children,
  className = 'h-[500px] w-full',
  cameraPosition = [0, 0, 5],
}: Scene3DProps) {
  return (
    <div className={className}>
      <Canvas
        shadows
        camera={{ position: cameraPosition, fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <Suspense fallback={<CanvasLoader />}>
          {children}
        </Suspense>
      </Canvas>
    </div>
  );
}
