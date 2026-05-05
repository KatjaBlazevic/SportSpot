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

router.put(
  "/otkazi/:id",
  autentificiraj,
  async (req: AuthRequest, res: Response) => {
    const idTermina = req.params.id;
    const idKorisnika = req.user?.id;

    try {
      //Provjeri postoji li termin i tko ga je rezervirao
      const [termini] = (await pool.query(
        "SELECT ID_korisnika, Status FROM TERMINI WHERE ID_termina = ?",
        [idTermina],
      )) as [any[], any];

      if (termini.length === 0) {
        return res.status(404).json({ error: "Termin nije pronađen." });
      }

      if (Number(termini[0].ID_korisnika) !== Number(idKorisnika)) {
        return res
          .status(403)
          .json({ error: "Nemate dozvolu za otkazivanje tuđe rezervacije." });
      }

      await pool.query(
        "UPDATE TERMINI SET Status = 'Slobodan', ID_korisnika = NULL WHERE ID_termina = ?",
        [idTermina],
      );

      res.status(200).json({ message: "Rezervacija uspješno otkazana!" });
    } catch (error) {
      console.error("Greška pri otkazivanju:", error);
      res.status(500).json({ error: "Interna greška servera." });
    }
  },
);
export default router;
