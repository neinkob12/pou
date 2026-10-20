import { type PhaseId } from '../../game/config';
import { phaseLabels } from '../strings';
import { FACT_CARDS, factById, factsForPhase } from '../facts';

describe('facts', () => {
  it('enthält alle zehn Karten aus KONZEPT.md', () => {
    expect(FACT_CARDS).toHaveLength(10);
  });

  it('jede Karte hat Phase, Titel, Text, Quelle und einen https-Link', () => {
    for (const card of FACT_CARDS) {
      expect(Object.keys(phaseLabels)).toContain(card.phase);
      expect(card.title.trim()).not.toBe('');
      expect(card.text.trim()).not.toBe('');
      expect(card.source.trim()).not.toBe('');
      expect(() => new URL(card.url)).not.toThrow();
      expect(card.url.startsWith('https://')).toBe(true);
    }
  });

  it('Kartentexte haben höchstens zwei Sätze', () => {
    for (const card of FACT_CARDS) {
      const sentences = card.text.split(/[.!?](?:\s|$)/).filter((s) => s.trim() !== '');
      expect(sentences.length).toBeLessThanOrEqual(2);
    }
  });

  it('IDs sind eindeutig und über factById auffindbar', () => {
    const ids = FACT_CARDS.map((card) => card.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(factById(id)?.id).toBe(id);
    expect(factById('gibt-es-nicht')).toBeUndefined();
  });

  it('jede Quizfrage hat drei verschiedene Antworten und eine gültige Lösung', () => {
    for (const card of FACT_CARDS) {
      expect(card.quiz.question.trim()).not.toBe('');
      expect(new Set(card.quiz.options).size).toBe(3);
      expect(card.quiz.options[card.quiz.correctIndex]).toBeDefined();
    }
  });

  it('factsForPhase liefert die Karten der Phase', () => {
    const counts: Partial<Record<PhaseId, number>> = {
      germination: 2,
      seedling: 0,
      vegetative: 2,
      flowering: 3,
      ready: 0,
      drying: 2,
      done: 1,
    };
    for (const [phase, count] of Object.entries(counts)) {
      const cards = factsForPhase(phase as PhaseId);
      expect(cards).toHaveLength(count);
      for (const card of cards) expect(card.phase).toBe(phase);
    }
  });
});
