import { useCallback, useEffect, useRef, useState } from 'react';
import { animate } from 'animejs';
import { usePrefs } from '../lib/prefs';
import { MEDIA } from '../lib/media';
import { LibTag } from './ui/LibTag';
import './aperture.css';

const PHOTO = MEDIA.street;
const BLADES = 9;
const R = 200;

/** one wedge, cut slightly wide so neighbours overlap instead of leaving seams */
const WEDGE = (() => {
  const L = R * 2.4;
  const half = Math.tan((Math.PI / BLADES) * 1.18) * L;
  return `M0,0 L${L.toFixed(2)},${(-half).toFixed(2)} L${L.toFixed(2)},${half.toFixed(2)} Z`;
})();

const fNumber = (o: number) => 1.4 * Math.pow(2, (1 - o) * 3.5);

export function Aperture() {
  const { reduced } = usePrefs();
  const stageRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const knobRef = useRef<HTMLSpanElement>(null);
  const bladeRefs = useRef<(SVGPathElement | null)[]>([]);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const blurRef = useRef<HTMLSpanElement>(null);
  const scaleRef = useRef<HTMLSpanElement>(null);
  const state = useRef({ o: 1 });
  const target = useRef(1);
  const dragging = useRef(false);
  const lastY = useRef(0);
  const [value, setValue] = useState(16);

  const paint = useCallback(() => {
    const o = Math.max(0, Math.min(1, state.current.o));
    // o = 1 (wide open) → blades pushed clear of the disc; o = 0 → a small f/16 opening
    const d = R * 0.13 + o * R * 1.75;

    bladeRefs.current.forEach((el, i) => {
      el?.setAttribute('transform', `rotate(${i * (360 / BLADES)}) translate(${d.toFixed(2)} 0)`);
    });

    if (imgRef.current) {
      imgRef.current.style.filter = `blur(${((1 - o) * 17).toFixed(2)}px) brightness(${(
        0.5 + o * 0.55
      ).toFixed(3)}) saturate(${(0.7 + o * 0.4).toFixed(3)})`;
    }

    if (knobRef.current) {
      const angle = ((90 - o * 64) * Math.PI) / 180;
      knobRef.current.style.left = `${50 + Math.cos(angle) * 47.4}%`;
      knobRef.current.style.top = `${50 + Math.sin(angle) * 47.4}%`;
    }

    if (readoutRef.current) {
      const f = fNumber(o);
      readoutRef.current.textContent = `f/${f < 10 ? f.toFixed(1) : f.toFixed(0)}`;
    }
    if (blurRef.current) blurRef.current.textContent = `${((1 - o) * 17).toFixed(1)} px`;
    if (scaleRef.current) scaleRef.current.style.transform = `scaleX(${o.toFixed(3)})`;

    setValue(Math.round(o * 100));
  }, []);

  const drive = useCallback(
    (next: number, duration = 320) => {
      target.current = Math.max(0, Math.min(1, next));
      animate(state.current, {
        o: target.current,
        duration: reduced ? 0 : duration,
        ease: 'outQuart',
        onUpdate: paint,
      });
    },
    [paint, reduced],
  );

  useEffect(() => {
    paint();
  }, [paint]);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    lastY.current = e.clientY;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dy = e.clientY - lastY.current;
    lastY.current = e.clientY;
    drive(target.current - dy / 260, 380);
  };

  const endDrag = () => {
    dragging.current = false;
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
      e.preventDefault();
      drive(target.current + 0.08, 260);
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
      e.preventDefault();
      drive(target.current - 0.08, 260);
    }
  };

  return (
    <section
      id="aperture"
      className="ap section"
      data-lib="Anime.js · iris + blur"
      aria-label="Colorways"
    >
      <div className="shell ap__grid">
        <div className="ap__copy">
          <div className="eyebrow-row">
            <p className="eyebrow">05 — Colorways</p>
            <LibTag>Anime.js · iris + blur</LibTag>
          </div>
          <h2 className="h2 ap__title">
            Four finishes.
            <br />
            One unmistakable silhouette.
          </h2>
          <p className="lede">
            A rounded nine-blade diaphragm that stays circular down to f/4, so a streetlight
            at f/2 is a disc, not a polygon. Drag the ring and watch the glass give up its
            depth.
          </p>

          <div className="ap__readouts">
            <div className="ap__readout">
              <span className="mono ap__readout-k">Display</span>
              <span className="mono ap__readout-v" ref={readoutRef}>
                2,400 nits
              </span>
            </div>
            <div className="ap__readout">
              <span className="mono ap__readout-k">Blur</span>
              <span className="mono ap__readout-v ap__readout-v--sm" ref={blurRef}>
                0.0 px
              </span>
            </div>
            <div className="ap__readout ap__readout--scale">
              <span className="mono ap__readout-k">Open</span>
              <span className="ap__scale">
                <span className="ap__scale-fill" ref={scaleRef} />
              </span>
            </div>
          </div>

          <p className="ap__hint mono">
            <span className="ap__hint-dot" />
            Drag up to shift color · double-click to reset
          </p>
        </div>

        <div className="ap__stage-wrap">
          <div
            className="ap__stage"
            ref={stageRef}
            role="slider"
            tabIndex={0}
            aria-label="Display opening"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={value}
            aria-valuetext={`f/${fNumber(state.current.o).toFixed(1)}`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onDoubleClick={() => drive(1, 700)}
            onKeyDown={onKeyDown}
          >
            <div className="ap__photo">
              <img ref={imgRef} src={PHOTO} alt="Night street photographed at 2,400 nits" loading="lazy" />
            </div>

            <svg className="ap__iris" viewBox={`${-R} ${-R} ${R * 2} ${R * 2}`} aria-hidden="true">
              <defs>
                <clipPath id="ap-clip">
                  <circle r={R} />
                </clipPath>
                <linearGradient id="ap-blade" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1b1b1f" />
                  <stop offset="100%" stopColor="#0e0e10" />
                </linearGradient>
                <linearGradient id="ap-blade-b" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#212126" />
                  <stop offset="100%" stopColor="#121215" />
                </linearGradient>
              </defs>
              <g clipPath="url(#ap-clip)">
                {Array.from({ length: BLADES }).map((_, i) => (
                  <path
                    key={i}
                    ref={(el) => {
                      bladeRefs.current[i] = el;
                    }}
                    d={WEDGE}
                    fill={i % 2 ? 'url(#ap-blade-b)' : 'url(#ap-blade)'}
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="0.6"
                  />
                ))}
              </g>
              <circle
                r={R - 1}
                fill="none"
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="1"
                strokeDasharray="1 9"
                strokeLinecap="round"
              />
            </svg>

            <span className="ap__ring" aria-hidden="true" />
            <span className="ap__knob" ref={knobRef} aria-hidden="true">
              <span className="ap__knob-grip" />
            </span>
          </div>

          <div className="ap__stage-foot">
            <span className="mono">120 Hz · 9 blades · 2,400 nits–f/16</span>
            <span className="mono dim">Anime.js · eased, not snapped</span>
          </div>
        </div>
      </div>
    </section>
  );
}
