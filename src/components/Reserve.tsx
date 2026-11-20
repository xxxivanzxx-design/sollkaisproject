import { useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Magnetic } from './ui/Magnetic';
import { scrollToId, scrollToTop } from '../lib/smooth';
import { MEDIA } from '../lib/media';
import { LibTag } from './ui/LibTag';
import './reserve.css';

const BG = MEDIA.hand;

const FOOTER_LINKS = [
  { label: 'Overview', id: 'overview' },
  { label: 'Display', id: 'lens' },
  { label: 'Specs', id: 'specs' },
  { label: 'Gallery', id: 'gallery' },
  { label: 'Display', id: 'aperture' },
  { label: 'Playground', id: 'playground' },
];

export function Reserve() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'done' | 'error'>('idle');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
    if (!ok) {
      setState('error');
      return;
    }
    try {
      window.localStorage.setItem('noctis:reservation', email.trim());
    } catch {
      /* storage is optional */
    }
    setState('done');
  };

  return (
    <>
      <section
        id="reserve"
        className="reserve"
        data-lib="Motion · magnetic CTA"
        aria-label="Join the list"
      >
        <div className="reserve__bg" aria-hidden="true">
          <img src={BG} alt="" loading="lazy" />
        </div>
        <div className="shell reserve__inner">
          <div className="reserve__lead">
            <div className="eyebrow-row">
              <p className="eyebrow">08 — Join the list</p>
              <LibTag>Motion · magnetic CTA</LibTag>
            </div>
            <h2 className="display reserve__title">
              Make it yours
              <br />
              before the moment.
            </h2>
            <p className="reserve__sub">
              The first production run is limited to 2,000 bodies. Reservations are free,
              refundable and transferable.
            </p>
          </div>

          <div className="reserve__card panel">
            <div className="reserve__card-head">
              <div>
                <span className="mono reserve__k">NOCTIS 18 Pro Max — 256 GB</span>
                <div className="reserve__price mono">
                  $1,299
                  <span className="reserve__price-note mono">or $108/mo · 12 mo</span>
                </div>
              </div>
              <span className="mono reserve__stock">
                <span className="reserve__stock-dot" />
                Early access open
              </span>
            </div>

            <ul className="reserve__list">
              <li>
                <span className="mono">Finishes</span>
                <span className="mono">Midnight · Silver · Ocean · Desert</span>
              </li>
              <li>
                <span className="mono">Availability</span>
                <span className="mono">Concept release · details to follow</span>
              </li>
              <li>
                <span className="mono">Status</span>
                <span className="mono">No payment now</span>
              </li>
            </ul>

            <AnimatePresence mode="wait" initial={false}>
              {state === 'done' ? (
                <motion.div
                  key="done"
                  className="reserve__done"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span className="mono reserve__done-mark">You are on the list</span>
                  <p>
                    We will write to <strong>{email.trim()}</strong>. We will write once,
                    when this concept enters the next phase.
                  </p>
                  <button className="link-underline" onClick={() => setState('idle')}>
                    Use a different address
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  className="reserve__form"
                  onSubmit={submit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  noValidate
                >
                  <label className="sr-only" htmlFor="reserve-email">
                    Email address
                  </label>
                  <input
                    id="reserve-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="you@studio.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (state === 'error') setState('idle');
                    }}
                    className={`reserve__input${state === 'error' ? ' is-error' : ''}`}
                    aria-invalid={state === 'error'}
                  />
                  <Magnetic strength={0.18}>
                    <button className="btn btn--signal reserve__submit" type="submit">
                      Notify me
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                        <path d="M2 6.5h9M7.4 2.6l3.9 3.9-3.9 3.9" stroke="currentColor" strokeWidth="1.3" />
                      </svg>
                    </button>
                  </Magnetic>
                </motion.form>
              )}
            </AnimatePresence>

            <p className="mono reserve__fine">
              {state === 'error'
                ? 'That address does not look right. Try again.'
                : 'Concept only. No payment is taken.'}
            </p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="shell">
          <div className="footer__top">
            <div className="footer__brand">
              <span className="footer__wordmark">slproject</span>
              <p className="footer__tag">Designed for the next long day.</p>
            </div>
            <nav className="footer__links" aria-label="Footer">
              {FOOTER_LINKS.map((l) => (
                <button key={l.id} onClick={() => scrollToId(l.id, -76)}>
                  {l.label}
                </button>
              ))}
            </nav>
            <div className="footer__meta">
              <span className="mono">Concept notes</span>
              <span className="mono">Specifications</span>
              <span className="mono">Support</span>
            </div>
          </div>

          <div className="footer__bottom">
            <span className="mono">© 2027 slproject studio — A fictional product study.</span>
            <span className="mono footer__build">Built with GSAP · Motion · Anime.js · R3F</span>
            <button className="mono footer__top-btn" onClick={scrollToTop}>
              Back to top
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
                <path d="M5.5 9.5V1.6M1.6 5.5 5.5 1.6l3.9 3.9" stroke="currentColor" strokeWidth="1.1" />
              </svg>
            </button>
          </div>
        </div>
      </footer>
    </>
  );
}
