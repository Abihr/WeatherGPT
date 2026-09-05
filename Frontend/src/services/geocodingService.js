export async function getLocationName(latitude, longitude) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=jsonv2&addressdetails=1`
  );

  if (!response.ok) {
    throw new Error("Failed to reverse geocode location");
  }

  const data = await response.json();

  const address = data.address;

  const city =
    address.city ||
    address.town ||
    address.village ||
    address.municipality ||
    "";

  const state = address.state || "";

  return {
    city,
    state,
    country: address.country || "",
    displayName: city && state ? `${city}, ${state}` : city || state,
  };
}