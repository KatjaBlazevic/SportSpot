import express, { type Request, type Response } from "express";
import bcrypt from "bcrypt";
import pool from "../db.ts";
import { autentificiraj, type AuthRequest } from "../middleware/auth.ts";

const router = express.Router();

// GET /api/korisnik/profil
router.get("/profil", autentificiraj, async (req: AuthRequest, res: Response) => {
  try {
    const [rows] = await pool.query(
      "SELECT ID_korisnika, Ime, Prezime, Email, Broj_mobitela, Uloga FROM KORISNIK WHERE ID_korisnika = ?",
      [req.user?.id],
    ) as [any[], any];
    if (rows.length === 0) { res.status(404).json({ greska: "Korisnik ne postoji." }); return; }
    const k = rows[0];
    res.json({ id: k.ID_korisnika, ime: k.Ime, prezime: k.Prezime, email: k.Email, brojMobitela: k.Broj_mobitela, uloga: k.Uloga });
  } catch (error) {
    res.status(500).json({ greska: "Interna greška servera." });
  }
});

// POST /api/korisnik/profil/update
router.post("/profil/update", autentificiraj, async (req: AuthRequest, res: Response) => {
  const { ime, prezime, email, brojMobitela, novaLozinka } = req.body;
  try {
    const [currentRows] = await pool.query(
      "SELECT Ime, Prezime, Email, Broj_mobitela FROM KORISNIK WHERE ID_korisnika = ?",
      [req.user?.id],
    ) as [any[], any];
    const current = currentRows[0];
    if (!current) { res.status(404).json({ greska: "Korisnik ne postoji." }); return; }

    if (email && email !== current.Email) {
      const [existing] = await pool.query(
        "SELECT ID_korisnika FROM KORISNIK WHERE Email = ? AND ID_korisnika != ?",
        [email, req.user?.id],
      ) as [any[], any];
      if (existing.length > 0) { res.status(409).json({ greska: "Email je već u uporabi." }); return; }
    }

    let query = "UPDATE KORISNIK SET ";
    const params: (string | number)[] = [];
    if (ime && ime !== current.Ime) { query += "Ime = ?, "; params.push(ime); }
    if (prezime && prezime !== current.Prezime) { query += "Prezime = ?, "; params.push(prezime); }
    if (email && email !== current.Email) { query += "Email = ?, "; params.push(email); }
    if (brojMobitela !== undefined && brojMobitela !== current.Broj_mobitela) { query += "Broj_mobitela = ?, "; params.push(brojMobitela || ""); }
    if (novaLozinka) { const hash = await bcrypt.hash(novaLozinka, 10); query += "Lozinka = ?, "; params.push(hash); }
    if (params.length === 0) { res.json({ poruka: "Nema promjena za ažurirati." }); return; }

    query = query.slice(0, -2) + " WHERE ID_korisnika = ?";
    params.push(req.user?.id as number);
    await pool.query(query, params);
    res.json({ poruka: "Profil uspješno ažuriran." });
  } catch (error) {
    res.status(500).json({ greska: "Interna greška servera." });
  }
});

// GET /api/korisnik/moje-rezervacije
router.get("/moje-rezervacije", autentificiraj, async (req: AuthRequest, res: Response) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.ID_termina, t.ID_objekta, o.Naziv_objekta, o.Adresa, o.Kvart, k.Naziv_kluba, t.Datum,
       TIME_FORMAT(t.Vrijeme_pocetka, '%H:%i') AS vrijeme_pocetka,
       TIME_FORMAT(t.Vrijeme_kraja, '%H:%i') AS vrijeme_kraja, t.Cijena, t.Status
       FROM TERMINI t
       JOIN OBJEKTI o ON t.ID_objekta = o.ID_objekta
       LEFT JOIN KLUB k ON o.ID_kluba = k.ID_kluba
       WHERE t.ID_korisnika = ? AND t.Status != 'Slobodan'
       ORDER BY t.Datum DESC, t.Vrijeme_pocetka DESC`,
      [req.user?.id],
    ) as [any[], any];
    res.json(rows);
  } catch (error) {
    res.status(500).json({ greska: "Interna greška servera." });
  }
});

// GET /api/korisnik/sportovi
router.get("/sportovi", async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(
      "SELECT ID_sporta, Naziv_sporta FROM SPORT ORDER BY Naziv_sporta"
    ) as [any[], any];
    res.json(rows);
  } catch (error) {
    res.status(500).json({ greska: "Interna greška servera." });
  }
});

export default router;