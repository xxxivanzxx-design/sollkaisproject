import { useEffect } from 'react';
import { Nav } from './components/Nav';
import { Hero } from './components/Hero';
import { LensZoom } from './components/LensZoom';
import { Specs } from './components/Specs';
import { Gallery } from './components/Gallery';
import { Aperture } from './components/Aperture';
import { LensStage } from './components/LensStage';
import { Playground } from './components/Playground';
import { Reserve } from './components/Reserve';
import { initSmoothScroll } from './lib/smooth';
import { usePrefs } from './lib/prefs';

export function App() {
  const { reduced } = usePrefs();

  useEffect(() => {
    if (reduced) return;
    return initSmoothScroll();
  }, [reduced]);

  useEffect(() => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>('.section .shell > *, .gallery__head, .gallery__panel, .reserve__card, .footer__top, .footer__bottom'));
    targets.forEach((node) => node.classList.add('reveal-item'));
    if (reduced) {
      targets.forEach((node) => node.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    targets.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [reduced]);

  return (
    <>
      <div className="grain" aria-hidden="true" />

      <Nav />

      <main id="top">
        <Hero />
        <LensZoom />
        <Specs />
        <Gallery />
        <Aperture />
        <LensStage />
        <Playground />
        <Reserve />
      </main>
    </>
  );
}
