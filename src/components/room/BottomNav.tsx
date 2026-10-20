import { Link, type Href } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ui, type UiAssetId } from '../../lib/assets';
import type { GameIconId } from '../ui/icons/iconArt';
import { room } from '../../content/strings';
import { spacing } from '../../lib/theme';
import { AssetImage } from '../ui/AssetImage';

const ICON_SIZE = 36;

type NavId = keyof typeof room.nav;

const NAV: readonly { id: NavId; href: Href; icon: UiAssetId; art: GameIconId }[] = [
  { id: 'minigames', href: '/minigames', icon: 'u12_minigames', art: 'minigames' },
  { id: 'shop', href: '/shop', icon: 'u12_shop', art: 'shop' },
  { id: 'album', href: '/album', icon: 'u12_album', art: 'album' },
  { id: 'settings', href: '/settings', icon: 'u12_settings', art: 'settings' },
];

/** Untere Navigation im Raum, Pou-artig mit runden Icons. */
export function BottomNav() {
  const insets = useSafeAreaInsets();
  return (
    <View
      className="flex-row justify-around rounded-t-3xl border-t-2 border-plantDark bg-white pt-2"
      style={{ paddingBottom: insets.bottom + spacing.sm }}
    >
      {NAV.map((item) => (
        <Link key={item.id} href={item.href} asChild>
          <Pressable accessibilityRole="link" className="min-w-16 items-center gap-1 active:scale-95 active:opacity-80">
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-cream">
              <AssetImage source={ui[item.icon]} label={room.nav[item.id]} color="coral" size={ICON_SIZE} round icon={item.art} />
            </View>
            <Text className="font-body-bold text-xs text-ink">{room.nav[item.id]}</Text>
          </Pressable>
        </Link>
      ))}
    </View>
  );
}
