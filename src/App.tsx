import { lazy, Suspense, useEffect } from 'react';
import { Nav } from './components/Nav';
import { Hero } from './components/Hero';
import { initSmoothScroll } from './lib/smooth';
import { usePrefs } from './lib/prefs';

const LensZoom = lazy(() => import('./components/LensZoom').then(({ LensZoom: Component }) => ({ default: Component })));
const Specs = lazy(() => import('./components/Specs').then(({ Specs: Component }) => ({ default: Component })));
const Gallery = lazy(() => import('./components/Gallery').then(({ Gallery: Component }) => ({ default: Component })));
const Aperture = lazy(() => import('./components/Aperture').then(({ Aperture: Component }) => ({ default: Component })));
const LensStage = lazy(() => import('./components/LensStage').then(({ LensStage: Component }) => ({ default: Component })));
const Playground = lazy(() => import('./components/Playground').then(({ Playground: Component }) => ({ default: Component })));
const Reserve = lazy(() => import('./components/Reserve').then(({ Reserve: Component }) => ({ default: Component })));

export function App() {
  const { reduced } = usePrefs();

  useEffect(() => {
    if (reduced) return;
    return initSmoothScroll();
  }, [reduced]);

  useEffect(() => {
    const seen = new Set<HTMLElement>();
    const observer = reduced ? null : new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer?.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

    const collect = () => {
      const targets = Array.from(document.querySelectorAll<HTMLElement>('.section .shell > *, .gallery__head, .gallery__panel, .reserve__card, .footer__top, .footer__bottom'));
      targets.forEach((node, index) => {
        if (seen.has(node)) return;
        seen.add(node);
        node.classList.add('reveal-item');
        node.style.setProperty('--reveal-delay', `${Math.min(index % 6, 5) * 55}ms`);
        if (reduced) node.classList.add('is-visible');
        else observer?.observe(node);
      });
    };

    collect();
    const mutations = new MutationObserver(collect);
    mutations.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer?.disconnect();
      mutations.disconnect();
    };
  }, [reduced]);

  return (
    <>
      <div className="grain" aria-hidden="true" />

      <Nav />

      <main id="top">
        <Hero />
        <Suspense fallback={null}>
          <LensZoom />
          <Specs />
          <Gallery />
          <Aperture />
          <LensStage />
          <Playground />
          <Reserve />
        </Suspense>
      </main>
    </>
  );
}
