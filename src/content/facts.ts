// Fakten-Karten (Lernmodul, docs/KONZEPT.md). Budi erzählt sie selbst, maximal zwei Sätze.
// Jede Karte gehört zu einer Phase und wird beim Phasenwechsel freigeschaltet (UI und Quiz: P17).
// Inhalt bleibt bei Botanik und Anbau (Feste Regeln in CLAUDE.md).

import type { PhaseId } from '../game/config';

export interface FactQuiz {
  question: string;
  /** Genau drei Antworten, eine davon richtig. */
  options: [string, string, string];
  correctIndex: 0 | 1 | 2;
}

export interface FactCard {
  id: string;
  /** Phase, in der die Karte freigeschaltet wird. "Lagerung" hängt an `done`. */
  phase: PhaseId;
  title: string;
  /** In Budis Stimme, höchstens zwei Sätze. */
  text: string;
  /** Kurzangabe der Quelle, wie sie auf der Karte steht. */
  source: string;
  /** Link zur Quelle, öffnet den Browser. */
  url: string;
  /** Frage fürs Fakten-Quiz (P17). */
  quiz: FactQuiz;
}

export const FACT_CARDS: readonly FactCard[] = [
  {
    id: 'germination-bbch',
    phase: 'germination',
    title: 'Neun Lebensstadien',
    text: 'Forscher teilen das Hanfleben in neun Hauptstadien ein, von der Keimung bis zum Absterben. Ich bin gerade in Stadium 0, also ganz am Anfang!',
    source: 'Mishchenko et al. 2017',
    url: 'https://lmaleidykla.lt/ojs/index.php/zemesukiomokslai/article/view/3496',
    quiz: {
      question: 'In wie viele Hauptstadien teilen Forscher das Hanfleben ein?',
      options: ['Drei', 'Neun', 'Zwölf'],
      correctIndex: 1,
    },
  },
  {
    id: 'germination-temperature',
    phase: 'germination',
    title: 'Kuschelig warm',
    text: 'Ob ich keime, hängt stark von der Temperatur ab. Rund 25 °C finde ich optimal, wie ein Sommertag im Topf.',
    source: 'Kaufman et al. 1974, zitiert bei CED Clinic',
    url: 'https://cedclinic.com/?p=76915',
    quiz: {
      question: 'Welche Temperatur gilt beim Keimen als optimal?',
      options: ['Rund 10 °C', 'Rund 25 °C', 'Rund 40 °C'],
      correctIndex: 1,
    },
  },
  {
    id: 'vegetative-long-days',
    phase: 'vegetative',
    title: 'Lange Tage, viel Blatt',
    text: 'Solange ich mindestens 16 Stunden Licht bekomme, bleibe ich im Wachstumsmodus. Dann mache ich Blätter statt Blüten.',
    source: 'Plants 2023',
    url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10004775/',
    quiz: {
      question: 'Wie viele Stunden Licht halten Budi im Wachstumsmodus?',
      options: ['Mindestens 8', 'Mindestens 12', 'Mindestens 16'],
      correctIndex: 2,
    },
  },
  {
    id: 'vegetative-energy',
    phase: 'vegetative',
    title: 'Stromfresser Lampe',
    text: 'Indoor-Anbau gilt in den USA als einer der energiehungrigsten Wirtschaftszweige. Meine Lampe frisst mehr, als du denkst.',
    source: 'Eaves et al. 2019, Frontiers in Plant Science',
    url: 'https://www.frontiersin.org/journals/plant-science/articles/10.3389/fpls.2019.00296/epub',
    quiz: {
      question: 'Was frisst beim Indoor-Anbau besonders viel Energie?',
      options: ['Die Lampe', 'Der Topf', 'Die Gießkanne'],
      correctIndex: 0,
    },
  },
  {
    id: 'flowering-short-days',
    phase: 'flowering',
    title: 'Kein Blüten-Schalter',
    text: 'Kurze Tage schalten meine Blüte nicht einfach an, sie bauen meine Triebspitzen zu dichten Blütenständen um. Einzelblüten mache ich sowieso, je nach Alter.',
    source: 'Spitzer-Rimon et al. 2019',
    url: 'https://www.frontiersin.org/journals/plant-science/articles/10.3389/fpls.2019.00350/full',
    quiz: {
      question: 'Was machen kurze Tage mit Budis Triebspitzen?',
      options: [
        'Sie bauen sie zu dichten Blütenständen um',
        'Sie lassen sie abfallen',
        'Sie färben sie blau',
      ],
      correctIndex: 0,
    },
  },
  {
    id: 'flowering-gibberellin',
    phase: 'flowering',
    title: 'Hormon-Hauptschalter',
    text: 'Im Kurztag sinkt mein Gibberellin-Spiegel. Das Hormon wirkt wie ein Hauptschalter für meine Blütenform.',
    source: 'Alter et al. 2024',
    url: 'https://www.newswise.com/articles/how-light-and-hormones-shape-cannabis-flowers',
    quiz: {
      question: 'Welches Hormon wirkt wie ein Hauptschalter für Budis Blütenform?',
      options: ['Adrenalin', 'Gibberellin', 'Insulin'],
      correctIndex: 1,
    },
  },
  {
    id: 'flowering-twelve-twelve',
    phase: 'flowering',
    title: '12/12 ist nur eine Faustregel',
    text: '12 Stunden Licht, 12 Stunden Dunkel ist eine Faustregel. Viele Sorten blühen auch bei etwas mehr als 12 Stunden Licht.',
    source: 'Plants 2023',
    url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10004775/',
    quiz: {
      question: 'Blühen viele Sorten auch bei etwas mehr als 12 Stunden Licht?',
      options: ['Ja, 12/12 ist nur eine Faustregel', 'Nein, niemals', 'Nur bei Vollmond'],
      correctIndex: 0,
    },
  },
  {
    id: 'drying-terpenes',
    phase: 'drying',
    title: 'Nicht zu heiß!',
    text: 'Wer mich zu heiß trocknet, verliert meine Duftstoffe, die Terpene. Also bitte schön gemütlich.',
    source: 'Solar Drying of Floral Hemp, Dissertation UC',
    url: 'https://escholarship.org/uc/item/2w5586rd',
    quiz: {
      question: 'Was geht verloren, wenn Budi zu heiß getrocknet wird?',
      options: ['Wurzeln', 'Duftstoffe (Terpene)', 'Der Topf'],
      correctIndex: 1,
    },
  },
  {
    id: 'drying-botrytis',
    phase: 'drying',
    title: 'Achtung, Schimmel',
    text: 'Klassisches Trocknen kann Schimmelpilze wie Botrytis begünstigen. Frische Luft ist mein bester Freund.',
    source: 'Birenboim et al. 2024, Plants',
    url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11013261/',
    quiz: {
      question: 'Welcher Schimmelpilz kann beim Trocknen Ärger machen?',
      options: ['Botrytis', 'Hefe', 'Fliegenpilz'],
      correctIndex: 0,
    },
  },
  {
    id: 'storage-cool',
    phase: 'done',
    title: 'Kühl lagern',
    text: 'Bei 25 °C verändern sich meine Inhaltsstoffe am stärksten. Kühlschranktemperatur schneidet am besten ab, brrr, aber gut.',
    source: 'Milay et al. 2020, Frontiers in Plant Science',
    url: 'https://public-pages-files-2025.frontiersin.org/journals/plant-science/articles/10.3389/fpls.2020.583605/text',
    quiz: {
      question: 'Bei welcher Temperatur hält sich die Ernte laut Studie am besten?',
      options: ['Kühlschranktemperatur', '25 °C', 'In der Sonne'],
      correctIndex: 0,
    },
  },
];

/** Alle Karten, die beim Wechsel in diese Phase freigeschaltet werden. */
export function factsForPhase(phase: PhaseId): FactCard[] {
  return FACT_CARDS.filter((card) => card.phase === phase);
}

export function factById(id: string): FactCard | undefined {
  return FACT_CARDS.find((card) => card.id === id);
}
