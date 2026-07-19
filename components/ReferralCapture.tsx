'use client';

import { useEffect } from 'react';
import { captureRefFromUrl } from '@/lib/referral';

/**
 * Leest ?ref= op elke pagina-load en bewaart een geldige referrer (base58) in localStorage.
 * Rendert niets. Gemount in de root-layout.
 */
export default function ReferralCapture() {
  useEffect(() => { captureRefFromUrl(); }, []);
  return null;
}
