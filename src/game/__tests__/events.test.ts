import { createEventBus, gameEvents, type GameEvents } from '../events';

const T0 = Date.UTC(2026, 9, 1, 12, 0, 0);

describe('events', () => {
  afterEach(() => gameEvents.clear());

  it('liefert das Ereignis an alle Listener mit Payload', () => {
    const bus = createEventBus<GameEvents>();
    const a = jest.fn();
    const b = jest.fn();
    bus.on('careAction', a);
    bus.on('careAction', b);
    bus.emit('careAction', { action: 'water', atMs: T0 });
    expect(a).toHaveBeenCalledWith({ action: 'water', atMs: T0 });
    expect(b).toHaveBeenCalledTimes(1);
  });

  it('trennt Ereignisse nach Namen', () => {
    const bus = createEventBus<GameEvents>();
    const listener = jest.fn();
    bus.on('harvested', listener);
    bus.emit('phaseChanged', { from: 'seedling', to: 'vegetative', atMs: T0 });
    expect(listener).not.toHaveBeenCalled();
  });

  it('meldet über die Rückgabe von on und über off ab', () => {
    const bus = createEventBus<GameEvents>();
    const a = jest.fn();
    const b = jest.fn();
    const unsubscribe = bus.on('purchaseCompleted', a);
    bus.on('purchaseCompleted', b);
    unsubscribe();
    bus.off('purchaseCompleted', b);
    bus.emit('purchaseCompleted', { productId: 'turbo', atMs: T0 });
    expect(a).not.toHaveBeenCalled();
    expect(b).not.toHaveBeenCalled();
  });

  it('erlaubt Abmelden während des Aufrufs, ohne andere Listener zu überspringen', () => {
    const bus = createEventBus<GameEvents>();
    const second = jest.fn();
    const unsubscribe = bus.on('minigameFinished', () => unsubscribe());
    bus.on('minigameFinished', second);
    const payload = { gameId: 'tap', score: 10, coins: 5, atMs: T0 };
    bus.emit('minigameFinished', payload);
    bus.emit('minigameFinished', payload);
    expect(second).toHaveBeenCalledTimes(2);
  });

  it('stellt einen gemeinsamen Bus bereit, den clear leert', () => {
    const listener = jest.fn();
    gameEvents.on('harvested', listener);
    gameEvents.clear();
    gameEvents.emit('harvested', { strainId: 'gustav', yieldUnits: 10, stars: 3, atMs: T0 });
    expect(listener).not.toHaveBeenCalled();
  });
});
