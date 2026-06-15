'use client';

import nextDynamic from 'next/dynamic';

const HeroScene = nextDynamic(() => import('./HeroScene'), { ssr: false });
const GalleryScene = nextDynamic(() => import('./FloatingArtGallery'), { ssr: false });
import Scene3D from './Scene3D';

interface ArtPiece {
  id: number;
  title: string;
  artistName: string;
  fileUrl: string;
  contentType: string;
}

export function Hero3DSection() {
  return (
    <div className="absolute inset-0 -z-10">
      <Scene3D className="h-full w-full">
        <HeroScene />
      </Scene3D>
    </div>
  );
}

export function Gallery3DSection({ pieces }: { pieces: ArtPiece[] }) {
  if (pieces.length === 0) return null;
  return (
    <Scene3D className="h-[500px] w-full rounded-xl overflow-hidden" cameraPosition={[0, 0.5, 7]}>
      <GalleryScene pieces={pieces} />
    </Scene3D>
  );
}
