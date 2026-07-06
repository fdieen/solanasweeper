'use client';

import { useAppKit, useAppKitAccount } from '@reown/appkit/react';

type Props = {
  fullWidth?: boolean;
  showArrow?: boolean;
};

function shorten(addr: string) {
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

export default function ConnectWalletButton({ fullWidth = false, showArrow = true }: Props) {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();

  const label = isConnected && address ? shorten(address) : 'Connect Wallet';

  const onClick = () => {
    // Opent de Reown-modal: bij verbonden toont 'Account'-view (disconnect/switch)
    open(isConnected ? { view: 'Account' } : { view: 'Connect' });
  };

  return (
    <button
      onClick={onClick}
      title={isConnected && address ? address : undefined}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        fontFamily: 'General Sans, sans-serif',
        fontWeight: 600,
        fontSize: '0.95rem',
        background: '#fff',
        color: '#05050a',
        border: 'none',
        borderRadius: '999px',
        padding: showArrow ? '13px 22px 13px 28px' : '13px 24px',
        cursor: 'pointer',
        width: fullWidth ? '100%' : 'fit-content',
      }}
    >
      {label}
      {showArrow && (
        <span style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '30px', height: '30px',
          background: '#05050a', borderRadius: '50%',
        }}>
          <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
            <path d="M2 6H12M12 6L8 2M12 6L8 10" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      )}
    </button>
  );
}
