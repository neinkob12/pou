import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';

import { lightPhase, room } from '../../content/strings';
import { gameEvents } from '../../game/events';
import { room as roomAssets } from '../../lib/assets';
import { ArtCanvas } from '../ui/ArtCanvas';
import { AssetImage } from '../ui/AssetImage';
import { LampArt, LightCone } from './art/LampArt';
import { lampTapOutcome } from './phase/lightCycle';
import { LightFlipDialog } from './phase/LightFlipDialog';
import { usePlantStatus } from './phase/usePlantStatus';
import { clock } from '../../lib/clock';

const LAMP_WIDTH = 140;
const LAMP_HEIGHT = 60;
/** Gezeichnete Lampe: Seitenverhältnis von LampArt (100 × 43). */
const ART_HEIGHT = LAMP_WIDTH * 0.43;
/** Lichtkegel unter der Lampe. */
const CONE_WIDTH = 300;
const CONE_HEIGHT = 300;
/** Licht atmet leise (CSS-Animation: läuft im Compositor bzw. UI-Thread, kein JavaScript pro Frame). */
const GLOW = {
  animationName: { from: { opacity: 0.82 }, to: { opacity: 1 } },
  animationDuration: '2600ms',
  animationTimingFunction: 'ease-in-out',
  animationIterationCount: 'infinite',
  animationDirection: 'alternate',
} as const;
/** Kürzestes Kabel über der Lampe. */
const MIN_CORD = 12;
/** So lange bleibt der Hinweis nach einer Störung sichtbar (reine Anzeige, kein Spielwert). */
const HINT_MS = 3000;

/** Lampe oben im Bild, an einem Kabel über Budi. An/aus nach Lichtplan, antippbar (P11). */
export function Lamp() {
  const view = usePlantStatus();
  const [dialog, setDialog] = useState(false);
  const [hint, setHint] = useState(false);
  const isOn = view.light?.isDay ?? true;
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!hint) return;
    const id = setTimeout(() => setHint(false), HINT_MS);
    return () => clearTimeout(id);
  }, [hint]);

  const onPress = () => {
    if (!view.status || !view.light) return;
    const outcome = lampTapOutcome(view.status, view.light);
    if (outcome === 'disturb') {
      gameEvents.emit('lightDisturbed', { atMs: clock.now() });
      setHint(true);
    } else if (outcome === 'confirmFlip') {
      setDialog(true);
    }
  };

  // Das Kabel füllt den Platz zwischen HUD und Budi: die Lampe hängt immer direkt über der Pflanze.
  return (
    <View pointerEvents="box-none" className="flex-1 items-center justify-end">
      <View className="w-1 flex-1 bg-ink" style={{ minHeight: MIN_CORD }} />
      {isOn ? (
        <Animated.View pointerEvents="none" style={[styles.cone, { bottom: -CONE_HEIGHT + ART_HEIGHT * 0.2 }, reduced ? null : GLOW]}>
          <ArtCanvas width={CONE_WIDTH} height={CONE_HEIGHT} still>
            <LightCone />
          </ArtCanvas>
        </Animated.View>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={isOn ? lightPhase.lampOn : lightPhase.lampOff}
        onPress={onPress}
        style={styles.target}
      >
        {roomAssets.u2_lamp_on ? (
          <AssetImage
            source={isOn ? roomAssets.u2_lamp_on : roomAssets.u2_lamp_off}
            label={isOn ? room.lamp : `${room.lamp}, ${lightPhase.lampOff}`}
            size={LAMP_WIDTH}
            height={LAMP_HEIGHT}
          />
        ) : (
          <ArtCanvas width={LAMP_WIDTH} height={ART_HEIGHT} still>
            <LampArt on={isOn} />
          </ArtCanvas>
        )}
      </Pressable>
      {hint ? (
        <Text
          style={styles.hint}
          className="rounded-2xl bg-white px-3 py-2 text-center font-body-bold text-sm text-ink"
        >
          {lightPhase.disturbed}
        </Text>
      ) : null}
      <LightFlipDialog visible={dialog} debugMultiplier={view.debugMultiplier} onClose={() => setDialog(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  cone: { position: 'absolute', width: CONE_WIDTH, height: CONE_HEIGHT },
  // Mindestens 44 Punkte hoch zum Antippen, auch wenn die Lampe flacher gezeichnet ist.
  target: { minHeight: 44, justifyContent: 'center' },
  // Hinweis schwebt unter der Lampe, ohne Budi nach unten zu schieben.
  hint: { position: 'absolute', top: '100%', marginTop: 8, maxWidth: 280, zIndex: 3 },
});
