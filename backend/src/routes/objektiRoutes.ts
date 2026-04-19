import express, { type Request, type Response } from "express";
import pool from "../db.ts";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT 
        o.ID_objekta, 
        o.Naziv_objekta, 
        o.Adresa, 
        o.Opis, 
        o.Kvart, 
        o.Kapacitet,
        k.Ime AS Vlasnik_Ime,
        k.Prezime AS Vlasnik_Prezime
      FROM OBJEKTI o
      LEFT JOIN KORISNIK k ON o.ID_korisnika = k.ID_korisnika
    `;

    const [rows] = await pool.query(query);

    res.json(rows);
  } catch (error) {
    console.error("Greška pri dohvaćanju objekata:", error);
    res.status(500).json({ error: "Neuspješno povezivanje s bazom podataka." });
  }
});

export default router;
