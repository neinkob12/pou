import { useState, type ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { surface } from '../../lib/theme';
import type { BackdropVariant } from './backdrops';
import { GameTitle } from './GameTitle';
import { ScreenBackdrop } from './ScreenBackdrop';
import { ScreenEnter } from './ScreenEnter';

interface GameScreenProps {
  /** Welcher Spiel-Hintergrund (Shop, Album, Ernte ...). */
  backdrop: BackdropVariant;
  title?: string;
  subtitle?: string;
  back?: boolean;
  right?: ReactNode;
  /** Ohne ScrollView, etwa für Screens, die selbst zentrieren (Altersfrage). */
  fixed?: boolean;
  children: ReactNode;
}

/**
 * Rahmen der Screens außerhalb des Zimmers im Spiele-Look (ART-5): eigener Hintergrund je Screen,
 * Titel als Spielschrift, Inhalt federt beim Öffnen herein. Gleiche Abstände wie ui/Screen.
 */
export function GameScreen({ backdrop, title, subtitle, back, right, fixed = false, children }: GameScreenProps) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const head = title ? <GameTitle title={title} subtitle={subtitle} back={back} right={right} /> : null;
  return (
    <View
      style={{ flex: 1 }}
      onLayout={(e) => setSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
    >
      <ScreenBackdrop variant={backdrop} width={size.width} height={size.height} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScreenEnter>
          {fixed ? (
            <View style={{ flex: 1, padding: surface.screenPadding, gap: surface.gap }}>
              {head}
              {children}
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={{
                padding: surface.screenPadding,
                paddingBottom: surface.screenPadding * 2,
                gap: surface.gap,
              }}
            >
              {head}
              {children}
            </ScrollView>
          )}
        </ScreenEnter>
      </SafeAreaView>
    </View>
  );
}
