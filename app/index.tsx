import { useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';

import { RoomScreen } from '../src/components/room/RoomScreen';

export default function RoomRoute() {
  const navigation = useNavigation();
  // Der Raum hat eine eigene BottomNav, daher hier ohne Tab-Leiste aus app/_layout.tsx.
  useLayoutEffect(() => {
    navigation.setOptions({ tabBarStyle: { display: 'none' } });
  }, [navigation]);
  return <RoomScreen />;
}
