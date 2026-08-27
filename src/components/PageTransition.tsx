"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [opacity, setOpacity] = useState(1);
  const [translateY, setTranslateY] = useState(0);
  const prevPathname = useRef(pathname);
  const animating = useRef(false);

  const animateIn = useCallback(() => {
    requestAnimationFrame(() => {
      setOpacity(1);
      setTranslateY(0);
      animating.current = false;
    });
  }, []);

  useEffect(() => {
    if (prevPathname.current !== pathname && !animating.current) {
      animating.current = true;
      setOpacity(0);
      setTranslateY(8);
      prevPathname.current = pathname;
      const timer = setTimeout(animateIn, 250);
      return () => clearTimeout(timer);
    }
  }, [pathname, animateIn]);

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        transition: "opacity 400ms cubic-bezier(0.22, 1, 0.36, 1), transform 400ms cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      {children}
    </div>
  );
}
