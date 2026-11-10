
const OVERPASS_SERVERS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

export const getNearbyAttractions = async (
  latitude,
  longitude,
  radius = 2000
) => {
  const query = `
    [out:json][timeout:25];

    (
      nwr(around:${radius},${latitude},${longitude})
        [tourism~"attraction|museum|viewpoint|artwork|gallery|zoo|theme_park"];

      nwr(around:${radius},${latitude},${longitude})
        [historic];

      nwr(around:${radius},${latitude},${longitude})
        [natural~"waterfall|peak|cave|spring"];

      nwr(around:${radius},${latitude},${longitude})
        [amenity~"place_of_worship|museum|arts_centre"];

      nwr(around:${radius},${latitude},${longitude})
        [leisure~"park|garden"];
    );

    out center tags 50;
  `;

  let lastError;

  for (const server of OVERPASS_SERVERS) {
    try {
      const response = await fetch(server, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "TravelMate/1.0",
        },
        body: new URLSearchParams({ data: query }),
        signal: AbortSignal.timeout(60000),
      });

      if (!response.ok) {
        throw new Error(
          `Overpass server returned status ${response.status}`
        );
      }

      const data = await response.json();

      return data.elements
        .map((element) => {
          const tags = element.tags || {};

          const latitude = element.lat ?? element.center?.lat;
          const longitude = element.lon ?? element.center?.lon;

          if (!tags.name || latitude == null || longitude == null) {
            return null;
          }

          return {
            id: `${element.type}-${element.id}`,
            name: tags.name,
            latitude,
            longitude,
            category:
              tags.tourism ||
              tags.historic ||
              tags.natural ||
              tags.amenity ||
              tags.leisure ||
              "attraction",
            address: tags["addr:full"] || "",
            website: tags.website || "",
          };
        })
        .filter(Boolean);
    } catch (error) {
      lastError = error;
      console.error(`Overpass server failed: ${server}`, error.message);
    }
  }

  throw lastError || new Error("All Overpass servers failed.");
};
