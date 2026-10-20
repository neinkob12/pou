import { Text, View } from 'react-native';

import { shop } from '../../content/strings';

// Leere Struktur. Kosmetik gegen Münzen baut P25, gegen Echtgeld P33.
/** Tab "Kosmetik" im Shop. */
export function CosmeticsTab() {
  return (
    <View className="items-center rounded-2xl bg-white p-6">
      <Text className="text-center font-body text-base text-inkMuted">{shop.cosmeticsEmpty}</Text>
    </View>
  );
}
