import { COSMETIC_ITEMS } from '../../game/config';
import { gameEvents } from '../../game/events';
import { useGameStore } from '../gameStore';

const T0 = Date.UTC(2026, 9, 20, 12, 0, 0);
const initial = useGameStore.getState();

describe('Kosmetik-Slice', () => {
  beforeEach(() => useGameStore.setState(initial, true));
  afterEach(() => gameEvents.clear());

  it('kauft mit Münzen, rüstet aus und meldet den Kauf', () => {
    const listener = jest.fn();
    gameEvents.on('purchaseCompleted', listener);
    const price = COSMETIC_ITEMS.u16_hat_cap.priceCoins;
    useGameStore.getState().addCoins(price + 3);

    const { buyCosmetic, spendCoins } = useGameStore.getState();
    expect(buyCosmetic('u16_hat_cap', spendCoins, T0)).toBe(true);

    const state = useGameStore.getState();
    expect(state.coins).toBe(3);
    expect(state.cosmeticsOwned).toEqual(['u16_hat_cap']);
    expect(state.cosmeticEquipped).toBe('u16_hat_cap');
    expect(listener).toHaveBeenCalledWith({ productId: 'cosmetic:u16_hat_cap', atMs: T0 });
  });

  it('ohne genug Münzen passiert nichts', () => {
    const { buyCosmetic, spendCoins } = useGameStore.getState();
    expect(buyCosmetic('u16_hat_crown', spendCoins, T0)).toBe(false);
    expect(useGameStore.getState().cosmeticsOwned).toEqual([]);
    expect(useGameStore.getState().cosmeticEquipped).toBeNull();
  });

  it('zweimal kaufen kostet nichts', () => {
    useGameStore.setState({ cosmeticsOwned: ['u16_sunglasses'] });
    const pay = jest.fn(() => true);
    expect(useGameStore.getState().buyCosmetic('u16_sunglasses', pay, T0)).toBe(false);
    expect(pay).not.toHaveBeenCalled();
  });

  it('ausrüsten nur, was gekauft ist; ablegen geht immer', () => {
    useGameStore.setState({ cosmeticsOwned: ['u16_sunglasses'] });
    const { equipCosmetic } = useGameStore.getState();
    expect(equipCosmetic('u16_hat_straw')).toBe(false);
    expect(useGameStore.getState().cosmeticEquipped).toBeNull();
    expect(equipCosmetic('u16_sunglasses')).toBe(true);
    expect(useGameStore.getState().cosmeticEquipped).toBe('u16_sunglasses');
    expect(equipCosmetic(null)).toBe(true);
    expect(useGameStore.getState().cosmeticEquipped).toBeNull();
  });

  it('ändert keine Spielwerte', () => {
    useGameStore.getState().addCoins(1000);
    const before = useGameStore.getState();
    before.buyCosmetic('u16_hat_crown', before.spendCoins, T0);
    const after = useGameStore.getState();
    expect(after.upgrades).toEqual(before.upgrades);
    expect(after.coins).toBe(1000 - COSMETIC_ITEMS.u16_hat_crown.priceCoins);
  });
});
