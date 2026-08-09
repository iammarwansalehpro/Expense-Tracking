import { useRef, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

interface AutoShrinkTextProps {
  text?: string;
  children?: ReactNode;
  className?: string;
}

export default function AutoShrinkText({ text, children, className = '' }: AutoShrinkTextProps) {
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

  return (
    <div ref={containerRef} className={`w-full overflow-hidden flex items-center ${className}`}>
      <span 
        ref={textRef} 
        style={{ 
          transform: `scale(${scale})`, 
          transformOrigin: 'left center', 
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
