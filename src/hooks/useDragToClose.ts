import { useState, useRef, useEffect } from 'react';
import type { TouchEvent } from 'react';

interface UseDragToCloseProps {
  onClose: () => void;
  threshold?: number;
  disabled?: boolean;
}

export function useDragToClose({ onClose, threshold = 120, disabled = false }: UseDragToCloseProps) {
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);
  const isDraggingRef = useRef(false);

  // Prevent pull-to-refresh synchronously
  useEffect(() => {
    const preventDefault = (e: globalThis.TouchEvent) => {
      if (isDraggingRef.current && e.touches && e.touches.length > 0) {
        const y = e.touches[0].clientY;
        const delta = y - startY.current;
        if (delta > 0) {
          // If we are dragging the modal down, strictly prevent browser default (pull-to-refresh)
          if (e.cancelable) {
            e.preventDefault();
          }
        }
      }
    };
    
    // Attach globally and permanently, but it only acts when isDraggingRef is true
    document.addEventListener('touchmove', preventDefault, { passive: false });
    return () => document.removeEventListener('touchmove', preventDefault);
  }, []);

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (disabled) return;
    
    // If the target is within a scrollable container that is currently scrolled down,
    // don't start dragging the modal to allow native scrolling.
    const target = e.target as HTMLElement;
    const scrollable = target.closest('.overflow-y-auto') as HTMLElement;
    if (scrollable && scrollable.scrollTop > 5) {
      return;
    }

    startY.current = e.touches[0].clientY;
    currentY.current = e.touches[0].clientY;
    setIsDragging(true);
    isDraggingRef.current = true;
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!isDragging || disabled) return;
    
    const y = e.touches[0].clientY;
    currentY.current = y;
    const delta = y - startY.current;

    // Only allow dragging down
    if (delta > 0) {
      setTranslateY(delta);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging || disabled) return;
    setIsDragging(false);
    isDraggingRef.current = false;
    
    const delta = currentY.current - startY.current;
    if (delta > threshold) {
      // Send modal completely off screen, then close
      setTranslateY(window.innerHeight);
      setTimeout(() => {
        onClose();
        // Reset state for next time
        setTimeout(() => setTranslateY(0), 100);
      }, 250);
    } else {
      // Spring back
      setTranslateY(0);
    }
  };

  return {
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    style: {
      transform: `translateY(${translateY}px)`,
      transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
    }
  };
}
