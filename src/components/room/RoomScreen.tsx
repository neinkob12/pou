import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FactUnlockPopup } from '../facts/FactUnlockPopup';
import { CelebrationLayer } from '../feedback/CelebrationLayer';
import { FocusEnter } from '../frame/FocusEnter';
import { canShowRoom } from '../onboarding/onboardingFlow';
import { useGameStore } from '../../store/gameStore';
import { motion } from '../../lib/theme';
import { useRoomAudio } from './audio/useRoomAudio';
import { BudiStage } from './BudiStage';
import { CareStageProvider } from './care/CareStage';
import { useMinigameMoodBonus } from './care/useMinigameMoodBonus';
import { CoinDisplay } from './CoinDisplay';
import { DailyGoal } from './DailyGoal';
import { HealthWatch } from './health/useHealthCheck';
import { Lamp } from './Lamp';
import { NeedBars } from './NeedBars';
import { PhaseHeader } from './PhaseHeader';
import { PhaseChangePopup } from './phase/PhaseChangePopup';
import { RoomBackground, RoomForeground } from './RoomBackground';
import { RoomDock } from './RoomDock';
import { RoomUpgrades } from './RoomUpgrades';

// Hauptraum: nur Komposition der Slots. Besitzer je Welle siehe docs/AUFTRAEGE.md
// (P03, dann P10, dann P31). Andere Aufträge hängen ihre Komponente mit einer Zeile ein.
// Aufbau (Redesign): oben eine schmale HUD-Zeile, Budi groß in der Mitte, unten das Dock in
// Daumenreichweite. Navigation ist die Tab-Leiste aus app/_layout.tsx.
export function RoomScreen() {
  useMinigameMoodBonus();
  useRoomAudio();
  const hydrated = useGameStore((s) => s.hydration !== 'pending');
  const ageConfirmed = useGameStore((s) => s.ageConfirmed);
  // Vor der Altersfrage nur der leere Hintergrund, damit das Zimmer nicht aufblitzt (P31).
  if (!canShowRoom(hydrated, ageConfirmed)) return <View className="flex-1 bg-cream" />;
  return (
    <CareStageProvider>
      <View className="flex-1">
        <RoomBackground />
        {/* zIndex: Sprechblasen aus dem HUD (Tagesziel, Kugel-Werte) liegen über Lampe und Budi. */}
        <SafeAreaView edges={['top']} style={{ zIndex: 10, gap: 8, paddingHorizontal: 12, paddingTop: 6 }}>
          <FocusEnter from="top" style={{ zIndex: 2 }} pointerEvents="box-none">
            <View className="flex-row items-center justify-between gap-2">
              <NeedBars />
              <CoinDisplay />
            </View>
          </FocusEnter>
          <FocusEnter from="top" delay={motion.stagger} pointerEvents="box-none">
            <View className="flex-row items-start justify-between gap-2">
              <PhaseHeader />
              <DailyGoal />
            </View>
          </FocusEnter>
        </SafeAreaView>
        <Lamp />
        <RoomUpgrades />
        <BudiStage />
        <RoomForeground />
        <HealthWatch />
        <FocusEnter from="bottom" delay={motion.stagger * 2} pointerEvents="box-none">
          <RoomDock />
        </FocusEnter>
        {/* Über dem HUD (zIndex 10), damit Popups und Feiern alles abdunkeln. */}
        <View pointerEvents="box-none" style={[StyleSheet.absoluteFill, { zIndex: 20 }]}>
          <FactUnlockPopup />
          <PhaseChangePopup />
          <CelebrationLayer />
        </View>
      </View>
    </CareStageProvider>
  );
}
