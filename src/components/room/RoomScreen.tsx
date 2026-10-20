import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionTray } from './ActionTray';
import { BottomNav } from './BottomNav';
import { BudiStage } from './BudiStage';
import { CoinDisplay } from './CoinDisplay';
import { Lamp } from './Lamp';
import { NeedBars } from './NeedBars';
import { PhaseHeader } from './PhaseHeader';
import { RoomBackground } from './RoomBackground';

// Hauptraum: nur Komposition der Slots. Besitzer je Welle siehe docs/AUFTRAEGE.md
// (P03, dann P10, dann P31). Andere Aufträge hängen ihre Komponente mit einer Zeile ein.
export function RoomScreen() {
  return (
    <View className="flex-1">
      <RoomBackground />
      <SafeAreaView edges={['top']} className="gap-2 px-4 pt-2">
        <View className="flex-row items-start gap-3">
          <NeedBars />
          <CoinDisplay />
        </View>
        <PhaseHeader />
      </SafeAreaView>
      <Lamp />
      <BudiStage />
      <ActionTray />
      <View className="h-3" />
      <BottomNav />
    </View>
  );
}
