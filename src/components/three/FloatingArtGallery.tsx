'use client';

import { useRef, useMemo, useState, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Float, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useRouter } from 'next/navigation';

interface ArtPiece {
  id: number;
  title: string;
  artistName: string;
  fileUrl: string;
  contentType: string;
}

function ArtFrame({
  piece, index, count, isSelected, onSelect,
}: {
  piece: ArtPiece;
  index: number;
  count: number;
  isSelected: boolean;
  onSelect: (id: number) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const frameRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const { pointer } = useThree();

  const angle = (index / count) * Math.PI * 2;
  const radius = 4.5;
  const baseY = Math.sin(index * 1.5) * 0.5;

  useFrame((state) => {
    if (!groupRef.current) return;

    const t = state.clock.elapsedTime;

    const targetAngle = angle + t * 0.06;
    const smoothAngle = isSelected ? targetAngle : targetAngle;

    groupRef.current.position.x = Math.sin(smoothAngle) * radius;
    groupRef.current.position.z = Math.cos(smoothAngle) * radius;
    groupRef.current.position.y = baseY + Math.sin(t * 0.5 + index) * 0.15;

    groupRef.current.lookAt(0, baseY, 0);

    if (isSelected) {
      groupRef.current.position.y += 0.3;
      groupRef.current.scale.setScalar(1 + Math.sin(t * 0.5) * 0.05);
    }
  });

  const handleClick = useCallback((e: any) => {
    e.stopPropagation();
    onSelect(piece.id);
  }, [piece.id, onSelect]);

  return (
    <group ref={groupRef}>
      <Float speed={0.5} floatIntensity={hovered ? 0.5 : 0.2}>
        <mesh
          ref={frameRef}
          position={[0, 0, 0]}
          castShadow
          onClick={handleClick}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
        >
          <planeGeometry args={[1.6, 1.2]} />
          <meshPhysicalMaterial
            color={hovered ? '#2d1b69' : '#181127'}
            metalness={hovered ? 0.4 : 0.2}
            roughness={0.3}
            transparent
            opacity={hovered ? 0.95 : 0.7}
          />
        </mesh>

        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[1.45, 1.05]} />
          <meshPhysicalMaterial
            color="#ffffff"
            transparent
            opacity={hovered ? 0.15 : 0.06}
          />
        </mesh>

        <mesh position={[0, 0, 0.02]}>
          <planeGeometry args={[1.35, 0.15]} />
          <meshBasicMaterial color="#7c5cfc" transparent opacity={0.3} />
        </mesh>

        <Text
          position={[0, 0.35, 0.03]}
          fontSize={0.09}
          color="#f1e8ff"
          anchorX="center"
          anchorY="middle"
          maxWidth={1.2}
        >
          {piece.contentType === 'music' || piece.contentType === 'audio' ? '♫' : '◷'}
        </Text>

        <Text
          position={[0, 0.05, 0.03]}
          fontSize={0.09}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          maxWidth={1.2}
        >
          {piece.title.length > 16 ? piece.title.slice(0, 14) + '…' : piece.title}
        </Text>

        <Text
          position={[0, -0.35, 0.03]}
          fontSize={0.06}
          color="#9a8ab0"
          anchorX="center"
          anchorY="middle"
          maxWidth={1.2}
        >
          {piece.artistName}
        </Text>

        {hovered && (
          <mesh position={[0, -0.55, 0.03]}>
            <planeGeometry args={[0.6, 0.15]} />
            <meshBasicMaterial color="#7c5cfc" transparent opacity={0.8} />
          </mesh>
        )}
      </Float>
    </group>
  );
}

function GalleryRings() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.03;
  });

  const rings = useMemo(() => {
    return Array.from({ length: 32 }).map((_, i) => {
      const a = (i / 32) * Math.PI * 2 + Math.random() * 0.1;
      const r = 5.3;
      return { x: Math.sin(a) * r, z: Math.cos(a) * r, s: 0.3 + Math.random() * 0.5 };
    });
  }, []);

  return (
    <group ref={groupRef}>
      {rings.map((r, i) => (
        <mesh key={i} position={[r.x, 0, r.z]} rotation={[Math.PI / 2, 0, 0]} scale={r.s}>
          <ringGeometry args={[0.01, 0.02, 3]} />
          <meshPhysicalMaterial color="#7c5cfc" transparent opacity={0.15} wireframe />
        </mesh>
      ))}
    </group>
  );
}

interface FloatingArtGalleryProps {
  pieces: ArtPiece[];
}

export default function FloatingArtGallery({ pieces }: FloatingArtGalleryProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const handleSelect = useCallback((id: number) => {
    setSelectedId(id);
    setTimeout(() => router.push(`/content/${id}`), 400);
  }, [router]);

  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight position={[3, 5, 3]} intensity={0.5} castShadow />
      <pointLight position={[0, 3, 3]} intensity={0.6} color="#7c5cfc" />
      <pointLight position={[0, -2, -3]} intensity={0.4} color="#a855f7" />

      {pieces.map((piece, i) => (
        <ArtFrame
          key={piece.id}
          piece={piece}
          index={i}
          count={pieces.length}
          isSelected={selectedId === piece.id}
          onSelect={handleSelect}
        />
      ))}

      <GalleryRings />

      <mesh position={[0, 0, 0]}>
        <dodecahedronGeometry args={[0.08, 0]} />
        <meshPhysicalMaterial color="#7c5cfc" transparent opacity={0.5} />
      </mesh>

      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.15, 0.2, 32]} />
        <meshBasicMaterial color="#7c5cfc" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
    </>
  );
}
