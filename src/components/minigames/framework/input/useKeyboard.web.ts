// Tastatur im Browser (Auftrag 40): Pfeiltasten und A/D lenken, andere Tasten über useKeyDown.

import { useEffect, useRef } from 'react';
import { useSharedValue, type SharedValue } from 'react-native-reanimated';

import { axisFromKeys, isAxisKey } from './keys';

export function useKeyAxis(): SharedValue<number> {
  const axis = useSharedValue(0);
  useEffect(() => {
    const held: string[] = [];
    const update = () => axis.set(axisFromKeys(held));
    const down = (e: KeyboardEvent) => {
      if (!isAxisKey(e.key)) return;
      e.preventDefault();
      if (!held.includes(e.key)) held.push(e.key);
      update();
    };
    const up = (e: KeyboardEvent) => {
      const i = held.indexOf(e.key);
      if (i >= 0) held.splice(i, 1);
      update();
    };
    const clear = () => {
      held.length = 0;
      update();
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', clear);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', clear);
    };
  }, [axis]);
  return axis;
}

export function useKeyDown(onKey: (key: string) => void): void {
  const ref = useRef(onKey);
  useEffect(() => {
    ref.current = onKey;
  });
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.repeat) return;
      ref.current(e.key);
    };
    window.addEventListener('keydown', down);
    return () => window.removeEventListener('keydown', down);
  }, []);
}
