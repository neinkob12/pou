import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View, type HostInstance } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { celebrations, dailyGoals, lightPhase } from '../../content/strings';
import { gameEvents } from '../../game/events';
import { cue } from '../../lib/audio';
import { PUFF_MS } from '../room/phase/Puff';
import { Button } from '../ui/Button';
import { BudiAvatar } from './BudiAvatar';
import { dismissCelebration, enqueueCelebration, type Celebration } from './celebrationQueue';
import { getCoinAnchor, type Point } from './coinTarget';
import { CoinFly } from './CoinFly';
import { CountUpText } from './CountUpText';
import { Sparkles } from './Sparkles';

/**
 * Feiern im Zimmer (WEB-3): Phasenwechsel (nach der Puff-Wolke) und Tageskiste. Budi jubelt,
 * Funken fliegen, Münzen zählen hoch und fliegen beim Schließen in den Münzzähler.
 * Eine Zeile in RoomScreen.tsx, hört nur auf gameEvents.
 */
export function CelebrationLayer() {
  const [queue, setQueue] = useState<Celebration[]>([]);
  const [fly, setFly] = useState<{ from: Point; to: Point } | null>(null);
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

  const current = queue[0];

  const close = () => {
    const anchor = getCoinAnchor();
    const from = cardCenter.current;
    if (current?.kind === 'chest' && anchor && from) {
      const origin = layerOrigin.current;
      setFly({ from, to: { x: anchor.x - origin.x, y: anchor.y - origin.y } });
    }
    cardCenter.current = null;
    setQueue(dismissCelebration);
  };

  return (
    <View ref={layerRef} pointerEvents="box-none" className="absolute inset-0">
      {current ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={celebrations.continue}
          onPress={close}
          className="absolute inset-0 items-center justify-center bg-ink/50 p-6"
        >
          <Sparkles playKey={queue.length} />
          <Animated.View
            key={JSON.stringify(current)}
            entering={ZoomIn.springify().damping(11)}
            style={{ width: '100%' }}
          >
            <View ref={cardRef} onLayout={measure} className="w-full max-w-md items-center gap-3 self-center rounded-3xl bg-cream p-6">
              <BudiAvatar size={72} />
              <Text className="text-center font-heading text-2xl text-ink">
                {current.kind === 'phase' ? lightPhase.phaseChangedTitle : dailyGoals.chestTitle}
              </Text>
              {current.kind === 'phase' ? (
                <Text className="text-center font-body-bold text-lg text-ink">
                  {lightPhase.phaseChanged[current.phase]}
                </Text>
              ) : (
                <>
                  <CountUpText
                    value={current.coins}
                    format={celebrations.coins}
                    onDone={() => cue('coins')}
                    className="font-heading text-4xl text-coral"
                  />
                  <Text className="text-center font-body text-base text-ink">{celebrations.chestText}</Text>
                </>
              )}
              <View className="w-full">
                <Button label={celebrations.continue} onPress={close} />
              </View>
            </View>
          </Animated.View>
        </Pressable>
      ) : null}
      {fly ? <CoinFly from={fly.from} to={fly.to} onDone={() => setFly(null)} /> : null}
    </View>
  );
}
