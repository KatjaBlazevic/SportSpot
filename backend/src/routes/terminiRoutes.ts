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
export default router;
