'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text } from '@react-three/drei';
import * as THREE from 'three';

interface ArtPiece {
  id: number;
  title: string;
  artistName: string;
  fileUrl: string;
  contentType: string;
}

function ArtFrame({ piece, index, count }: { piece: ArtPiece; index: number; count: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const angle = (index / count) * Math.PI * 2;
  const radius = 4.5;

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.position.x = Math.sin(angle + state.clock.elapsedTime * 0.08) * radius;
    groupRef.current.position.z = Math.cos(angle + state.clock.elapsedTime * 0.08) * radius;
    groupRef.current.lookAt(0, 0, 0);
  });

  const isMusic = piece.contentType === 'music' || piece.contentType === 'audio';

  return (
    <group ref={groupRef} position={[Math.sin(angle) * radius, 0, Math.cos(angle) * radius]}>
      <Float speed={0.5} floatIntensity={0.3}>
        <mesh position={[0, 0, 0]} castShadow>
          <planeGeometry args={[1.6, 1.2]} />
          <meshPhysicalMaterial color="#1a1a2e" metalness={0.3} roughness={0.4} />
        </mesh>

        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[1.5, 1.1]} />
          <meshPhysicalMaterial color="#ffffff" />
        </mesh>

        <Text
          position={[0, -0.75, 0.02]}
          fontSize={0.08}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          maxWidth={1.4}
        >
          {isMusic ? '🎵' : '🖼️'}
        </Text>

        <Text
          position={[0, 0.45, 0.02]}
          fontSize={0.1}
          color="#111111"
          anchorX="center"
          anchorY="middle"
          maxWidth={1.3}
        >
          {piece.title}
        </Text>

        <Text
          position={[0, -0.55, 0.02]}
          fontSize={0.07}
          color="#666666"
          anchorX="center"
          anchorY="middle"
          maxWidth={1.3}
        >
          {piece.artistName}
        </Text>
      </Float>
    </group>
  );
}

function GalleryRing() {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.03;
  });

  return (
    <group ref={ref}>
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i / 24) * Math.PI * 2;
        const r = 5.2;
        return (
          <mesh key={i} position={[Math.sin(angle) * r, 0, Math.cos(angle) * r]} rotation={[0, 0, Math.PI / 2]}>
            <ringGeometry args={[0.01, 0.03, 3]} />
            <meshPhysicalMaterial color="#6366f1" transparent opacity={0.2} wireframe />
          </mesh>
        );
      })}
    </group>
  );
}

interface FloatingArtGalleryProps {
  pieces: ArtPiece[];
}

export default function FloatingArtGallery({ pieces }: FloatingArtGalleryProps) {
  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[3, 5, 3]} intensity={0.6} castShadow />
      <pointLight position={[0, 2, 3]} intensity={0.4} color="#6366f1" />
      <pointLight position={[0, -2, -3]} intensity={0.3} color="#a855f7" />

      {pieces.map((piece, i) => (
        <ArtFrame key={piece.id} piece={piece} index={i} count={pieces.length} />
      ))}

      <GalleryRing />

      <mesh position={[0, 0, 0]}>
        <dodecahedronGeometry args={[0.12, 0]} />
        <meshPhysicalMaterial color="#6366f1" transparent opacity={0.3} />
      </mesh>
    </>
  );
}
