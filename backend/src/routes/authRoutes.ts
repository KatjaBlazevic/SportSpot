import { Router, type Request, type Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../db.ts";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || "sportspot_tajni_kljuc";

// POST /api/auth/registracija
router.post("/registracija", async (req: Request, res: Response) => {
  const { ime, prezime, email, lozinka, brojMobitela } = req.body;

  if (!ime || !prezime || !email || !lozinka) {
    res.status(400).json({ greska: "Ime, prezime, email i lozinka su obavezni." });
    return;
  }

  try {
    // Provjeri postoji li već korisnik s tim emailom
    const [existing] = await pool.query(
      "SELECT ID_korisnika FROM KORISNIK WHERE Email = ?",
      [email]
    );
    const rows = existing as { ID_korisnika: number }[];
    if (rows.length > 0) {
      res.status(409).json({ greska: "Korisnik s tim emailom već postoji." });
      return;
    }

    // Hashiraj lozinku
    const hashLozinke = await bcrypt.hash(lozinka, 10);

    // Umetni novog korisnika s ulogom 'User'
    const [result] = await pool.query(
      "INSERT INTO KORISNIK (Ime, Prezime, Email, Lozinka, Broj_mobitela, Uloga) VALUES (?, ?, ?, ?, ?, 'User')",
      [ime, prezime, email, hashLozinke, brojMobitela || null]
    );

    const insertResult = result as { insertId: number };

    const token = jwt.sign(
      {
        id: insertResult.insertId,
        email,
        uloga: "User",
        ime,
        prezime,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      poruka: "Registracija uspješna.",
      token,
      korisnik: {
        id: insertResult.insertId,
        ime,
        prezime,
        email,
        uloga: "User",
      },
    });
  } catch (error) {
    console.error("Greška pri registraciji:", error);
    res.status(500).json({ greska: "Interna greška servera." });
  }
});

// POST /api/auth/prijava
router.post("/prijava", async (req: Request, res: Response) => {
  const { email, lozinka } = req.body;

  if (!email || !lozinka) {
    res.status(400).json({ greska: "Email i lozinka su obavezni." });
    return;
  }

  try {
    const [rows] = await pool.query(
      "SELECT ID_korisnika, Ime, Prezime, Email, Lozinka, Uloga FROM KORISNIK WHERE Email = ?",
      [email]
    );

    const korisnici = rows as {
      ID_korisnika: number;
      Ime: string;
      Prezime: string;
      Email: string;
      Lozinka: string;
      Uloga: string;
    }[];

    if (korisnici.length === 0) {
      res.status(401).json({ greska: "Pogrešan email ili lozinka." });
      return;
    }

    const korisnik = korisnici[0];
    if (!korisnik) {
      res.status(401).json({ greska: "Pogrešan email ili lozinka." });
      return;
    }

    let lozinkaIspravna = await bcrypt.compare(lozinka, korisnik.Lozinka);

    // Ako lozinka nije hashirana, probaj usporediti kao plain tekst
    if (!lozinkaIspravna) {
      if (korisnik.Lozinka === lozinka) {
        // Re-hashiraj lozinku i spremi u bazu
        const noviHash = await bcrypt.hash(lozinka, 10);
        await pool.query("UPDATE KORISNIK SET Lozinka = ? WHERE ID_korisnika = ?", [
          noviHash,
          korisnik.ID_korisnika,
        ]);
        lozinkaIspravna = true;
      }
    }

    if (!lozinkaIspravna) {
      res.status(401).json({ greska: "Pogrešan email ili lozinka." });
      return;
    }

    const token = jwt.sign(
      {
        id: korisnik.ID_korisnika,
        email: korisnik.Email,
        uloga: korisnik.Uloga,
        ime: korisnik.Ime,
        prezime: korisnik.Prezime,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      poruka: "Prijava uspješna.",
      token,
      korisnik: {
        id: korisnik.ID_korisnika,
        ime: korisnik.Ime,
        prezime: korisnik.Prezime,
        email: korisnik.Email,
        uloga: korisnik.Uloga,
      },
    });
  } catch (error) {
    console.error("Greška pri prijavi:", error);
    res.status(500).json({ greska: "Interna greška servera." });
  }
});

export default router;
