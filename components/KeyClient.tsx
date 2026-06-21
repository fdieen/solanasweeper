'use client';

import dynamic from 'next/dynamic';

const KeyCanvas = dynamic(() => import('./KeyCanvas'), { ssr: false });

export default function KeyClient() {
  return <KeyCanvas />;
}
