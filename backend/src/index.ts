import express, { type Request, type Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Ova ruta / radi");
});

app.listen(PORT, () => {
  console.log(`Server diše na: http://localhost:${PORT}`);
});
