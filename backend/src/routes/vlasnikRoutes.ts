import express, { type Request, type Response } from "express";
import pool from "../db.ts";
import { autentificiraj, type AuthRequest } from "../middleware/auth.ts";

const router = express.Router();

// POST /api/vlasnik/objekti
router.post("/objekti", autentificiraj, async (req: AuthRequest, res: Response) => {
  const { naziv, adresa, kvart, kapacitet, opis, slikaUrl, sportovi, lat, lng } = req.body;
  if (!naziv || !adresa || !kvart) { res.status(400).json({ greska: "Naziv, adresa i kvart su obavezni." }); return; }
  try {
    const [result] = await pool.query(
      "INSERT INTO OBJEKTI (ID_korisnika, Naziv_objekta, Adresa, Kvart, Kapacitet, Opis, Slika_url, Status_objekta, Lat, Lng) VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending', ?, ?)",
      [req.user?.id, naziv, adresa, kvart, kapacitet || null, opis || null, slikaUrl || null, lat ?? null, lng ?? null],
    ) as [any, any];
    const noviId = result.insertId;
    if (sportovi && Array.isArray(sportovi) && sportovi.length > 0) {
      const sportValues = sportovi.map((idSporta: number) => [noviId, idSporta]);
      await pool.query("INSERT INTO SPORTOVI_OBJEKTA (ID_objekta, ID_sporta) VALUES ?", [sportValues]);
    }
    res.status(201).json({ id: noviId, poruka: "Objekt uspješno kreiran." });
  } catch (error: any) {
    if (error.code === "ER_DUP_ENTRY") { res.status(409).json({ greska: "Objekt s tim nazivom već postoji." }); return; }
    console.error("Greška pri kreiranju objekta:", error);
    res.status(500).json({ greska: "Interna greška servera." });
  }
});

// PUT /api/vlasnik/objekti/:id
router.put("/objekti/:id", autentificiraj, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { naziv, adresa, kvart, kapacitet, opis, slikaUrl, sportovi, lat, lng } = req.body;
  try {
    const [existing] = await pool.query(
      "SELECT ID_objekta FROM OBJEKTI WHERE ID_objekta = ? AND ID_korisnika = ?",
      [id, req.user?.id],
    ) as [any[], any];
    if (existing.length === 0) { res.status(404).json({ greska: "Objekt ne postoji ili nemate pravo uređivati." }); return; }

    await pool.query(
      "UPDATE OBJEKTI SET Naziv_objekta = ?, Adresa = ?, Kvart = ?, Kapacitet = ?, Opis = ?, Slika_url = ?, Lat = ?, Lng = ? WHERE ID_objekta = ?",
      [naziv, adresa, kvart, kapacitet || null, opis || null, slikaUrl || null, lat ?? null, lng ?? null, id],
    );

    await pool.query("DELETE FROM SPORTOVI_OBJEKTA WHERE ID_objekta = ?", [id]);
    if (sportovi && Array.isArray(sportovi) && sportovi.length > 0) {
      const sportValues = sportovi.map((idSporta: number) => [id, idSporta]);
      await pool.query("INSERT INTO SPORTOVI_OBJEKTA (ID_objekta, ID_sporta) VALUES ?", [sportValues]);
    }
    res.json({ poruka: "Objekt uspješno ažuriran." });
  } catch (error) {
    console.error("Greška pri ažuriranju objekta:", error);
    res.status(500).json({ greska: "Interna greška servera." });
  }
});

// DELETE /api/vlasnik/objekti/:id
router.delete("/objekti/:id", autentificiraj, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT ID_korisnika FROM OBJEKTI WHERE ID_objekta = ?", [id]
    ) as [any[], any];
    if (rows.length === 0) { res.status(404).json({ greska: "Objekt nije pronađen." }); return; }
    if (rows[0].ID_korisnika !== req.user?.id) { res.status(403).json({ greska: "Nemate ovlasti." }); return; }
    await pool.query("UPDATE OBJEKTI SET Status_objekta = 'PendingDelete' WHERE ID_objekta = ?", [id]);
    res.json({ poruka: "Zahtjev za brisanje poslan administratoru." });
  } catch (error) {
    res.status(500).json({ greska: "Interna greška servera." });
  }
});

// GET /api/vlasnik/moji-objekti
router.get("/moji-objekti", autentificiraj, async (req: AuthRequest, res: Response) => {
  try {
    const [rows] = await pool.query(
      `SELECT o.ID_objekta, o.Naziv_objekta, o.Adresa, o.Kvart, o.Kapacitet, o.Opis, o.Slika_url, o.Status_objekta,
       (SELECT GROUP_CONCAT(s.Naziv_sporta SEPARATOR ', ') FROM SPORTOVI_OBJEKTA so JOIN SPORT s ON so.ID_sporta = s.ID_sporta WHERE so.ID_objekta = o.ID_objekta) AS sportovi
       FROM OBJEKTI o WHERE o.ID_korisnika = ? ORDER BY o.Naziv_objekta ASC`,
      [req.user?.id],
    ) as [any[], any];
    res.json(rows);
  } catch (error) {
    res.status(500).json({ greska: "Interna greška servera." });
  }
});

// GET /api/vlasnik/statistika
router.get("/statistika", autentificiraj, async (req: AuthRequest, res: Response) => {
  try {
    const [poMjesecima] = await pool.query(
      `SELECT DATE_FORMAT(t.Datum, '%Y-%m') AS mjesec, COUNT(*) AS broj_rezervacija, SUM(t.Cijena) AS prihod
       FROM TERMINI t JOIN OBJEKTI o ON t.ID_objekta = o.ID_objekta
       WHERE o.ID_korisnika = ? AND t.Status = 'Zauzet' AND t.Datum >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
       GROUP BY DATE_FORMAT(t.Datum, '%Y-%m') ORDER BY mjesec ASC`,
      [req.user?.id],
    ) as [any[], any];

    const [poObjektima] = await pool.query(
      `SELECT o.ID_objekta, o.Naziv_objekta,
        COUNT(CASE WHEN t.Status = 'Zauzet' THEN 1 END) AS zauzeti,
        COUNT(CASE WHEN t.Status = 'Slobodan' THEN 1 END) AS slobodni,
        COUNT(*) AS ukupno_termina,
        COALESCE(SUM(CASE WHEN t.Status = 'Zauzet' THEN t.Cijena END), 0) AS ukupni_prihod
       FROM OBJEKTI o LEFT JOIN TERMINI t ON o.ID_objekta = t.ID_objekta
       WHERE o.ID_korisnika = ? GROUP BY o.ID_objekta, o.Naziv_objekta`,
      [req.user?.id],
    ) as [any[], any];

    res.json({
      poMjesecima: poMjesecima.map((r: any) => ({ mjesec: r.mjesec, brojRezervacija: Number(r.broj_rezervacija), prihod: Number(r.prihod) })),
      poObjektima: poObjektima.map((r: any) => ({ id: r.ID_objekta, naziv: r.Naziv_objekta, zauzeti: Number(r.zauzeti), slobodni: Number(r.slobodni), ukupnoTermina: Number(r.ukupno_termina), ukupniPrihod: Number(r.ukupni_prihod) })),
    });
  } catch (error) {
    res.status(500).json({ greska: "Interna greška servera." });
  }
});

export default router;