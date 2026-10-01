"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Adds a short exit phase to a modal/viewer before it unmounts, so a close
 * animation can play. `requestClose` replaces the direct close call in every
 * dismissal path (backdrop, button, Escape); the real `onClose` fires once the
 * exit `durationMs` has elapsed. Reduced-motion users get the same behaviour
 * with an effectively instant transition.
 */
export function useExitAnimation(onClose: () => void, durationMs = 160) {
  const [closing, setClosing] = useState(false);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const requestClose = useCallback(() => setClosing(true), []);

  useEffect(() => {
    if (!closing) {
      return;
    }
    const timer = setTimeout(() => onCloseRef.current(), durationMs);
    return () => clearTimeout(timer);
  }, [closing, durationMs]);

  return { closing, requestClose };
}
