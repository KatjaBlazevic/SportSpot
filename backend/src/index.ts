import express, { type Request, type Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import objektiRoutes from "./routes/objektiRoutes.ts";
import pool from "./db.ts";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api/objekti", objektiRoutes);

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
