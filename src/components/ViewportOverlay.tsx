import type { MouseEventHandler, ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface ViewportOverlayProps {
  children: ReactNode;
  className?: string;
  zClass?: string;
  onBackdropClick?: MouseEventHandler<HTMLDivElement>;
}

export function ViewportOverlay({
  children,
  className = '',
  zClass = 'z-50',
  onBackdropClick,
}: ViewportOverlayProps) {
  return createPortal(
    <div
      className={`fixed inset-0 ${zClass} flex items-center justify-center overflow-y-auto overscroll-contain p-4 bg-black/60 backdrop-blur-xs ${className}`}
      style={{ position: 'fixed', inset: 0, width: '100vw', height: '100dvh' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onBackdropClick?.(e);
      }}
    >
      {children}
    </div>,
    document.body
  );
}
