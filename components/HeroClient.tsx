'use client';

import dynamic from 'next/dynamic';

const HeroCanvas = dynamic(() => import('./HeroCanvas'), { ssr: false });

type Props = {
  transparent?: boolean;
  lookAt?: [number, number, number];
};

export default function HeroClient({ transparent, lookAt }: Props) {
  return <HeroCanvas transparent={transparent} lookAt={lookAt} />;
}
