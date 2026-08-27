"use client";

import { useEffect, useRef, ReactNode } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  style?: "fadeUp" | "fadeIn" | "fadeSlide";
}

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  duration = 900,
  style = "fadeUp",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced) return;

    let delayTimer: ReturnType<typeof setTimeout>;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          delayTimer = setTimeout(() => {
            el.style.transition = `opacity ${duration}ms cubic-bezier(0.22, 1, 0.36, 1), transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1)`;
            el.style.opacity = "1";
            el.style.transform = "translateY(0) scale(1)";
          }, delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px -20px 0px" }
    );

    el.style.opacity = "0";
    el.style.transform = style === "fadeUp" ? "translateY(12px) scale(0.98)" : "translateY(8px)";

    observer.observe(el);

    return () => {
      clearTimeout(delayTimer);
      observer.disconnect();
    };
  }, [delay, duration, style, prefersReduced]);

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
