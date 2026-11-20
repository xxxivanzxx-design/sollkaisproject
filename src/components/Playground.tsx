import { useCallback, useEffect, useRef, useState } from 'react';
import { animate as animateMotion, motion } from 'motion/react';
import { animate as animateAnime } from 'animejs';
import { gsap } from '../lib/smooth';
import { usePrefs } from '../lib/prefs';
import { LibTag } from './ui/LibTag';
import './playground.css';

type Engine = 'gsap' | 'motion' | 'anime' | 'css';
type EaseKey = 'expo' | 'power' | 'linear';

const ENGINES: { id: Engine; label: string; lib: string }[] = [
  { id: 'gsap', label: 'GSAP', lib: 'gsap.to' },
  { id: 'motion', label: 'Motion', lib: 'animate()' },
  { id: 'anime', label: 'Anime.js', lib: 'animate()' },
  { id: 'css', label: 'CSS', lib: 'transition' },
];

const EASES: Record<EaseKey, { label: string; gsap: string; motion: [number, number, number, number] | 'linear'; anime: string; css: string }> = {
  expo: { label: 'expo.out', gsap: 'expo.out', motion: [0.16, 1, 0.3, 1], anime: 'outExpo', css: 'cubic-bezier(.16,1,.3,1)' },
  power: { label: 'power3.inOut', gsap: 'power3.inOut', motion: [0.65, 0, 0.35, 1], anime: 'inOutQuad', css: 'cubic-bezier(.65,0,.35,1)' },
  linear: { label: 'linear', gsap: 'none', motion: 'linear', anime: 'linear', css: 'linear' },
};

const DISTANCE = 64;

