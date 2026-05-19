import { useEffect, useState } from "react";

interface SportskiObjekt {
  ID_objekta: number;
  Naziv_objekta: string;
  Adresa: string;
  Opis: string;
  Kvart: string;
  Kapacitet: number;
  Vlasnik_Ime: string;
  Vlasnik_Prezime: string;
}

function Objekti() {
  const [objekti, setObjekti] = useState<SportskiObjekt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://sportspot-sxcq.onrender.com/api/objekti")
      .then((res) => res.json())
      .then((data) => {
        setObjekti(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Greška pri dohvaćanju:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="p-8">Učitavam objekte...</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Svi sportski objekti</h1>

      <div className="grid w-max grid-cols-5 gap-2">
        {objekti.map((objekt) => (
          <div
            key={objekt.ID_objekta}
            className="p-4 bg-white border-b-2 border-gray-500 rounded shadow-sm"
          >
            <h2 className="text-xl font-bold text-gray-700">
              {objekt.Naziv_objekta}
            </h2>
            <p className="text-gray-700">
              <strong>Lokacija:</strong> {objekt.Adresa}, {objekt.Kvart}
            </p>
            <p className="text-gray-700">
              <strong>Kapacitet:</strong> {objekt.Kapacitet} ljudi
            </p>
            <p className="text-gray-600 mt-2">{objekt.Opis}</p>
            <hr className="my-2" />
            <p className="text-sm text-gray-500">
              Vlasnik: {objekt.Vlasnik_Ime} {objekt.Vlasnik_Prezime}
            </p>
          </div>
        ))}
      </div>

      {objekti.length === 0 && <p>Nema pronađenih objekata u bazi.</p>}
    </div>
  );
}

export default Objekti;
