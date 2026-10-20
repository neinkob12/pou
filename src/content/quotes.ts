// Budi-Sprüche (Text-Asset T1, docs/ASSETS.md). Ton: frech, albern, Budi ist eine Pflanze.
// Nie Konsum, Wirkung oder Verkauf. Sortennamen kommen aus STRAINS in config.ts.

import type { PhaseId, StrainId } from '../game/config';

export type QuoteSituation =
  | 'greeting' // App geöffnet
  | 'thirsty' // Wasser niedrig
  | 'hungry' // Nährstoffe niedrig
  | 'petted' // gestreichelt
  | 'nightDisturbed'; // nachts geweckt, Licht aus

export const QUOTES: Record<QuoteSituation, readonly string[]> = {
  greeting: [
    'Da bist du ja! Ich hab extra ein neues Blatt für dich gemacht.',
    'Hallo! Ich bin seit gestern mindestens zwei Millimeter gewachsen.',
    'Endlich! Mir war schon langweilig, ich hab mit der Gießkanne geredet.',
    'Guten Tag, Gärtner meines Herzens!',
    'Ach, du schon wieder. Kleiner Scherz, ich freu mich riesig!',
    'Willkommen zurück im schönsten Topf der Welt.',
    'Wurzeln: fest. Blätter: grün. Laune: steigt gerade.',
    'Hey! Hast du mich vermisst? Ich dich nämlich voll.',
  ],
  thirsty: [
    'Wasser! Ich bin trockener als ein Knäckebrot.',
    'Meine Wurzeln schreiben gerade ein Beschwerdeschreiben.',
    'Ein Schlückchen? Bitte? Nur ein winziges Schlückchen?',
    'Ich lass schon die Blätter hängen. Das ist ein Hinweis.',
    'Selbst ein Kaktus würde mich jetzt bemitleiden.',
    'Gießkanne. Jetzt. Ich zähle bis drei.',
    'Mein Topf fühlt sich an wie die Sahara.',
  ],
  hungry: [
    'Mein Magen knurrt. Also, meine Wurzeln knurren.',
    'Ein bisschen Dünger wär jetzt Gold wert.',
    'Ich kann nicht wachsen, wenn ich nur von Luft und Liebe lebe.',
    'Nährstoffe? Hallo? Ich bin im Wachstum!',
    'Meine Blätter werden schon blass vor Hunger.',
    'Ich hätte gern das Gericht des Tages: Bio-Erde mit Extra-Stickstoff.',
    'Ohne Futter mach ich keine einzige Blüte. Nur so als Info.',
  ],
  petted: [
    'Hihi, das kitzelt an den Blättern!',
    'Mehr! Genau da, am Stängel!',
    'Ich bin offiziell die glücklichste Pflanze im Raum.',
    'Wenn ich schnurren könnte, würde ich schnurren.',
    'Vorsicht, ich werde gleich rot. Na gut, grün.',
    'Streicheln zählt als Dünger für die Seele.',
    'Ich wachse gerade vor lauter Freude einen Zentimeter.',
    'Du hast echt grüne Daumen. Und weiche Finger.',
  ],
  nightDisturbed: [
    'Psst! Es ist dunkel, ich mach gerade Pflanzenschlaf.',
    'Licht aus heißt Ruhe! Meine Blüten brauchen das.',
    'Zzz... was? Wer? Ach, du. Gute Nacht!',
    'Ich träume gerade von Regenwürmern. Stör mich nicht.',
    'Nachts wird nicht gequatscht, nachts wird gewachsen.',
    'Mach die Augen zu, ich mach die Blätter zu.',
    'Komm morgen wieder, der Mond passt heute auf mich auf.',
  ],
};

/** Budis Spruch beim Wechsel in die jeweilige Phase. */
export const PHASE_CHANGE_QUOTES: Record<PhaseId, readonly string[]> = {
  germination: ['Plopp! Ich bin aus der Schale geschlüpft. Hallo Welt!'],
  seedling: [
    'Schau, meine ersten echten Blätter! Ich bin jetzt ein Sämling.',
    'Ich bin klein, aber oho.',
  ],
  vegetative: [
    'Wachstumsschub! Ich werde riesig, versprochen.',
    'Mehr Licht, mehr Blätter, mehr Budi!',
  ],
  flowering: [
    'Ich blühe auf! Ab jetzt bin ich eine richtige Diva.',
    'Kurze Tage, große Pläne: Blütezeit!',
  ],
  ready: [
    'Ich bin reif! Schau mal unter die Lupe, wie hübsch ich bin.',
    'Erntezeit! Ich bin bereit für meinen großen Auftritt auf dem Kräutermarkt.',
  ],
  drying: ['Jetzt häng ich hier ab. Wortwörtlich.'],
  done: [
    'Fertig! Ab mit mir zum Kräutermarkt.',
    'Geschafft! Pflanz gleich den nächsten Samen, ich will Gesellschaft.',
  ],
};

/** Eigene Sprüche je Sorte, mindestens drei. Passend zur Besonderheit aus KONZEPT.md. */
export const STRAIN_QUOTES: Record<StrainId, readonly string[]> = {
  gustav: [
    'Ich bin Gurken-Gustav. Pflegeleicht, aber nicht anspruchslos!',
    'Keine Panik, ich verzeih dir auch mal einen vergessenen Gießtag.',
    'Gurke? Nein, Gustav. Ich bin nur sehr grün.',
  ],
  lotte: [
    'Lila steht mir einfach am besten, findest du nicht?',
    'Ich bin Lila Lotte und färb mich, wann ich will.',
    'Andere sind grün vor Neid. Ich bin lila vor Stolz.',
  ],
  sascha: [
    'Mehr Licht! Ich bin Sativa Sascha und will bis zur Decke.',
    'Ich bin nicht groß, die anderen sind nur klein.',
    'Gib mir Zeit und Licht, dann wird die Ernte riesig.',
  ],
  anton: [
    'Auto-Anton, zu Diensten! Ich blüh einfach los, ganz ohne Lichtwechsel.',
    'Schnell, schneller, Anton!',
    'Warten ist was für andere Pflanzen.',
  ],
  koelsch: [
    'Alaaf! Ich bin die Kölsche Knospe, un dat is jot so.',
    'Et kütt, wie et kütt. Und ich kumm golden!',
    'Hück is ene schöne Daach zom Wachse.',
  ],
};

/**
 * Wählt einen Spruch für eine Situation. Bei der Begrüßung kommen die Sprüche der Sorte dazu,
 * bei Durst oder Hunger würde ein Sortenspruch nicht passen. `random` liefert eine Zahl in [0, 1), wie Math.random, damit Tests deterministisch sind.
 */
export function pickQuote(
  situation: QuoteSituation,
  strain?: StrainId,
  random: () => number = Math.random,
): string {
  const pool =
    situation === 'greeting' && strain
      ? [...QUOTES[situation], ...STRAIN_QUOTES[strain]]
      : QUOTES[situation];
  return pool[Math.floor(random() * pool.length) % pool.length];
}

/** Wählt den Spruch zum Phasenwechsel. */
export function pickPhaseChangeQuote(phase: PhaseId, random: () => number = Math.random): string {
  const pool = PHASE_CHANGE_QUOTES[phase];
  return pool[Math.floor(random() * pool.length) % pool.length];
}
