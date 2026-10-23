export type FacilityFilters = {
  selectedSports: string[];
  selectedDistrict: string;
  selectedDate: string;
  selectedPeriod: string;
  minPrice: string;
  maxPrice: string;
  freeOnly: boolean;
};

export function buildFacilityQuery(
  filters: FacilityFilters,
): URLSearchParams {
  const params = new URLSearchParams();

  filters.selectedSports.forEach((sport) => {
    params.append("sport", sport);
  });

  if (filters.selectedDistrict !== "Svi kvartovi") {
    params.set("kvart", filters.selectedDistrict);
  }

  if (filters.selectedDate) {
    params.set("datum", filters.selectedDate);
  }

  if (filters.selectedPeriod) {
    params.set("period", filters.selectedPeriod);
  }

  if (filters.freeOnly) {
    params.set("besplatni", "true");
  }

  if (!filters.freeOnly && filters.minPrice) {
    params.set("cijenaMin", filters.minPrice);
  }

  if (!filters.freeOnly && filters.maxPrice) {
    params.set("cijenaMax", filters.maxPrice);
  }

  return params;
}
