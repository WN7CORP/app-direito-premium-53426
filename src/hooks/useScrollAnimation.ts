import { useEffect, useRef } from 'react';

export const useScrollAnimation = (threshold = 0.1, rootMargin = '50px') => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
          }
        });
      },
      { 
        threshold,
        rootMargin // Pre-load elementos antes de aparecerem
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return elementRef;
};

// Hook otimizado para múltiplos elementos
export const useBatchScrollAnimation = (
  elementsCount: number,
  threshold = 0.1,
  maxAnimated = 20 // Limita animações para melhor performance
) => {
  const elementsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
          }
        });
      },
      { 
        threshold,
        rootMargin: '100px' // Maior pre-load para listas
      }
    );

    // Observa apenas os primeiros N elementos para melhor performance
    const elementsToObserve = elementsRef.current.slice(0, maxAnimated);
    elementsToObserve.forEach(element => {
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [elementsCount, threshold, maxAnimated]);

  return elementsRef;
};
