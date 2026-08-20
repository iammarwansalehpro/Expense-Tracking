import React from 'react';

export type AlertUrgency = 'overdue' | 'today' | 'urgent' | 'warning';

interface Alert3DIconProps {
  urgency: AlertUrgency;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Alert3DIcon({ urgency, size = 'md', className = '' }: Alert3DIconProps) {
  // Dimension mapping
  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-14 h-14'
  };

  const containerSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`relative flex items-center justify-center shrink-0 select-none ${containerSize} ${className}`}>
      {urgency === 'overdue' && <RubyShield3D />}
      {urgency === 'today' && <FlameOrb3D />}
      {urgency === 'urgent' && <GoldenChrono3D />}
      {urgency === 'warning' && <VioletBell3D />}
    </div>
  );
}

// 🔴 1. 3D Ruby Crystal Shield (Overdue)
function RubyShield3D() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* 3D Rendered Vector Shield */}
      <svg
        viewBox="0 0 64 64"
        className="w-full h-full relative z-10 drop-shadow-[0_4px_12px_rgba(225,29,72,0.35)] animate-shield-tilt transition-transform duration-200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Base Shield Gradient */}
          <linearGradient id="rubyBase" x1="12" y1="8" x2="52" y2="58" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FB7185" />
            <stop offset="35%" stopColor="#E11D48" />
            <stop offset="75%" stopColor="#BE123C" />
            <stop offset="100%" stopColor="#881337" />
          </linearGradient>

          {/* Chamfered 3D Rim Gradient */}
          <linearGradient id="rubyRim" x1="10" y1="6" x2="54" y2="60" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFE4E6" />
            <stop offset="40%" stopColor="#FDA4AF" />
            <stop offset="80%" stopColor="#BE123C" />
            <stop offset="100%" stopColor="#4C0519" />
          </linearGradient>

          {/* Glossy Top Specular Highlight */}
          <linearGradient id="rubyGloss" x1="32" y1="12" x2="32" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>

          {/* Inner Core Warning Glow */}
          <radialGradient id="rubyCoreGlow" cx="32" cy="33" r="14" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFF1F2" />
            <stop offset="40%" stopColor="#FFE4E6" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FDA4AF" stopOpacity="0" />
          </radialGradient>

          {/* 3D Drop Shadow for Core Icon */}
          <filter id="shadow3d" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#4C0519" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* 3D Outer Rim */}
        <path
          d="M32 6L12 14V28C12 42.5 20.5 53 32 58C43.5 53 52 42.5 52 28V14L32 6Z"
          fill="url(#rubyRim)"
        />

        {/* 3D Beveled Main Shield Body */}
        <path
          d="M32 9L15 16V28C15 40.8 22.3 50.2 32 54.8C41.7 50.2 49 40.8 49 28V16L32 9Z"
          fill="url(#rubyBase)"
        />

        {/* Right Facet Shadow (for 3D depth) */}
        <path
          d="M32 9L49 16V28C49 40.8 41.7 50.2 32 54.8V9Z"
          fill="#4C0519"
          fillOpacity="0.25"
        />

        {/* Top Gloss Curve Glass Reflection */}
        <path
          d="M32 10L16.5 16.5C16.5 16.5 21 28 32 28C43 28 47.5 16.5 47.5 16.5L32 10Z"
          fill="url(#rubyGloss)"
        />

        {/* Specular Edge Sparkle */}
        <ellipse cx="23" cy="17" rx="5" ry="2" transform="rotate(-20 23 17)" fill="#FFFFFF" fillOpacity="0.75" />

        {/* Core Glowing Orb Backdrop */}
        <circle cx="32" cy="32" r="13" fill="url(#rubyCoreGlow)" />

        {/* 3D Warning Exclamation Symbol */}
        <g filter="url(#shadow3d)">
          {/* Main Exclamation Bar */}
          <rect x="29.5" y="21" width="5" height="13" rx="2.5" fill="#FFFFFF" />
          <rect x="30" y="22" width="2" height="10" rx="1" fill="#FFF1F2" />
          
          {/* Exclamation Dot */}
          <circle cx="32" cy="39" r="2.8" fill="#FFFFFF" />
          <circle cx="31.2" cy="38.2" r="1.2" fill="#FFE4E6" />
        </g>
      </svg>
    </div>
  );
}

