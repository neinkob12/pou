// Gemeinsame Typen für Store-Slices.
// Ein Slice sieht nur seinen eigenen Zustand. Wer Werte aus anderen Slices braucht, liest sie
// in einem Hook oder in src/game/ über useGameStore.getState().

export type SliceSet<T> = (partial: Partial<T> | ((state: T) => Partial<T>)) => void;
export type SliceGet<T> = () => T;
export type SliceCreator<T> = (set: SliceSet<T>, get: SliceGet<T>) => T;
