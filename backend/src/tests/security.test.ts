import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import authRoutes from '../routes/authRoutes.js';
import adminRoutes from '../routes/adminRoutes.js';
import korisnikRoutes from '../routes/korisnikRoutes.js';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/korisnik', korisnikRoutes);

const JWT_SECRET = process.env.JWT_SECRET || 'sportspot_tajni_kljuc';

// Token za običnog korisnika (User uloga)
const tokenUser = jwt.sign(
    { id: 999, email: 'user@test.hr', uloga: 'User' },
    JWT_SECRET,
    { expiresIn: '1h' }
);

// Istekli token
const tokenIstekao = jwt.sign(
    { id: 1, uloga: 'User' },
    JWT_SECRET,
    { expiresIn: '-1s' }
);

describe('Security testovi - zaštita ruta', () => {

    it('Pristup admin ruti bez tokena vraća 401', async () => {
        const res = await request(app).get('/api/admin/korisnici');
        expect(res.status).toBe(401);
    });

    it('Pristup admin ruti s isteklim tokenom vraća 401', async () => {
        const res = await request(app)
            .get('/api/admin/korisnici')
            .set('Authorization', `Bearer ${tokenIstekao}`);
        expect(res.status).toBe(401);
    });

    it('Pristup admin ruti s User ulogom vraća 403', async () => {
        const res = await request(app)
            .get('/api/admin/korisnici')
            .set('Authorization', `Bearer ${tokenUser}`);
        expect(res.status).toBe(403);
    });

    it('Pristup korisničkom profilu bez tokena vraća 401', async () => {
        const res = await request(app).get('/api/korisnik/profil');
        expect(res.status).toBe(401);
    });

    it('Slanje neispravnog tokena vraća 401', async () => {
        const res = await request(app)
            .get('/api/korisnik/profil')
            .set('Authorization', 'Bearer lazni.token.koji.ne.valja');
        expect(res.status).toBe(401);
    });

});