'use client';

import { useRef, useMemo, useState, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Float, MeshDistortMaterial, GradientTexture } from '@react-three/drei';
import * as THREE from 'three';

const COLORS = ['#7c5cfc', '#a855f7', '#ec4899', '#14b8a6', '#f59e0b', '#6366f1'];

function InteractiveShape({
  position,
  shape,
  color,
  speed = 1,
  scale = 1,
  mouseOffset = 1,
  index,
}: {
  position: [number, number, number];
  shape: 'icosahedron' | 'octahedron' | 'torus' | 'dodecahedron';
  color: string;
  speed?: number;
  scale?: number;
  mouseOffset?: number;
  index: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const originRef = useRef(new THREE.Vector3(...position));
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const clickTime = useRef(0);
  const { pointer } = useThree();

  useFrame((state) => {
    if (!ref.current) return;

    const t = state.clock.elapsedTime * speed;

    ref.current.rotation.x = t * 0.2;
    ref.current.rotation.y = t * 0.3;

    const mx = (pointer.x * 0.6 + Math.sin(t * 0.3 + index) * 0.2) * mouseOffset;
    const my = (-pointer.y * 0.6 + Math.cos(t * 0.25 + index) * 0.2) * mouseOffset;

    const targetX = originRef.current.x + mx;
    const targetY = originRef.current.y + my;
    const targetZ = originRef.current.z + (hovered ? 0.5 : 0) + (clicked ? 1.5 : 0);

    ref.current.position.x += (targetX - ref.current.position.x) * 0.05;
    ref.current.position.y += (targetY - ref.current.position.y) * 0.05;
    ref.current.position.z += (targetZ - ref.current.position.z) * 0.05;

    const targetScale = hovered ? 1.3 : clicked ? 1.6 : 1;
    const s = scale * (ref.current.scale.x + (targetScale - ref.current.scale.x) * 0.08);
    ref.current.scale.setScalar(s);

    if (clicked) {
      clickTime.current += 0.05;
      if (clickTime.current > 1) {
        setClicked(false);
        clickTime.current = 0;
      }
    }
  });

  const handleClick = useCallback(() => {
    setClicked(true);
    clickTime.current = 0;
  }, []);

  const Geometry = useMemo(() => {
    switch (shape) {
      case 'icosahedron': return <icosahedronGeometry args={[scale, 0]} />;
      case 'octahedron': return <octahedronGeometry args={[scale, 0]} />;
      case 'torus': return <torusGeometry args={[scale * 0.8, scale * 0.3, 16, 32]} />;
      case 'dodecahedron': return <dodecahedronGeometry args={[scale, 0]} />;
    }
  }, [shape, scale]);

  return (
    <Float speed={speed * 0.3} rotationIntensity={0} floatIntensity={0}>
      <mesh
        ref={ref}
        position={position}
        castShadow
        onClick={handleClick}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        {Geometry}
        <MeshDistortMaterial
          color={color}
          roughness={0.2}
          metalness={0.7}
          distort={hovered ? 0.25 : 0.15}
          speed={clicked ? 3 : 1.5}
          transparent
          opacity={hovered || clicked ? 1 : 0.85}
        />
      </mesh>
    </Float>
  );
}

function PulseRing({ position, color, delay = 0 }: { position: [number, number, number]; color: string; delay?: number }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime + delay;
    ref.current.rotation.z = t * 0.15;
    ref.current.position.y += Math.sin(t * 0.5) * 0.002;
    const pulse = 1 + Math.sin(t * 0.8) * 0.05;
    ref.current.scale.setScalar(pulse);
  });

  return (
    <mesh ref={ref} position={position} rotation={[Math.PI / 3, 0, 0]}>
      <torusGeometry args={[1.4, 0.025, 16, 64]} />
      <meshPhysicalMaterial color={color} transparent opacity={0.25} wireframe />
    </mesh>
  );
}

function ParticleField({ count = 200 }) {
  const ref = useRef<THREE.Points>(null);
  const { pointer } = useThree();

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 24;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 16 - 4;
      const c = new THREE.Color(COLORS[Math.floor(Math.random() * COLORS.length)]);
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return [pos, col];
  }, [count]);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y += 0.001;
    const positions2 = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions2[i3 + 1] += Math.sin(state.clock.elapsedTime * 0.3 + i) * 0.002;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} sizeAttenuation vertexColors transparent opacity={0.7} />
    </points>
  );
}

function GroundGlow() {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!mesh.current) return;
    mesh.current.position.y = -2.5 + Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    mesh.current.rotation.x = -Math.PI / 2;
  });

  return (
    <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]}>
      <planeGeometry args={[12, 12]} />
      <meshBasicMaterial color="#7c5cfc" transparent opacity={0.06} />
    </mesh>
  );
}

export default function HeroScene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <directionalLight position={[-3, -2, 4]} intensity={0.3} />
      <pointLight position={[0, 3, 2]} intensity={0.8} color="#7c5cfc" />
      <pointLight position={[-2, -1, 3]} intensity={0.5} color="#a855f7" />
      <pointLight position={[3, -1, -2]} intensity={0.4} color="#ec4899" />

      <InteractiveShape position={[-2.8, 1.5, -1]} shape="icosahedron" color={COLORS[0]} speed={0.7} scale={0.7} mouseOffset={1.2} index={0} />
      <InteractiveShape position={[3, -1, -0.5]} shape="octahedron" color={COLORS[1]} speed={1.1} scale={0.55} mouseOffset={1} index={1} />
      <InteractiveShape position={[0, 2.8, -2]} shape="dodecahedron" color={COLORS[2]} speed={0.5} scale={0.5} mouseOffset={0.8} index={2} />
      <InteractiveShape position={[-2, -1.8, 0.8]} shape="torus" color={COLORS[3]} speed={0.9} scale={0.55} mouseOffset={1.3} index={3} />
      <InteractiveShape position={[1.8, -2, -1.8]} shape="icosahedron" color={COLORS[4]} speed={0.8} scale={0.4} mouseOffset={0.9} index={4} />
      <InteractiveShape position={[2, 1.2, -3]} shape="dodecahedron" color={COLORS[5]} speed={0.6} scale={0.35} mouseOffset={1.1} index={5} />

      <PulseRing position={[0, 0, -3.5]} color="#7c5cfc" delay={0} />
      <PulseRing position={[0, 0.6, -4.5]} color="#a855f7" delay={1.5} />
      <PulseRing position={[0, -0.4, -5]} color="#ec4899" delay={3} />

      <ParticleField count={250} />
      <GroundGlow />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={false}
        autoRotate
        autoRotateSpeed={0.3}
      />
    </>
  );
}
