import express, { type Response } from "express";
import pool from "../db.ts";
import { autentificiraj, type AuthRequest } from "../middleware/auth.ts";
import bcrypt from "bcrypt";

const router = express.Router();

const samoAdmin = async (req: AuthRequest, res: Response, next: any) => {
  const [rows] = await pool.query(
    "SELECT Uloga FROM KORISNIK WHERE ID_korisnika = ?",
    [req.user?.id]
  ) as [any[], any];
  if (!rows[0] || rows[0].Uloga !== "Admin") {
    res.status(403).json({ error: "Pristup zabranjen." });
    return;
  }
  next();
};

// GET /api/admin/dashboard
router.get("/dashboard", autentificiraj, samoAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const [[{ ukupnoKorisnika }]] = await pool.query("SELECT COUNT(*) AS ukupnoKorisnika FROM KORISNIK WHERE Uloga = 'User'") as [any[], any];
    const [[{ ukupnoVlasnika }]] = await pool.query("SELECT COUNT(*) AS ukupnoVlasnika FROM KORISNIK WHERE Uloga = 'Vlasnik'") as [any[], any];
    const [[{ ukupnoObjekta }]] = await pool.query("SELECT COUNT(*) AS ukupnoObjekta FROM OBJEKTI WHERE Status_objekta = 'Aktivan'") as [any[], any];
    const [[{ ukupnoPending }]] = await pool.query("SELECT COUNT(*) AS ukupnoPending FROM OBJEKTI WHERE Status_objekta = 'Pending'") as [any[], any];
    const [[{ ukupnoKlubova }]] = await pool.query("SELECT COUNT(*) AS ukupnoKlubova FROM KLUB") as [any[], any];
    const [[{ ukupnoRecenzija }]] = await pool.query("SELECT COUNT(*) AS ukupnoRecenzija FROM RECENZIJE") as [any[], any];
    const [[{ ukupnoRezervacija }]] = await pool.query("SELECT COUNT(*) AS ukupnoRezervacija FROM TERMINI WHERE Status = 'Zauzet'") as [any[], any];
    res.json({ ukupnoKorisnika, ukupnoVlasnika, ukupnoObjekta, ukupnoPending, ukupnoKlubova, ukupnoRecenzija, ukupnoRezervacija });
  } catch (e) { res.status(500).json({ error: "Greška na serveru." }); }
});

// ===================== KORISNICI =====================

router.get("/korisnici", autentificiraj, samoAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const [rows] = await pool.query(
      "SELECT ID_korisnika, Ime, Prezime, Email, Broj_mobitela, Uloga FROM KORISNIK ORDER BY ID_korisnika DESC"
    ) as [any[], any];
    res.json(rows.map((r: any) => ({
      id: r.ID_korisnika, ime: r.Ime, prezime: r.Prezime,
      email: r.Email, brojMobitela: r.Broj_mobitela, uloga: r.Uloga
    })));
  } catch (e) { res.status(500).json({ error: "Greška na serveru." }); }
});

router.post("/korisnici", autentificiraj, samoAdmin, async (req: AuthRequest, res: Response) => {
  const { ime, prezime, email, lozinka, brojMobitela, uloga } = req.body;
  if (!ime || !prezime || !email || !lozinka) {
    res.status(400).json({ error: "Ime, prezime, email i lozinka su obavezni." }); return;
  }
  try {
    const [existing] = await pool.query("SELECT ID_korisnika FROM KORISNIK WHERE Email = ?", [email]) as [any[], any];
    if (existing.length > 0) { res.status(409).json({ error: "Korisnik s tim emailom već postoji." }); return; }
    const hash = await bcrypt.hash(lozinka, 10);
    await pool.query(
      "INSERT INTO KORISNIK (Ime, Prezime, Email, Lozinka, Broj_mobitela, Uloga) VALUES (?, ?, ?, ?, ?, ?)",
      [ime, prezime, email, hash, brojMobitela || null, uloga || "User"]
    );
    res.status(201).json({ message: "Korisnik dodan." });
  } catch (e) { res.status(500).json({ error: "Greška na serveru." }); }
});

