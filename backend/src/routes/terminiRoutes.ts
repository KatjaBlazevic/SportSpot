import express, { type Request, type Response } from "express";
import pool from "../db.ts";
import { autentificiraj, type AuthRequest } from "../middleware/auth.ts";

const router = express.Router();

// Putanja će biti: GET http://localhost:5000/api/termini/
router.get("/", (req: Request, res: Response) => {
  res.json({ message: "Router termini je povezan i radi!" });
});
router.post(
  "/dodaj",
  autentificiraj,
  async (req: AuthRequest, res: Response) => {
    try {
      const {
        idObjekta,
        datumPocetka,
        vrijemePocetka,
        vrijemeKraja,
        cijena,
        ponavljajDo,
      } = req.body;
      const idKorisnika = req.user?.id;

      const [objekt] = (await pool.query(
        "SELECT ID_korisnika FROM OBJEKTI WHERE ID_objekta = ?",
        [idObjekta],
      )) as [any[], any];

      if (objekt.length === 0 || objekt[0].ID_korisnika !== idKorisnika) {
        return res
          .status(403)
          .json({ error: "Nemate ovlasti za ovaj objekt." });
      }

      const terminiZaUnos = [];
      let trenutniDatum = new Date(datumPocetka);
      const krajnjiDatum = ponavljajDo ? new Date(ponavljajDo) : trenutniDatum;

      while (trenutniDatum <= krajnjiDatum) {
        const formatiranDatum = trenutniDatum.toISOString().split("T")[0];
        terminiZaUnos.push([
          idObjekta,
          formatiranDatum,
          vrijemePocetka,
          vrijemeKraja,
          cijena,
          "Slobodan",
        ]);
        if (ponavljajDo) {
          trenutniDatum.setDate(trenutniDatum.getDate() + 7);
        } else {
          break;
        }
      }

      await pool.query(
        "INSERT INTO TERMINI (ID_objekta, Datum, Vrijeme_pocetka, Vrijeme_kraja, Cijena, Status) VALUES ?",
        [terminiZaUnos],
      );

      res
        .status(201)
        .json({ message: `Uspješno dodano ${terminiZaUnos.length} termina.` });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Greška na serveru." });
    }
  },
);

// POST /api/termini/rezerviraj/:id
router.post(
  "/rezerviraj/:id",
  autentificiraj,
  async (req: AuthRequest, res: Response) => {
    const idTermina = req.params.id;
    const idKorisnika = req.user?.id;

    //Termin slobodan?
    try {
      const [termini] = (await pool.query(
        "SELECT Status FROM TERMINI WHERE ID_termina = ?",
        [idTermina],
      )) as [any[], any];

      if (termini.length === 0) {
        return res.status(404).json({ error: "Termin nije pronađen." });
      }

      if (termini[0].Status !== "Slobodan") {
        return res
          .status(400)
          .json({ error: "Ovaj termin više nije dostupan za rezervaciju." });
      }

      await pool.query(
        "UPDATE TERMINI SET Status = 'Zauzet', ID_korisnika = ? WHERE ID_termina = ?",
        [idKorisnika, idTermina],
      );

      res.status(200).json({ message: "Termin uspješno rezerviran!" });
    } catch (error) {
      console.error("Greška pri rezervaciji:", error);
      res.status(500).json({ error: "Interna greška servera." });
    }
  },
);
//otkazivanje termina
router.put(
  "/otkazi/:id",
  autentificiraj,
  async (req: AuthRequest, res: Response) => {
    const idTermina = req.params.id;
    const idKorisnika = req.user?.id;

    // Započinjemo sa transakcijom
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [termini] = (await connection.query(
        "SELECT ID_korisnika, Status FROM TERMINI WHERE ID_termina = ?",
        [idTermina],
      )) as [any[], any];

      if (termini.length === 0) {
        await connection.rollback();
        return res.status(404).json({ error: "Termin nije pronađen." });
      }

      if (Number(termini[0].ID_korisnika) !== Number(idKorisnika)) {
        await connection.rollback();
        return res
          .status(403)
          .json({ error: "Nemate dozvolu za otkazivanje tuđe rezervacije." });
      }

      const [listaCekanja] = (await connection.query(
        "SELECT ID_korisnika FROM LISTA_CEKANJA WHERE ID_termina = ? ORDER BY Vrijeme_prijave ASC LIMIT 1",
        [idTermina],
      )) as [any[], any];

      if (listaCekanja.length > 0) {
        // postoji netko na listi, dodaj mu termin
        const sljedeciKorisnik = listaCekanja[0].ID_korisnika;

        await connection.query(
          "UPDATE TERMINI SET ID_korisnika = ?, Status = 'Zauzet' WHERE ID_termina = ?",
          [sljedeciKorisnik, idTermina],
        );

        // Obriši korisnika kojeg smo dodali sa liste čekanja u listi čekanja
        await connection.query(
          "DELETE FROM LISTA_CEKANJA WHERE ID_termina = ? AND ID_korisnika = ?",
          [idTermina, sljedeciKorisnik],
        );

        await connection.commit();
        return res.status(200).json({
          message:
            "Rezervacija otkazana, termin automatski dodijeljen sljedećem na listi!",
        });
      } else {
        await connection.query(
          "UPDATE TERMINI SET Status = 'Slobodan', ID_korisnika = NULL WHERE ID_termina = ?",
          [idTermina],
        );

        await connection.commit();
        return res
          .status(200)
          .json({ message: "Rezervacija uspješno otkazana!" });
      }
    } catch (error) {
      await connection.rollback();
      console.error("Greška pri otkazivanju:", error);
      res.status(500).json({ error: "Interna greška servera." });
    } finally {
      connection.release();
    }
  },
);

