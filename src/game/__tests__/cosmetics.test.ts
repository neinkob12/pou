import { COSMETIC_IDS, COSMETIC_ITEMS } from '../config';
import {
  addCosmetic,
  canBuyCosmetic,
  equippedCosmetic,
  isCosmeticId,
  ownedCosmetics,
  ownsCosmetic,
  shownCosmetic,
} from '../cosmetics';

describe('Kosmetik', () => {
  it('jedes Accessoire im Tab hat einen Preis', () => {
    for (const id of COSMETIC_IDS) expect(COSMETIC_ITEMS[id].priceCoins).toBeGreaterThan(0);
    expect(new Set(COSMETIC_IDS).size).toBe(Object.keys(COSMETIC_ITEMS).length);
  });

  it('erkennt nur bekannte IDs', () => {
    expect(isCosmeticId('u16_hat_crown')).toBe(true);
    expect(isCosmeticId('u16_pot_gold')).toBe(false);
    expect(isCosmeticId('toString')).toBe(false);
    expect(isCosmeticId(3)).toBe(false);
  });

  it('säubert die Besitzliste aus alten Spielständen', () => {
    expect(ownedCosmetics(['u16_hat_cap', 'weg', 'u16_hat_cap', null])).toEqual(['u16_hat_cap']);
    expect(ownedCosmetics(undefined)).toEqual([]);
  });

  it('kaufbar nur mit genug Münzen und nur einmal', () => {
    const price = COSMETIC_ITEMS.u16_sunglasses.priceCoins;
    expect(canBuyCosmetic([], 'u16_sunglasses', price)).toBe(true);
    expect(canBuyCosmetic([], 'u16_sunglasses', price - 1)).toBe(false);
    expect(canBuyCosmetic(['u16_sunglasses'], 'u16_sunglasses', 10_000)).toBe(false);
  });

  it('addCosmetic fügt einmal hinzu', () => {
    const once = addCosmetic([], 'u16_hat_straw');
    expect(once).toEqual(['u16_hat_straw']);
    expect(addCosmetic(once, 'u16_hat_straw')).toEqual(['u16_hat_straw']);
    expect(ownsCosmetic(once, 'u16_hat_straw')).toBe(true);
  });

  it('ausgerüstet ist nur, was gekauft ist', () => {
    expect(equippedCosmetic(['u16_hat_cap'], 'u16_hat_cap')).toBe('u16_hat_cap');
    expect(equippedCosmetic([], 'u16_hat_cap')).toBeNull();
    expect(equippedCosmetic(['u16_hat_cap'], 'weg')).toBeNull();
    expect(equippedCosmetic(['u16_hat_cap'], null)).toBeNull();
  });

  it('Anprobieren zeigt auch Ungekauftes, sonst das Ausgerüstete', () => {
    expect(shownCosmetic([], null, 'u16_hat_crown')).toBe('u16_hat_crown');
    expect(shownCosmetic(['u16_hat_cap'], 'u16_hat_cap', null)).toBe('u16_hat_cap');
    expect(shownCosmetic([], 'u16_hat_cap', null)).toBeNull();
  });
});
