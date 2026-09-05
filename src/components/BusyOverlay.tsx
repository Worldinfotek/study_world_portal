import React from 'react';
import { Loader2 } from 'lucide-react';

interface BusyOverlayProps {
  message: string;
}

export const BusyOverlay: React.FC<BusyOverlayProps> = ({ message }) => {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[#241512]/45 backdrop-blur-[2px]"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="mx-4 w-full max-w-sm rounded-2xl border border-stone-200 bg-white px-6 py-8 text-center shadow-2xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#FBF6F1] border border-stone-200">
          <Loader2 className="h-7 w-7 animate-spin text-[#A8382C]" />
        </div>
        <div className="font-display text-base font-bold text-[#7A2820]">Please wait</div>
        <p className="mt-1 text-xs font-medium text-stone-500">{message}</p>
      </div>
    </div>
  );
};
