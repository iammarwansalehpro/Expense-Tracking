import React from 'react';

interface EMVChip3DProps {
  className?: string;
  variant?: 'gold' | 'silver';
}

export default function EMVChip3D({ className = '', variant = 'gold' }: EMVChip3DProps) {
  const isGold = variant === 'gold';

  return (
    <div className={`relative w-10 h-7.5 rounded-md overflow-hidden shrink-0 select-none shadow-[0_2px_6px_rgba(0,0,0,0.18)] border border-black/10 ${className}`}>
      <svg
        viewBox="0 0 40 30"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Metallic Brushed Texture */}
          <linearGradient id={isGold ? 'chipGoldBase' : 'chipSilverBase'} x1="0" y1="0" x2="40" y2="30" gradientUnits="userSpaceOnUse">
            {isGold ? (
              <>
                <stop offset="0%" stopColor="#FDE68A" />
                <stop offset="35%" stopColor="#F59E0B" />
                <stop offset="70%" stopColor="#D97706" />
                <stop offset="100%" stopColor="#B45309" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#F1F5F9" />
                <stop offset="35%" stopColor="#CBD5E1" />
                <stop offset="70%" stopColor="#94A3B8" />
                <stop offset="100%" stopColor="#64748B" />
              </>
            )}
          </linearGradient>

          {/* Circuit Groove Lines */}
          <linearGradient id="chipGroove" x1="0" y1="0" x2="40" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#78350F" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#451A03" stopOpacity="0.8" />
          </linearGradient>

          {/* Top-Right Specular Light Glint */}
          <linearGradient id="chipSpecular" x1="0" y1="0" x2="40" y2="30" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Chip Base Plate */}
        <rect width="40" height="30" rx="3" fill={`url(#${isGold ? 'chipGoldBase' : 'chipSilverBase'})`} />

        {/* EMV Microchip Circuit Grooves */}
        {/* Outer Inset Border */}
        <rect x="2" y="2" width="36" height="26" rx="2" stroke="url(#chipGroove)" strokeWidth="0.8" />

        {/* Center Contact Oval/Rect */}
        <rect x="14" y="8" width="12" height="14" rx="2" stroke="url(#chipGroove)" strokeWidth="0.75" />

        {/* Horizontal Dividing Lines */}
        <line x1="2" y1="15" x2="14" y2="15" stroke="url(#chipGroove)" strokeWidth="0.75" />
        <line x1="26" y1="15" x2="38" y2="15" stroke="url(#chipGroove)" strokeWidth="0.75" />

        {/* Vertical Radiating Lines */}
        <line x1="20" y1="2" x2="20" y2="8" stroke="url(#chipGroove)" strokeWidth="0.75" />
        <line x1="20" y1="22" x2="20" y2="28" stroke="url(#chipGroove)" strokeWidth="0.75" />

        {/* Diagonal Corner Trace Accents */}
        <line x1="8" y1="2" x2="8" y2="6" stroke="url(#chipGroove)" strokeWidth="0.5" />
        <line x1="32" y1="2" x2="32" y2="6" stroke="url(#chipGroove)" strokeWidth="0.5" />
        <line x1="8" y1="24" x2="8" y2="28" stroke="url(#chipGroove)" strokeWidth="0.5" />
        <line x1="32" y1="24" x2="32" y2="28" stroke="url(#chipGroove)" strokeWidth="0.5" />

        {/* Diagonal Specular Highlight Sweep */}
        <path d="M0 0L24 0L6 30L0 30Z" fill="url(#chipSpecular)" />
      </svg>
    </div>
  );
}
