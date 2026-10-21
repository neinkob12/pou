// Bewegungswerte für Budi (ART-3). UI-Konstanten, keine Balancing-Werte.

/** Atmen: Budi wird beim Einatmen etwas höher und schmaler. Im Schlaf langsamer und tiefer. */
export const BREATH_MS = 1800;
export const BREATH_SCALE = 0.025;
export const SLEEP_BREATH_MS = 2800;
export const SLEEP_BREATH_SCALE = 0.045;
/** Die Pflanze wippt sanft im Wind. */
export const SWAY_MS = 2600;
export const SWAY_DEG = 2.5;
/** Nachfedern der Pflanze nach Sprung oder Stauchung (Follow-through). */
export const PLANT_KICK_DEG = 7;
export const PLANT_KICK_SCALE = 0.08;

/** Pausen zwischen zwei Blinzlern, im Wechsel, damit es nicht mechanisch wirkt. */
export const BLINK_PAUSES_MS = [3200, 4700, 2100, 5200, 900] as const;
export const BLINK_HALF_MS = 70;
/** Kleine Gesten, wenn nichts passiert (Umschauen, Kopf neigen, Hüpfer). */
export const FIDGET_PAUSES_MS = [6500, 9000, 7500, 11000] as const;
/** Blick: wie weit die Iris wandert (Budi-Einheiten). */
export const GAZE_X = 1.7;
export const GAZE_Y = 0.8;
export const GAZE_MS = 240;
export const GAZE_HOLD_MS = 700;

/** Neigung des ganzen Budi in Grad je Einheit `tilt`. */
export const TILT_DEG = 6;
/** Sprunghöhe als Anteil der Budi-Größe. */
export const HOP_HEIGHT = 0.16;
export const SMALL_HOP_HEIGHT = 0.08;
/** Seitliches Zittern (Kichern, Kopfschütteln) als Anteil der Budi-Größe. */
export const SHAKE = 0.03;

/** Squash & Stretch beim Hüpfen: Ausholen, Absprung, Landung. */
export const SQUASH = { x: 1.16, y: 0.84 };
export const STRETCH = { x: 0.9, y: 1.14 };
export const LAND = { x: 1.2, y: 0.8 };
export const ANTICIPATION_MS = 110;
export const RISE_MS = 260;
export const FALL_MS = 220;
export const LAND_MS = 80;

/** Federn: wenig Dämpfung = deutliches Nachfedern (Overshoot). */
export const BOUNCY = { damping: 7, stiffness: 260, mass: 0.7 };
export const SOFT = { damping: 12, stiffness: 140, mass: 1 };
export const WOBBLY = { damping: 4, stiffness: 180, mass: 0.6 };

/** Budi wird größer, wenn ein Werkzeug über ihm schwebt ("Mund auf"). */
export const HOVER_SCALE = 0.08;

/** Mund: Kauen beim Düngen, Schlucken beim Gießen, Ploppen beim Mimikwechsel. */
export const CHEW_MS = 110;
export const CHEWS = 4;
export const GULPS = 3;
export const GULP_MS = 140;
/** Herzklopfen der Herzaugen (verliebt). */
export const HEARTBEAT = 0.2;
export const HEARTBEAT_MS = 130;
/** Strecken beim Aufwachen und wenn das Licht angeht. */
export const STRETCH_MS = 520;
export const STRETCH_HOLD_MS = 260;
export const WAKE_STRETCH = { x: 0.86, y: 1.2 };
/** Einschlafen: Budi sackt langsam ein und nickt weg. */
export const DOZE_MS = 1100;
export const DOZE = { x: 1.05, y: 0.93 };
