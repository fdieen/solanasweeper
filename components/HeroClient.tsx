'use client';

import dynamic from 'next/dynamic';

const CubeGrid = dynamic(() => import('./CubeGrid'), { ssr: false });

export default function HeroClient() {
  return <CubeGrid />;
}
