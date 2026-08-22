import { useRef, useLayoutEffect, useState } from 'react';
import type { ReactNode } from 'react';

interface AutoShrinkTextProps {
  text?: string;
  children?: ReactNode;
  className?: string;
  origin?: 'left' | 'center' | 'right';
  minScale?: number;
}

export default function AutoShrinkText({ 
  text, 
  children, 
  className = '', 
  origin = 'left',
  minScale = 0.5
}: AutoShrinkTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const calculateScale = () => {
      if (!containerRef.current || !textRef.current) return;
      const containerWidth = containerRef.current.clientWidth;
      const textWidth = textRef.current.scrollWidth;
      
      if (textWidth > containerWidth && containerWidth > 0 && textWidth > 0) {
        const calculatedScale = Math.max(containerWidth / textWidth, minScale);
        setScale(calculatedScale);
      } else {
        setScale(1);
      }
    };

    calculateScale();
    
    // ResizeObserver ensures scale recalculates immediately if container resizes or during layout shifts
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        calculateScale();
      });
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', calculateScale);
    return () => {
      window.removeEventListener('resize', calculateScale);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [text, children, minScale]);

  const justifyClass = origin === 'right' ? 'justify-end' : origin === 'center' ? 'justify-center' : 'justify-start';
  const transformOrigin = origin === 'right' ? 'right center' : origin === 'center' ? 'center center' : 'left center';

  return (
    <div 
      ref={containerRef} 
      className={`w-full overflow-hidden flex items-center ${justifyClass} ${className}`}
    >
      <span 
        ref={textRef} 
        style={{ 
          transform: `scale(${scale})`, 
          transformOrigin, 
          whiteSpace: 'nowrap', 
          display: 'inline-block',
          willChange: 'transform'
        }}
      >
        {children || text}
      </span>
    </div>
  );
}
