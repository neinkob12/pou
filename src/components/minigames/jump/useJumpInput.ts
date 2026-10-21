// Eingabe für Budi Jump: Neigung (Beschleunigungssensor), Tippen links/rechts oder am Rechner
// Pfeiltasten und A/D (Auftrag 40). Ergebnis ist die Ziel-Geschwindigkeit, die der Frame-Callback
// über `readVx` liest; eine gedrückte Taste gewinnt vor Finger und Neigung.

import { Accelerometer } from 'expo-sensors';
import { useCallback, useEffect, useState } from 'react';
import { Platform, type LayoutChangeEvent } from 'react-native';
import { useSharedValue, type SharedValue } from 'react-native-reanimated';

import { BUDI_JUMP } from '../../../game/config';
import { usePointerInput } from '../framework/input/usePointerInput';
import { useKeyAxis } from '../framework/input/useKeyboard';
import { speedForTilt, tapDirection, tiltFromAccelerometer, type JumpControl } from './jumpControls';

export interface JumpInput {
  targetVx: SharedValue<number>;
  /** Ziel-Geschwindigkeit jetzt (Worklet): Tastatur vor Finger und Neigung. */
  readVx: () => number;
  /** Tatsächlich genutzte Steuerung (Neigen fällt ohne Sensor auf Tippen zurück). */
  control: JumpControl;
  tiltUnavailable: boolean;
  onLayout: (e: LayoutChangeEvent) => void;
  /** Für den GestureDetector um das Spielfeld: Finger und Maus. */
  gesture: ReturnType<typeof usePointerInput>;
}

export function useJumpInput(wanted: JumpControl): JumpInput {
  const targetVx = useSharedValue(0);
  const width = useSharedValue(0);
  const tapControl = useSharedValue(true);
  const keyAxis = useKeyAxis();
  // Im Browser (PWEB) kein Neigen: am Rechner fehlt der Sensor, Safari fragt erst nach Erlaubnis.
  const [tiltUnavailable, setTiltUnavailable] = useState(Platform.OS === 'web');
  const control: JumpControl = wanted === 'tilt' && !tiltUnavailable ? 'tilt' : 'tap';

  useEffect(() => {
    targetVx.set(0);
    tapControl.set(control === 'tap');
    if (control !== 'tilt') return;
    let active = true;
    let sub: { remove: () => void } | null = null;
    Accelerometer.isAvailableAsync()
      .then((available) => {
        if (!active) return;
        if (!available) {
          setTiltUnavailable(true);
          return;
        }
        Accelerometer.setUpdateInterval(BUDI_JUMP.sensorIntervalMs);
        sub = Accelerometer.addListener(({ x }) => {
          targetVx.set(speedForTilt(tiltFromAccelerometer(x, Platform.OS)));
        });
      })
      .catch(() => setTiltUnavailable(true));
    return () => {
      active = false;
      sub?.remove();
    };
  }, [control, tapControl, targetVx]);

  const onLayout = useCallback((e: LayoutChangeEvent) => width.set(e.nativeEvent.layout.width), [width]);

  // Aufsetzen, Bewegen und Loslassen melden die noch liegenden Finger; daraus die Richtung.
  const gesture = usePointerInput({
    onHeld: (xs) => {
      'worklet';
      if (!tapControl.get()) return;
      targetVx.set(tapDirection(xs, width.get()) * BUDI_JUMP.maxSideSpeed);
    },
  });

  const readVx = () => {
    'worklet';
    const key = keyAxis.get();
    return key !== 0 ? key * BUDI_JUMP.maxSideSpeed : targetVx.get();
  };

  return { targetVx, readVx, control, tiltUnavailable, onLayout, gesture };
}
