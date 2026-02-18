// Geocoding utility using OpenStreetMap Nominatim API (free, no API key required)

interface GeocodingResult {
  lat: number;
  lng: number;
}

export async function geocodeLocation(
  city?: string | null,
  state?: string | null,
  country?: string | null
): Promise<GeocodingResult | null> {
  const parts = [city, state, country].filter(Boolean);
  if (parts.length === 0) return null;

  const query = parts.join(", ");

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
      {
        headers: {
          "User-Agent": "RVNO-Website/1.0",
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }

    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}