// 🟠 2. 3D Glossy Ember Flame Orb (Due Today)
function FlameOrb3D() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg
        viewBox="0 0 64 64"
        className="w-full h-full relative z-10 drop-shadow-[0_4px_12px_rgba(249,115,22,0.35)] animate-flame-flicker transition-transform duration-200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Outer Sphere Gradient */}
          <radialGradient id="flameOrbBase" cx="24" cy="20" r="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FED7AA" />
            <stop offset="25%" stopColor="#FB923C" />
            <stop offset="65%" stopColor="#EA580C" />
            <stop offset="100%" stopColor="#9A3412" />
          </radialGradient>

          {/* 3D Glass Specular Cap */}
          <linearGradient id="flameSpecular" x1="32" y1="6" x2="32" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="70%" stopColor="#FFFFFF" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>

          {/* Inner Flame Core Gradient */}
          <linearGradient id="innerFire" x1="32" y1="48" x2="32" y2="16" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#DC2626" />
            <stop offset="45%" stopColor="#F97316" />
            <stop offset="85%" stopColor="#FDE047" />
            <stop offset="100%" stopColor="#FFFFFF" />
          </linearGradient>

          {/* Secondary Golden Flame Tongue */}
          <linearGradient id="goldFlame" x1="32" y1="46" x2="32" y2="26" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#EA580C" />
            <stop offset="60%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#FEF08A" />
          </linearGradient>
        </defs>

        {/* 3D Glossy Sphere Outer Base */}
        <circle cx="32" cy="32" r="26" fill="url(#flameOrbBase)" />

        {/* Bottom Ambient Occlusion Shadow */}
        <ellipse cx="32" cy="54" rx="18" ry="4" fill="#431407" fillOpacity="0.45" />

        {/* Outer Flame Contour */}
        <path
          d="M32 12C32 12 37.5 21 37.5 27.5C37.5 30.5 39.5 32 41.5 30C43.5 28 43.5 24 43.5 24C43.5 24 48 31 48 37.5C48 45.5 40.8 52 32 52C23.2 52 16 45.5 16 37.5C16 28.5 24 22 24 22C24 22 23 27 26.5 28C30 29 32 24.5 32 12Z"
          fill="url(#innerFire)"
          filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
        />

        {/* Inner Dancing Core Flame */}
        <path
          d="M32 26C32 26 35.5 31 35.5 35C35.5 37 37 38 38 36.5C39 35 39 33 39 33C39 33 42 37 42 41C42 46.5 37.5 50 32 50C26.5 50 22 46.5 22 41C22 35 27 31 27 31C27 31 26.5 34 28.5 34.5C30.5 35 32 32 32 26Z"
          fill="url(#goldFlame)"
        />

        {/* Bright White Hot Flame Center */}
        <ellipse cx="32" cy="44" rx="4.5" ry="5.5" fill="#FFFFFF" fillOpacity="0.9" />

        {/* 3D Specular Curved Highlight */}
        <ellipse cx="26" cy="16" rx="9" ry="4.5" transform="rotate(-30 26 16)" fill="url(#flameSpecular)" />
        <circle cx="38" cy="14" r="2.5" fill="#FFFFFF" fillOpacity="0.75" />
      </svg>
    </div>
  );
}

// 🟡 3. 3D Golden Chrono Orb (Urgent 1-2 Days)
function GoldenChrono3D() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg
        viewBox="0 0 64 64"
        className="w-full h-full relative z-10 drop-shadow-[0_4px_12px_rgba(217,119,6,0.35)] animate-chrono-tick transition-transform duration-200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* 3D Brushed Gold Bezel */}
          <linearGradient id="goldBezel" x1="10" y1="8" x2="54" y2="56" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FEF3C7" />
            <stop offset="30%" stopColor="#F59E0B" />
            <stop offset="70%" stopColor="#B45309" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>

          {/* Inner Clock Face Depth */}
          <radialGradient id="clockFace" cx="30" cy="28" r="22" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFBEB" />
            <stop offset="60%" stopColor="#FEF3C7" />
            <stop offset="90%" stopColor="#FDE68A" />
            <stop offset="100%" stopColor="#D97706" />
          </radialGradient>

          {/* Top Glass Specular Arc */}
          <linearGradient id="glassSpecular" x1="32" y1="12" x2="32" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>

          {/* Clock Hand Drop Shadow */}
          <filter id="handShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="1" dy="2" stdDeviation="1" floodColor="#78350F" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Outer 3D Gold Ring */}
        <circle cx="32" cy="32" r="26" fill="url(#goldBezel)" />

        {/* Chamfered Inset Border */}
        <circle cx="32" cy="32" r="22.5" fill="#78350F" fillOpacity="0.25" />

        {/* Recessed Inner Clock Face */}
        <circle cx="32" cy="32" r="21" fill="url(#clockFace)" />

        {/* Dial Hour Tick Marks (12, 3, 6, 9) */}
        <rect x="31" y="14" width="2" height="4" rx="1" fill="#B45309" />
        <rect x="31" y="46" width="2" height="4" rx="1" fill="#B45309" />
        <rect x="14" y="31" width="4" height="2" rx="1" fill="#B45309" />
        <rect x="46" y="31" width="4" height="2" rx="1" fill="#B45309" />

        {/* Subtle Diagonal Hour Marks */}
        <circle cx="20" cy="20" r="1" fill="#D97706" />
        <circle cx="44" cy="20" r="1" fill="#D97706" />
        <circle cx="20" cy="44" r="1" fill="#D97706" />
        <circle cx="44" cy="44" r="1" fill="#D97706" />

        {/* 3D Clock Hands with Real Depth */}
        <g filter="url(#handShadow)">
          {/* Hour Hand (pointing at ~10:10 or 3) */}
          <line x1="32" y1="32" x2="23" y2="23" stroke="#92400E" strokeWidth="3" strokeLinecap="round" />
          
          {/* Minute Hand (pointing at ~2) */}
          <line x1="32" y1="32" x2="43" y2="21" stroke="#B45309" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="32" y1="32" x2="43" y2="21" stroke="#D97706" strokeWidth="1.2" strokeLinecap="round" />

          {/* Center Golden Pivot */}
          <circle cx="32" cy="32" r="3.5" fill="#78350F" />
          <circle cx="32" cy="32" r="2.5" fill="#FEF3C7" />
          <circle cx="31.3" cy="31.3" r="1" fill="#FFFFFF" />
        </g>

        {/* 3D Curved Specular Glass Reflection Dome */}
        <path
          d="M14 26C16 18 23 13 32 13C41 13 48 18 50 26C45 23 38 21 32 21C26 21 19 23 14 26Z"
          fill="url(#glassSpecular)"
        />
        <ellipse cx="23" cy="18" rx="4" ry="2" transform="rotate(-30 23 18)" fill="#FFFFFF" fillOpacity="0.8" />
      </svg>
    </div>
  );
}

