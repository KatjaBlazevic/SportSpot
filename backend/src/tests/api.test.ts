import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/authRoutes.ts';
import terminiRoutes from '../routes/terminiRoutes.ts';
import objektiRoutes from '../routes/objektiRoutes.ts';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/termini', terminiRoutes);
app.use('/api/objekti', objektiRoutes);

let tokenKorisnik: string = '';

describe('Auth API - funkcijski testovi', () => {
  it('POST /api/auth/registracija - registracija novog korisnika', async () => {
    const res = await request(app)
      .post('/api/auth/registracija')
      .send({
        ime: 'Test',
        prezime: 'Korisnik',
        email: `test_${Date.now()}@sportspot.hr`,
        lozinka: 'lozinka123',
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
  });

  it('POST /api/auth/prijava - prijava s krivim podacima vraća 401', async () => {
    const res = await request(app)
      .post('/api/auth/prijava')
      .send({ email: 'nepostoji@test.hr', lozinka: 'krivolozinka' });
    expect(res.status).toBe(401);
  });

  it('POST /api/auth/prijava - uspješna prijava vraća token', async () => {
    // Pretpostavlja da korisnik postoji u test bazi
    const res = await request(app)
      .post('/api/auth/prijava')
      .send({ email: 'kblazevic@veleri.hr', lozinka: 'katja123' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    tokenKorisnik = res.body.token;
  });
});

describe('Objekti API - funkcijski testovi', () => {
  it('GET /api/objekti - dohvat liste objekata', async () => {
    const res = await request(app).get('/api/objekti');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/objekti/:id - dohvat nepostojećeg objekta vraća 404', async () => {
    const res = await request(app).get('/api/objekti/999999');
    expect(res.status).toBe(404);
  });
});

describe('Termini API - funkcijski testovi', () => {
  it('GET /api/termini - dohvat termina bez filtera', async () => {
    const res = await request(app).get('/api/termini');
    expect(res.status).toBe(200);
  });

  it('POST /api/termini/rezerviraj/:id - bez tokena vraća 401', async () => {
    const res = await request(app).post('/api/termini/rezerviraj/1');
    expect(res.status).toBe(401);
  });
});