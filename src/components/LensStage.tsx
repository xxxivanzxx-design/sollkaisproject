import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { usePrefs } from '../lib/prefs';
import { MEDIA } from '../lib/media';
import { LibTag } from './ui/LibTag';
import type { Finish } from './LensScene';
import './lensstage.css';

const LensScene = lazy(() => import('./LensScene'));

const SIDE_IMG = MEDIA.side;
const FINISHES: { id: Finish; label: string; color: string }[] = [
  { id: 'midnight', label: 'Midnight', color: '#26272b' },
  { id: 'silver', label: 'Silver', color: '#b8bbc1' },
  { id: 'ocean', label: 'Ocean', color: '#1d405d' },
  { id: 'desert', label: 'Desert', color: '#a8896f' },
];

export function LensStage() {
  const hostRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ tx: -0.08, ty: 0.35, active: false });
  const last = useRef({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [finish, setFinish] = useState<Finish>('midnight');
  const { reduced, compact } = usePrefs();
  const enabled = !reduced;

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setMounted(true);
        setVisible(entry.isIntersecting);
      },
      { rootMargin: '240px 0px', threshold: 0.01 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      id="stage"
      className="stage section"
      data-lib="React Three Fiber · lazy"
      aria-label="The display in 3D"
    >
      <div className="shell stage__grid">
        <div className="stage__copy">
          <div className="eyebrow-row">
            <p className="eyebrow">06 — In the round</p>
            <LibTag>React Three Fiber</LibTag>
          </div>
          <h2 className="h2 stage__title">
            Turn it over.
            <br />
            It is a real object.
          </h2>
          <p className="lede">
            Aerospace-grade titanium wraps a sculpted glass back. The camera island, buttons and
            Ceramic Shield surface are all modeled as one quiet, precise object.
          </p>

          <ul className="stage__specs">
            <li>
              <span className="mono">Frame</span>
              <span className="mono">Grade 5 titanium</span>
            </li>
            <li>
              <span className="mono">Glass</span>
              <span className="mono">Ceramic Shield</span>
            </li>
            <li>
              <span className="mono">Finishes</span>
              <span className="mono stage__accent">Midnight · Silver · Ocean · Desert</span>
            </li>
          </ul>

          <p className="stage__hint mono">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1" opacity="0.5" />
              <circle cx="7" cy="7" r="3.4" stroke="currentColor" strokeWidth="1" />
            </svg>
            Drag to rotate
          </p>
          <div className="stage__finishes" aria-label="Choose 3D phone finish">
            <span className="mono stage__finishes-label">3D finish / {finish}</span>
            <div className="stage__finish-buttons">
              {FINISHES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`stage__finish${finish === item.id ? ' is-active' : ''}`}
                  style={{ '--finish-color': item.color } as React.CSSProperties}
                  aria-label={`Show ${item.label} finish in 3D`}
                  aria-pressed={finish === item.id}
                  onClick={() => setFinish(item.id)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="stage__panel">
          <div
            className="stage__host"
            ref={hostRef}
            onPointerDown={(e) => {
              if (!enabled) return;
              drag.current.active = true;
              last.current = { x: e.clientX, y: e.clientY };
              e.currentTarget.setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
              if (!drag.current.active) return;
              const dx = e.clientX - last.current.x;
              const dy = e.clientY - last.current.y;
              last.current = { x: e.clientX, y: e.clientY };
              drag.current.ty += dx * 0.0075;
              drag.current.tx += dy * 0.0045;
            }}
            onPointerUp={() => {
              drag.current.active = false;
            }}
            onPointerCancel={() => {
              drag.current.active = false;
            }}
          >
            {mounted && enabled ? (
              <Suspense
                fallback={
                  <div className="stage__fallback">
                    <img src={SIDE_IMG} alt="" aria-hidden="true" />
                    <span className="mono">Loading device…</span>
                  </div>
                }
              >
                <LensScene drag={drag} active={visible} finish={finish} />
              </Suspense>
            ) : (
              <div className="stage__fallback stage__fallback--static">
                <img src={SIDE_IMG} alt="Side profile of the NOCTIS 18 Pro Max" loading="lazy" />
                <span className="mono">
                  {reduced ? '3D view off · reduced motion' : 'Static view'}
                </span>
              </div>
            )}

            <span className="stage__badge mono">R3F · 60 fps</span>
            <span className="stage__axis mono" aria-hidden="true">
              <span />
              <span />
            </span>
          </div>

          <div className="stage__panel-foot">
            <span className="mono">Apple iPhone 18 Pro Max GLB · local textures</span>
            <span className="mono dim">{compact ? 'Touch to rotate' : 'Pointer to rotate'}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
