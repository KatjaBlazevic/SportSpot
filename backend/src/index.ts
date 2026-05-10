import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import objektiRoutes from "./routes/objektiRoutes.ts";
import terminiRoutes from "./routes/terminiRoutes.ts";
import authRoutes from "./routes/authRoutes.ts";
import adminRoutes from "./routes/adminRoutes.ts";
import vlasnikRoutes from "./routes/vlasnikRoutes.ts";
import korisnikRoutes from "./routes/korisnikRoutes.ts";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/termini", terminiRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/vlasnik", vlasnikRoutes);
app.use("/api/objekti", objektiRoutes);
app.use("/api/korisnik", korisnikRoutes);

app.get("/", (_req, res) => res.send("SportSpot API radi!"));
app.get("/test-db", async (_req, res) => {
  try {
    const [rows] = await (await import("./db.ts")).default.query("SELECT 1 as test");
    res.json({ success: true, rows });
  } catch (error) {
    res.json({ success: false, error: String(error) });
  }
});

app.listen(PORT, () => console.log(`Server pokrenut na: http://localhost:${PORT}`));