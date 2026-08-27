"use client";

import { useEffect, useState, useRef } from "react";

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  const mounted = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!mounted.current) {
      mounted.current = true;
      setReduced(mq.matches);
    }
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return reduced;
}
