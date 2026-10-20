import type { ReactNode } from 'react';
import { View } from 'react-native';

interface OverlayProps {
  children: ReactNode;
  /** Abgedunkelter Hintergrund mit Karte (Pause, Spielende) oder nur zentriert (Countdown). */
  card?: boolean;
  /** Berührungen gehen durch aufs Spielfeld (z. B. "Los!", während das Spiel schon läuft). */
  passThrough?: boolean;
}

/** Liegt über dem Spielfeld und fängt alle Berührungen ab. */
export function Overlay({ children, card = true, passThrough = false }: OverlayProps) {
  return (
    <View
      pointerEvents={passThrough ? 'none' : 'auto'}
      className={`absolute inset-0 items-center justify-center p-6 ${card ? 'bg-ink/40' : ''}`}
    >
      {card ? <View className="w-full max-w-sm gap-3 rounded-3xl bg-cream p-6">{children}</View> : children}
    </View>
  );
}
