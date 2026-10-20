import { Link, type Href } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ui, type UiAssetId } from '../../lib/assets';
import { room } from '../../content/strings';
import { spacing } from '../../lib/theme';
import { AssetImage } from '../ui/AssetImage';

const ICON_SIZE = 44;

type NavId = keyof typeof room.nav;

const NAV: readonly { id: NavId; href: Href; icon: UiAssetId }[] = [
  { id: 'minigames', href: '/minigames', icon: 'u12_minigames' },
  { id: 'shop', href: '/shop', icon: 'u12_shop' },
  { id: 'album', href: '/album', icon: 'u12_album' },
  { id: 'settings', href: '/settings', icon: 'u12_settings' },
];

/** Untere Navigation im Raum, Pou-artig mit runden Icons. */
export function BottomNav() {
  const insets = useSafeAreaInsets();
  return (
    <View
      className="flex-row justify-around rounded-t-3xl bg-white pt-2"
      style={{ paddingBottom: insets.bottom + spacing.sm }}
    >
      {NAV.map((item) => (
        <Link key={item.id} href={item.href} asChild>
          <Pressable accessibilityRole="link" className="items-center gap-1 active:opacity-70">
            <AssetImage source={ui[item.icon]} label={room.nav[item.id]} color="coral" size={ICON_SIZE} round />
            <Text className="font-body-bold text-xs text-ink">{room.nav[item.id]}</Text>
          </Pressable>
        </Link>
      ))}
    </View>
  );
}
