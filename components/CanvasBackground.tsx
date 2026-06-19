'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

const CubeGrid = dynamic(() => import('./CubeGrid'), { ssr: false });

export default function CanvasBackground() {
  const pathname = usePathname();
  if (pathname !== '/') return null;
  return <CubeGrid />;
}
