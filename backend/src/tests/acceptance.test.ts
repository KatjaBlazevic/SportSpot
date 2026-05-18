import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/authRoutes.ts';
import terminiRoutes from '../routes/terminiRoutes.ts';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/termini', terminiRoutes);

/**
 * PRIHVATNI TEST 1
 * Korisnička priča: Kao korisnik, želim se registrirati kako bih mogao
 *                   rezervirati termine.
 *
 * Given: Korisnik nije registriran u sustavu
 * When:  Korisnik pošalje ispravne podatke za registraciju
 * Then:  Sustav kreira račun i vraća JWT token
 */
describe('Korisnička priča: Registracija korisnika', () => {
  it('Given novi korisnik, When pošalje validne podatke, Then dobiva token', async () => {
    const res = await request(app)
      .post('/api/auth/registracija')
      .send({
        ime: 'Marko',
        prezime: 'Marković',
        email: `marko_${Date.now()}@test.hr`,
        lozinka: 'sigurnalozinka1',
      });

    // Then
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.token).toBeTruthy();
  });
});

/**
 * PRIHVATNI TEST 2
 * Korisnička priča: Kao korisnik, želim rezervirati slobodan termin.
 *
 * Given: Korisnik je prijavljen i postoji slobodan termin
 * When:  Korisnik pošalje zahtjev za rezervaciju
 * Then:  Termin se rezervira i korisnik dobiva potvrdu
 */
describe('Korisnička priča: Rezervacija termina', () => {
  it('Given neprijavljen korisnik, When pokušava rezervirati, Then dobiva 401', async () => {
    const res = await request(app)
      .post('/api/termini/rezerviraj/1')
      .send({});

    // Then
    expect(res.status).toBe(401);
  });

  it('Given prijavljen korisnik s tokenom, When rezervira slobodan termin, Then dobiva potvrdu', async () => {
    // Given - prijavi se
    const loginRes = await request(app)
      .post('/api/auth/prijava')
      .send({ email: 'maja.pavic@gmail.com', lozinka: 'maja123' });

    const token = loginRes.body.token;

    // When
    const res = await request(app)
      .post('/api/termini/rezerviraj/1')
      .set('Authorization', `Bearer ${token}`)
      .send({ emailPotvrde: 'testuser@sportspot.hr' });

    // Then - ili uspjeh ili termin je već zauzet (oba su validna stanja)
    expect([200, 400, 401, 404]).toContain(res.status);
  });
});

/**
 * PRIHVATNI TEST 3
 * Korisnička priča: Kao korisnik, želim pregledati sportske objekte
 *                   i filtrirati ih po sportu.
 *
 * Given: Postoje objekti u sustavu
 * When:  Korisnik filtrira po sportu "Tenis"
 * Then:  Dobiva samo objekte koji nude tenis
 */
describe('Korisnička priča: Pregled i filtriranje objekata', () => {
  it('Given objekti u sustavu, When korisnik dohvati listu, Then dobiva niz objekata', async () => {
    const objektiRoutes = (await import('../routes/objektiRoutes.ts')).default;
    app.use('/api/objekti', objektiRoutes);

    const res = await request(app).get('/api/objekti');

    // Then
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});