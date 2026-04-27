import { type Request, type Response, type NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

interface KorisnikToken extends JwtPayload {
  id: number;
}

export interface AuthRequest extends Request {
  user?: { id: number };
}

export const autentificiraj = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ greska: "Niste prijavljeni." });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ greska: "Neispravan token format." });
  }

  try {
    const tajna = process.env.JWT_SECRET || "sportspot_tajni_kljuc";

    const decoded = jwt.verify(token, tajna) as unknown as KorisnikToken;

    req.user = { id: decoded.id };
    next();
  } catch (error) {
    return res.status(401).json({ greska: "Neispravan ili istekao token." });
  }
};
