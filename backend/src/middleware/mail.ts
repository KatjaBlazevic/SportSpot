import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

type TipMaila = "LISTA_CEKANJA" | "REZERVACIJA_GOST" | "OTKAZIVANJE_GOST";

export const posaljiEmailObavijest = async (
  email: string,
  nazivObjekta: string,
  terminInfo: string,
  tip: TipMaila,
  idTermina?: number,
  lozinkaHash?: string,
) => {
  let subject = "";
  let naslovHtml = "";
  let porukaHtml = "";
  let prikaziGumb = false;

  // Logika za odabir sadržaja
  switch (tip) {
    case "LISTA_CEKANJA":
      subject = "Upao si! Termin je tvoj!";
      naslovHtml = "Sjajne vijesti!";
      porukaHtml = `Bio si na listi čekanja za objekt <strong>${nazivObjekta}</strong>. Termin se oslobodio i sada je rezerviran na tvoje ime:`;
      prikaziGumb = true;
      break;

    case "REZERVACIJA_GOST":
      subject = "Uspješna rezervacija - SportSpot";
      naslovHtml = "Termin rezerviran!";
      porukaHtml = `Uspješno ste rezervirali termin u objektu <strong>${nazivObjekta}</strong>. Detalji termina:`;
      prikaziGumb = true;
      break;

    case "OTKAZIVANJE_GOST":
      subject = "Otkazivanje rezervacije";
      naslovHtml = "Rezervacija otkazana";
      porukaHtml = `Vaša rezervacija za objekt <strong>${nazivObjekta}</strong> je uspješno otkazana. Detalji termina koji je otkazan:`;
      prikaziGumb = false;
      break;
  }

  const hashToken = lozinkaHash ? encodeURIComponent(lozinkaHash) : "";
  const otkazivanjeLink = `https://sportspot-sxcq.onrender.com/api/termini/otkazivanje-gosta?id=${idTermina}&auth=${hashToken}`;

  const mailOptions = {
    from: '"SportSpot" <noreply@sportspot.hr>',
    to: email,
    subject: subject,
    html: `
      <div style="font-family: sans-serif; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; max-width: 500px; margin: auto; text-align: center;">
        <h2 style="color: #2563eb;">${naslovHtml}</h2>
        <p style="color: #475569; line-height: 1.5; text-align: left;">${porukaHtml}</p>
        
        <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb; text-align: left;">
          <p style="margin: 0; font-weight: bold; color: #1e293b;">${terminInfo}</p>
        </div>

        ${
          prikaziGumb
            ? `
          <div style="margin-top: 30px; margin-bottom: 20px;">
            <p style="font-size: 13px; color: #64748b; margin-bottom: 10px;">Promijenili ste planove?</p>
            <a href="${otkazivanjeLink}" 
               style="background-color: #ef4444; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
               Otkaži ovaj termin
            </a>
          </div>
        `
            : ""
        }

        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
        <p style="font-size: 11px; color: #94a3b8;">
          Ovaj mail je automatski poslan od strane SportSpot sustava.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email (${tip}) uspješno poslan na:`, email);
  } catch (error) {
    console.error("Nodemailer greška:", error);
  }
};
