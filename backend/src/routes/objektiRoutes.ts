import express, { type Request, type Response } from "express";
import pool from "../db.ts";

const router = express.Router();

// GET /api/objekti — svi objekti sa sportovima, ocjenama i slobodnim terminima
router.get("/", async (req: Request, res: Response) => {
  try {
    const { sport, kvart, datum, period } = req.query;

    // Određujemo vremenski raspon prema periodu dana
    let vrijemeOd = "00:00:00";
    let vrijemeDo = "23:59:59";
    if (period === "jutro") { vrijemeOd = "06:00:00"; vrijemeDo = "12:00:00"; }
    else if (period === "poslijepodne") { vrijemeOd = "12:00:00"; vrijemeDo = "18:00:00"; }
    else if (period === "vecer") { vrijemeOd = "18:00:00"; vrijemeDo = "23:59:59"; }

    // Dohvati objekte s filterima
    const objektiQuery = `
      SELECT DISTINCT
        o.ID_objekta,
        o.Naziv_objekta,
        o.Adresa,
        o.Opis,
        o.Kvart,
        o.Kapacitet,
        ROUND(AVG(r.Ocjena), 1) AS ocjena,
        COUNT(DISTINCT r.ID_korisnika) AS broj_recenzija,
        MIN(t.Cijena) AS cijena_od
      FROM OBJEKTI o
      LEFT JOIN RECENZIJE r ON o.ID_objekta = r.ID_objekta
      LEFT JOIN TERMINI t ON o.ID_objekta = t.ID_objekta
        AND t.Status = 'Slobodan'
        ${datum ? "AND t.Datum = ?" : ""}
        ${period !== undefined && period !== "" ? "AND t.Vrijeme_pocetka >= ? AND t.Vrijeme_pocetka < ?" : ""}
      ${sport ? `
        INNER JOIN SPORTOVI_OBJEKTA so ON o.ID_objekta = so.ID_objekta
        INNER JOIN SPORT sp ON so.ID_sporta = sp.ID_sporta AND sp.Naziv_sporta = ?
      ` : ""}
      ${kvart && kvart !== "Svi kvartovi" ? "WHERE o.Kvart = ?" : ""}
      GROUP BY o.ID_objekta
      ORDER BY ocjena DESC
    `;

    // Dinamički params za query
    const params: unknown[] = [];
    if (datum) params.push(datum);
    if (period && period !== "") { params.push(vrijemeOd); params.push(vrijemeDo); }
    if (sport) params.push(sport);
    if (kvart && kvart !== "Svi kvartovi") params.push(kvart);

    const [objekti] = await pool.query(objektiQuery, params) as [any[], any];

    if (objekti.length === 0) {
      res.json([]);
      return;
    }

    const ids = objekti.map((o: any) => o.ID_objekta);

    // Dohvati sportove za sve objekte
    const [sportovi] = await pool.query(
      `SELECT so.ID_objekta, sp.Naziv_sporta
       FROM SPORTOVI_OBJEKTA so
       JOIN SPORT sp ON so.ID_sporta = sp.ID_sporta
       WHERE so.ID_objekta IN (?)`,
      [ids]
    ) as [any[], any];

    // Dohvati slobodne termine za sve objekte
    const terminiQuery = `
      SELECT 
        t.ID_termina,
        t.ID_objekta,
        t.Datum,
        TIME_FORMAT(t.Vrijeme_pocetka, '%H:%i') AS vrijeme_pocetka,
        TIME_FORMAT(t.Vrijeme_kraja, '%H:%i') AS vrijeme_kraja,
        t.Cijena,
        t.Status
      FROM TERMINI t
      WHERE t.ID_objekta IN (?)
        AND t.Status = 'Slobodan'
        ${datum ? "AND t.Datum = ?" : "AND t.Datum >= CURDATE()"}
        ${period && period !== "" ? "AND t.Vrijeme_pocetka >= ? AND t.Vrijeme_pocetka < ?" : ""}
      ORDER BY t.Datum ASC, t.Vrijeme_pocetka ASC
    `;

    const terminiParams: unknown[] = [ids];
    if (datum) terminiParams.push(datum);
    if (period && period !== "") { terminiParams.push(vrijemeOd); terminiParams.push(vrijemeDo); }

    const [termini] = await pool.query(terminiQuery, terminiParams) as [any[], any];

    // Spoji sve zajedno
    const rezultat = objekti.map((obj: any) => ({
      id: obj.ID_objekta,
      naziv: obj.Naziv_objekta,
      adresa: obj.Adresa,
      opis: obj.Opis,
      kvart: obj.Kvart,
      kapacitet: obj.Kapacitet,
      ocjena: obj.ocjena ?? null,
      brojRecenzija: Number(obj.broj_recenzija),
      cijenaOd: obj.cijena_od ?? 0,
      sportovi: sportovi
        .filter((s: any) => s.ID_objekta === obj.ID_objekta)
        .map((s: any) => s.Naziv_sporta),
      termini: termini
        .filter((t: any) => t.ID_objekta === obj.ID_objekta)
        .map((t: any) => ({
          id: t.ID_termina,
          naziv: `Teren ${t.ID_termina}`,
          datum: t.Datum,
          vrijemePocetka: t.vrijeme_pocetka,
          vrijemeKraja: t.vrijeme_kraja,
          cijena: Number(t.Cijena),
          status: t.Status,
        })),
    }));

    res.json(rezultat);
  } catch (error) {
    console.error("Greška pri dohvaćanju objekata:", error);
    res.status(500).json({ error: "Greška na serveru.", details: String(error) });
  }
});

