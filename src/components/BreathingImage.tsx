"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface BreathingImageProps {
  children: React.ReactNode;
  className?: string;
}

export function BreathingImage({ children, className = "" }: BreathingImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced) return;

    let frame: number;
    let start: number | null = null;
    const duration = 4000; // 4 seconds per cycle
    const maxScale = 1.01;

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = ((timestamp - start) % duration) / duration;
      // Smooth sine wave: 1 → 1.01 → 1
      const scale = 1 + (maxScale - 1) * Math.sin(progress * Math.PI);
      el.style.transform = `scale(${scale})`;
      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [prefersReduced]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}