//Edititranje termina
router.put(
  "/uredi/:id",
  autentificiraj,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { vrijemePocetka, vrijemeKraja, cijena } = req.body;
      const idKorisnika = req.user?.id;

      const [vlasnikCheck] = (await pool.query(
        `SELECT o.ID_korisnika 
         FROM TERMINI t 
         JOIN OBJEKTI o ON t.ID_objekta = o.ID_objekta 
         WHERE t.ID_termina = ?`,
        [id],
      )) as [any[], any];

      if (
        vlasnikCheck.length === 0 ||
        vlasnikCheck[0].ID_korisnika !== idKorisnika
      ) {
        return res
          .status(403)
          .json({ error: "Nemate ovlasti za izmjenu ovog termina." });
      }

      // Izmjena podataka
      await pool.query(
        `UPDATE TERMINI 
         SET Vrijeme_pocetka = ?, Vrijeme_kraja = ?, Cijena = ? 
         WHERE ID_termina = ?`,
        [vrijemePocetka, vrijemeKraja, cijena, id],
      );

      res.json({ message: "Termin uspješno ažuriran." });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "Greška na serveru pri ažuriranju termina." });
    }
  },
);

//brisanje
router.delete(
  "/obrisi/:id",
  autentificiraj,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const idKorisnika = req.user?.id;

      const [termin] = (await pool.query(
        `SELECT o.ID_korisnika, t.Status 
         FROM TERMINI t 
         JOIN OBJEKTI o ON t.ID_objekta = o.ID_objekta 
         WHERE t.ID_termina = ?`,
        [id],
      )) as [any[], any];

      if (termin.length === 0 || termin[0].ID_korisnika !== idKorisnika) {
        return res
          .status(403)
          .json({ error: "Nemate ovlasti za brisanje ovog termina." });
      }
      //Ako želimo da se ne može brisati ako je zauzet
      /* if (termin[0].Status !== "Slobodan") {
        return res.status(400).json({
          error:
            "Ne možete obrisati termin koji je već rezerviran. Prvo otkažite rezervaciju.",
        });
      } */

      await pool.query("DELETE FROM TERMINI WHERE ID_termina = ?", [id]);

      res.json({ message: "Termin uspješno obrisan." });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "Greška na serveru pri brisanju termina." });
    }
  },
);

//Dodavanje na listu cekanja
router.post(
  "/lista-cekanja/prijava",
  autentificiraj,
  async (req: AuthRequest, res: Response) => {
    try {
      const { idTermina } = req.body;
      const idKorisnika = req.user?.id;

      const [termin] = (await pool.query(
        "SELECT Status FROM TERMINI WHERE ID_termina = ?",
        [idTermina],
      )) as [any[], any];

      if (termin.length === 0) {
        return res.status(404).json({ error: "Termin ne postoji." });
      }

      if (termin[0].Status === "Slobodan") {
        return res
          .status(400)
          .json({ error: "Termin je slobodan, rezervirajte ga direktno." });
      }

      try {
        await pool.query(
          "INSERT INTO LISTA_CEKANJA (ID_korisnika, ID_termina) VALUES (?, ?)",
          [idKorisnika, idTermina],
        );

        res
          .status(201)
          .json({ message: "Uspješno ste dodani na listu čekanja." });
      } catch (innerError: any) {
        if (innerError.code === "ER_DUP_ENTRY") {
          return res
            .status(400)
            .json({ error: "Već ste na listi čekanja za ovaj termin." });
        }
        throw innerError;
      }
    } catch (error) {
      console.error("Greška pri prijavi na listu čekanja:", error);
      res.status(500).json({ error: "Greška na serveru." });
    }
  },
);
export default router;
