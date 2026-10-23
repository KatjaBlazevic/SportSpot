
import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api";
const ALL_DISTRICTS = "Svi kvartovi";

export default function useHomeFilters() {
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState(ALL_DISTRICTS);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [freeOnly, setFreeOnly] = useState(false);

  const [districts, setDistricts] = useState<string[]>([
    ALL_DISTRICTS,
  ]);

  useEffect(() => {
    fetch(`${API_URL}/objekti/kvartovi`)
      .then((response) => response.json())
      .then((data: string[]) => {
        setDistricts([ALL_DISTRICTS, ...data]);
      })
      .catch(() => {
        setDistricts([ALL_DISTRICTS]);
      });
  }, []);

  const toggleSport = (sport: string) => {
    setSelectedSports((previous) =>
      previous.includes(sport)
        ? previous.filter((item) => item !== sport)
        : [...previous, sport],
    );
  };

  // TODO: Uključiti selectedPeriod u provjeru aktivnih filtera.
  // Trenutno je izostavljen kako bi se zadržalo postojeće ponašanje.
  const hasActiveFilters =
    selectedSports.length > 0 ||
    selectedDistrict !== ALL_DISTRICTS ||
    !!selectedDate ||
    !!minPrice ||
    !!maxPrice ||
    freeOnly;

  return {
    selectedSports,
    setSelectedSports,
    selectedDistrict,
    setSelectedDistrict,
    selectedDate,
    setSelectedDate,
    selectedPeriod,
    setSelectedPeriod,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    freeOnly,
    setFreeOnly,
    districts,
    toggleSport,
    hasActiveFilters,
  };
}
