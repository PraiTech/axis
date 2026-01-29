import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useGSAPAnimations() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Animate numbers count-up
      gsap.utils.toArray('.count-up').forEach((element: any) => {
        const endValue = parseFloat(element.textContent?.replace(/[^0-9.]/g, '') || '0');
        gsap.fromTo(
          element,
          { textContent: 0 },
          {
            textContent: endValue,
            duration: 2,
            ease: 'power2.out',
            snap: { textContent: 1 },
            scrollTrigger: {
              trigger: element,
              start: 'top 80%',
            },
          }
        );
      });

      // Fade in on scroll
      gsap.utils.toArray('.fade-in-on-scroll').forEach((element: any) => {
        gsap.fromTo(
          element,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: element,
              start: 'top 80%',
            },
          }
        );
      });

      // Parallax effect
      gsap.utils.toArray('.parallax').forEach((element: any) => {
        gsap.to(element, {
          y: -100,
          ease: 'none',
          scrollTrigger: {
            trigger: element,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return containerRef;
}
