
import { useCallback, useEffect, useState } from "react";
import type { DetaljiObjekta } from "../types";

export default function useFacilityDetails(id: string | undefined) {
  const [data, setData] = useState<DetaljiObjekta | null>(null);

  const refetch = useCallback(() => {
    if (!id) return;

    fetch(`http://localhost:5000/api/objekti/${id}`)
      .then((response) => response.json())
      .then((result: DetaljiObjekta) => {
        setData(result);
      })
      .catch((error) => {
        console.error("Greška:", error);
      });
  }, [id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    data,
    refetch,
  };
}
