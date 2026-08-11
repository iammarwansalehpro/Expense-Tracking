import { useRef, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

interface AutoShrinkTextProps {
  text?: string;
  children?: ReactNode;
  className?: string;
  origin?: 'left' | 'center' | 'right';
}

export default function AutoShrinkText({ text, children, className = '', origin = 'left' }: AutoShrinkTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const calculateScale = () => {
      if (!containerRef.current || !textRef.current) return;
      const containerWidth = containerRef.current.clientWidth;
      const textWidth = textRef.current.scrollWidth;
      
      if (textWidth > containerWidth && containerWidth > 0) {
        setScale(containerWidth / textWidth);
      } else {
        setScale(1);
      }
    };

    calculateScale();
    
    // Add resize listener just in case container resizes
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, [text, children]);

  const justifyClass = origin === 'right' ? 'justify-end' : origin === 'center' ? 'justify-center' : 'justify-start';
  const transformOrigin = origin === 'right' ? 'right center' : origin === 'center' ? 'center center' : 'left center';

  return (
    <div ref={containerRef} className={`w-full overflow-hidden flex items-center ${justifyClass} ${className}`}>
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
