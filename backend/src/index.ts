import express, { type Request, type Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import objektiRoutes from "./routes/objektiRoutes.ts";
import terminiRoutes from "./routes/terminiRoutes.ts";
import authRoutes from "./routes/authRoutes.ts";
import adminRoutes from "./routes/adminRoutes.ts";
import pool from "./db.ts";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api/termini", terminiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

// POST /api/objekti - Kreiraj novi objekt (samo vlasnik)
app.post("/api/objekti", async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ greska: "Niste prijavljeni." });
    return;
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    res.status(401).json({ greska: "Neispravan token." });
    return;
  }

  const { naziv, adresa, kvart, kapacitet, opis, slikaUrl, sportovi } = req.body;

  if (!naziv || !adresa || !kvart) {
    res.status(400).json({ greska: "Naziv, adresa i kvart su obavezni." });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "sportspot_tajni_kljuc",
    ) as { id: number };

    const [result] = await pool.query(
      "INSERT INTO OBJEKTI (ID_korisnika, Naziv_objekta, Adresa, Kvart, Kapacitet, Opis, Slika_url, Status_objekta) VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')",
[decoded.id, naziv, adresa, kvart, kapacitet || null, opis || null, slikaUrl || null],
    );

    const insertResult = result as { insertId: number };
    const noviId = insertResult.insertId;

    // Dodaj sportove ako su proslijeđeni
    if (sportovi && Array.isArray(sportovi) && sportovi.length > 0) {
      const sportValues = sportovi.map((idSporta: number) => [noviId, idSporta]);
      await pool.query(
        "INSERT INTO SPORTOVI_OBJEKTA (ID_objekta, ID_sporta) VALUES ?",
        [sportValues],
      );
    }

    res
      .status(201)
      .json({ id: noviId, poruka: "Objekt uspješno kreiran." });
} catch (error: any) {
  if (error.code === 'ER_DUP_ENTRY') {
    res.status(409).json({ greska: "Objekt s tim nazivom već postoji." });
    return;
  }
  console.error("Greška pri kreiranju objekta:", error);
  res.status(500).json({ greska: "Interna greška servera." });
}
});

// PUT /api/objekti/:id - Ažuriraj objekt (samo vlasnik)
app.put("/api/objekti/:id", async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ greska: "Niste prijavljeni." });
    return;
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    res.status(401).json({ greska: "Neispravan token." });
    return;
  }

  const { id } = req.params;
  const { naziv, adresa, kvart, kapacitet, opis, slikaUrl, sportovi } = req.body;

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "sportspot_tajni_kljuc",
    ) as { id: number };

    // Provjeri je li objekt vlasnikov
    const [existing] = await pool.query(
      "SELECT ID_objekta FROM OBJEKTI WHERE ID_objekta = ? AND ID_korisnika = ?",
      [id, decoded.id],
    );
    const rows = existing as { ID_objekta: number }[];
    if (rows.length === 0) {
      res
        .status(404)
        .json({ greska: "Objekt ne postoji ili nemate pravo uređivati." });
      return;
    }

    await pool.query(
      "UPDATE OBJEKTI SET Naziv_objekta = ?, Adresa = ?, Kvart = ?, Kapacitet = ?, Opis = ?, Slika_url = ? WHERE ID_objekta = ?",
[naziv, adresa, kvart, kapacitet || null, opis || null, slikaUrl || null, id],
    );

    // Ažuriraj sportove - prvo izbriši stare, pa dodaj nove
    await pool.query("DELETE FROM SPORTOVI_OBJEKTA WHERE ID_objekta = ?", [id]);
    
    if (sportovi && Array.isArray(sportovi) && sportovi.length > 0) {
      const sportValues = sportovi.map((idSporta: number) => [id, idSporta]);
      await pool.query(
        "INSERT INTO SPORTOVI_OBJEKTA (ID_objekta, ID_sporta) VALUES ?",
        [sportValues],
      );
    }

    res.json({ poruka: "Objekt uspješno ažuriran." });
  } catch (error) {
    console.error("Greška pri ažuriranju objekta:", error);
    res.status(500).json({ greska: "Interna greška servera." });
  }
});

app.use("/api/objekti", objektiRoutes);

// GET /api/profile - Dohvati profil korisnika
app.get("/api/profile", async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ greska: "Niste prijavljeni." });
    return;
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    res.status(401).json({ greska: "Neispravan token." });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "sportspot_tajni_kljuc",
    ) as { id: number };

    const [rows] = await pool.query(
      "SELECT ID_korisnika, Ime, Prezime, Email, Broj_mobitela, Uloga FROM KORISNIK WHERE ID_korisnika = ?",
      [decoded.id],
    );

    const korisnici = rows as {
      ID_korisnika: number;
      Ime: string;
      Prezime: string;
      Email: string;
      Broj_mobitela: string | null;
      Uloga: string;
    }[];

    if (korisnici.length === 0) {
      res.status(404).json({ greska: "Korisnik ne postoji." });
      return;
    }

    const k = korisnici[0];
    if (!k) {
      res.status(404).json({ greska: "Korisnik ne postoji." });
      return;
    }
    res.json({
      id: k.ID_korisnika,
      ime: k.Ime,
      prezime: k.Prezime,
      email: k.Email,
      brojMobitela: k.Broj_mobitela,
      uloga: k.Uloga,
    });
  } catch (error) {
    console.error("Greška pri dohvatu objekata:", error);
    res.status(500).json({ greska: "Interna greška servera." });
  }
});

