import type { ReactNode } from 'react';
import { useWindowDimensions, View } from 'react-native';

import { colors, radii, surface } from '../../lib/theme';
import { FrameBrand } from './FrameBrand';
import { brandBeside, frameLayout } from './frameLayout';

const BEZEL = 12;
const BRAND_GAP = 72;
const SIDE_KEY_WIDTH = 4;

// Hintergrund am Rechner (ART-5): satter Spiel-Verlauf mit warmem Lampenlicht, weichen Farbflecken
// und einem Muster aus kleinen Blättern (nur CSS, kein Bild).
const LEAF_TILE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Cpath d='M20 10 Q30 20 20 34 Q10 20 20 10Z' fill='%237BC96F' fill-opacity='0.13'/%3E%3Cpath d='M48 38 L50 44 L56 46 L50 48 L48 54 L46 48 L40 46 L46 44Z' fill='%23FFD45C' fill-opacity='0.16'/%3E%3C/svg%3E\")";
const BACKDROP = {
  position: 'fixed',
  inset: 0,
  backgroundColor: surface.frameBgBottom,
  backgroundImage: [
    LEAF_TILE,
    `radial-gradient(ellipse at 28% 18%, rgba(255,212,92,0.32), transparent 50%)`,
    `radial-gradient(circle at 85% 85%, rgba(169,139,232,0.30), transparent 45%)`,
    `radial-gradient(circle at 70% 10%, rgba(255,122,138,0.22), transparent 40%)`,
    `linear-gradient(160deg, #2F7A45, ${surface.frameBgTop} 45%, ${surface.frameBgBottom})`,
  ].join(', '),
  backgroundSize: '64px 64px, 100% 100%, 100% 100%, 100% 100%, 100% 100%',
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
 * Web-Version: Am Handy füllt das Spiel den Bildschirm. Am Rechner (WEB-3, WEB-5, ART-5 überarbeitet) steht
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
            backgroundImage: `linear-gradient(145deg, ${surface.frameShellLight}, ${surface.frameShell} 40%)`,
            borderWidth: 3,
            borderColor: colors.ink,
            // Weicher Schlagschatten, farbiger Schein und Glanzkante wie ein Spielzeug-Gehäuse.
            boxShadow:
              '0 34px 80px rgba(0,0,0,0.55), 0 0 0 8px rgba(123,201,111,0.18), inset 0 2px 0 rgba(255,255,255,0.18)',
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
