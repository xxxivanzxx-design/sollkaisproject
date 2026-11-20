import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { SplitText } from 'gsap/SplitText';
import { gsap, ScrollTrigger } from '../lib/smooth';
import { usePrefs } from '../lib/prefs';
import { scrollToId } from '../lib/smooth';
import { MEDIA } from '../lib/media';
import { LibTag } from './ui/LibTag';
import './hero.css';

const HERO_IMG = MEDIA.hero;
const COLORWAYS = [
  { id: 'midnight', label: 'Midnight', color: '#242428', image: MEDIA.midnight, material: 'Grade 5 titanium', display: '2,400 nits peak', battery: 'Up to 29 hours' },
  { id: 'silver', label: 'Silver', color: '#c6c7c9', image: MEDIA.silver, material: 'Brushed titanium', display: '2,400 nits peak', battery: 'Up to 29 hours' },
  { id: 'ocean', label: 'Ocean', color: '#17344c', image: MEDIA.blue, material: 'Anodised titanium', display: '2,400 nits peak', battery: 'Up to 29 hours' },
  { id: 'desert', label: 'Desert', color: '#a98e72', image: MEDIA.sand, material: 'Warm titanium', display: '2,400 nits peak', battery: 'Up to 29 hours' },
] as const;

const STATS = [
  { k: 'Thickness', v: '8.4 mm' },
  { k: 'Weight', v: '229 g' },
  { k: 'Battery', v: 'Up to 29 hours' },
  { k: 'Video', v: '4K 120 fps · ProRes' },
];

