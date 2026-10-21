import { Text, View } from 'react-native';

import { screenUi } from '../../content/strings';
import { colors, radii, surface } from '../../lib/theme';

const DOT = 28;

/** Fortschritt durch die Ernte (WEB-5): Lupe, Schere, Trocknen, Ernte. Erledigte Schritte grün. */
export function HarvestSteps({ current }: { current: number }) {
  const steps = screenUi.harvestSteps;
  return (
    <View accessibilityLabel={screenUi.harvestStepLabel(current + 1, steps.length)} className="flex-row items-start">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <View key={label} className="flex-1 items-center gap-1">
            <View className="w-full flex-row items-center">
              <View
                style={{
                  flex: 1,
                  height: surface.line,
                  backgroundColor: i === 0 ? 'transparent' : done || active ? colors.plantDark : surface.cardEdgeMuted,
                }}
              />
              <View
                style={{
                  width: DOT,
                  height: DOT,
                  borderRadius: radii.pill,
                  borderWidth: surface.line,
                  borderColor: done || active ? colors.plantDark : surface.cardEdgeMuted,
                  backgroundColor: done ? colors.plantLight : active ? colors.coral : colors.white,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  className={`font-body-bold text-xs ${active ? 'text-white' : done ? 'text-ink' : 'text-inkMuted'}`}
                >
                  {i + 1}
                </Text>
              </View>
              <View
                style={{
                  flex: 1,
                  height: surface.line,
                  backgroundColor:
                    i === steps.length - 1 ? 'transparent' : done ? colors.plantDark : surface.cardEdgeMuted,
                }}
              />
            </View>
            <Text className={`font-body-bold text-xs ${active ? 'text-ink' : 'text-inkMuted'}`}>{label}</Text>
          </View>
        );
      })}
    </View>
  );
}
