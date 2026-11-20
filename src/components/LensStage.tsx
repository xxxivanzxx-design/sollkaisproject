import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { usePrefs } from '../lib/prefs';
import { MEDIA } from '../lib/media';
import { LibTag } from './ui/LibTag';
import './lensstage.css';

const LensScene = lazy(() => import('./LensScene'));

const SIDE_IMG = MEDIA.side;

export function LensStage() {
  const hostRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ tx: -0.08, ty: 0.35, active: false });
  const last = useRef({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
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
      aria-label="The lens in 3D"
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
            The barrel is one turned aluminium tube. The focus ring is cut, not printed.
            The only colour on the camera is a 0.4 mm anodised ring under the front element.
          </p>

          <ul className="stage__specs">
            <li>
              <span className="mono">Barrel</span>
              <span className="mono">Turned aluminium, 96 mm</span>
            </li>
            <li>
              <span className="mono">Focus ring</span>
              <span className="mono">76 diamond cuts</span>
            </li>
            <li>
              <span className="mono">Accent</span>
              <span className="mono stage__accent">Signal orange, 0.4 mm</span>
            </li>
          </ul>

          <p className="stage__hint mono">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1" opacity="0.5" />
              <circle cx="7" cy="7" r="3.4" stroke="currentColor" strokeWidth="1" />
            </svg>
            Drag to rotate
          </p>
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
                    <span className="mono">Loading lens…</span>
                  </div>
                }
              >
                <LensScene drag={drag} active={visible} />
              </Suspense>
            ) : (
              <div className="stage__fallback stage__fallback--static">
                <img src={SIDE_IMG} alt="Side profile of the NOCTIS C1" loading="lazy" />
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
            <span className="mono">Procedural geometry · no model download</span>
            <span className="mono dim">{compact ? 'Touch to rotate' : 'Pointer to rotate'}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
