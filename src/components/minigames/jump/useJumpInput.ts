// Eingabe für Budi Jump: Neigung (Beschleunigungssensor) oder Tippen links/rechts.
// Ergebnis ist die Ziel-Geschwindigkeit als Shared Value, die der Frame-Callback liest.

import { Accelerometer } from 'expo-sensors';
import { useEffect, useState } from 'react';
import { Platform, type GestureResponderEvent, type LayoutChangeEvent } from 'react-native';
import { useSharedValue, type SharedValue } from 'react-native-reanimated';

import { BUDI_JUMP } from '../../../game/config';
import { speedForTilt, tapDirection, tiltFromAccelerometer, type JumpControl } from './jumpControls';

export interface JumpInput {
  targetVx: SharedValue<number>;
  /** Tatsächlich genutzte Steuerung (Neigen fällt ohne Sensor auf Tippen zurück). */
  control: JumpControl;
  tiltUnavailable: boolean;
  onLayout: (e: LayoutChangeEvent) => void;
  onTouch: (e: GestureResponderEvent) => void;
}

export function useJumpInput(wanted: JumpControl): JumpInput {
  const targetVx = useSharedValue(0);
  const width = useSharedValue(0);
  const [tiltUnavailable, setTiltUnavailable] = useState(false);
  const control: JumpControl = wanted === 'tilt' && !tiltUnavailable ? 'tilt' : 'tap';

  useEffect(() => {
    targetVx.set(0);
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
  }, [control, targetVx]);

  const onLayout = (e: LayoutChangeEvent) => width.set(e.nativeEvent.layout.width);

  // Start, Bewegung und Ende melden die noch liegenden Finger; daraus die Richtung.
  const onTouch = (e: GestureResponderEvent) => {
    if (control !== 'tap') return;
    const xs = e.nativeEvent.touches.map((t) => t.pageX);
    targetVx.set(tapDirection(xs, width.get()) * BUDI_JUMP.maxSideSpeed);
  };

  return { targetVx, control, tiltUnavailable, onLayout, onTouch };
}
