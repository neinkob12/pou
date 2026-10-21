import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, View, type HostInstance } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import { celebrations } from '../../content/strings';
import { gameEvents } from '../../game/events';
import { colors, surface } from '../../lib/theme';
import { PUFF_MS } from '../room/phase/Puff';
import { CelebrationCard } from './CelebrationCard';
import { dismissCelebration, enqueueCelebration, type Celebration } from './celebrationQueue';
import { CoinFly } from './CoinFly';
import { CoinRain } from './CoinRain';
import { getCoinAnchor, type Point } from './coinTarget';
import { Confetti } from './Confetti';
import { GlowRays } from './GlowRays';
import { Sparkles } from './Sparkles';
import { useCameraShake } from './useCameraShake';
import { useLevelUps } from './useLevelUps';

const GLOW_SIZE = 380;
/** Wie stark die Karte beim Erscheinen wackelt, je Feier. */
const SHAKE: Record<Celebration['kind'], number> = { phase: 0.4, chest: 0.6, level: 0.8 };

/**
 * Feiern im Zimmer (WEB-3, ART-5 groß inszeniert): Phasenwechsel (nach der Puff-Wolke), Tageskiste
 * und Level-Aufstieg. Abdunkeln, kreisende Strahlen, Konfetti, Karte federt herein und wackelt,
 * Münzen zählen hoch, regnen herab und fliegen beim Schließen in den Münzzähler.
 * Eine Zeile in RoomScreen.tsx, hört nur auf gameEvents und den Spielstand.
 */
export function CelebrationLayer() {
  const [queue, setQueue] = useState<Celebration[]>([]);
  const [fly, setFly] = useState<{ from: Point; to: Point } | null>(null);
  const [rainKey, setRainKey] = useState(0);
  const { style: shakeStyle, shake } = useCameraShake();
  const layerRef = useRef<HostInstance>(null);
  const cardRef = useRef<HostInstance>(null);
  // Mitte der Karte relativ zur Ebene, gemessen beim Layout: beim Schließen ist die Karte schon weg.
  const cardCenter = useRef<Point | null>(null);
  const layerOrigin = useRef<Point>({ x: 0, y: 0 });

  const measure = () => {
    layerRef.current?.measureInWindow((lx, ly) => {
      layerOrigin.current = { x: lx, y: ly };
      cardRef.current?.measureInWindow((cx, cy, cw, ch) => {
        cardCenter.current = { x: cx - lx + cw / 2, y: cy - ly + ch / 2 };
      });
    });
  };

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const offPhase = gameEvents.on('phaseChanged', ({ to }) => {
      // Erst die Puff-Wolke, dann die Feier.
      timers.push(setTimeout(() => setQueue((q) => enqueueCelebration(q, { kind: 'phase', phase: to })), PUFF_MS));
    });
    const offChest = gameEvents.on('dailyChestOpened', ({ coins }) =>
      setQueue((q) => enqueueCelebration(q, { kind: 'chest', coins })),
    );
    return () => {
      offPhase();
      offChest();
      timers.forEach(clearTimeout);
    };
  }, []);

  useLevelUps(useCallback((level: number) => setQueue((q) => enqueueCelebration(q, { kind: 'level', level })), []));

  const current = queue[0];
  const currentKey = current ? JSON.stringify(current) : '';
  const currentKind = current?.kind;

  // Jede neue Feier: Karte wackelt kurz nach dem Hereinfedern.
  useEffect(() => {
    if (!currentKind) return;
    const timer = setTimeout(() => shake(SHAKE[currentKind]), 260);
    return () => clearTimeout(timer);
  }, [currentKey, currentKind, shake]);

  const close = () => {
    const anchor = getCoinAnchor();
    const from = cardCenter.current;
    if (current?.kind === 'chest' && anchor && from) {
      const origin = layerOrigin.current;
      setFly({ from, to: { x: anchor.x - origin.x, y: anchor.y - origin.y } });
    }
    cardCenter.current = null;
    setRainKey(0);
    setQueue(dismissCelebration);
  };

  return (
    <View ref={layerRef} pointerEvents="box-none" className="absolute inset-0">
      {current ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={celebrations.continue}
          onPress={close}
          className="absolute inset-0 items-center justify-center p-6"
        >
          <Animated.View
            key={`dim-${currentKey}`}
            entering={FadeIn.duration(220)}
            pointerEvents="none"
            className="absolute inset-0 bg-ink/60"
          />
          <View pointerEvents="none" className="absolute inset-0 items-center justify-center">
            <GlowRays size={GLOW_SIZE} />
          </View>
          <Confetti playKey={queue.length} count={current.kind === 'phase' ? 24 : 40} />
          <Sparkles playKey={queue.length} />
          {current.kind === 'chest' && rainKey > 0 ? <CoinRain coins={current.coins} playKey={rainKey} /> : null}
          <Animated.View key={currentKey} entering={ZoomIn.springify().damping(9)} style={{ width: '100%' }}>
            <Animated.View style={shakeStyle}>
              <View
                ref={cardRef}
                onLayout={measure}
                className="w-full max-w-md items-center gap-3 self-center rounded-3xl bg-cream p-6"
                style={{
                  borderWidth: surface.line + 1,
                  borderBottomWidth: surface.edge + 3,
                  borderColor: colors.plantDark,
                }}
              >
                <CelebrationCard
                  celebration={current}
                  onClose={close}
                  onCoinsCounted={() => setRainKey((k) => k + 1)}
                />
              </View>
            </Animated.View>
          </Animated.View>
        </Pressable>
      ) : null}
      {fly ? <CoinFly from={fly.from} to={fly.to} onDone={() => setFly(null)} /> : null}
    </View>
  );
}
