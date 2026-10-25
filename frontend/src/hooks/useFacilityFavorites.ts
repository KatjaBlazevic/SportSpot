
import { useState } from "react";

type FavoriteFacility = {
  id: number;
  naziv: string;
  adresa: string;
};

type UseFacilityFavoritesProps = {
  facilityId: string | undefined;
  facilityName: string;
  facilityAddress: string;
  isAuthenticated: boolean;
};

const STORAGE_KEY = "sportspot_omiljeni";

function getFavorites(): FavoriteFacility[] {
  const saved = localStorage.getItem(STORAGE_KEY);

  return saved ? (JSON.parse(saved) as FavoriteFacility[]) : [];
}

export default function useFacilityFavorites({
  facilityId,
  facilityName,
  facilityAddress,
  isAuthenticated,
}: UseFacilityFavoritesProps) {
  const [favorites, setFavorites] = useState<FavoriteFacility[]>(getFavorites);

  const isFavorite = favorites.some(
    (favorite) => favorite.id === Number(facilityId),
  );

  const toggleFavorite = () => {
    if (!isAuthenticated || !facilityId) return;

    const savedFavorites = getFavorites();
    const id = Number(facilityId);

    const alreadyFavorite = savedFavorites.some(
      (favorite) => favorite.id === id,
    );

    const updatedFavorites = alreadyFavorite
      ? savedFavorites.filter((favorite) => favorite.id !== id)
      : [
          ...savedFavorites,
          {
            id,
            naziv: facilityName,
            adresa: facilityAddress,
          },
        ];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFavorites));
    setFavorites(updatedFavorites);
  };

  return {
    isFavorite,
    toggleFavorite,
  };
}
