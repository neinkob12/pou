const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Web (PWEB): CanvasKit für Skia wird als Asset gebündelt (src/lib/skiaWeb.web.ts).
config.resolver.assetExts.push('wasm');

module.exports = withNativeWind(config, { input: './global.css' });