// 🟣 4. 3D Violet Hologram Bell (Warning 3-7 Days)
function VioletBell3D() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg
        viewBox="0 0 64 64"
        className="w-full h-full relative z-10 drop-shadow-[0_4px_12px_rgba(147,51,234,0.35)] animate-bell-chime transition-transform duration-200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* 3D Violet Glass Body */}
          <linearGradient id="violetBody" x1="16" y1="12" x2="48" y2="52" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#DDD6FE" />
            <stop offset="35%" stopColor="#A855F7" />
            <stop offset="75%" stopColor="#7E22CE" />
            <stop offset="100%" stopColor="#4C1D95" />
          </linearGradient>

          {/* 3D Chamfered Lip Gradient */}
          <linearGradient id="bellLip" x1="12" y1="46" x2="52" y2="46" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="50%" stopColor="#E9D5FF" />
            <stop offset="100%" stopColor="#6B21A8" />
          </linearGradient>

          {/* Golden/Neon Clapper */}
          <radialGradient id="clapperGrad" cx="30" cy="51" r="7" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="40%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#B45309" />
          </radialGradient>

          {/* Top Gloss Highlight */}
          <linearGradient id="bellGloss" x1="32" y1="12" x2="32" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>

          {/* Depth Drop Shadow */}
          <filter id="bellShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#2E1065" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Top Ring / Handle */}
        <circle cx="32" cy="14" r="5" stroke="#C084FC" strokeWidth="2.5" fill="none" />
        <ellipse cx="32" cy="12" rx="3" ry="1.5" fill="#FFFFFF" fillOpacity="0.7" />

        {/* Golden Clapper Hanging Below */}
        <ellipse cx="32" cy="52" rx="5.5" ry="5.5" fill="url(#clapperGrad)" filter="url(#bellShadow)" />
        <circle cx="30.5" cy="50.5" r="1.5" fill="#FFFFFF" fillOpacity="0.8" />

        {/* 3D Bell Body */}
        <path
          d="M32 15C23.5 15 19 22 19 32C19 39 16 43 14 45C14 45 16 48 32 48C48 48 50 45 50 45C48 43 45 39 45 32C45 22 40.5 15 32 15Z"
          fill="url(#violetBody)"
        />

        {/* Right Side Depth Shading */}
        <path
          d="M32 15C40.5 15 45 22 45 32C45 39 48 43 50 45C50 45 48 48 32 48V15Z"
          fill="#2E1065"
          fillOpacity="0.25"
        />

        {/* 3D Bottom Lip Rim */}
        <ellipse cx="32" cy="46" rx="17" ry="3.5" fill="url(#bellLip)" />

        {/* Specular Front Sheen */}
        <path
          d="M32 16C26 16 22 22 22 31C22 36 21 39 19 42C24 44 32 44 32 44V16Z"
          fill="url(#bellGloss)"
        />

        {/* Specular Glint Dots */}
        <ellipse cx="26" cy="22" rx="3.5" ry="7" transform="rotate(-15 26 22)" fill="#FFFFFF" fillOpacity="0.45" />
        <circle cx="28" cy="18" r="1.5" fill="#FFFFFF" fillOpacity="0.85" />
      </svg>
    </div>
  );
}
