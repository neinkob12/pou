import { Text, View } from 'react-native';

interface SectionTitleProps {
  title: string;
  /** Rechts daneben, etwa "3 von 12". */
  meta?: string;
}

/** Zwischenüberschrift innerhalb eines Screens (WEB-5). */
export function SectionTitle({ title, meta }: SectionTitleProps) {
  return (
    <View className="flex-row items-end justify-between gap-2 px-1 pt-1">
      <Text className="font-heading text-xl text-ink">{title}</Text>
      {meta ? <Text className="font-body-bold text-sm text-inkMuted">{meta}</Text> : null}
    </View>
  );
}
