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
