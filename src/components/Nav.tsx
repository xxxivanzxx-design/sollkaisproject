import { useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
} from 'motion/react';
import { Magnetic } from './ui/Magnetic';
import { scrollToId, scrollToTop } from '../lib/smooth';
import './nav.css';

const LINKS = [
  { id: 'overview', label: 'Overview' },
  { id: 'lens', label: 'Display' },
  { id: 'specs', label: 'Specs' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'aperture', label: 'Display' },
  { id: 'playground', label: 'Playground' },
];

const EASE = [0.16, 1, 0.3, 1] as const;

export function Nav() {
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 180, damping: 32, mass: 0.4 });
  const [hidden, setHidden] = useState(false);
  const [lifted, setLifted] = useState(false);
  const [active, setActive] = useState('overview');
  const [tagsOn, setTagsOn] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastY = useRef(0);

  /* tags toggle — persisted, applied as a body class */
  useEffect(() => {
    const stored = window.localStorage.getItem('noctis:tags');
    const on = stored === null ? true : stored === '1';
    setTagsOn(on);
    document.body.classList.toggle('tags-on', on);
  }, []);

  const toggleTags = () => {
    setTagsOn((on) => {
      const next = !on;
      document.body.classList.toggle('tags-on', next);
      window.localStorage.setItem('noctis:tags', next ? '1' : '0');
      return next;
    });
  };

  /* hide on scroll down, reveal on scroll up */
  useMotionValueEvent(scrollY, 'change', (y) => {
    const delta = y - lastY.current;
    lastY.current = y;
    setLifted(y > 16);
    if (menuOpen) return;
    if (y < 140) setHidden(false);
    else if (delta > 4) setHidden(true);
    else if (delta < -4) setHidden(false);
  });

  /* which section owns the pill */
  useEffect(() => {
    const nodes = LINKS.map((l) => document.getElementById(l.id)).filter(
      (n): n is HTMLElement => Boolean(n),
    );
    if (!nodes.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: '-42% 0px -48% 0px', threshold: [0, 0.2, 0.6, 1] },
    );
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, []);

  const go = (id: string) => {
    setMenuOpen(false);
    scrollToId(id, -76);
  };

  return (
    <>
      <motion.header
        className={`nav${lifted ? ' nav--lifted' : ''}`}
        initial={{ y: -80 }}
        animate={{ y: hidden ? -96 : 0 }}
        transition={{ duration: 0.65, ease: EASE }}
      >
        <div className="nav__inner">
          <button className="nav__brand" onClick={scrollToTop} aria-label="NOCTIS — back to top">
            <span className="nav__mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
                <circle cx="12" cy="12" r="9.2" stroke="currentColor" strokeWidth="1.1" opacity="0.55" />
                <circle cx="12" cy="12" r="4.4" stroke="#ff5a1f" strokeWidth="1.2" />
                <circle cx="12" cy="12" r="1.15" fill="#ededea" />
                <path d="M12 2.8v2.2M12 19v2.2M2.8 12h2.2M19 12h2.2" stroke="currentColor" strokeWidth="1" opacity="0.5" />
              </svg>
            </span>
            <span className="nav__wordmark">NOCTIS</span>
            <span className="nav__model mono">18 PM</span>
          </button>

          <nav className="nav__links" aria-label="Sections">
            {LINKS.map((link) => (
              <button
                key={link.id}
                className={`nav__link${active === link.id ? ' is-active' : ''}`}
                onClick={() => go(link.id)}
              >
                {active === link.id && (
                  <motion.span
                    layoutId="nav-pill"
                    className="nav__pill"
                    transition={{ type: 'spring', stiffness: 380, damping: 34, mass: 0.7 }}
                  />
                )}
                <span className="nav__label">{link.label}</span>
              </button>
            ))}
          </nav>

          <div className="nav__right">
            <button
              className={`nav__toggle${tagsOn ? ' is-on' : ''}`}
              onClick={toggleTags}
              aria-pressed={tagsOn}
              title="Show the motion library behind each section"
            >
              <span className="nav__toggle-track" aria-hidden="true">
                <span className="nav__toggle-thumb" />
              </span>
              <span className="nav__toggle-label mono">Tags</span>
            </button>

            <Magnetic strength={0.22} className="nav__cta-wrap">
              <a className="btn btn--signal nav__cta" href="#reserve" onClick={(e) => { e.preventDefault(); go('reserve'); }}>
                Notify me
                <span className="mono nav__price">$1,299</span>
              </a>
            </Magnetic>

            <button
              className="nav__burger"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              <span className={`nav__burger-line${menuOpen ? ' is-x1' : ''}`} />
              <span className={`nav__burger-line${menuOpen ? ' is-x2' : ''}`} />
            </button>
          </div>
        </div>

        <motion.div className="nav__progress" style={{ scaleX: progress }} />
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="nav-sheet"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <div className="nav-sheet__inner">
              {LINKS.map((link, i) => (
                <motion.button
                  key={link.id}
                  className="nav-sheet__link"
                  onClick={() => go(link.id)}
                  initial={{ y: 26, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.06 + i * 0.05, duration: 0.7, ease: EASE }}
                >
                  <span className="mono nav-sheet__index">{String(i + 1).padStart(2, '0')}</span>
                  {link.label}
                </motion.button>
              ))}
              <motion.div
                className="nav-sheet__foot"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.36, duration: 0.6 }}
              >
                <span className="mono">48 MP · 120 HZ · 229 G</span>
                <span className="mono dim">Concept release</span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
