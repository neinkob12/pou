import type { ReactNode } from 'react';
import { Animated, Pressable, View } from 'react-native';

import { depth, outline, shadows, tones, type ToneName } from '../../lib/theme';
import { GlossFill } from './game/GlossFill';
import { usePressSpring } from './game/usePressSpring';

const SIZES = { sm: { box: 40, depth: depth.sm }, md: { box: 52, depth: depth.md }, lg: { box: 64, depth: depth.lg } } as const;

interface IconButtonProps {
  icon: ReactNode;
  /** Pflicht: der Knopf hat keinen sichtbaren Text. */
  accessibilityLabel: string;
  onPress?: () => void;
  tone?: ToneName;
  size?: keyof typeof SIZES;
  disabled?: boolean;
  quiet?: boolean;
}

/** Runder 3D-Knopf nur mit Icon (ART-1), etwa Schließen, Einstellungen, Pause. */
export function IconButton({ icon, accessibilityLabel, onPress, tone = 'cream', size = 'md', disabled = false, quiet }: IconButtonProps) {
  const t = tones[disabled ? 'stone' : tone];
  const s = SIZES[size];
  const radius = s.box / 2;
  const press = usePressSpring({ sink: s.depth, disabled, quiet });

  return (
    <Animated.View style={[{ borderRadius: radius, boxShadow: disabled ? undefined : shadows.button }, press.outerStyle]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled }}
        disabled={disabled}
        hitSlop={6}
        onPress={onPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        style={{
          width: s.box,
          height: s.box + s.depth,
          borderRadius: radius,
          borderWidth: outline.regular,
          borderColor: outline.color,
          backgroundColor: t.edge,
          paddingBottom: s.depth,
        }}
      >
        <Animated.View style={[{ flex: 1, borderRadius: radius }, press.faceStyle]}>
          <GlossFill tone={t} radius={radius} />
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>{icon}</View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}
