import React from 'react';
import { useSettingsStore, type Language } from '@/store/useSettingsStore';

interface PremiumLanguageSwitchProps {
  language?: Language;
  onChange?: (lang: Language) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function PremiumLanguageSwitch({
  language: propLang,
  onChange: propOnChange,
  size = 'md',
  className = '',
}: PremiumLanguageSwitchProps) {
  const storeLang = useSettingsStore((s) => s.language);
  const setStoreLang = useSettingsStore((s) => s.setLanguage);

  const currentLang = propLang || storeLang;
  const isEnglish = currentLang === 'en';

  const toggleLanguage = () => {
    const nextLang: Language = isEnglish ? 'th' : 'en';
    if (propOnChange) {
      propOnChange(nextLang);
    } else {
      setStoreLang(nextLang);
    }
  };

  // Dimensions configurations based on size
  const config = {
    sm: {
      width: 66,
      height: 32,
      blobSize: 24,
      travel: 34, // 66 - 24 - 4*2 = 34
      padding: 4,
      fontSize: 'text-[10px]',
    },
    md: {
      width: 76,
      height: 38,
      blobSize: 30,
      travel: 38, // 76 - 30 - 4*2 = 38
      padding: 4,
      fontSize: 'text-[11px]',
    },
    lg: {
      width: 92,
      height: 46,
      blobSize: 36,
      travel: 46, // 92 - 36 - 5*2 = 46
      padding: 5,
      fontSize: 'text-xs',
    },
  }[size];

  return (
    <div
      role="button"
      aria-label="Toggle Language"
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        toggleLanguage();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          toggleLanguage();
        }
      }}
      className={`relative select-none inline-flex items-center justify-between cursor-pointer rounded-full transition-transform active:scale-[0.96] outline-none ${className}`}
      style={{
        width: `${config.width}px`,
        height: `${config.height}px`,
        padding: `${config.padding}px`,
        background: 'var(--lang-track-bg, linear-gradient(145deg, #f8f8f8, #d9d9d9))',
        boxShadow:
          '0 3px 8px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* Neumorphic Inset Shadow Layer (Adapts to Light / Dark) */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none transition-all duration-300 dark:hidden"
        style={{
          boxShadow:
            'inset 4px 4px 8px rgba(0, 0, 0, 0.16), inset -4px -4px 8px rgba(255, 255, 255, 0.95)',
        }}
      />
      <div
        className="absolute inset-0 rounded-full pointer-events-none transition-all duration-300 hidden dark:block"
        style={{
          boxShadow:
            'inset 4px 4px 8px rgba(0, 0, 0, 0.75), inset -3px -3px 6px rgba(255, 255, 255, 0.07)',
          background: 'linear-gradient(145deg, #23183d, #110822)',
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
          transform: isEnglish
            ? `translateX(${config.travel}px)`
            : 'translateX(0px)',
          background: isEnglish
            ? 'linear-gradient(145deg, #3b82f6, #1d4ed8)' // Royal Blue for EN
            : 'linear-gradient(145deg, #a855f7, #7c3aed)', // Rich Purple for TH
          boxShadow: isEnglish
            ? '0 4px 12px rgba(59, 130, 246, 0.45), 2px 4px 8px rgba(0, 0, 0, 0.22), inset 1.5px 1.5px 3px rgba(255, 255, 255, 0.75), inset -1.5px -1.5px 3px rgba(29, 78, 216, 0.35)'
            : '0 4px 12px rgba(168, 85, 247, 0.45), 2px 4px 8px rgba(0, 0, 0, 0.22), inset 1.5px 1.5px 3px rgba(255, 255, 255, 0.75), inset -1.5px -1.5px 3px rgba(124, 58, 237, 0.35)',
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
            background:
              'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0) 80%)',
            transform: 'rotate(-25deg)',
          }}
        />
      </div>

      {/* TH Label Zone (Left) */}
      <div
        className={`relative z-[2] flex items-center justify-center font-black pointer-events-none transition-all duration-300 ${config.fontSize}`}
        style={{
          width: `${config.blobSize}px`,
          height: `${config.blobSize}px`,
          color: !isEnglish ? '#ffffff' : '#717f94',
          opacity: !isEnglish ? 1 : 0.65,
          filter: !isEnglish
            ? 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))'
            : 'drop-shadow(0 1px 0 rgba(255, 255, 255, 0.8))',
          transform: !isEnglish ? 'scale(1.05)' : 'scale(0.95)',
        }}
      >
        TH
      </div>

      {/* EN Label Zone (Right) */}
      <div
        className={`relative z-[2] flex items-center justify-center font-black pointer-events-none transition-all duration-300 ${config.fontSize}`}
        style={{
          width: `${config.blobSize}px`,
          height: `${config.blobSize}px`,
          color: isEnglish ? '#ffffff' : '#717f94',
          opacity: isEnglish ? 1 : 0.65,
          filter: isEnglish
            ? 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))'
            : 'drop-shadow(0 1px 0 rgba(255, 255, 255, 0.8))',
          transform: isEnglish ? 'scale(1.05)' : 'scale(0.95)',
        }}
      >
        EN
      </div>
    </div>
  );
}