export function Playground() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [engine, setEngine] = useState<Engine>('gsap');
  const [ease, setEase] = useState<EaseKey>('expo');
  const [duration, setDuration] = useState(1100);
  const [runs, setRuns] = useState(0);
  const { reduced } = usePrefs();

  const run = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;
    const d = reduced ? 0 : duration / 1000;
    const e = EASES[ease];

    el.classList.remove('is-css-run');
    el.style.transition = 'none';
    el.style.transform = 'translate3d(0,0,0) rotate(0deg) scale(1)';
    gsap.killTweensOf(el);
    // force a style flush so every engine starts from the same place
    void el.offsetWidth;

    if (engine === 'gsap') {
      gsap.to(el, {
        y: -DISTANCE,
        rotate: -6,
        scale: 1.05,
        duration: d,
        ease: e.gsap,
      });
    } else if (engine === 'motion') {
      animateMotion(
        el,
        { y: -DISTANCE, rotate: -6, scale: 1.05 },
        { duration: d, ease: e.motion },
      );
    } else if (engine === 'anime') {
      animateAnime(el, {
        y: [0, -DISTANCE],
        rotate: [0, -6],
        scale: [1, 1.05],
        duration: d * 1000,
        ease: e.anime,
      });
    } else {
      el.style.transition = `transform ${d}s ${e.css}`;
      void el.offsetWidth;
      el.classList.add('is-css-run');
    }
    setRuns((r) => r + 1);
  }, [duration, ease, engine, reduced]);

  useEffect(() => {
    const t = window.setTimeout(run, 260);
    return () => window.clearTimeout(t);
  }, [engine, run]);

  const snippet: Record<Engine, string> = {
    gsap: `gsap.to(el, {
  y: -${DISTANCE}, rotate: -6, scale: 1.05,
  duration: ${(duration / 1000).toFixed(2)},
  ease: '${EASES[ease].gsap}'
});`,
    motion: `animate(el, {
  y: -${DISTANCE}, rotate: -6, scale: 1.05
}, {
  duration: ${(duration / 1000).toFixed(2)},
  ease: [${EASES[ease].motion === 'linear' ? '0,0,1,1' : EASES[ease].motion.join(', ')}]
});`,
    anime: `animate(el, {
  y: [0, -${DISTANCE}],
  rotate: [0, -6],
  scale: [1, 1.05],
  duration: ${duration},
  ease: '${EASES[ease].anime}'
});`,
    css: `.el {
  transition: transform ${(duration / 1000).toFixed(2)}s ${EASES[ease].css};
}
.el.run {
  transform: translateY(-${DISTANCE}px)
    rotate(-6deg) scale(1.05);
}`,
  };

  return (
    <section
      id="playground"
      className="pg section"
      data-lib="GSAP · Motion · Anime · CSS"
      aria-label="Motion playground"
    >
      <div className="shell">
        <header className="pg__head">
          <div>
            <div className="eyebrow-row">
              <p className="eyebrow">07 — Playground</p>
              <LibTag>GSAP · Motion · Anime · CSS</LibTag>
            </div>
            <h2 className="h2 pg__title">Same move.<br />Four engines.</h2>
          </div>
          <p className="lede pg__lede">
            One transform, four implementations. Change the duration or the curve and run it
            again — the pixels should be indistinguishable. That is the whole test.
          </p>
        </header>

        <div className="pg__board">
          <div className="pg__stage">
            <div className="pg__grid" aria-hidden="true" />
            <div className="pg__baseline" aria-hidden="true">
              <span className="mono">0</span>
            </div>
            <div className="pg__target" aria-hidden="true" />
            <div className="pg__card" ref={cardRef}>
              <span className="pg__card-mark" aria-hidden="true">
                <svg viewBox="0 0 40 40" width="40" height="40" fill="none">
                  <circle cx="20" cy="20" r="15" stroke="rgba(237,237,234,.5)" strokeWidth="1" />
                  <circle cx="20" cy="20" r="7.4" stroke="#ff5a1f" strokeWidth="1.4" />
                  <circle cx="20" cy="20" r="2" fill="#ededea" />
                </svg>
              </span>
              <span className="pg__card-label mono">NOCTIS C1</span>
              <span className="pg__card-sub mono">drag · no</span>
            </div>
            <span className="pg__run-count mono" key={runs}>
              run {String(runs).padStart(3, '0')}
            </span>
          </div>

          <div className="pg__controls">
            <div className="pg__tabs" role="tablist" aria-label="Motion library">
              {ENGINES.map((e) => (
                <button
                  key={e.id}
                  role="tab"
                  aria-selected={engine === e.id}
                  className={`pg__tab${engine === e.id ? ' is-active' : ''}`}
                  onClick={() => setEngine(e.id)}
                >
                  {engine === e.id && (
                    <motion.span
                      layoutId="pg-pill"
                      className="pg__tab-pill"
                      transition={{ type: 'spring', stiffness: 420, damping: 36, mass: 0.6 }}
                    />
                  )}
                  <span className="pg__tab-label">{e.label}</span>
                </button>
              ))}
            </div>

            <div className="pg__params">
              <label className="pg__param">
                <span className="mono pg__param-k">
                  Duration <span className="pg__param-v">{duration} ms</span>
                </span>
                <input
                  type="range"
                  min={300}
                  max={2000}
                  step={50}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  onPointerUp={run}
                  onKeyUp={run}
                />
              </label>

              <div className="pg__param">
                <span className="mono pg__param-k">Easing</span>
                <div className="pg__eases">
                  {(Object.keys(EASES) as EaseKey[]).map((k) => (
                    <button
                      key={k}
                      className={`pg__ease${ease === k ? ' is-active' : ''}`}
                      onClick={() => setEase(k)}
                    >
                      <span className="mono">{EASES[k].label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pg__code">
              <div className="pg__code-head">
                <span className="mono">{ENGINES.find((e) => e.id === engine)?.lib}</span>
                <span className="mono dim">{engine.toUpperCase()}</span>
              </div>
              <pre className="mono">
                <code>{snippet[engine]}</code>
              </pre>
            </div>

            <button className="btn btn--signal pg__run" onClick={run}>
              Run the move
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2 1.4 10.4 6 2 10.6V1.4Z" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
