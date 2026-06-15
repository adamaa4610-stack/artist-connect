'use client';

import { Html, useProgress } from '@react-three/drei';

export default function CanvasLoader() {
  const { progress, active } = useProgress();
  if (!active) return null;
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-xs text-muted-foreground">{progress.toFixed(0)}%</p>
      </div>
    </Html>
  );
}
