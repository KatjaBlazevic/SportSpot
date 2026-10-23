
import { useCallback, useEffect, useState } from "react";
import type { SportsFacility } from "../types/sportsFacility";
import {
  buildFacilityQuery,
  type FacilityFilters,
} from "../utils/buildFacilityQuery";

const API_URL = "http://localhost:5000/api";

type FacilitiesResult = {
  requestKey: string;
  facilities: SportsFacility[];
  error: string | null;
};

export default function useFacilities(filters: FacilityFilters) {
  const [refreshCount, setRefreshCount] = useState(0);

  const [result, setResult] = useState<FacilitiesResult>({
    requestKey: "",
    facilities: [],
    error: null,
  });

  const {
    selectedSports,
    selectedDistrict,
    selectedDate,
    selectedPeriod,
    minPrice,
    maxPrice,
    freeOnly,
  } = filters;

  const query = buildFacilityQuery({
    selectedSports,
    selectedDistrict,
    selectedDate,
    selectedPeriod,
    minPrice,
    maxPrice,
    freeOnly,
  }).toString();

  const requestKey = `${query}::${refreshCount}`;

  useEffect(() => {
    const controller = new AbortController();

    const loadFacilities = async () => {
      try {
        const response = await fetch(
          `${API_URL}/objekti?${query}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error("Greška pri dohvaćanju podataka");
        }

        const data: SportsFacility[] = await response.json();

        if (controller.signal.aborted) return;

        setResult({
          requestKey,
          facilities: data,
          error: null,
        });
      } catch (error) {
        if (controller.signal.aborted) return;

        console.error(error);

        setResult({
          requestKey,
          facilities: [],
          error:
            "Nije moguće dohvatiti objekte. Provjeri je li backend pokrenut na portu 5000.",
        });
      }
    };

    void loadFacilities();

    return () => {
      controller.abort();
    };
  }, [query, requestKey]);

  const refetch = useCallback(() => {
    setRefreshCount((previous) => previous + 1);
  }, []);

  const isLoading = result.requestKey !== requestKey;

  // TODO: Odlučiti trebaju li se filteri primjenjivati
  // automatski ili isključivo klikom na gumb.

  return {
    facilities: result.facilities,
    isLoading,
    error: isLoading ? null : result.error,
    refetch,
  };
}
