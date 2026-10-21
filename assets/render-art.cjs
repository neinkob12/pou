/* global __dirname, Buffer */
// Rendert gezeichnete Skia-Grafik (src/components/**/art) als PNG nach assets/ (WEB-4).
// Für Stellen, die ein Bild aus src/lib/assets.ts erwarten (Ernte-Screen, Shop, Accessoires).
// Aufruf im Repo-Root: node assets/render-art.cjs
// Läuft mit CanvasKit (WebAssembly) aus @shopify/react-native-skia, ohne Browser.
const fs = require('fs');
const path = require('path');
const Module = require('module');

const ROOT = path.join(__dirname, '..');
const skiaDir = path.join(ROOT, 'node_modules/@shopify/react-native-skia/lib/commonjs');
const headlessPath = path.join(skiaDir, 'headless/index.js');

// Die Zeichnungen importieren '@shopify/react-native-skia'; im Node-Lauf zeigt das auf die Headless-Variante.
const resolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
  if (request === '@shopify/react-native-skia') return headlessPath;
  return resolve.call(this, request, ...rest);
};
const sucrase = require('sucrase/dist/register');
sucrase.addHook('.tsx', { transforms: ['typescript', 'jsx', 'imports'], jsxRuntime: 'automatic', production: true });
sucrase.addHook('.ts', { transforms: ['typescript', 'imports'] });

const React = require('react');

const h = React.createElement;
const src = (p) => require(path.join(ROOT, 'src', p));

/**
 * Ein Bild: `art` in Einheiten, Ausschnitt `view` (x, y, w, h), Ausgabe `w` × `h` Pixel.
 * Der Ausschnitt wird eingepasst und zentriert, der Rest bleibt durchsichtig.
 */
function jobs() {
  const { HarvestArt } = src('components/budi/art/HarvestArt.tsx');
  const { DryingRoomArt, DRYING_ROOM_H } = src('components/budi/art/DryingRoomArt.tsx');
  const { AccessoryArt } = src('components/budi/art/AccessoryArt.tsx');
  const { plantPalette } = src('components/budi/art/palette.ts');
  const { IconArt } = src('components/ui/icons/iconArt.tsx');
  const icon = (file, id) => ({ file: `images/${file}.png`, w: 384, h: 384, view: [0, 0, 100, 100], art: h(IconArt, { id }) });
  const accessory = (id) => ({ file: `budi/${id}.png`, w: 1024, h: 1024, view: [0, 0, 100, 100], art: h(AccessoryArt, { id }) });
  return [
    { file: 'images/b8_crate.png', w: 540, h: 360, view: [4, 22, 92, 76], art: h(HarvestArt, { kind: 'crate', palette: plantPalette(null, true) }) },
    { file: 'images/b7_drying.png', w: 500, h: 300, view: [0, 6, 100, 80], art: h(HarvestArt, { kind: 'drying', palette: plantPalette(null, true) }) },
    { file: 'images/h3_drying_room.png', w: 780, h: 240, view: [0, 0, 100, DRYING_ROOM_H], art: h(DryingRoomArt) },
    icon('u7_lupe', 'lupe'),
    icon('u8_scissors', 'scissors'),
    icon('u1_pot_1', 'potTier1'),
    icon('u1_pot_2', 'potTier2'),
    icon('u1_pot_3', 'potTier3'),
    icon('u2_led_on', 'led'),
    icon('u4_special', 'bioSoil'),
    icon('u6_dehumidifier', 'fanDehumidifier'),
    icon('beneficials', 'ladybug'),
    accessory('u16_sunglasses'),
    accessory('u16_hat_cap'),
    accessory('u16_hat_straw'),
    accessory('u16_hat_crown'),
  ];
}

async function main() {
  const { LoadSkiaWeb } = require(path.join(skiaDir, 'web/LoadSkiaWeb.js'));
  await LoadSkiaWeb();
  const sk = require(headlessPath);
  // Headless exportiert vec nicht; die Zeichnungen brauchen es für Verläufe.
  if (!sk.vec) sk.vec = (x = 0, y) => ({ x, y: y ?? x });
  const only = process.argv[2];
  for (const job of jobs()) {
    if (only && !job.file.includes(only)) continue;
    const [vx, vy, vw, vh] = job.view;
    const scale = Math.min(job.w / vw, job.h / vh);
    const dx = (job.w - vw * scale) / 2 - vx * scale;
    const dy = (job.h - vh * scale) / 2 - vy * scale;
    const surface = sk.makeOffscreenSurface(job.w, job.h);
    const el = h(sk.Group, { transform: [{ translateX: dx }, { translateY: dy }, { scale }] }, job.art);
    const image = await sk.drawOffscreen(surface, el);
    const out = path.join(__dirname, job.file);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, Buffer.from(image.encodeToBytes()));
    console.log('geschrieben', job.file);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
