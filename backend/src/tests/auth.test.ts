import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';

const TAJNI_KLJUC = 'test_tajni_kljuc';

function generirajToken(id: number, uloga: string): string {
  return jwt.sign({ id, uloga }, TAJNI_KLJUC, { expiresIn: '1h' });
}

function verificirajToken(token: string): any {
  return jwt.verify(token, TAJNI_KLJUC);
}

describe('JWT autentifikacija - unit testovi', () => {
  it('treba generirati validan JWT token', () => {
    const token = generirajToken(1, 'User');
    expect(token).toBeTruthy();
    expect(typeof token).toBe('string');
  });

  it('treba dekodirati točne podatke iz tokena', () => {
    const token = generirajToken(42, 'Admin');
    const decoded: any = verificirajToken(token);
    expect(decoded.id).toBe(42);
    expect(decoded.uloga).toBe('Admin');
  });

  it('treba baciti grešku za nevažeći token', () => {
    expect(() => verificirajToken('lazni.token.xyz')).toThrow();
  });
});