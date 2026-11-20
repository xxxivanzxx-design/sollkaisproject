import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Prefs = {
  /** user asked the OS to reduce motion */
  reduced: boolean;
  /** small viewport: no pinning, no scrubbing, no WebGL */
  compact: boolean;
  /** pointer is a real mouse (enables magnetic / spotlight behaviour) */
  finePointer: boolean;
};

const DEFAULT: Prefs = { reduced: false, compact: false, finePointer: true };

const PrefsContext = createContext<Prefs>(DEFAULT);

function read(): Prefs {
  if (typeof window === 'undefined') return DEFAULT;
  const reduceQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  const compactQ = window.matchMedia('(max-width: 860px)');
  const pointerQ = window.matchMedia('(hover: hover) and (pointer: fine)');
  return {
    reduced: reduceQ.matches,
    compact: compactQ.matches,
    finePointer: pointerQ.matches,
  };
}

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Prefs>(read);

  useEffect(() => {
    const queries = [
      window.matchMedia('(prefers-reduced-motion: reduce)'),
      window.matchMedia('(max-width: 860px)'),
      window.matchMedia('(hover: hover) and (pointer: fine)'),
    ];
    const sync = () => setPrefs(read());
    queries.forEach((q) => q.addEventListener('change', sync));
    return () => queries.forEach((q) => q.removeEventListener('change', sync));
  }, []);

  const value = useMemo(() => prefs, [prefs.reduced, prefs.compact, prefs.finePointer]);
  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>;
}

export function usePrefs() {
  return useContext(PrefsContext);
}
