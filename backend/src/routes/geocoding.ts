import https from "https";

export async function geocodeAdresa(adresa: string): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    const upit = encodeURIComponent(`${adresa}, Rijeka`);
    const url = `https://photon.komoot.io/api/?q=${upit}&limit=1&lang=default`;
    console.log("Geocoding URL:", url);
    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          const feature = json.features?.[0];
          if (feature) {
            const [lng, lat] = feature.geometry.coordinates;
            resolve({ lat, lng });
          } else {
            console.warn("Geocoding: nema rezultata za:", adresa);
            resolve(null);
          }
        } catch (e) {
          console.error("Geocoding: greška parsiranja:", e);
          resolve(null);
        }
      });
    }).on("error", (e) => {
      console.error("Geocoding: HTTP greška:", e);
      resolve(null);
    });
  });
}