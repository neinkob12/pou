import type { ReactNode } from 'react';
import { useWindowDimensions, View } from 'react-native';

import { colors, radii, surface } from '../../lib/theme';
import { FrameBrand } from './FrameBrand';
import { brandBeside, frameLayout } from './frameLayout';

const BEZEL = 12;
const BRAND_GAP = 72;
const SIDE_KEY_WIDTH = 4;

// Hintergrund am Rechner: Verlauf in Waldgrün mit feinem Punktraster (nur CSS, kein Bild).
const BACKDROP = {
  position: 'fixed',
  inset: 0,
  backgroundColor: surface.frameBgBottom,
  backgroundImage: [
    `radial-gradient(${surface.frameDot} 1.5px, transparent 1.5px)`,
    `radial-gradient(ellipse at 30% 20%, rgba(255,212,92,0.12), transparent 55%)`,
    `linear-gradient(160deg, ${surface.frameBgTop}, ${surface.frameBgBottom})`,
  ].join(', '),
  backgroundSize: '22px 22px, 100% 100%, 100% 100%',
} as const;

/** Seitentaste am Gehäuse, rein zur Zierde. */
function SideKey({ side, top, height }: { side: 'left' | 'right'; top: number; height: number }) {
  return (
    <View
      style={{
        position: 'absolute',
        [side]: -SIDE_KEY_WIDTH - 1,
        top,
        width: SIDE_KEY_WIDTH,
        height,
        borderRadius: 2,
        backgroundColor: surface.frameShellLight,
      }}
    />
  );
}

/**
 * Web-Version: Am Handy füllt das Spiel den Bildschirm. Am Rechner (WEB-3, WEB-5 überarbeitet) steht
 * es in einem Handy-Gehäuse vor einem grünen Verlauf, links daneben Titel und kurze Hinweise.
 */
export function AppFrame({ children }: { children: ReactNode }) {
  const { width, height } = useWindowDimensions();
  const layout = frameLayout(width, height);
  if (!layout.framed) return <View style={{ flex: 1 }}>{children}</View>;
  const beside = brandBeside(width);
  const shellRadius = radii.lg * 2 + BEZEL;
  return (
    <View style={{ flex: 1 }}>
      <div style={BACKDROP} aria-hidden />
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: BRAND_GAP }}>
        {beside ? <FrameBrand compact={false} /> : <FrameBrand compact />}
        <View
          style={{
            width: layout.width + 2 * BEZEL,
            height: layout.height,
            padding: BEZEL,
            borderRadius: shellRadius,
            backgroundColor: surface.frameShell,
            borderWidth: 1,
            borderColor: surface.frameShellLight,
            boxShadow: '0 30px 80px rgba(0, 0, 0, 0.55), inset 0 0 0 2px rgba(255,255,255,0.06)',
          }}
        >
          <SideKey side="left" top={120} height={36} />
          <SideKey side="left" top={170} height={60} />
          <SideKey side="right" top={150} height={80} />
          <View
            style={{
              flex: 1,
              overflow: 'hidden',
              borderRadius: radii.lg * 2,
              backgroundColor: colors.cream,
            }}
          >
            {children}
          </View>
        </View>
      </View>
    </View>
  );
}
