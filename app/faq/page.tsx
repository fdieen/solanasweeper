'use client';

import { useState } from 'react';
import InnerLayout from '@/components/InnerLayout';
import AuroraBackground from '@/components/AuroraBackground';
import HelpBot from '@/components/HelpBot';
import { FAQS, type Faq } from '@/lib/faq';

function FaqItem({ q, a, link, open, toggle }: { q: string; a: string; link?: Faq['link']; open: boolean; toggle: () => void }) {
  return (
    <div
      style={{
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        cursor: 'pointer',
      }}
      onClick={toggle}
    >
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '24px 0', gap: '24px',
      }}>
        <span style={{
          fontFamily: 'General Sans, sans-serif', fontWeight: 500,
          fontSize: 'clamp(0.92rem, 1.5vw, 1.05rem)',
          color: open ? '#fff' : 'rgba(255,255,255,0.7)',
          lineHeight: 1.4,
          transition: 'color 0.15s',
        }}>
          {q}
        </span>
        <svg
          width="16" height="16" viewBox="0 0 16 16" fill="none"
          style={{ flexShrink: 0, transform: open ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}
        >
          <path d="M8 2V14M2 8H14" stroke={open ? '#14F195' : 'rgba(255,255,255,0.3)'} strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
      {/* Altijd in de DOM (statische HTML voor crawlers + FAQPage-schema);
          alleen visueel in-/uitgeklapt met CSS (max-height), niet conditioneel gerenderd. */}
      <div
        aria-hidden={!open}
        style={{ overflow: 'hidden', maxHeight: open ? '1200px' : 0, transition: 'max-height 0.3s ease' }}
      >
        <div style={{ paddingBottom: '24px', maxWidth: '640px' }}>
          <p style={{
            fontFamily: 'General Sans, sans-serif', fontWeight: 400,
            fontSize: '0.9rem', lineHeight: 1.75,
            color: 'rgba(255,255,255,0.45)', margin: 0,
          }}>
            {a}
          </p>
          {link && (
            <p style={{ margin: '12px 0 0', fontFamily: 'General Sans, sans-serif', fontSize: '0.86rem' }}>
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>→ </span>
              <a
                href={link.href}
                onClick={(e) => e.stopPropagation()}
                style={{ color: '#14F195', textDecoration: 'none', borderBottom: '1px solid rgba(20,241,149,0.3)' }}
              >
                {link.text}
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <InnerLayout bgNode={<AuroraBackground />}>
      <HelpBot />
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: 'clamp(100px, 14vw, 160px) clamp(24px, 6vw, 80px) 80px' }}>

        <p style={{
          fontFamily: 'General Sans, sans-serif', fontWeight: 400,
          fontSize: '0.78rem', letterSpacing: '0.08em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.35)', marginBottom: '20px',
        }}>
          Frequently asked
        </p>
        <h1 style={{
          fontFamily: 'General Sans, sans-serif', fontWeight: 700,
          fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)', letterSpacing: '-0.03em',
          lineHeight: 1.05, color: '#fff', marginBottom: '56px',
        }}>
          Got questions?
        </h1>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          {FAQS.map((item, i) => (
            <FaqItem
              key={i}
              q={item.q}
              a={item.a}
              link={item.link}
              open={openIdx === i}
              toggle={() => setOpenIdx(openIdx === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </InnerLayout>
  );
}
