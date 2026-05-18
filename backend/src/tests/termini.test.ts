import { describe, it, expect } from 'vitest';

type Status = 'Slobodan' | 'Zauzet' | 'Blokiran';

interface Termin {
  id: number;
  status: Status;
  cijena: number;
}

function mozeSerezervirat(termin: Termin): boolean {
  return termin.status === 'Slobodan';
}

function izracunajUkupnuCijenu(termini: Termin[]): number {
  return termini.reduce((sum, t) => sum + t.cijena, 0);
}

describe('Poslovna logika termina - unit testovi', () => {
  it('slobodan termin može se rezervirati', () => {
    const termin: Termin = { id: 1, status: 'Slobodan', cijena: 50 };
    expect(mozeSerezervirat(termin)).toBe(true);
  });

  it('zauzet termin ne može se rezervirati', () => {
    const termin: Termin = { id: 2, status: 'Zauzet', cijena: 50 };
    expect(mozeSerezervirat(termin)).toBe(false);
  });

  it('blokiran termin ne može se rezervirati', () => {
    const termin: Termin = { id: 3, status: 'Blokiran', cijena: 50 };
    expect(mozeSerezervirat(termin)).toBe(false);
  });

  it('ispravno izračunava ukupnu cijenu više termina', () => {
    const termini: Termin[] = [
      { id: 1, status: 'Slobodan', cijena: 30 },
      { id: 2, status: 'Slobodan', cijena: 45 },
      { id: 3, status: 'Slobodan', cijena: 25 },
    ];
    expect(izracunajUkupnuCijenu(termini)).toBe(100);
  });
});