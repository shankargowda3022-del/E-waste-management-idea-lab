import React, { useEffect, useState, useRef } from 'react';

export const InteractiveCursor: React.FC = () => {
  const [enabled, setEnabled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Position references - updated directly without triggering React re-renders
  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });

  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const isHoveredRef = useRef(false);

  useEffect(() => {
    // Only enable on desktop pointer devices with fine control
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!isFinePointer || prefersReducedMotion) {
      setEnabled(false);
      return;
    }

    setEnabled(true);

    let isVisible = false;
    let animFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;

      if (!isVisible) {
        isVisible = true;
        if (dotRef.current) dotRef.current.style.opacity = '1';
        if (ringRef.current) ringRef.current.style.opacity = '1';
      }

      // Check if hovering an interactive target (efficient DOM check)
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = Boolean(
          target.closest('button, a, input, select, textarea, [role="button"], .cursor-pointer, [data-interactive]')
        );
        if (interactive !== isHoveredRef.current) {
          isHoveredRef.current = interactive;
          setIsHovered(interactive);
        }
      }
    };

    const handleMouseLeave = () => {
      isVisible = false;
      if (dotRef.current) dotRef.current.style.opacity = '0';
      if (ringRef.current) ringRef.current.style.opacity = '0';
    };

    const handleMouseEnter = () => {
      isVisible = true;
      if (dotRef.current) dotRef.current.style.opacity = '1';
      if (ringRef.current) ringRef.current.style.opacity = '1';
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // Ultra-smooth 60/120fps hardware-accelerated physics loop
    const render = () => {
      // Smooth linear interpolation for trailing ring (no lag, buttery motion)
      const lerpFactor = 0.18;
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * lerpFactor;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * lerpFactor;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0) translate(-50%, -50%)`;
      }

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%)`;
      }

      animFrameId = requestAnimationFrame(render);
    };

    animFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      cancelAnimationFrame(animFrameId);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[99999] overflow-hidden"
      aria-hidden="true"
    >
      {/* 1. Smooth Trailing Ring with Hover Expansion (No click animation) */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 w-7 h-7 rounded-full opacity-0 pointer-events-none transition-[border-color,background-color,box-shadow] duration-200 ease-out will-change-transform ${
          isHovered
            ? 'border-[1.5px] border-[#16A36A] bg-[#B9F5D0]/35 shadow-[0_0_16px_rgba(22,163,106,0.22)]'
            : 'border border-[#123D32]/35 bg-[#16A36A]/5 shadow-[0_0_8px_rgba(18,61,50,0.08)]'
        }`}
        style={{
          marginLeft: 0,
          marginTop: 0
        }}
      >
        <div
          className={`w-full h-full rounded-full transition-transform duration-200 ease-out ${
            isHovered ? 'scale-150 bg-[#B9F5D0]/20' : 'scale-100'
          }`}
        />
      </div>

      {/* 2. Precision Center Core Dot */}
      <div
        ref={dotRef}
        className={`fixed top-0 left-0 w-2 h-2 rounded-full opacity-0 pointer-events-none transition-[background-color,transform] duration-150 ease-out will-change-transform ${
          isHovered
            ? 'bg-[#123D32] shadow-[0_0_6px_rgba(18,61,50,0.4)]'
            : 'bg-[#16A36A] shadow-[0_0_5px_rgba(22,163,106,0.35)]'
        }`}
      />
    </div>
  );
};