// GET /api/moje-rezervacije - Povijest rezervacija
app.get("/api/moje-rezervacije", async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ greska: "Niste prijavljeni." });
    return;
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    res.status(401).json({ greska: "Neispravan token." });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "sportspot_tajni_kljuc",
    ) as { id: number };

    const [rows] = await pool.query(
      `SELECT t.ID_termina, t.ID_objekta, o.Naziv_objekta, o.Adresa, o.Kvart, k.Naziv_kluba, t.Datum, 
       TIME_FORMAT(t.Vrijeme_pocetka, '%H:%i') AS vrijeme_pocetka,
       TIME_FORMAT(t.Vrijeme_kraja, '%H:%i') AS vrijeme_kraja, t.Cijena, t.Status
       FROM TERMINI t
       JOIN OBJEKTI o ON t.ID_objekta = o.ID_objekta
       LEFT JOIN KLUB k ON o.ID_kluba = k.ID_kluba
       WHERE t.ID_korisnika = ? AND t.Status != 'Slobodan'
       ORDER BY t.Datum DESC, t.Vrijeme_pocetka DESC`,
      [decoded.id],
    );

    res.json(rows);
  } catch (error) {
    console.error("Greška pri dohvatu rezervacija:", error);
    res.status(500).json({ greska: "Interna greška servera." });
  }
});

// GET /api/sportovi - Lista svih sportova
app.get("/api/sportovi", async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query("SELECT ID_sporta, Naziv_sporta FROM SPORT ORDER BY Naziv_sporta");
    res.json(rows);
  } catch (error) {
    console.error("Greška pri dohvaćanju sportova:", error);
    res.status(500).json({ greska: "Interna greška servera." });
  }
});

// GET /api/moji-objekti - Objekti vlasnika
app.get("/api/moji-objekti", async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ greska: "Niste prijavljeni." });
    return;
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    res.status(401).json({ greska: "Neispravan token." });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "sportspot_tajni_kljuc",
    ) as { id: number };

const [rows] = await pool.query(
  `SELECT o.ID_objekta, o.Naziv_objekta, o.Adresa, o.Kvart, o.Kapacitet, o.Opis, o.Slika_url, o.Status_objekta,
   (SELECT GROUP_CONCAT(s.Naziv_sporta SEPARATOR ', ') FROM SPORTOVI_OBJEKTA so JOIN SPORT s ON so.ID_sporta = s.ID_sporta WHERE so.ID_objekta = o.ID_objekta) AS sportovi
   FROM OBJEKTI o
   WHERE o.ID_korisnika = ?
   ORDER BY o.Naziv_objekta ASC`,
  [decoded.id],
);

    res.json(rows);
  } catch (error) {
    console.error("Greška pri dohvatu objekata:", error);
    res.status(500).json({ greska: "Interna greška servera." });
  }
});

// POST /api/profile/update - Ažuriraj profil
app.post("/api/profile/update", async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ greska: "Niste prijavljeni." });
    return;
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    res.status(401).json({ greska: "Neispravan token." });
    return;
  }

  const { ime, prezime, email, brojMobitela, novaLozinka } = req.body;

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "sportspot_tajni_kljuc",
    ) as { id: number };

    const [currentRows] = await pool.query(
      "SELECT Ime, Prezime, Email, Broj_mobitela FROM KORISNIK WHERE ID_korisnika = ?",
      [decoded.id],
    );
    const current = (
      currentRows as {
        Ime: string;
        Prezime: string;
        Email: string;
        Broj_mobitela: string | null;
      }[]
    )[0];
    if (!current) {
      res.status(404).json({ greska: "Korisnik ne postoji." });
      return;
    }

    if (email && email !== current.Email) {
      const [existing] = await pool.query(
        "SELECT ID_korisnika FROM KORISNIK WHERE Email = ? AND ID_korisnika != ?",
        [email, decoded.id],
      );
      const rows = existing as { ID_korisnika: number }[];
      if (rows.length > 0) {
        res.status(409).json({ greska: "Email je već u uporabi." });
        return;
      }
    }

    let query = "UPDATE KORISNIK SET ";
    const params: (string | number)[] = [];

    if (ime && ime !== current.Ime) {
      query += "Ime = ?, ";
      params.push(ime);
    }
    if (prezime && prezime !== current.Prezime) {
      query += "Prezime = ?, ";
      params.push(prezime);
    }
    if (email && email !== current.Email) {
      query += "Email = ?, ";
      params.push(email);
    }
    if (brojMobitela !== undefined && brojMobitela !== current.Broj_mobitela) {
      query += "Broj_mobitela = ?, ";
      params.push(brojMobitela || "");
    }
    if (novaLozinka) {
      const hash = await bcrypt.hash(novaLozinka, 10);
      query += "Lozinka = ?, ";
      params.push(hash);
    }
    if (params.length === 0) {
  res.json({ poruka: "Nema promjena za ažurirati." });
  return;
}
    query = query.slice(0, -2) + " WHERE ID_korisnika = ?";
    params.push(decoded.id);

    await pool.query(query, params);

    res.json({ poruka: "Profil uspješno ažuriran." });
  } catch (error) {
    console.error("Greška pri ažuriranju profila:", error);
    res.status(500).json({ greska: "Interna greška servera." });
  }
});

app.get("/", (req: Request, res: Response) => {
  res.send("Ova ruta / radi");
});

app.get("/test-db", async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query("SELECT 1 as test");
    res.json({ success: true, rows });
  } catch (error) {
    res.json({ success: false, error: String(error) });
  }
});

app.listen(PORT, () => {
  console.log(`Server se pokreće na: http://localhost:${PORT}`);
});