// GET /api/objekti/:id — jedan objekt s detaljima
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT 
        o.*,
        k.Naziv_kluba,
        k.Kontakt_telefon,
        ROUND(AVG(r.Ocjena), 1) AS ocjena,
        COUNT(DISTINCT r.ID_korisnika) AS broj_recenzija
       FROM OBJEKTI o
       LEFT JOIN KLUB k ON o.ID_objekta = k.ID_objekta
       LEFT JOIN RECENZIJE r ON o.ID_objekta = r.ID_objekta
       WHERE o.ID_objekta = ?
       GROUP BY o.ID_objekta`,
      [id]
    ) as [any[], any];

    if (rows.length === 0) {
      res.status(404).json({ error: "Objekt nije pronađen." });
      return;
    }

    const obj = rows[0];

    // Sportovi
    const [sportovi] = await pool.query(
      `SELECT sp.Naziv_sporta FROM SPORTOVI_OBJEKTA so
       JOIN SPORT sp ON so.ID_sporta = sp.ID_sporta
       WHERE so.ID_objekta = ?`,
      [id]
    ) as [any[], any];

    // Slobodni termini
    const [termini] = await pool.query(
      `SELECT 
        ID_termina,
        Datum,
        TIME_FORMAT(Vrijeme_pocetka, '%H:%i') AS vrijeme_pocetka,
        TIME_FORMAT(Vrijeme_kraja, '%H:%i') AS vrijeme_kraja,
        Cijena,
        Status
       FROM TERMINI
       WHERE ID_objekta = ? AND Status = 'Slobodan' AND Datum >= CURDATE()
       ORDER BY Datum ASC, Vrijeme_pocetka ASC`,
      [id]
    ) as [any[], any];

    // Recenzije
    const [recenzije] = await pool.query(
      `SELECT 
        r.Ocjena, r.Komentar, r.Datum_objave,
        k.Ime, k.Prezime
       FROM RECENZIJE r
       JOIN KORISNIK k ON r.ID_korisnika = k.ID_korisnika
       WHERE r.ID_objekta = ?
       ORDER BY r.Datum_objave DESC`,
      [id]
    ) as [any[], any];

    res.json({
      id: obj.ID_objekta,
      naziv: obj.Naziv_objekta,
      adresa: obj.Adresa,
      opis: obj.Opis,
      kvart: obj.Kvart,
      kapacitet: obj.Kapacitet,
      nazivKluba: obj.Naziv_kluba,
      kontaktTelefon: obj.Kontakt_telefon,
      ocjena: obj.ocjena,
      brojRecenzija: Number(obj.broj_recenzija),
      sportovi: sportovi.map((s: any) => s.Naziv_sporta),
      termini: termini.map((t: any) => ({
        id: t.ID_termina,
        datum: t.Datum,
        vrijemePocetka: t.vrijeme_pocetka,
        vrijemeKraja: t.vrijeme_kraja,
        cijena: Number(t.Cijena),
        status: t.Status,
      })),
      recenzije: recenzije.map((r: any) => ({
        ime: r.Ime,
        prezime: r.Prezime,
        ocjena: r.Ocjena,
        komentar: r.Komentar,
        datumObjave: r.Datum_objave,
      })),
    });
  } catch (error) {
    console.error("Greška pri dohvaćanju objekta:", error);
    res.status(500).json({ error: "Greška na serveru." });
  }
});

export default router;