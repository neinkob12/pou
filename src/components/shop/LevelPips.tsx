import { View } from 'react-native';

interface LevelPipsProps {
  level: number;
  max: number;
  /** Vorlesetext, etwa "Stufe 1 von 3". */
  label: string;
}

/** Stufen als Punkte: gefüllt bis zur aktuellen Stufe (WEB-3). */
export function LevelPips({ level, max, label }: LevelPipsProps) {
  return (
    <View accessibilityLabel={label} className="flex-row gap-1.5">
      {Array.from({ length: max }, (_, i) => (
        <View
          key={i}
          className={`h-3 w-6 rounded-full border border-plantDark ${i < level ? 'bg-plantLight' : 'bg-white'}`}
        />
      ))}
    </View>
  );
}
