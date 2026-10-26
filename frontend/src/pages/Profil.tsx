import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/useAuth";
import ProfileLayout from "../components/Profile/ProfileLayout";

export default function Profil() {
  const { korisnik, ucitavanje } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!ucitavanje && !korisnik) {
      navigate("/prijava", { replace: true });
    }
  }, [ucitavanje, korisnik, navigate]);

  if (ucitavanje || !korisnik) {
    return null;
  }

  return <ProfileLayout key={korisnik.uloga} korisnik={korisnik} />;
}
