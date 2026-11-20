import { useEffect, useRef } from 'react';
import { gsap } from '../lib/smooth';
import { usePrefs } from '../lib/prefs';
import { MEDIA } from '../lib/media';
import { LibTag } from './ui/LibTag';
import './gallery.css';

const IMG = {
  plinth: MEDIA.plinth,
  hand: MEDIA.hand,
  side: MEDIA.side,
  rear: MEDIA.rear,
  street: MEDIA.street,
};

const PANELS = [
  {
    kind: 'image',
    src: IMG.plinth,
    caption: 'Concrete, 21:40',
    meta: '28mm · f/1.4 · 1/60 · ISO 3200',
    size: 'wide',
    pos: '24% 50%',
  },
  {
    kind: 'quote',
    text: 'The best camera is the one you forget you are holding.',
    meta: 'FIELD NOTES — VOL. 03',
    size: 'narrow',
  },
  {
    kind: 'image',
    src: IMG.street,
    caption: 'Rain, 23:12',
    meta: '28mm · f/1.4 · 1/30 · ISO 6400',
    size: 'mid',
  },
  {
    kind: 'image',
    src: IMG.hand,
    caption: 'Handheld, 19:58',
    meta: '28mm · f/2 · 1/125 · ISO 800',
    size: 'tall',
    pos: '50% 42%',
  },
  {
    kind: 'image',
    src: IMG.rear,
    caption: 'The back, 02:14',
    meta: '3.1" OLED · 2.1M dots',
    size: 'mid',
  },
  {
    kind: 'image',
    src: IMG.side,
    caption: 'Profile, studio',
    meta: '96 × 62 × 29 mm',
    size: 'wide',
    pos: '50% 50%',
  },
];

export function Gallery() {
  const rootRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const { reduced, compact } = usePrefs();

  useEffect(() => {
    const root = rootRef.current;
    const pin = pinRef.current;
    const track = trackRef.current;
    if (!root || !pin || !track || reduced || compact) return;

    const ctx = gsap.context(() => {
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth + 48);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: () => `+=${distance() + window.innerHeight * 0.35}`,
          pin,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (barRef.current) barRef.current.style.transform = `scaleX(${self.progress})`;
            if (countRef.current) {
              const idx = Math.min(
                PANELS.length,
                Math.max(1, Math.round(self.progress * (PANELS.length - 1)) + 1),
              );
              countRef.current.textContent = String(idx).padStart(2, '0');
            }
          },
        },
      });

      tl.to(track, { x: () => -distance(), ease: 'none', duration: 1 }, 0);

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    }, root);

    return () => ctx.revert();
  }, [reduced, compact]);

  return (
    <section
      id="gallery"
      className="gallery"
      ref={rootRef}
      data-lib="GSAP · horizontal pin"
      aria-label="Gallery"
    >
      <div className="gallery__pin" ref={pinRef}>
        <header className="gallery__head shell">
          <div>
            <div className="eyebrow-row">
              <p className="eyebrow">04 — Frames</p>
              <LibTag>GSAP · horizontal pin</LibTag>
            </div>
            <h2 className="h2 gallery__title">No retouching. No excuses.</h2>
          </div>
          <div className="gallery__meter">
            <span className="mono gallery__count">
              <span ref={countRef}>01</span>
              <span className="dim"> / 0{PANELS.length}</span>
            </span>
            <span className="gallery__bar">
              <span className="gallery__bar-fill" ref={barRef} />
            </span>
          </div>
        </header>

        <div className="gallery__viewport">
          <div className="gallery__track" ref={trackRef}>
            {PANELS.map((panel, i) =>
              panel.kind === 'quote' ? (
                <figure className={`gallery__panel gallery__panel--${panel.size} gallery__panel--quote`} key={i}>
                  <blockquote>{panel.text}</blockquote>
                  <figcaption className="mono">{panel.meta}</figcaption>
                </figure>
              ) : (
                <figure className={`gallery__panel gallery__panel--${panel.size}`} key={i}>
                  <img
                    src={panel.src}
                    alt={panel.caption}
                    loading="lazy"
                    decoding="async"
                    style={{ objectPosition: panel.pos }}
                  />
                  <figcaption>
                    <span className="mono gallery__cap">{panel.caption}</span>
                    <span className="mono gallery__meta">{panel.meta}</span>
                  </figcaption>
                </figure>
              ),
            )}
            <div className="gallery__panel gallery__panel--end gallery__panel--narrow">
              <p className="mono">End of roll</p>
              <p className="h3">Six frames from one night in Osaka.</p>
              <span className="mono dim">Shot on NOCTIS C1 · 61.2 MP · no crop</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
