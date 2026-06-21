'use client';

import dynamic from 'next/dynamic';

const GemCanvas = dynamic(() => import('./GemCanvas'), { ssr: false });

export default function GemClient() {
  return <GemCanvas />;
}