router.put("/korisnici/:id/uloga", autentificiraj, samoAdmin, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { uloga } = req.body;
  if (!["User", "Vlasnik", "Admin"].includes(uloga)) { res.status(400).json({ error: "Neispravna uloga." }); return; }
  await pool.query("UPDATE KORISNIK SET Uloga = ? WHERE ID_korisnika = ?", [uloga, id]);
  res.json({ message: "Uloga ažurirana." });
});

router.delete("/korisnici/:id", autentificiraj, samoAdmin, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  await pool.query("DELETE FROM KORISNIK WHERE ID_korisnika = ?", [id]);
  res.json({ message: "Korisnik obrisan." });
});

// ===================== OBJEKTI =====================

router.get("/objekti", autentificiraj, samoAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const [rows] = await pool.query(
      `SELECT o.ID_objekta, o.Naziv_objekta, o.Adresa, o.Kvart, o.Kapacitet, o.Opis, o.Slika_url, o.Status_objekta,
              o.ID_kluba, k.Naziv_kluba,
              vl.Ime AS vlasnikIme, vl.Prezime AS vlasnikPrezime, vl.ID_korisnika AS vlasnikId,
              GROUP_CONCAT(DISTINCT sp.Naziv_sporta ORDER BY sp.Naziv_sporta SEPARATOR ', ') AS sportovi
       FROM OBJEKTI o
       LEFT JOIN KLUB k ON o.ID_kluba = k.ID_kluba
       LEFT JOIN KORISNIK vl ON o.ID_korisnika = vl.ID_korisnika
       LEFT JOIN SPORTOVI_OBJEKTA so ON o.ID_objekta = so.ID_objekta
       LEFT JOIN SPORT sp ON so.ID_sporta = sp.ID_sporta
       GROUP BY o.ID_objekta ORDER BY o.Status_objekta ASC, o.ID_objekta DESC`
    ) as [any[], any];
    res.json(rows.map((r: any) => ({
      id: r.ID_objekta, naziv: r.Naziv_objekta, adresa: r.Adresa, kvart: r.Kvart,
      kapacitet: r.Kapacitet, opis: r.Opis, slikaUrl: r.Slika_url,
      status_objekta: r.Status_objekta,
      idKluba: r.ID_kluba || null,
      nazivKluba: r.Naziv_kluba || null,
      vlasnik: r.vlasnikIme ? `${r.vlasnikIme} ${r.vlasnikPrezime}` : "—",
      vlasnikId: r.vlasnikId || null,
      sportovi: r.sportovi || ""
    })));
  } catch (e) { res.status(500).json({ error: "Greška na serveru." }); }
});

router.post("/objekti", autentificiraj, samoAdmin, async (req: AuthRequest, res: Response) => {
  const { naziv, adresa, kvart, kapacitet, opis, slikaUrl, vlasnikId, idKluba, sportovi } = req.body;
  if (!naziv || !adresa || !kvart) { res.status(400).json({ error: "Naziv, adresa i kvart su obavezni." }); return; }
  try {
    const [result] = await pool.query(
      "INSERT INTO OBJEKTI (Naziv_objekta, Adresa, Kvart, Kapacitet, Opis, Slika_url, ID_korisnika, ID_kluba, Status_objekta) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Aktivan')",
      [naziv, adresa, kvart, kapacitet || null, opis || null, slikaUrl || null, vlasnikId || null, idKluba || null]
    ) as [any, any];
    const idObjekta = result.insertId;
    if (sportovi && sportovi.length > 0) {
      const values = sportovi.map((id: number) => [idObjekta, id]);
      await pool.query("INSERT IGNORE INTO SPORTOVI_OBJEKTA (ID_objekta, ID_sporta) VALUES ?", [values]);
    }
    res.status(201).json({ message: "Objekt dodan." });
  } catch (e) { res.status(500).json({ error: "Greška na serveru." }); }
});

