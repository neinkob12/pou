import { Text, View } from 'react-native';

import { cosmetics as text, screenUi } from '../../content/strings';
import { COSMETIC_ITEMS, type CosmeticId } from '../../game/config';
import { canBuyCosmetic, equippedCosmetic, ownsCosmetic } from '../../game/cosmetics';
import { cosmetics as cosmeticAssets } from '../../lib/assets';
import { cue } from '../../lib/audio';
import { clock } from '../../lib/clock';
import { useGameStore } from '../../store/gameStore';
import { AssetImage } from '../ui/AssetImage';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { PriceCoin } from './PriceCoin';

const IMAGE_SIZE = 64;

interface CosmeticCardProps {
  id: CosmeticId;
  /** Wird gerade in der Vorschau anprobiert. */
  tryingOn: boolean;
  /** Antippen der Karte: anprobieren bzw. Anprobe beenden. */
  onTryOn: () => void;
  /** Nach Kauf, Anziehen oder Ablegen: Anprobe beenden, Vorschau zeigt wieder das Ausgerüstete. */
  onDone: () => void;
}

/** Ein Accessoire im Kosmetik-Tab: Bild, Name, anprobieren, kaufen oder an- und ablegen. */
export function CosmeticCard({ id, tryingOn, onTryOn, onDone }: CosmeticCardProps) {
  const owned = useGameStore((s) => s.cosmeticsOwned);
  const equippedId = useGameStore((s) => s.cosmeticEquipped);
  const coins = useGameStore((s) => s.coins);
  const buyCosmetic = useGameStore((s) => s.buyCosmetic);
  const equipCosmetic = useGameStore((s) => s.equipCosmetic);
  const spendCoins = useGameStore((s) => s.spendCoins);

  const name = text.items[id];
  const isOwned = ownsCosmetic(owned, id);
  const isEquipped = equippedCosmetic(owned, equippedId) === id;
  const affordable = canBuyCosmetic(owned, id, coins);

  return (
    <Card
      onPress={onTryOn}
      selected={tryingOn}
      tone={isEquipped ? 'rare' : 'plain'}
      accessibilityLabel={`${name}: ${text.tryOn}`}
    >
      <View className="flex-row items-center gap-3">
        <AssetImage source={cosmeticAssets[id]} label={name} size={IMAGE_SIZE} />
        <View className="flex-1 gap-1">
          <View className="flex-row flex-wrap items-center gap-2">
            <Text className="font-heading text-lg text-ink">{name}</Text>
            {isEquipped ? (
              <Badge label={screenUi.equippedBadge} color="lavender" />
            ) : isOwned ? (
              <Badge label={screenUi.ownedBadge} color="plantLight" />
            ) : null}
          </View>
          <Text className={`font-body text-sm ${tryingOn ? 'text-coral' : 'text-inkMuted'}`}>
            {isEquipped ? text.equipped : tryingOn ? text.tryingOn : text.tryOn}
          </Text>
        </View>
        {isOwned ? (
          <Button
            label={isEquipped ? text.unequip : text.equip}
            variant="secondary"
            size="sm"
            onPress={() => equipCosmetic(isEquipped ? null : id) && onDone()}
          />
        ) : (
          <Button
            label={text.buy(COSMETIC_ITEMS[id].priceCoins)}
            size="sm"
            disabled={!affordable}
            leading={<PriceCoin />}
            onPress={() => {
              if (!buyCosmetic(id, spendCoins, clock.now())) return;
              cue('coins');
              onDone();
            }}
          />
        )}
      </View>
      {!isOwned && !affordable ? (
        <Text className="text-right font-body text-xs text-inkMuted">{text.notEnoughCoins}</Text>
      ) : null}
    </Card>
  );
}
