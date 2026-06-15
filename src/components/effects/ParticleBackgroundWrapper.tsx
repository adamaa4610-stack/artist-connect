'use client';

import nextDynamic from 'next/dynamic';

const Particles = nextDynamic(() => import('./ParticleBackground'), { ssr: false });

export default function ParticleBackgroundWrapper() {
  return <Particles />;
}
