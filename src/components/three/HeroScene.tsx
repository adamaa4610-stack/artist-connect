'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function FloatingShape({ position, shape, color, speed = 1, scale = 1 }: {
  position: [number, number, number];
  shape: 'icosahedron' | 'octahedron' | 'torus' | 'dodecahedron';
  color: string;
  speed?: number;
  scale?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.x = state.clock.elapsedTime * 0.2 * speed;
    ref.current.rotation.y = state.clock.elapsedTime * 0.3 * speed;
  });

  const Geometry = useMemo(() => {
    switch (shape) {
      case 'icosahedron': return <icosahedronGeometry args={[scale, 0]} />;
      case 'octahedron': return <octahedronGeometry args={[scale, 0]} />;
      case 'torus': return <torusGeometry args={[scale * 0.8, scale * 0.3, 16, 32]} />;
      case 'dodecahedron': return <dodecahedronGeometry args={[scale, 0]} />;
    }
  }, [shape, scale]);

  return (
    <Float speed={speed * 0.5} rotationIntensity={0.4} floatIntensity={0.5}>
      <mesh ref={ref} position={position} castShadow>
        {Geometry}
        <MeshDistortMaterial
          color={color}
          roughness={0.3}
          metalness={0.6}
          distort={0.15}
          speed={1.5}
          transparent
          opacity={0.85}
        />
      </mesh>
    </Float>
  );
}

function FloatingRing({ position, color }: { position: [number, number, number]; color: string }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.z = state.clock.elapsedTime * 0.15;
    ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
  });

  return (
    <mesh ref={ref} position={position} rotation={[Math.PI / 3, 0, 0]}>
      <torusGeometry args={[1.2, 0.03, 16, 64]} />
      <meshPhysicalMaterial color={color} transparent opacity={0.3} wireframe />
    </mesh>
  );
}

function Particles({ count = 80, color = '#ffffff' }) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      pos[i] = (Math.random() - 0.5) * 20;
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.02;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.1;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color={color} transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

export default function HeroScene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <directionalLight position={[-3, -2, 4]} intensity={0.4} />
      <pointLight position={[0, 3, 2]} intensity={0.5} color="#6366f1" />
      <pointLight position={[-2, -1, 3]} intensity={0.3} color="#a855f7" />

      <FloatingShape position={[-2.5, 1.2, -1]} shape="icosahedron" color="#6366f1" speed={0.8} scale={0.6} />
      <FloatingShape position={[2.8, -0.8, -0.5]} shape="octahedron" color="#a855f7" speed={1.2} scale={0.5} />
      <FloatingShape position={[0, 2.5, -2]} shape="dodecahedron" color="#ec4899" speed={0.6} scale={0.45} />
      <FloatingShape position={[-1.8, -1.5, 0.5]} shape="torus" color="#14b8a6" speed={1} scale={0.5} />
      <FloatingShape position={[1.5, -1.8, -1.5]} shape="icosahedron" color="#f59e0b" speed={0.9} scale={0.35} />

      <FloatingRing position={[0, 0, -3]} color="#6366f1" />
      <FloatingRing position={[0, 0.5, -4]} color="#a855f7" />

      <Particles count={120} color="#6366f1" />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
        maxPolarAngle={Math.PI / 2.5}
        minPolarAngle={Math.PI / 4}
      />
    </>
  );
}
