import React, { useState, useEffect } from 'react';
import { getCustomLogo, LOGO_UPDATED_EVENT } from '../utils/logoStorage';

interface CrestLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'full' | 'stacked' | 'icon' | 'white';
  showSubtitle?: boolean;
  className?: string;
  subtitleText?: string;
}

export const CrestLogo: React.FC<CrestLogoProps> = ({
  size = 'md',
  variant = 'full',
  showSubtitle = true,
  className = '',
  subtitleText = 'Search Portal',
}) => {
  const [customLogo, setCustomLogoState] = useState<string | null>(() => getCustomLogo());

  useEffect(() => {
    const handleLogoUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<string | null>;
      setCustomLogoState(customEvent.detail ?? getCustomLogo());
    };

    window.addEventListener(LOGO_UPDATED_EVENT, handleLogoUpdate);
    return () => window.removeEventListener(LOGO_UPDATED_EVENT, handleLogoUpdate);
  }, []);

  const sizeMap = {
    xs: { icon: 26, height: 31, text: 'text-xs', sub: 'text-[9px]', subBadge: 'text-[7px]' },
    sm: { icon: 34, height: 41, text: 'text-sm', sub: 'text-[10px]', subBadge: 'text-[8px]' },
    md: { icon: 44, height: 53, text: 'text-base', sub: 'text-[11px]', subBadge: 'text-[9px]' },
    lg: { icon: 58, height: 70, text: 'text-xl', sub: 'text-xs', subBadge: 'text-[10px]' },
    xl: { icon: 80, height: 96, text: 'text-2xl', sub: 'text-sm', subBadge: 'text-xs' },
    '2xl': { icon: 110, height: 132, text: 'text-3xl', sub: 'text-base', subBadge: 'text-sm' },
  };

  const dim = sizeMap[size];

  // Render uploaded image if available, else SVG fallback
  const renderEmblem = (width: number, height: number) => {
    if (customLogo) {
      return (
        <img
          src={customLogo}
          alt="Study World Consultant Logo"
          className="object-contain flex-shrink-0"
          style={{ width: `${width}px`, height: `${height}px` }}
        />
      );
    }

    return (
      <svg
        width={width}
        height={height}
        viewBox="0 0 280 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        <defs>
          <linearGradient id="swcBrandGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#A84338" />
            <stop offset="50%" stopColor="#8E2F26" />
            <stop offset="100%" stopColor="#6E1B15" />
          </linearGradient>
        </defs>

        {/* Outer Shield Frame */}
        <path
          d="M 140 10 C 185 10 242 22 260 36 C 266 95 260 178 212 232 C 180 268 145 288 140 292 C 135 288 100 268 68 232 C 20 178 14 95 20 36 C 38 22 95 10 140 10 Z"
          fill="none"
          stroke="url(#swcBrandGrad)"
          strokeWidth="14"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Inner Globe Outer Ring */}
        <circle cx="140" cy="116" r="96" fill="none" stroke="url(#swcBrandGrad)" strokeWidth="6" />

        {/* Upper Globe Latitudes & Meridians */}
        <ellipse cx="140" cy="74" rx="86" ry="26" fill="none" stroke="url(#swcBrandGrad)" strokeWidth="3.5" />
        <ellipse cx="140" cy="116" rx="94" ry="36" fill="none" stroke="url(#swcBrandGrad)" strokeWidth="3.5" />
        <ellipse cx="140" cy="116" rx="52" ry="94" fill="none" stroke="url(#swcBrandGrad)" strokeWidth="3.5" />
        <line x1="140" y1="20" x2="140" y2="100" stroke="url(#swcBrandGrad)" strokeWidth="3.5" />

        {/* Continents Silhouettes */}
        <path
          d="M 130 38 Q 160 34 186 48 Q 212 62 206 84 Q 188 80 176 94 Q 168 116 180 134 Q 168 142 154 134 Q 140 152 144 172 Q 134 176 125 160 Q 120 130 132 118 Q 118 108 114 88 Q 110 60 130 38 Z"
          fill="url(#swcBrandGrad)"
        />
        <path
          d="M 66 48 Q 92 44 102 66 Q 92 84 78 94 Q 88 120 74 142 Q 62 134 56 108 Q 52 80 66 48 Z"
          fill="url(#swcBrandGrad)"
        />

        {/* Academic Mortarboard Cap (Center) */}
        <g transform="translate(140, 102)">
          <polygon points="0,-32 58,-10 0,12 -58,-10" fill="url(#swcBrandGrad)" />
          <path d="M -26 -4 L -26 14 C -26 22 26 22 26 14 L 26 -4 Z" fill="url(#swcBrandGrad)" />
          <circle cx="0" cy="-10" r="3.5" fill="#FFFFFF" />
          <path d="M 0 -10 Q -28 -6 -36 10 Q -40 20 -38 28" fill="none" stroke="url(#swcBrandGrad)" strokeWidth="3.5" strokeLinecap="round" />
          <polygon points="-41,28 -35,28 -36,36 -40,36" fill="url(#swcBrandGrad)" />
        </g>

        {/* Open Book with "S W C" */}
        <g transform="translate(140, 160)">
          <path
            d="M -76 -10 Q -38 2 0 -5 Q 38 2 76 -10 L 68 18 Q 34 7 0 14 Q -34 7 -68 18 Z"
            fill="#FFFFFF"
            stroke="url(#swcBrandGrad)"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <line x1="0" y1="-5" x2="0" y2="14" stroke="url(#swcBrandGrad)" strokeWidth="3" />
          <text x="-42" y="8" fontFamily="'Plus Jakarta Sans', 'Arial Black', sans-serif" fontWeight="900" fontSize="18" fill="#8E2F26" textAnchor="middle">
            S
          </text>
          <text x="0" y="8" fontFamily="'Plus Jakarta Sans', 'Arial Black', sans-serif" fontWeight="900" fontSize="18" fill="#8E2F26" textAnchor="middle">
            W
          </text>
          <text x="42" y="8" fontFamily="'Plus Jakarta Sans', 'Arial Black', sans-serif" fontWeight="900" fontSize="18" fill="#8E2F26" textAnchor="middle">
            C
          </text>
        </g>

        {/* Lower Globe Hemisphere Grid */}
        <ellipse cx="140" cy="216" rx="60" ry="24" fill="none" stroke="url(#swcBrandGrad)" strokeWidth="4" />
        <ellipse cx="140" cy="236" rx="40" ry="14" fill="none" stroke="url(#swcBrandGrad)" strokeWidth="3.5" />
        <line x1="140" y1="174" x2="140" y2="250" stroke="url(#swcBrandGrad)" strokeWidth="4" />
        <line x1="112" y1="184" x2="116" y2="242" stroke="url(#swcBrandGrad)" strokeWidth="3" />
        <line x1="168" y1="184" x2="164" y2="242" stroke="url(#swcBrandGrad)" strokeWidth="3" />
      </svg>
    );
  };

  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        {renderEmblem(dim.icon, dim.height)}
      </div>
    );
  }

  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center text-center select-none ${className}`}>
        {renderEmblem(dim.icon * 1.3, dim.height * 1.3)}
        
        <div className="mt-2.5 flex flex-col items-center">
          <span className="font-extrabold tracking-tight uppercase leading-tight text-[#701C18] text-lg sm:text-xl">
            STUDY WORLD
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="font-extrabold tracking-wider uppercase leading-none text-[#701C18] text-base sm:text-lg">
              CONSULTANT
            </span>
            <span className="px-1.5 py-0.5 bg-[#701C18] text-white font-black text-[9px] sm:text-[10px] tracking-wider rounded-xs">
              SINCE 2016
            </span>
          </div>
          {showSubtitle && (
            <span className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold mt-1">
              {subtitleText}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* SWC Shield Crest Icon / Uploaded Logo */}
      {renderEmblem(dim.icon, dim.height)}

      {/* Brand Text & Badge */}
      {variant !== 'icon' && (
        <div className="flex flex-col justify-center">
          <div className="flex items-baseline gap-1">
            <span
              className={`font-black tracking-tight uppercase leading-tight ${
                variant === 'white' ? 'text-white' : 'text-[#701C18]'
              } ${dim.text}`}
            >
              STUDY WORLD
            </span>
          </div>
          
          <div className="flex items-center gap-1.5 -mt-0.5">
            <span
              className={`font-extrabold tracking-wider uppercase ${
                variant === 'white' ? 'text-amber-200' : 'text-[#88221D]'
              } text-xs sm:text-sm leading-none`}
            >
              CONSULTANT
            </span>
            <span
              className={`px-1 py-0.2 font-black tracking-wider uppercase rounded-xs ${
                variant === 'white'
                  ? 'bg-white/20 text-white border border-white/30'
                  : 'bg-[#701C18] text-white'
              } ${dim.subBadge}`}
            >
              SINCE 2016
            </span>
          </div>

          {showSubtitle && (
            <span
              className={`tracking-widest font-semibold uppercase mt-0.5 ${
                variant === 'white' ? 'text-stone-300' : 'text-stone-500'
              } ${dim.sub}`}
            >
              {subtitleText}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

