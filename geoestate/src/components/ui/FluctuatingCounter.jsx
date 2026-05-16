'use client';

import { useEffect, useRef, useState } from 'react';

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

export default function FluctuatingCounter({
  base = 23421,
  range = 90,
  interval = 2600,
  duration = 1400,
}) {
  const [display, setDisplay] = useState(base);
  const currentRef = useRef(base);
  const rafRef = useRef(null);

  useEffect(() => {
    function animateTo(target) {
      const from = currentRef.current;
      const diff = target - from;
      const startTime = performance.now();

      function tick(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const value = Math.round(from + diff * easeInOut(progress));

        currentRef.current = value;
        setDisplay(value);

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(tick);
        }
      }

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(tick);
    }

    const id = setInterval(() => {
      const delta = Math.round((Math.random() * 2 - 1) * range);
      animateTo(base + delta);
    }, interval);

    return () => {
      clearInterval(id);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [base, range, interval, duration]);

  return <>{display.toLocaleString('en-IN')}</>;
}
