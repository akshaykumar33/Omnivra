"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "motion/react";

/**
 * Pulls its child a short distance toward the pointer.
 *
 * On a page whose whole argument is "the machine should meet you where you
 * are", a control that leans toward your cursor is thematic rather than
 * ornamental. Kept to a few pixels: past roughly 10 the effect stops reading as
 * responsiveness and starts reading as a bug.
 *
 * Position lives in motion values, so none of this re-renders React. Under
 * reduced motion the wrapper renders its child untouched.
 */
export function Magnetic({
  children,
  strength = 0.35,
  radius = 90,
}: {
  children: React.ReactNode;
  strength?: number;
  radius?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

  if (reduce) return <>{children}</>;

  const handleMove = (event: React.PointerEvent<HTMLSpanElement>) => {
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    const distance = Math.hypot(dx, dy);
    if (distance > radius) {
      x.set(0);
      y.set(0);
      return;
    }
    const falloff = 1 - distance / radius;
    x.set(dx * strength * falloff);
    y.set(dy * strength * falloff);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.span
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      style={{ x: springX, y: springY, display: "inline-block" }}
    >
      {children}
    </motion.span>
  );
}
