import express, { type Request, type Response } from "express";
import pool from "../db.ts";
import { autentificiraj, type AuthRequest } from "../middleware/auth.ts";

const router = express.Router();

// GET /api/objekti — svi objekti sa sportovima, ocjenama i slobodnim terminima
router.get("/", async (req: Request, res: Response) => {
  try {
    const { sport, kvart, datum, period } = req.query;

    const sportArray = sport ? (Array.isArray(sport) ? sport : [sport]) : [];

    let vrijemeOd = "00:00:00";
    let vrijemeDo = "23:59:59";
    if (period === "jutro") {
      vrijemeOd = "06:00:00";
      vrijemeDo = "12:00:00";
    } else if (period === "poslijepodne") {
      vrijemeOd = "12:00:00";
      vrijemeDo = "18:00:00";
    } else if (period === "vecer") {
      vrijemeOd = "18:00:00";
      vrijemeDo = "23:59:59";
    }

    const sportJoinClause =
      sportArray.length > 0
        ? `
        INNER JOIN SPORTOVI_OBJEKTA so ON o.ID_objekta = so.ID_objekta
        INNER JOIN SPORT sp ON so.ID_sporta = sp.ID_sporta AND sp.Naziv_sporta IN (${sportArray.map(() => "?").join(",")})
      `
        : "";

    const objektiQuery = `
      SELECT DISTINCT
        o.ID_objekta,
        o.Naziv_objekta,
        o.Adresa,
        o.Opis,
        o.Kvart,
        o.Kapacitet,
        o.Slika_url,
        ROUND(AVG(r.Ocjena), 1) AS ocjena,
        COUNT(DISTINCT r.ID_korisnika) AS broj_recenzija,
        MIN(t.Cijena) AS cijena_od
      FROM OBJEKTI o
      LEFT JOIN RECENZIJE r ON o.ID_objekta = r.ID_objekta
      LEFT JOIN TERMINI t ON o.ID_objekta = t.ID_objekta
        AND t.Status = 'Slobodan'
        ${datum ? "AND t.Datum = ?" : ""}
        ${period !== undefined && period !== "" ? "AND t.Vrijeme_pocetka >= ? AND t.Vrijeme_pocetka < ?" : ""}
      ${sportJoinClause}
      ${kvart && kvart !== "Svi kvartovi" ? "WHERE o.Kvart = ?" : ""}
      GROUP BY o.ID_objekta
      ORDER BY ocjena DESC
    `;

    const params: unknown[] = [];
    if (datum) params.push(datum);
    if (period && period !== "") {
      params.push(vrijemeOd);
      params.push(vrijemeDo);
    }
    if (sportArray.length > 0) params.push(...sportArray);
    if (kvart && kvart !== "Svi kvartovi") params.push(kvart);

    const [objekti] = (await pool.query(objektiQuery, params)) as [any[], any];

    if (objekti.length === 0) {
      res.json([]);
      return;
    }

    const ids = objekti.map((o: any) => o.ID_objekta);

    const [sportovi] = (await pool.query(
      `SELECT so.ID_objekta, sp.Naziv_sporta
       FROM SPORTOVI_OBJEKTA so
       JOIN SPORT sp ON so.ID_sporta = sp.ID_sporta
       WHERE so.ID_objekta IN (?)`,
      [ids],
    )) as [any[], any];

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
    if (period && period !== "") {
      terminiParams.push(vrijemeOd);
      terminiParams.push(vrijemeDo);
    }

    const [termini] = (await pool.query(terminiQuery, terminiParams)) as [
      any[],
      any,
    ];

    const rezultat = objekti.map((obj: any) => ({
      id: obj.ID_objekta,
      naziv: obj.Naziv_objekta,
      adresa: obj.Adresa,
      opis: obj.Opis,
      kvart: obj.Kvart,
      kapacitet: obj.Kapacitet,
      slikaUrl: obj.Slika_url || null, 
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
    const [rows] = (await pool.query(
      `SELECT 
        o.*,
        o.ID_korisnika,
        o.Slika_url,
        k.Naziv_kluba,
        k.Kontakt_telefon,
        ROUND(AVG(r.Ocjena), 1) AS ocjena,
        COUNT(DISTINCT r.ID_korisnika) AS broj_recenzija
       FROM OBJEKTI o
       LEFT JOIN KLUB k ON o.ID_objekta = k.ID_objekta
       LEFT JOIN RECENZIJE r ON o.ID_objekta = r.ID_objekta
       WHERE o.ID_objekta = ?
       GROUP BY o.ID_objekta`,
      [id],
    )) as [any[], any];

    if (rows.length === 0) {
      res.status(404).json({ error: "Objekt nije pronađen." });
      return;
    }

    const obj = rows[0];

    const [sviTermini] = (await pool.query(
      `SELECT 
        ID_termina,
        ID_korisnika,
        Datum,
        TIME_FORMAT(Vrijeme_pocetka, '%H:%i') AS vrijeme_pocetka,
        TIME_FORMAT(Vrijeme_kraja, '%H:%i') AS vrijeme_kraja,
        Cijena,
        Status
       FROM TERMINI
       WHERE ID_objekta = ? 
       ORDER BY Datum DESC, Vrijeme_pocetka ASC`,
      [id],
    )) as [any[], any];

    const [sportovi] = (await pool.query(
      `SELECT sp.Naziv_sporta FROM SPORTOVI_OBJEKTA so
       JOIN SPORT sp ON so.ID_sporta = sp.ID_sporta
       WHERE so.ID_objekta = ?`,
      [id],
    )) as [any[], any];

    const [recenzije] = (await pool.query(
      `SELECT 
        r.Ocjena, r.Komentar, r.Datum_objave,
        k.Ime, k.Prezime
       FROM RECENZIJE r
       JOIN KORISNIK k ON r.ID_korisnika = k.ID_korisnika
       WHERE r.ID_objekta = ?
       ORDER BY r.Datum_objave DESC`,
      [id],
    )) as [any[], any];

    res.json({
      id: obj.ID_objekta,
      idKorisnika: obj.ID_korisnika,
      naziv: obj.Naziv_objekta,
      adresa: obj.Adresa,
      opis: obj.Opis,
      kvart: obj.Kvart,
      kapacitet: obj.Kapacitet,
      slikaUrl: obj.Slika_url || null,
      nazivKluba: obj.Naziv_kluba,
      kontaktTelefon: obj.Kontakt_telefon,
      ocjena: obj.ocjena || 0,
      brojRecenzija: Number(obj.broj_recenzija),
      sportovi: sportovi.map((s: any) => s.Naziv_sporta),
      termini: sviTermini.map((t: any) => ({
        id: t.ID_termina,
        idKorisnika: t.ID_korisnika !== undefined ? t.ID_korisnika : null,
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

// POST /api/objekti/recenzije/nova — dodavanje recenzija
router.post(
  "/recenzije/nova",
  autentificiraj,
  async (req: AuthRequest, res: Response) => {
    try {
      const { idObjekta, ocjena, komentar } = req.body;
      const idKorisnika = req.user?.id;

      if (!idObjekta || !ocjena) {
        res.status(400).json({ error: "Nedostaju objekt ili ocjena." });
        return;
      }

      if (ocjena < 1 || ocjena > 5) {
        res.status(400).json({ error: "Ocjena mora biti između 1 i 5." });
        return;
      }

      const [postojece] = (await pool.query(
        "SELECT * FROM RECENZIJE WHERE ID_korisnika = ? AND ID_objekta = ?",
        [idKorisnika, idObjekta],
      )) as [any[], any];

      if (postojece.length > 0) {
        res.status(400).json({ error: "Već ste ostavili recenziju za ovaj objekt." });
        return;
      }

      await pool.query(
        `INSERT INTO RECENZIJE (ID_korisnika, ID_objekta, Ocjena, Komentar) 
         VALUES (?, ?, ?, ?)`,
        [idKorisnika, idObjekta, ocjena, komentar || null],
      );

      res.status(201).json({ message: "Recenzija uspješno objavljena!" });
    } catch (error) {
      console.error("Greška pri spremanju recenzije:", error);
      res.status(500).json({ error: "Greška na serveru pri spremanju recenzije." });
    }
  },
);

// GET /api/objekti/vlasnik/statistika
router.get(
  "/vlasnik/statistika",
  autentificiraj,
  async (req: AuthRequest, res: Response) => {
    const idKorisnika = req.user?.id;

    try {
      const [poMjesecima] = (await pool.query(
        `SELECT 
          DATE_FORMAT(t.Datum, '%Y-%m') AS mjesec,
          COUNT(*) AS broj_rezervacija,
          SUM(t.Cijena) AS prihod
         FROM TERMINI t
         JOIN OBJEKTI o ON t.ID_objekta = o.ID_objekta
         WHERE o.ID_korisnika = ?
           AND t.Status = 'Zauzet'
           AND t.Datum >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
         GROUP BY DATE_FORMAT(t.Datum, '%Y-%m')
         ORDER BY mjesec ASC`,
        [idKorisnika],
      )) as [any[], any];

      const [poObjektima] = (await pool.query(
        `SELECT 
          o.ID_objekta,
          o.Naziv_objekta,
          COUNT(CASE WHEN t.Status = 'Zauzet' THEN 1 END) AS zauzeti,
          COUNT(CASE WHEN t.Status = 'Slobodan' THEN 1 END) AS slobodni,
          COUNT(*) AS ukupno_termina,
          COALESCE(SUM(CASE WHEN t.Status = 'Zauzet' THEN t.Cijena END), 0) AS ukupni_prihod
         FROM OBJEKTI o
         LEFT JOIN TERMINI t ON o.ID_objekta = t.ID_objekta
         WHERE o.ID_korisnika = ?
         GROUP BY o.ID_objekta, o.Naziv_objekta`,
        [idKorisnika],
      )) as [any[], any];

      res.json({
        poMjesecima: poMjesecima.map((r: any) => ({
          mjesec: r.mjesec,
          brojRezervacija: Number(r.broj_rezervacija),
          prihod: Number(r.prihod),
        })),
        poObjektima: poObjektima.map((r: any) => ({
          id: r.ID_objekta,
          naziv: r.Naziv_objekta,
          zauzeti: Number(r.zauzeti),
          slobodni: Number(r.slobodni),
          ukupnoTermina: Number(r.ukupno_termina),
          ukupniPrihod: Number(r.ukupni_prihod),
        })),
      });
    } catch (error) {
      console.error("Greška pri dohvatu statistike:", error);
      res.status(500).json({ error: "Greška na serveru." });
    }
  },
);

export default router;