router.put("/objekti/:id", autentificiraj, samoAdmin, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { naziv, adresa, kvart, kapacitet, opis, slikaUrl, vlasnikId, idKluba, sportovi } = req.body;
  try {
    await pool.query(
      "UPDATE OBJEKTI SET Naziv_objekta=?, Adresa=?, Kvart=?, Kapacitet=?, Opis=?, Slika_url=?, ID_korisnika=?, ID_kluba=? WHERE ID_objekta=?",
      [naziv, adresa, kvart, kapacitet || null, opis || null, slikaUrl || null, vlasnikId || null, idKluba || null, id]
    );
    await pool.query("DELETE FROM SPORTOVI_OBJEKTA WHERE ID_objekta = ?", [id]);
    if (sportovi && sportovi.length > 0) {
      const values = sportovi.map((sid: number) => [id, sid]);
      await pool.query("INSERT IGNORE INTO SPORTOVI_OBJEKTA (ID_objekta, ID_sporta) VALUES ?", [values]);
    }
    res.json({ message: "Objekt ažuriran." });
  } catch (e) { res.status(500).json({ error: "Greška na serveru." }); }
});

router.put("/objekti/:id/odobri", autentificiraj, samoAdmin, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  await pool.query("UPDATE OBJEKTI SET Status_objekta = 'Aktivan' WHERE ID_objekta = ?", [id]);
  res.json({ message: "Objekt odobren." });
});

router.delete("/objekti/:id", autentificiraj, samoAdmin, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  await pool.query("DELETE FROM OBJEKTI WHERE ID_objekta = ?", [id]);
  res.json({ message: "Objekt obrisan." });
});

// ===================== TERMINI =====================

