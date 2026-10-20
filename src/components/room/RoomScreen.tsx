import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FactUnlockPopup } from '../facts/FactUnlockPopup';
import { CelebrationLayer } from '../feedback/CelebrationLayer';
import { HarvestEntry } from '../harvest/HarvestEntry';
import { canShowRoom } from '../onboarding/onboardingFlow';
import { useGameStore } from '../../store/gameStore';
import { ActionTray } from './ActionTray';
import { useRoomAudio } from './audio/useRoomAudio';
import { BottomNav } from './BottomNav';
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
import { RoomBackground } from './RoomBackground';
import { RoomUpgrades } from './RoomUpgrades';

// Hauptraum: nur Komposition der Slots. Besitzer je Welle siehe docs/AUFTRAEGE.md
// (P03, dann P10, dann P31). Andere Aufträge hängen ihre Komponente mit einer Zeile ein.
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
        <SafeAreaView edges={['top']} className="gap-2 px-4 pt-2">
          <View className="flex-row items-start gap-3">
            <NeedBars />
            <CoinDisplay />
          </View>
          <PhaseHeader />
          <DailyGoal />
          <HarvestEntry />
        </SafeAreaView>
        <Lamp />
        <RoomUpgrades />
        <BudiStage />
        <HealthWatch />
        <ActionTray />
        <View className="h-3" />
        <BottomNav />
        <FactUnlockPopup />
        <PhaseChangePopup />
        <CelebrationLayer />
      </View>
    </CareStageProvider>
  );
}
