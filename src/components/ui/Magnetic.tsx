import { useRef, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { usePrefs } from '../../lib/prefs';

type Props = {
  children: ReactNode;
  strength?: number;
  className?: string;
};

/**
 * Pulls its child toward the pointer with a soft spring, then lets it settle.
 * Disabled for touch and reduced-motion users — the child stays a normal button.
 */
export function Magnetic({ children, strength = 0.32, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const { reduced, finePointer } = usePrefs();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 260, damping: 24, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 260, damping: 24, mass: 0.5 });
  const enabled = finePointer && !reduced;

  return (
    <motion.span
      ref={ref}
      className={className}
      style={{ display: 'inline-flex', x: springX, y: springY }}
      onPointerMove={(event) => {
        if (!enabled || !ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        x.set((event.clientX - (rect.left + rect.width / 2)) * strength);
        y.set((event.clientY - (rect.top + rect.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.span>
  );
}
