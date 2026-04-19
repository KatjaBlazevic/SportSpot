import express, { type Request, type Response } from "express";

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  const popisObjekata = [
    {
      id: 1,
      naziv: "Arena Zagreb",
      sport: "Rukomet/Košarka",
      lokacija: "Lanište",
    },
    {
      id: 2,
      naziv: "Dom Sportova",
      sport: "Klizanje/Tenis",
      lokacija: "Trešnjevka",
    },
    { id: 3, naziv: "Mladost", sport: "Plivanje/Vaterpolo", lokacija: "Sava" },
  ];

  res.json(popisObjekata);
});

export default router;