router.get("/objekti/:id/termini", autentificiraj, samoAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.ID_termina, t.Datum,
              TIME_FORMAT(t.Vrijeme_pocetka,'%H:%i') AS vrijemePocetka,
              TIME_FORMAT(t.Vrijeme_kraja,'%H:%i') AS vrijemeKraja,
              t.Cijena, t.Status,
              k.Ime, k.Prezime
       FROM TERMINI t
       LEFT JOIN KORISNIK k ON t.ID_korisnika = k.ID_korisnika
       WHERE t.ID_objekta = ?
       ORDER BY t.Datum DESC, t.Vrijeme_pocetka ASC`,
      [req.params.id]
    ) as [any[], any];
    res.json(rows.map((r: any) => ({
      id: r.ID_termina, datum: r.Datum, vrijemePocetka: r.vrijemePocetka,
      vrijemeKraja: r.vrijemeKraja, cijena: Number(r.Cijena), status: r.Status,
      korisnik: r.Ime ? `${r.Ime} ${r.Prezime}` : null
    })));
  } catch (e) { res.status(500).json({ error: "Greška na serveru." }); }
});

router.post("/objekti/:id/termini", autentificiraj, samoAdmin, async (req: AuthRequest, res: Response) => {
  const { datumPocetka, vrijemePocetka, vrijemeKraja, cijena, ponavljajDo } = req.body;
  try {
    const terminiZaUnos = [];
    let trenutniDatum = new Date(datumPocetka);
    const krajnjiDatum = ponavljajDo ? new Date(ponavljajDo) : trenutniDatum;
    while (trenutniDatum <= krajnjiDatum) {
      terminiZaUnos.push([req.params.id, trenutniDatum.toISOString().split("T")[0], vrijemePocetka, vrijemeKraja, cijena, "Slobodan"]);
      if (ponavljajDo) { trenutniDatum.setDate(trenutniDatum.getDate() + 7); } else { break; }
    }
    await pool.query("INSERT INTO TERMINI (ID_objekta, Datum, Vrijeme_pocetka, Vrijeme_kraja, Cijena, Status) VALUES ?", [terminiZaUnos]);
    res.status(201).json({ message: `Dodano ${terminiZaUnos.length} termina.` });
  } catch (e) { res.status(500).json({ error: "Greška na serveru." }); }
});

router.put("/termini/:id", autentificiraj, samoAdmin, async (req: AuthRequest, res: Response) => {
  const { vrijemePocetka, vrijemeKraja, cijena } = req.body;
  await pool.query("UPDATE TERMINI SET Vrijeme_pocetka=?, Vrijeme_kraja=?, Cijena=? WHERE ID_termina=?",
    [vrijemePocetka, vrijemeKraja, cijena, req.params.id]);
  res.json({ message: "Termin ažuriran." });
});

router.delete("/termini/:id", autentificiraj, samoAdmin, async (req: AuthRequest, res: Response) => {
  await pool.query("DELETE FROM TERMINI WHERE ID_termina = ?", [req.params.id]);
  res.json({ message: "Termin obrisan." });
});

// ===================== KLUBOVI =====================

router.get("/klubovi", autentificiraj, samoAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const [rows] = await pool.query(
      `SELECT k.ID_kluba, k.Naziv_kluba, k.OIB, k.Kontakt_telefon,
              GROUP_CONCAT(o.ID_objekta ORDER BY o.Naziv_objekta SEPARATOR ',') AS objekti_ids,
              GROUP_CONCAT(o.Naziv_objekta ORDER BY o.Naziv_objekta SEPARATOR '|||') AS objekti_nazivi
       FROM KLUB k
       LEFT JOIN OBJEKTI o ON o.ID_kluba = k.ID_kluba
       GROUP BY k.ID_kluba
       ORDER BY k.ID_kluba DESC`
    ) as [any[], any];
    res.json(rows.map((r: any) => ({
      id: r.ID_kluba,
      naziv: r.Naziv_kluba,
      oib: r.OIB,
      kontakt: r.Kontakt_telefon,
      objektiIds: r.objekti_ids ? r.objekti_ids.split(',').map(Number) : [],
      objektiNazivi: r.objekti_nazivi ? r.objekti_nazivi.split('|||') : []
    })));
  } catch (e) { res.status(500).json({ error: "Greška na serveru." }); }
});

router.post("/klubovi", autentificiraj, samoAdmin, async (req: AuthRequest, res: Response) => {
  const { naziv, oib, kontakt } = req.body;
  if (!naziv || !oib) { res.status(400).json({ error: "Naziv i OIB su obavezni." }); return; }
  try {
    await pool.query("INSERT INTO KLUB (Naziv_kluba, OIB, Kontakt_telefon) VALUES (?, ?, ?)",
      [naziv, oib, kontakt || null]);
    res.status(201).json({ message: "Klub dodan." });
  } catch (e: any) {
    if (e.code === "ER_DUP_ENTRY") { res.status(409).json({ error: "OIB već postoji." }); return; }
    res.status(500).json({ error: "Greška na serveru." });
  }
});

router.put("/klubovi/:id", autentificiraj, samoAdmin, async (req: AuthRequest, res: Response) => {
  const { naziv, oib, kontakt } = req.body;
  try {
    await pool.query("UPDATE KLUB SET Naziv_kluba=?, OIB=?, Kontakt_telefon=? WHERE ID_kluba=?",
      [naziv, oib, kontakt || null, req.params.id]);
    res.json({ message: "Klub ažuriran." });
  } catch (e) { res.status(500).json({ error: "Greška na serveru." }); }
});

// ===================== RECENZIJE =====================

router.get("/recenzije", autentificiraj, samoAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.ID_korisnika, r.ID_objekta, r.Ocjena, r.Komentar, r.Datum_objave,
              k.Ime, k.Prezime, o.Naziv_objekta
       FROM RECENZIJE r
       JOIN KORISNIK k ON r.ID_korisnika = k.ID_korisnika
       JOIN OBJEKTI o ON r.ID_objekta = o.ID_objekta
       ORDER BY r.Datum_objave DESC`
    ) as [any[], any];
    res.json(rows.map((r: any) => ({
      idKorisnika: r.ID_korisnika, idObjekta: r.ID_objekta,
      ocjena: r.Ocjena, komentar: r.Komentar, datum: r.Datum_objave,
      ime: r.Ime, prezime: r.Prezime, nazivObjekta: r.Naziv_objekta
    })));
  } catch (e) { res.status(500).json({ error: "Greška na serveru." }); }
});

router.delete("/recenzije/:idKorisnika/:idObjekta", autentificiraj, samoAdmin, async (req: AuthRequest, res: Response) => {
  const { idKorisnika, idObjekta } = req.params;
  await pool.query("DELETE FROM RECENZIJE WHERE ID_korisnika = ? AND ID_objekta = ?", [idKorisnika, idObjekta]);
  res.json({ message: "Recenzija obrisana." });
});

export default router;