export function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const lensRef = useRef<HTMLSpanElement>(null);
  const holeRef = useRef<SVGCircleElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const { reduced, compact } = usePrefs();
  const [finish, setFinish] = useState<(typeof COLORWAYS)[number]['id']>('midnight');
  const selected = COLORWAYS.find((item) => item.id === finish) ?? COLORWAYS[0];

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    const title = titleRef.current;
    if (!root || !stage || !title) return;

    if (reduced) {
      gsap.set(title, { opacity: 1 });
      return;
    }

    let split: SplitText | null = null;
    const ctx = gsap.context(() => {
      split = SplitText.create(title, {
        type: 'lines,chars',
        mask: 'lines',
        linesClass: 'hero__line',
        charsClass: 'hero__char',
        autoSplit: true,
      });
      gsap.set(title, { opacity: 1 });

      /* ── entrance ─────────────────────────────────────────── */
      const intro = gsap.timeline({ delay: 0.18, defaults: { ease: 'expo.out' } });
      intro
        .from(split.lines, { yPercent: 116, duration: 1.4, stagger: 0.085 })
        .from('.hero__media img', { scale: 1.14, duration: 2.1, ease: 'expo.out' }, 0)
        .from('.hero__reveal', { y: 26, opacity: 0, duration: 1.1, stagger: 0.07 }, 0.42)
        .from('.hero__foot-cell', { opacity: 0, y: 16, duration: 0.9, stagger: 0.055 }, 0.6);

      /* ── pinned exit ──────────────────────────────────────── */
      if (compact) return;

      const irisMetrics = () => {
        const s = stage.getBoundingClientRect();
        const l = lensRef.current?.getBoundingClientRect();
        const cx = l ? l.left - s.left + l.width / 2 : s.width * 0.66;
        const cy = l ? l.top - s.top + l.height / 2 : s.height * 0.47;
        const maxR = Math.hypot(Math.max(cx, s.width - cx), Math.max(cy, s.height - cy));
        return { cx, cy, maxR };
      };

      const place = () => {
        const { cx, cy } = irisMetrics();
        gsap.set([holeRef.current, ringRef.current], { attr: { cx, cy } });
      };
      place();

      const exit = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: '+=130%',
          pin: stage,
          pinSpacing: true,
          scrub: 0.65,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefresh: place,
        },
      });

      exit
        .to('.hero__reveal', {
          filter: 'blur(12px)',
          opacity: 0,
          y: -22,
          duration: 0.36,
          stagger: 0.05,
          ease: 'power2.in',
        }, 0)
        .to('.hero__scroll', { opacity: 0, duration: 0.3 }, 0)
        .to('.hero__media img', { scale: 1.07, duration: 1.1, ease: 'none' }, 0)
        .to(
          split.chars,
          {
            opacity: 0,
            yPercent: -7,
            filter: 'blur(7px)',
            duration: 0.5,
            ease: 'power1.in',
            stagger: { each: 0.007, from: 'random' },
          },
          0.05,
        )
        .fromTo(
          [holeRef.current, ringRef.current],
          { attr: { r: () => irisMetrics().maxR } },
          { attr: { r: 0 }, duration: 0.72, ease: 'power2.inOut' },
          0.26,
        )
        .to(ringRef.current, { opacity: 0, duration: 0.16 }, 0.9)
        /* hold on black for the last beat before the pin releases */
        .set({}, {}, 1.12);

      return () => {
        exit.scrollTrigger?.kill();
        exit.kill();
      };
    }, root);

    return () => {
      ctx.revert();
      split?.revert();
      ScrollTrigger.refresh();
    };
  }, [reduced, compact]);

  return (
    <section
      id="overview"
      className="hero"
      ref={rootRef}
      data-lib="GSAP · SplitText + pin"
      aria-label="NOCTIS 18 Pro Max overview"
    >
      <div className="hero__stage" ref={stageRef}>
        <div className="hero__media" aria-hidden="true">
          <img src={HERO_IMG} alt={`${selected.label} titanium finish`} fetchPriority="high" decoding="async" />
          <span
            className="hero__finish-tint"
            style={{ '--finish-tone': selected.color } as React.CSSProperties}
          />
          <span className="hero__lens" ref={lensRef} />
          <span className="hero__media-fade" />
        </div>

        <div className="hero__content shell">
          <div className="eyebrow-row hero__reveal">
            <p className="eyebrow">NOCTIS 18 Pro Max — iPhone 18 Pro Max concept</p>
            <LibTag>GSAP · SplitText + pin</LibTag>
          </div>

          <h1 className="hero__title" ref={titleRef}>
            The next large thing.
          </h1>

          <p className="hero__sub hero__reveal">
            A titanium-and-glass flagship with a cinematic display, pro camera system and all-day power. Designed for the hours that matter.
          </p>

          <div className="hero__actions hero__reveal">
            <a
              className="btn btn--signal"
              href="#reserve"
              onClick={(e) => {
                e.preventDefault();
                scrollToId('reserve', -76);
              }}
            >
              Notify me — $1,299
            </a>
            <a
              className="btn btn--ghost"
              href="#lens"
              onClick={(e) => {
                e.preventDefault();
                scrollToId('lens', -76);
              }}
            >
              Explore the display
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                <path d="M3 10L10 3M10 3H4.4M10 3V8.6" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            </a>
          </div>

          <div className="hero__colors hero__reveal" aria-label="Choose a finish">
            <span className="mono hero__colors-label">Finish / {selected.label}</span>
            <div className="hero__swatches">
              {COLORWAYS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`hero__swatch${finish === item.id ? ' is-active' : ''}`}
                  style={{ '--swatch': item.color } as React.CSSProperties}
                  aria-label={`Select ${item.label} finish`}
                  aria-pressed={finish === item.id}
                  onClick={() => setFinish(item.id)}
                />
              ))}
            </div>
          </div>

          <motion.div
            className="hero__finish-meta hero__reveal"
            key={selected.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="mono">{selected.material}</span>
            <span className="mono">{selected.display}</span>
            <span className="mono">{selected.battery}</span>
          </motion.div>
        </div>

        <div className="hero__foot shell">
          {STATS.map((s) => (
            <div className="hero__foot-cell" key={s.k}>
              <span className="mono hero__foot-k">{s.k}</span>
              <span className="mono hero__foot-v">{s.v}</span>
            </div>
          ))}
        </div>

        <div className="hero__scroll" aria-hidden="true">
          <span className="mono">Scroll</span>
          <span className="hero__scroll-track">
            <span className="hero__scroll-dot" />
          </span>
        </div>

        <svg className="hero__iris" aria-hidden="true">
          <defs>
            <mask id="noctis-iris-mask" maskUnits="userSpaceOnUse">
              <rect x="0" y="0" width="100%" height="100%" fill="#fff" />
              <circle ref={holeRef} cx="0" cy="0" r="9999" fill="#000" />
            </mask>
            <filter id="noctis-iris-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <rect width="100%" height="100%" fill="#0b0b0c" mask="url(#noctis-iris-mask)" />
          <circle
            ref={ringRef}
            cx="0"
            cy="0"
            r="9999"
            fill="none"
            stroke="#8B5CFF"
            strokeWidth="1.4"
            filter="url(#noctis-iris-glow)"
          />
        </svg>
      </div>
    </section>
  );
}
