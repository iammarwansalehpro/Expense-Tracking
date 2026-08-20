import React from 'react';

interface PremiumThemeSwitchProps {
  checked: boolean;
  onChange: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function PremiumThemeSwitch({
  checked,
  onChange,
  size = 'md',
  className = '',
}: PremiumThemeSwitchProps) {
  // Dimensions configurations based on size
  const config = {
    sm: {
      width: 64,
      height: 34,
      blobSize: 26,
      travel: 30, // 64 - 26 - 4*2 = 30
      padding: 4,
      iconSize: 14,
    },
    md: {
      width: 74,
      height: 38,
      blobSize: 30,
      travel: 36, // 74 - 30 - 4*2 = 36
      padding: 4,
      iconSize: 16,
    },
    lg: {
      width: 92,
      height: 46,
      blobSize: 36,
      travel: 46, // 92 - 36 - 5*2 = 46
      padding: 5,
      iconSize: 20,
    },
  }[size];

  const isDark = checked;

  return (
    <div
      role="switch"
      aria-checked={isDark}
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          onChange();
        }
      }}
      className={`relative select-none inline-flex items-center justify-between cursor-pointer rounded-full transition-transform active:scale-[0.96] outline-none ${className}`}
      style={{
        width: `${config.width}px`,
        height: `${config.height}px`,
        padding: `${config.padding}px`,
        background: isDark
          ? 'linear-gradient(145deg, #23183d, #110822)'
          : 'linear-gradient(145deg, #f8f8f8, #d9d9d9)',
        boxShadow: isDark
          ? '0 3px 10px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.06)'
          : '0 3px 8px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* Neumorphic Inset Shadow Layer */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none transition-all duration-300"
        style={{
          boxShadow: isDark
            ? 'inset 4px 4px 8px rgba(0, 0, 0, 0.75), inset -3px -3px 6px rgba(255, 255, 255, 0.07)'
            : 'inset 4px 4px 8px rgba(0, 0, 0, 0.16), inset -4px -4px 8px rgba(255, 255, 255, 0.95)',
        }}
      />

      {/* 3D Animated Knob (Blob) */}
      <div
        className="absolute rounded-full transition-all duration-400 ease-[cubic-bezier(0.34,1.35,0.64,1)] z-[1]"
        style={{
          top: `${config.padding}px`,
          left: `${config.padding}px`,
          width: `${config.blobSize}px`,
          height: `${config.blobSize}px`,
          transform: isDark ? `translateX(${config.travel}px)` : 'translateX(0px)',
          background: isDark
            ? 'linear-gradient(145deg, #818cf8, #4f46e5)'
            : 'linear-gradient(145deg, #ffc85a, #ed8b00)',
          boxShadow: isDark
            ? '0 4px 14px rgba(79, 70, 229, 0.55), 2px 4px 8px rgba(0, 0, 0, 0.4), inset 1.5px 1.5px 3px rgba(255, 255, 255, 0.65), inset -1.5px -1.5px 3px rgba(30, 20, 70, 0.5)'
            : '0 4px 12px rgba(237, 139, 0, 0.45), 2px 4px 8px rgba(0, 0, 0, 0.22), inset 1.5px 1.5px 3px rgba(255, 255, 255, 0.75), inset -1.5px -1.5px 3px rgba(180, 80, 0, 0.35)',
        }}
      >
        {/* Specular Highlight on Sphere */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            top: '12%',
            left: '18%',
            width: '40%',
            height: '26%',
            background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0) 80%)',
            transform: 'rotate(-25deg)',
          }}
        />
      </div>

      {/* Sun Icon Zone (Left) */}
      <div
        className="relative z-[2] flex items-center justify-center pointer-events-none transition-all duration-300"
        style={{
          width: `${config.blobSize}px`,
          height: `${config.blobSize}px`,
          color: isDark ? '#64748b' : '#ffffff',
          opacity: isDark ? 0.5 : 1,
          filter: isDark ? 'none' : 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))',
        }}
      >
        {/* Exact Sun Icon with center circle & 8 radial dots matching the preview */}
        <svg
          viewBox="0 0 24 24"
          width={config.iconSize}
          height={config.iconSize}
          fill="none"
          className="transition-transform duration-300"
          style={{
            transform: isDark ? 'rotate(-30deg) scale(0.9)' : 'rotate(0deg) scale(1)',
          }}
        >
          {/* Center Ring */}
          <circle
            cx="12"
            cy="12"
            r="3.6"
            stroke="currentColor"
            strokeWidth="2.2"
          />
          {/* 8 Dotted Rays */}
          <circle cx="12" cy="3.5" r="1.3" fill="currentColor" />
          <circle cx="12" cy="20.5" r="1.3" fill="currentColor" />
          <circle cx="3.5" cy="12" r="1.3" fill="currentColor" />
          <circle cx="20.5" cy="12" r="1.3" fill="currentColor" />
          <circle cx="6" cy="6" r="1.3" fill="currentColor" />
          <circle cx="18" cy="6" r="1.3" fill="currentColor" />
          <circle cx="6" cy="18" r="1.3" fill="currentColor" />
          <circle cx="18" cy="18" r="1.3" fill="currentColor" />
        </svg>
      </div>

      {/* Moon Icon Zone (Right) */}
      <div
        className="relative z-[2] flex items-center justify-center pointer-events-none transition-all duration-300"
        style={{
          width: `${config.blobSize}px`,
          height: `${config.blobSize}px`,
          color: isDark ? '#ffffff' : '#717f94',
          opacity: isDark ? 1 : 0.7,
          filter: isDark
            ? 'drop-shadow(0 1px 3px rgba(0, 0, 0, 0.4))'
            : 'drop-shadow(0 1px 0 rgba(255, 255, 255, 0.8))',
        }}
      >
        {/* Crescent Moon Icon matching the preview */}
        <svg
          viewBox="0 0 24 24"
          width={config.iconSize}
          height={config.iconSize}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-transform duration-300"
          style={{
            transform: isDark ? 'rotate(0deg) scale(1)' : 'rotate(15deg) scale(0.9)',
          }}
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </div>
    </div>
  );
}
