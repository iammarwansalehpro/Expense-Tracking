import { useRef, useLayoutEffect, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';

interface AutoShrinkTextProps {
  text?: string;
  children?: ReactNode;
  className?: string;
  origin?: 'left' | 'center' | 'right';
  minScale?: number;
  maxScale?: number;
}

export default function AutoShrinkText({ 
  text, 
  children, 
  className = '', 
  origin = 'left',
  minScale = 0.25,
  maxScale = 1.0
}: AutoShrinkTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [scale, setScale] = useState(1);

  const calculateScale = useCallback(() => {
    if (!containerRef.current || !textRef.current) return;
    
    // Measure available container width (excluding horizontal padding)
    const container = containerRef.current;
    const textEl = textRef.current;

    const containerStyle = window.getComputedStyle(container);
    const paddingLeft = parseFloat(containerStyle.paddingLeft) || 0;
    const paddingRight = parseFloat(containerStyle.paddingRight) || 0;
    const availableWidth = container.clientWidth - paddingLeft - paddingRight;

    // Measure raw unscaled text width
    // Using scrollWidth or offsetWidth of unconstrained span
    const textWidth = textEl.scrollWidth || textEl.offsetWidth;

    if (availableWidth > 0 && textWidth > 0) {
      if (textWidth > availableWidth) {
        const rawScale = availableWidth / textWidth;
        const calculatedScale = Math.min(maxScale, Math.max(rawScale, minScale));
        setScale(calculatedScale);
      } else {
        setScale(1);
      }
    } else {
      setScale(1);
    }
  }, [minScale, maxScale]);

  useLayoutEffect(() => {
    calculateScale();

    // Re-calculate after animation frame for modals / transitions
    const rafId = requestAnimationFrame(() => {
      calculateScale();
    });

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        calculateScale();
      });
      resizeObserver.observe(containerRef.current);
      if (textRef.current) {
        resizeObserver.observe(textRef.current);
      }
    }

    window.addEventListener('resize', calculateScale);

    // Font loading listener
    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.ready.then(() => {
        calculateScale();
      });
    }

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', calculateScale);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [text, children, minScale, maxScale, calculateScale]);

  // Recalculate on any DOM content change or language switch
  useEffect(() => {
    const timer = setTimeout(calculateScale, 50);
    return () => clearTimeout(timer);
  }, [text, children, calculateScale]);

  const justifyClass = origin === 'right' ? 'justify-end' : origin === 'center' ? 'justify-center' : 'justify-start';
  const transformOrigin = origin === 'right' ? 'right center' : origin === 'center' ? 'center center' : 'left center';

  return (
    <div 
      ref={containerRef} 
      className={`w-full max-w-full overflow-hidden flex items-center min-w-0 ${justifyClass} ${className}`}
      style={{ overflow: 'hidden' }}
    >
      <span 
        ref={textRef} 
        style={{ 
          transform: scale < 1 ? `scale(${scale})` : 'none', 
          transformOrigin, 
          whiteSpace: 'nowrap', 
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: origin === 'right' ? 'flex-end' : origin === 'center' ? 'center' : 'flex-start',
          willChange: 'transform',
          maxWidth: 'none',
          width: 'max-content',
          textOverflow: 'clip'
        }}
      >
        {children || text}
      </span>
    </div>
  );
}
