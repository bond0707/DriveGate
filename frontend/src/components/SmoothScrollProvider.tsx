'use client';
import { createContext, useContext, useEffect, useState, useCallback, startTransition, ReactNode } from 'react';
import Lenis from 'lenis';

interface SmoothScrollContextType {
  lenis: Lenis | null;
  scrollTo: (target: string | number | HTMLElement) => void;
}

const SmoothScrollContext = createContext<SmoothScrollContextType>({
  lenis: null,
  scrollTo: () => { },
});

export const useSmoothScroll = () => useContext(SmoothScrollContext);

interface SmoothScrollProviderProps {
  children: ReactNode;
}

export default function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    const lenisInstance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 2,
    });

    startTransition(() => {
      setLenis(lenisInstance);
    });

    function raf(time: number) {
      lenisInstance.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenisInstance.destroy();
    };
  }, []);

  const scrollTo = useCallback((target: string | number | HTMLElement) => {
    lenis?.scrollTo(target, { offset: -80 });
  }, [lenis]);

  return (
    <SmoothScrollContext.Provider value={{ lenis, scrollTo }}>
      {children}
    </SmoothScrollContext.Provider>
  );
}
