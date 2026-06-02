import express, { type Request, type Response } from "express";
import pool from "../db.ts";
import { autentificiraj, type AuthRequest } from "../middleware/auth.ts";
import bcrypt from "bcrypt";
import { posaljiEmailObavijest } from "../middleware/mail.ts";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// Putanja će biti: GET https://sportspot-sxcq.onrender.com/api/termini/
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

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [terminPodaci] = (await connection.query(
        `SELECT t.ID_korisnika, t.Datum, t.Vrijeme_pocetka, o.Naziv_objekta, k.Email 
         FROM TERMINI t 
         JOIN OBJEKTI o ON t.ID_objekta = o.ID_objekta 
         JOIN KORISNIK k ON t.ID_korisnika = k.ID_korisnika
         WHERE t.ID_termina = ?`,
        [idTermina],
      )) as [any[], any];

      if (terminPodaci.length === 0) {
        await connection.rollback();
        return res.status(404).json({ error: "Termin nije pronađen." });
      }

      if (Number(terminPodaci[0].ID_korisnika) !== Number(idKorisnika)) {
        await connection.rollback();
        return res
          .status(403)
          .json({ error: "Nemate dozvolu za otkazivanje tuđe rezervacije." });
      }

      //priprema formata za mail
      const datumObjekt = new Date(terminPodaci[0].Datum);
      const formatiranDatum = datumObjekt.toLocaleDateString("hr-HR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      const terminInfo = `${formatiranDatum} u ${terminPodaci[0].Vrijeme_pocetka.toString().slice(0, 5)}h`;
      const nazivObjekta = terminPodaci[0].Naziv_objekta;
      const emailOtkazivaca = terminPodaci[0].Email;

      //provjera liste čekanja
      const [listaCekanja] = (await connection.query(
        `SELECT l.ID_korisnika, k.Email 
         FROM LISTA_CEKANJA l 
         JOIN KORISNIK k ON l.ID_korisnika = k.ID_korisnika 
         WHERE l.ID_termina = ? 
         ORDER BY l.Vrijeme_prijave ASC LIMIT 1`,
        [idTermina],
      )) as [any[], any];

      if (listaCekanja.length > 0) {
        const sljedeciKorisnikID = listaCekanja[0].ID_korisnika;
        const sljedeciKorisnikEmail = listaCekanja[0].Email;

        //dodijeli termin sljedećem
        await connection.query(
          "UPDATE TERMINI SET ID_korisnika = ?, Status = 'Rezervirano' WHERE ID_termina = ?",
          [sljedeciKorisnikID, idTermina],
        );

        await connection.query(
          "DELETE FROM LISTA_CEKANJA WHERE ID_termina = ? AND ID_korisnika = ?",
          [idTermina, sljedeciKorisnikID],
        );

        await connection.commit();

        posaljiEmailObavijest(
          sljedeciKorisnikEmail,
          nazivObjekta,
          terminInfo,
          "LISTA_CEKANJA",
        );

        return res.status(200).json({
          message: "Otkazano. Termin dodijeljen osobi s liste čekanja!",
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

//micanje sa liste cekanja
router.delete(
  "/lista-cekanja/odustani/:idTermina",
  autentificiraj,
  async (req: AuthRequest, res: Response) => {
    try {
      const { idTermina } = req.params;
      const idKorisnika = req.user?.id;

      const [result]: any = await pool.query(
        "DELETE FROM LISTA_CEKANJA WHERE ID_korisnika = ? AND ID_termina = ?",
        [idKorisnika, idTermina],
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          error: "Niste pronađeni na listi čekanja za ovaj termin.",
        });
      }

      res.status(200).json({
        message: "Uspješno ste se uklonili s liste čekanja.",
      });
    } catch (error) {
      console.error("Greška pri brisanju s liste čekanja:", error);
      res.status(500).json({ error: "Greška na serveru." });
    }
  },
);

//Neregistrirani korisnik dodavanje
router.put("/rezerviraj-gost/:id", async (req: AuthRequest, res: Response) => {
  const idTermina = req.params.id;
  const { emailGosta } = req.body;
  let idKorisnika = req.user?.id;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const [podaciTermina] = (await connection.query(
      `SELECT t.*, o.Naziv_objekta 
       FROM TERMINI t 
       JOIN OBJEKTI o ON t.ID_objekta = o.ID_objekta 
       WHERE t.ID_termina = ?`,
      [idTermina],
    )) as [any[], any];

    if (podaciTermina.length === 0 || podaciTermina[0].Status !== "Slobodan") {
      await connection.rollback();
      return res.status(400).json({ error: "Termin više nije dostupan." });
    }

    if (!idKorisnika) {
      if (!emailGosta) {
        await connection.rollback();
        return res.status(400).json({ error: "Email je obavezan." });
      }

      const [postojeci] = (await connection.query(
        "SELECT ID_korisnika FROM KORISNIK WHERE Email = ?",
        [emailGosta],
      )) as [any[], any];

      if (postojeci.length > 0) {
        idKorisnika = postojeci[0].ID_korisnika;
      } else {
        const tajniDodatak = process.env.TAJNI_KLJUC_MAIL;
        const lozinkaZaBazu = emailGosta + tajniDodatak;
        const hashLozinke = await bcrypt.hash(lozinkaZaBazu, 10);

        const [noviUser] = (await connection.query(
          "INSERT INTO KORISNIK (Ime, Prezime, Email, Lozinka, Uloga) VALUES (?, ?, ?, ?, 'User')",
          ["Gost", "Korisnik", emailGosta, hashLozinke],
        )) as [any, any];

        idKorisnika = noviUser.insertId;
      }
    }
    const [korisnikPodaci] = (await connection.query(
      "SELECT Email, Lozinka FROM KORISNIK WHERE ID_korisnika = ?",
      [idKorisnika],
    )) as [any[], any];

    const hashLozinkeZaLink = korisnikPodaci[0].Lozinka;
    const emailPrimatelja = korisnikPodaci[0].Email;

    //Ažuriranje termina
    await connection.query(
      "UPDATE TERMINI SET ID_korisnika = ?, Status = 'Rezervirano' WHERE ID_termina = ?",
      [idKorisnika, idTermina],
    );

    await connection.commit();

    // Formatiranje datuma i vremena
    const datumObjekt = new Date(podaciTermina[0].Datum);
    const formatiranDatum = datumObjekt.toLocaleDateString("hr-HR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const formatiranoVrijeme =
      podaciTermina[0].Vrijeme_pocetka.toString().slice(0, 5);
    const terminInfo = `${formatiranDatum} u ${formatiranoVrijeme}h`;

    posaljiEmailObavijest(
      emailPrimatelja,
      podaciTermina[0].Naziv_objekta,
      terminInfo,
      "REZERVACIJA_GOST",
      podaciTermina[0].ID_termina,
      hashLozinkeZaLink,
    ).catch((err) => console.error("Greška pri slanju maila:", err));

    res.status(200).json({ message: "Uspješno rezervirano!" });
  } catch (error) {
    await connection.rollback();
    console.error("Greška pri rezervaciji:", error);
    res.status(500).json({ error: "Interna greška servera." });
  } finally {
    connection.release();
  }
});

//Otkaži nereg korisnik preko maila
router.get("/otkazivanje-gosta", async (req: Request, res: Response) => {
  const { id, auth } = req.query;

  if (!id || !auth) {
    return res.status(400).send("<h1>Neispravan link za otkazivanje.</h1>");
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [podaci] = (await connection.query(
      `SELECT t.ID_termina, t.Datum, t.Vrijeme_pocetka, k.Lozinka, k.Email, o.Naziv_objekta
       FROM TERMINI t
       JOIN KORISNIK k ON t.ID_korisnika = k.ID_korisnika
       JOIN OBJEKTI o ON t.ID_objekta = o.ID_objekta
       WHERE t.ID_termina = ?`,
      [id],
    )) as [any[], any];

    if (podaci.length === 0) {
      await connection.rollback();
      return res
        .status(404)
        .send("<h1>Termin nije pronađen ili je već otkazan.</h1>");
    }

    //SIGURNOSNA PROVJERA
    const hashIzBaze = podaci[0].Lozinka;
    const hashIzLinka = auth as string;

    if (hashIzLinka !== hashIzBaze) {
      await connection.rollback();
      return res
        .status(403)
        .send("<h1>Autorizacija neuspješna. Link je nevažeći.</h1>");
    }

    const datumObjekt = new Date(podaci[0].Datum);
    const formatiranDatum = datumObjekt.toLocaleDateString("hr-HR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const terminInfo = `${formatiranDatum} u ${podaci[0].Vrijeme_pocetka.toString().slice(0, 5)}h`;
    const nazivObjekta = podaci[0].Naziv_objekta;
    const emailOtkazivaca = podaci[0].Email;

    const [listaCekanja] = (await connection.query(
      `SELECT ID_korisnika FROM LISTA_CEKANJA WHERE ID_termina = ? ORDER BY Vrijeme_prijave ASC LIMIT 1`,
      [id],
    )) as [any[], any];

    let porukaZaBrowser = "Vaša rezervacija je uspješno otkazana.";

    if (listaCekanja.length > 0) {
      const noviKorisnikID = listaCekanja[0].ID_korisnika;

      await connection.query(
        "UPDATE TERMINI SET ID_korisnika = ?, Status = 'Rezervirano' WHERE ID_termina = ?",
        [noviKorisnikID, id],
      );

      await connection.query(
        "DELETE FROM LISTA_CEKANJA WHERE ID_termina = ? AND ID_korisnika = ?",
        [id, noviKorisnikID],
      );

      porukaZaBrowser +=
        " Termin je dodijeljen sljedećoj osobi s liste čekanja.";
    } else {
      await connection.query(
        "UPDATE TERMINI SET ID_korisnika = NULL, Status = 'Slobodan' WHERE ID_termina = ?",
        [id],
      );
    }

    await connection.commit();

    try {
      await posaljiEmailObavijest(
        emailOtkazivaca,
        nazivObjekta,
        terminInfo,
        "OTKAZIVANJE_GOST",
      );
    } catch (mailError) {
      console.error("Greška pri slanju maila otkazivanja:", mailError);
    }

    res.send(`
      <div style="font-family: sans-serif; text-align: center; padding: 50px; color: #1e293b;">
        <div style="font-size: 50px; margin-bottom: 20px;">✅</div>
        <h1 style="color: #2563eb; margin-bottom: 10px;">SportSpot</h1>
        <p style="font-size: 18px; margin-bottom: 30px;">${porukaZaBrowser}</p>
        <a href="https://sportspot-ry8m.onrender.com" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 10px; font-weight: bold;">Povratak na SportSpot</a>
      </div>
    `);
  } catch (error) {
    await connection.rollback();
    console.error("Greška kod otkazivanja:", error);
    res.status(500).send("<h1>Došlo je do greške na serveru.</h1>");
  } finally {
    connection.release();
  }
});
export default router;
