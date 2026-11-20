import { useEffect, useRef } from 'react';
import { gsap } from '../lib/smooth';
import { usePrefs } from '../lib/prefs';
import { MEDIA } from '../lib/media';
import { LibTag } from './ui/LibTag';
import './lenszoom.css';

const LENS_IMG = MEDIA.lens;

const CALLOUTS = [
  {
    d: 'M50,52 L34,26 L8,26',
    x: 8,
    y: 26,
    align: 'left',
    title: '8 elements / 2 aspherical',
    meta: 'FLOATING REAR GROUP',
  },
  {
    d: 'M50,52 L67,29 L92,29',
    x: 92,
    y: 29,
    align: 'right',
    title: 'Nano-coated front element',
    meta: '0.2% REFLECTANCE',
  },
  {
    d: 'M50,52 L33,74 L9,74',
    x: 9,
    y: 74,
    align: 'left',
    title: 'f/1.4 maximum aperture',
    meta: '9 ROUNDED BLADES',
  },
  {
    d: 'M50,52 L68,77 L91,77',
    x: 91,
    y: 77,
    align: 'right',
    title: '28mm equivalent',
    meta: 'FIXED · NO ZOOM',
  },
] as const;

export function LensZoom() {
  const rootRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const { reduced, compact } = usePrefs();

  useEffect(() => {
    const root = rootRef.current;
    const pin = pinRef.current;
    if (!root || !pin || reduced || compact) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: '+=165%',
          pin,
          scrub: 0.7,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      tl.fromTo(
        '.zoom__img',
        { scale: 1.02, yPercent: 0 },
        { scale: 2.15, yPercent: 1.5, duration: 1, ease: 'none' },
        0,
      )
        .to('.zoom__head', { opacity: 0, y: -40, filter: 'blur(8px)', duration: 0.32, ease: 'power2.in' }, 0.06)
        .fromTo(
          '.callout__path',
          { strokeDashoffset: 1000 },
          { strokeDashoffset: 0, duration: 0.4, stagger: 0.07, ease: 'power2.out' },
          0.14,
        )
        .fromTo(
          '.callout__dot',
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.18, stagger: 0.07, ease: 'expo.out' },
          0.12,
        )
        .fromTo(
          '.callout__label',
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.28, stagger: 0.07, ease: 'expo.out' },
          0.3,
        )
        .to('.zoom__callouts', { opacity: 0, duration: 0.3, ease: 'power2.in' }, 0.78)
        .to('.zoom__veil', { opacity: 0.82, duration: 0.4 }, 0.72);

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    }, root);

    return () => ctx.revert();
  }, [reduced, compact]);

  return (
    <section
      id="lens"
      className="zoom"
      ref={rootRef}
      data-lib="GSAP · scrubbed zoom"
      aria-label="The lens"
    >
      <div className="zoom__pin" ref={pinRef}>
        <div className="zoom__media">
          <img
            className="zoom__img"
            src={LENS_IMG}
            alt="Macro view of the NOCTIS C1 lens barrel and front element"
            loading="lazy"
            decoding="async"
          />
        </div>

        <div className="zoom__veil" />

        <div className="zoom__head shell">
          <div className="eyebrow-row">
            <p className="eyebrow">02 — The glass</p>
            <LibTag>GSAP · scrubbed zoom</LibTag>
          </div>
          <h2 className="h2 zoom__title">
            Eight elements.
            <br />
            One intention.
          </h2>
          <p className="zoom__lede">
            A fixed 28mm f/1.4 prime, computed as one optical system rather than a
            compromise between zoom ranges. It does not zoom. It does not wobble.
          </p>
        </div>

        <div className="zoom__callouts" aria-hidden="true">
          <svg className="zoom__lines" viewBox="0 0 100 100" preserveAspectRatio="none">
            {CALLOUTS.map((c) => (
              <path
                key={c.d}
                className="callout__path"
                d={c.d}
                fill="none"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>

          {CALLOUTS.map((c) => (
            <div
              key={c.title}
              className={`callout callout--${c.align}`}
              style={{ left: `${c.x}%`, top: `${c.y}%` }}
            >
              <span className="callout__dot" />
              <div className="callout__label">
                <span className="mono callout__title">{c.title}</span>
                <span className="mono callout__meta">{c.meta}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="zoom__hud">
          <div className="zoom__readout">
            <span className="mono zoom__readout-k">Aperture</span>
            <span className="mono zoom__readout-value">f/1.4</span>
          </div>
          <div className="zoom__readout">
            <span className="mono zoom__readout-k">Focal</span>
            <span className="mono zoom__readout-value">28mm</span>
          </div>
          <div className="zoom__readout zoom__readout--dim">
            <span className="mono zoom__readout-k">Min focus</span>
            <span className="mono zoom__readout-value">0.28m</span>
          </div>
        </div>
      </div>
    </section>
  );
}
