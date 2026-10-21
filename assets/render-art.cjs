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
  const { AppIconArt } = src('components/ui/icons/appIconArt.tsx');
  const icon = (file, id) => ({ file: `images/${file}.png`, w: 384, h: 384, view: [0, 0, 100, 100], art: h(IconArt, { id }) });
  // ART-2: kleine Icons für die Oberfläche (bis 85 pt bei 3x scharf).
  const small = (file, id) => ({ file: `images/${file}.png`, w: 256, h: 256, view: [0, 0, 100, 100], art: h(IconArt, { id }) });
  const accessory = (id) => ({ file: `budi/${id}.png`, w: 1024, h: 1024, view: [0, 0, 100, 100], art: h(AccessoryArt, { id }) });
  const app = (file, variant, w) => ({
    file: `icon/${file}.png`,
    w,
    h: w,
    view: [0, 0, 100, 100],
    art: (sk) => h(AppIconArt, { variant, font: variant === 'splash' ? loadFont(sk, 17) : undefined }),
  });
  const strains = ['gustav', 'lotte', 'sascha', 'anton', 'koelsch'];
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
    // ART-2: Oberfläche, Pflege, Schädlinge, Sorten
    small('u9_coin', 'coin'),
    small('u10_seed_fragment', 'seedFragment'),
    small('u11_water', 'water'),
    small('u11_nutrients', 'nutrients'),
    small('u11_light', 'light'),
    small('u11_mood', 'mood'),
    small('u12_minigames', 'minigames'),
    small('u12_shop', 'shop'),
    small('u12_album', 'album'),
    small('u12_settings', 'settings'),
    small('u13_chest', 'chest'),
    small('u13_chest_open', 'chestOpen'),
    small('ui_star', 'star'),
    small('ui_lock', 'lock'),
    small('ui_seed', 'seed'),
    small('ui_gem', 'gem'),
    small('u3_watering_can', 'wateringCan'),
    small('u4_fertilizer_grow', 'fertilizerGrow'),
    small('u4_fertilizer_bloom', 'fertilizerBloom'),
    small('u17_spider_mite', 'mite'),
    small('u17_fungus_gnat', 'gnat'),
    small('u17_mold', 'mold'),
    ...strains.map((id) => small(`u15_${id}`, `packet_${id}`)),
    ...strains.map((id) => small(`strain_badge_${id}`, `badge_${id}`)),
    // ART-2: App-Icon (iOS ohne Transparenz), Android-Ebenen, Favicon, Ladebild
    app('icon', 'icon', 1024),
    app('android-icon-background', 'background', 512),
    app('android-icon-foreground', 'foreground', 512),
    app('android-icon-monochrome', 'monochrome', 432),
    app('favicon', 'favicon', 196),
    app('splash-icon', 'splash', 1024),
  ];
}

/** Schrift für Beschriftungen (Icon-Blatt, Logo): Fredoka aus @expo-google-fonts. */
function loadFont(sk, size) {
  const { Skia } = sk.getSkiaExports();
  const file = path.join(ROOT, 'node_modules/@expo-google-fonts/fredoka/700Bold/Fredoka_700Bold.ttf');
  const face = Skia.Typeface.MakeFreeTypeFaceFromData(Skia.Data.fromBytes(new Uint8Array(fs.readFileSync(file))));
  return Skia.Font(face, size);
}

/** Icon-Blatt: alle Icons im Raster mit Namen, als Übersicht für docs/progress/art2.md. */
async function sheet(sk, out) {
  const { IconArt, GAME_ICON_IDS } = src('components/ui/icons/iconArt.tsx');
  const font = loadFont(sk, 13);
  const cols = 8;
  const cell = 132;
  const icon = 100;
  const rows = Math.ceil(GAME_ICON_IDS.length / cols);
  const W = cols * cell;
  const H = rows * cell;
  const kids = [h(sk.Rect, { key: 'bg', x: 0, y: 0, width: W, height: H, color: '#FFF4E0' })];
  GAME_ICON_IDS.forEach((id, i) => {
    const x = (i % cols) * cell;
    const y = Math.floor(i / cols) * cell;
    const tw = font.measureText ? font.measureText(id).width : id.length * 7;
    kids.push(h(sk.Group, { key: id, transform: [{ translateX: x + (cell - icon) / 2 }, { translateY: y + 4 }] }, h(IconArt, { id })));
    kids.push(h(sk.Text, { key: `t${id}`, x: x + (cell - tw) / 2, y: y + cell - 12, text: id, font, color: '#2F5D3A' }));
  });
  const surface = sk.makeOffscreenSurface(W, H);
  const image = await sk.drawOffscreen(surface, h(sk.Group, null, kids));
  fs.writeFileSync(out, Buffer.from(image.encodeToBytes()));
  console.log('geschrieben', out);
}

async function main() {
  const { LoadSkiaWeb } = require(path.join(skiaDir, 'web/LoadSkiaWeb.js'));
  await LoadSkiaWeb();
  const sk = require(headlessPath);
  // Headless exportiert vec nicht; die Zeichnungen brauchen es für Verläufe.
  if (!sk.vec) sk.vec = (x = 0, y) => ({ x, y: y ?? x });
  if (process.argv[2] === '--sheet') return sheet(sk, path.resolve(process.argv[3]));
  const only = process.argv[2];
  for (const job of jobs()) {
    if (only && !job.file.includes(only)) continue;
    const [vx, vy, vw, vh] = job.view;
    const scale = Math.min(job.w / vw, job.h / vh);
    const dx = (job.w - vw * scale) / 2 - vx * scale;
    const dy = (job.h - vh * scale) / 2 - vy * scale;
    const surface = sk.makeOffscreenSurface(job.w, job.h);
    const art = typeof job.art === 'function' ? job.art(sk) : job.art;
    const el = h(sk.Group, { transform: [{ translateX: dx }, { translateY: dy }, { scale }] }, art);
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
