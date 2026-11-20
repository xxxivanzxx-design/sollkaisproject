import { useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { CountUp } from './ui/CountUp';
import { usePrefs } from '../lib/prefs';
import { MEDIA } from '../lib/media';
import { LibTag } from './ui/LibTag';
import './specs.css';

const DETAIL_IMG = {
  rear: MEDIA.rear,
  side: MEDIA.side,
  hand: MEDIA.hand,
  plinth: MEDIA.plinth,
  dial: MEDIA.dial,
};

const DETAILS = [
  {
    id: 'body',
    label: 'Body',
    value: '412 g',
    title: 'One piece of aluminium',
    copy: 'Milled from a single billet, then bead-blasted and anodised. No seams on the grip side, no plastic caps, no flex. The tripod socket is machined into the chassis itself.',
    img: DETAIL_IMG.side,
  },
  {
    id: 'dials',
    label: 'Dials',
    value: '2',
    title: 'Two dials. That is all.',
    copy: 'Shutter and aperture, diamond-knurled, with 0.4 Nm of detent torque. Every other setting lives behind one press of the rear wheel, so your thumb never leaves the shutter.',
    img: DETAIL_IMG.dial,
  },
  {
    id: 'screen',
    label: 'Screen',
    value: '3.1"',
    title: 'A screen you can trust at night',
    copy: 'A 2.1M-dot OLED that tilts 110° and dims to 2 nits, so the frame you see in a dark street is the frame you get. Touch is there if you want it; every control works with gloves.',
    img: DETAIL_IMG.rear,
  },
  {
    id: 'power',
    label: 'Power',
    value: '340',
    title: '340 frames, one battery',
    copy: 'A 1,250 mAh cell in the base plate. USB-C PD charges 0–80% in 38 minutes, and the camera runs from a power bank while it shoots tethered.',
    img: DETAIL_IMG.plinth,
  },
  {
    id: 'storage',
    label: 'Storage',
    value: '1 × CFe',
    title: 'One card. No compromise.',
    copy: 'A single CFexpress Type B slot behind the battery door. 61-megapixel uncompressed RAW writes at 1.4 GB/s, so the buffer clears before you lower the camera.',
    img: DETAIL_IMG.hand,
  },
  {
    id: 'sealing',
    label: 'Sealing',
    value: 'IP53',
    title: 'Weather is a feature',
    copy: 'Gasketed ports, a sealed lens mount and a hydrophobic mesh over the speaker. Rated for rain, dust and the kind of night where you should have gone home an hour ago.',
    img: DETAIL_IMG.dial,
  },
];

function SensorDiagram() {
  const cells = [];
  for (let r = 0; r < 9; r += 1) {
    for (let c = 0; c < 15; c += 1) {
      const hot = (r === 4 && c === 7) || (r === 3 && c === 7) || (r === 5 && c === 7) || (r === 4 && c === 6) || (r === 4 && c === 8);
      cells.push(
        <rect
          key={`${r}-${c}`}
          x={c * 9 + 2}
          y={r * 9 + 2}
          width="6"
          height="6"
          rx="1"
          fill={hot ? '#ff5a1f' : 'rgba(255,255,255,0.16)'}
          opacity={hot ? 1 : 0.28 + ((r * 15 + c) % 7) * 0.06}
        />,
      );
    }
  }
  return (
    <svg className="sensor" viewBox="0 0 139 85" aria-hidden="true">
      <rect x="0.5" y="0.5" width="138" height="84" rx="4" fill="none" stroke="rgba(255,255,255,0.1)" />
      {cells}
      <circle cx="79" cy="41" r="16" fill="none" stroke="#ff5a1f" strokeWidth="0.8" opacity="0.55" />
      <path d="M79 19v-6M79 63v6M57 41h-6M101 41h6" stroke="#ff5a1f" strokeWidth="0.8" opacity="0.7" />
    </svg>
  );
}

function SpotlightCard() {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(50);
  const my = useMotionValue(50);
  const sx = useSpring(mx, { stiffness: 140, damping: 22, mass: 0.4 });
  const sy = useSpring(my, { stiffness: 140, damping: 22, mass: 0.4 });
  const bg = useTransform(
    [sx, sy],
    ([x, y]: number[]) =>
      `radial-gradient(320px circle at ${x}% ${y}%, rgba(255,90,31,0.22), rgba(255,90,31,0.05) 42%, transparent 68%)`,
  );
  const { finePointer, reduced } = usePrefs();

  return (
    <div
      ref={ref}
      className="spot"
      onPointerMove={(e) => {
        if (!finePointer) return;
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        mx.set(((e.clientX - r.left) / r.width) * 100);
        my.set(((e.clientY - r.top) / r.height) * 100);
      }}
      onPointerLeave={() => {
        mx.set(50);
        my.set(50);
      }}
    >
      <motion.div className="spot__glow" style={{ background: reduced ? undefined : bg }} />
      <div className="spot__media">
        <img src={DETAIL_IMG.dial} alt="Macro of the shutter-speed dial" loading="lazy" />
      </div>
      <div className="spot__body">
        <span className="mono spec-card__k">Shutter</span>
        <span className="spec-card__big mono">
          <CountUp value={8000} prefix="1/" />
        </span>
        <p className="spec-card__copy">Mechanical, 1/8000 s, rated for 400,000 actuations.</p>
      </div>
    </div>
  );
}

export function Specs() {
  const [active, setActive] = useState(0);
  const detail = DETAILS[active];

  return (
    <section
      id="specs"
      className="section specs"
      data-lib="Motion · count + layout"
      aria-label="Specifications"
    >
      <div className="shell">
        <header className="specs__head">
          <div>
            <div className="eyebrow-row">
              <p className="eyebrow">03 — Numbers</p>
              <LibTag>Motion · count + layout</LibTag>
            </div>
            <h2 className="h2 specs__title">Specification,<br />not decoration.</h2>
          </div>
          <p className="lede specs__lede">
            Every number below is a decision someone had to defend. The sensor is bigger
            than the body suggests; everything else is smaller than you would expect.
          </p>
        </header>

        <div className="bento">
          <article className="panel bento__cell bento__cell--sensor">
            <div className="spec-card__top">
              <span className="mono spec-card__k">Sensor</span>
              <span className="mono spec-card__index">01</span>
            </div>
            <div className="spec-card__number">
              <CountUp value={61.2} decimals={1} />
              <span className="spec-card__unit mono">MP</span>
            </div>
            <p className="spec-card__copy">
              Full-frame backside-illuminated CMOS. 14-bit RAW, dual gain, and a base ISO
              of 64 that stays clean to 3200.
            </p>
            <SensorDiagram />
          </article>

          <article className="panel bento__cell bento__cell--mass">
            <div className="spec-card__top">
              <span className="mono spec-card__k">Mass</span>
              <span className="mono spec-card__index">02</span>
            </div>
            <div className="spec-card__number">
              <CountUp value={412} />
              <span className="spec-card__unit mono">g</span>
            </div>
            <p className="spec-card__copy">
              Including battery and card. Lighter than a 70–200mm lens hood.
            </p>
          </article>

          <article className="panel bento__cell bento__cell--iso">
            <div className="spec-card__top">
              <span className="mono spec-card__k">Native range</span>
              <span className="mono spec-card__index">03</span>
            </div>
            <div className="spec-card__number spec-card__number--sm">
              <CountUp value={102400} />
            </div>
            <p className="spec-card__copy">ISO 64–102,400, expandable to 409,600.</p>
          </article>

          <article className="panel bento__cell bento__cell--video">
            <div className="spec-card__top">
              <span className="mono spec-card__k">Video</span>
              <span className="mono spec-card__index">04</span>
            </div>
            <div className="spec-card__number spec-card__number--sm">
              <span className="mono">6K</span>
              <span className="spec-card__unit mono">60p</span>
            </div>
            <p className="spec-card__copy">10-bit 4:2:2 internal, 12-bit ProRes RAW over USB-C.</p>
          </article>

          <article className="panel bento__cell bento__cell--battery">
            <div className="spec-card__top">
              <span className="mono spec-card__k">Endurance</span>
              <span className="mono spec-card__index">05</span>
            </div>
            <div className="spec-card__number spec-card__number--sm">
              <CountUp value={340} />
              <span className="spec-card__unit mono">frames</span>
            </div>
            <p className="spec-card__copy">CIPA rated. 0–80% in 38 minutes over USB-C PD.</p>
          </article>

          <SpotlightCard />
        </div>

        <div className="detail">
          <div className="detail__list" role="tablist" aria-label="Body details">
            <div className="detail__list-head">
              <span className="mono">06 — The body, in detail</span>
              <span className="mono dim">{String(active + 1).padStart(2, '0')} / 06</span>
            </div>
            {DETAILS.map((item, i) => (
              <button
                key={item.id}
                role="tab"
                aria-selected={i === active}
                className={`detail__row${i === active ? ' is-active' : ''}`}
                onClick={() => setActive(i)}
                onPointerEnter={(e) => {
                  if (e.pointerType === 'mouse') setActive(i);
                }}
              >
                <span className="detail__row-dot" />
                <span className="detail__row-label">{item.label}</span>
                <span className="detail__row-value mono">{item.value}</span>
                <span className="detail__row-arrow" aria-hidden="true">
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    <path d="M1 5.5h8.4M6 1.6l3.9 3.9L6 9.4" stroke="currentColor" strokeWidth="1.1" />
                  </svg>
                </span>
              </button>
            ))}
          </div>

          <div className="detail__panel">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={detail.id}
                className="detail__panel-inner"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="detail__media">
                  <img src={detail.img} alt={detail.title} loading="lazy" />
                </div>
                <div className="detail__copy">
                  <h3 className="h3">{detail.title}</h3>
                  <p>{detail.copy}</p>
                  <span className="mono detail__meta">
                    {detail.label} — {detail.value}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
