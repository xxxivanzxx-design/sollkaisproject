import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

let instance: Lenis | null = null;

/**
 * Lenis driven by the GSAP ticker: one clock for both libraries, so scrubbed
 * ScrollTriggers never lag a frame behind the smoothed scroll position.
 */
export function initSmoothScroll(): () => void {
  if (instance) return () => {};

  const lenis = new Lenis({
    duration: 1.15,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 0.95,
    touchMultiplier: 1.7,
    syncTouch: false,
  });

  instance = lenis;
  if (typeof window !== 'undefined') {
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    (window as unknown as { __gsap?: typeof gsap }).__gsap = gsap;
    (window as unknown as { __st?: typeof ScrollTrigger }).__st = ScrollTrigger;
  }

  lenis.on('scroll', ScrollTrigger.update);

  const tick = (time: number) => {
    lenis.raf(time * 1000);
  };

  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  // keep pinned measurements honest once webfonts and images settle
  const refresh = () => ScrollTrigger.refresh();
  const t = window.setTimeout(refresh, 450);
  document.fonts?.ready.then(refresh).catch(() => {});

  return () => {
    window.clearTimeout(t);
    gsap.ticker.remove(tick);
    lenis.destroy();
    instance = null;
  };
}

export function scrollToId(id: string, offset = -72) {
  const el = document.getElementById(id);
  if (!el) return;
  if (instance) {
    instance.scrollTo(el, { offset, duration: 1.4 });
  } else {
    const y = el.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
}

export function scrollToTop() {
  if (instance) instance.scrollTo(0, { duration: 1.6 });
  else window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function getScroll() {
  return instance ? instance.scroll : window.scrollY;
}
