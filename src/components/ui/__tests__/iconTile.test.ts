import { initials } from '../IconTile';

describe('initials', () => {
  it('nimmt die Anfänge der großgeschriebenen Wörter', () => {
    expect(initials('Größerer Topf')).toBe('GT');
    expect(initials('Ventilator und Entfeuchter')).toBe('VE');
    expect(initials('LED-Lampe')).toBe('LL');
    expect(initials('Nützlings-Kit')).toBe('NK');
  });

  it('fällt auf die ersten Buchstaben zurück', () => {
    expect(initials('sonnenbrille')).toBe('so');
  });
});
