// Jest-Ersatz für react-native-nitro-modules: Die native Brücke fehlt in Tests.
// react-native-mmkv nutzt unter Jest seine eigene In-Memory-Attrappe und braucht nur den Import.
// Gilt automatisch für alle Tests (Ordner __mocks__ neben node_modules).

export const NitroModules = {
  createHybridObject: (name: string): never => {
    throw new Error(`NitroModules.createHybridObject('${name}') ist in Tests nicht verfügbar`);
  },
};
