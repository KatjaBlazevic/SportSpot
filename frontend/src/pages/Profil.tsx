import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import ProfilKorisnik from "./ProfilKorisnik";
import ProfilVlasnik from "./ProfilVlasnik";

export default function Profil() {
  const { korisnik, ucitavanje } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!ucitavanje && !korisnik) {
      navigate("/prijava");
    }
  }, [ucitavanje, korisnik, navigate]);

  if (ucitavanje || !korisnik) {
    return null;
  }

  if (korisnik.uloga === "Vlasnik") {
    return <ProfilVlasnik />;
  }

  return <ProfilKorisnik />;
}