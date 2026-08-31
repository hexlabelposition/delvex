/**
 * The API resolves `originLocationId` / `destinationLocationId` against its
 * `branches` table but exposes no endpoint to list them, so the catalogue is
 * mirrored here from the seed migration (V6__scope_employee_operations_by_branch).
 */
export const shipmentLocations = [
  {
    id: "WARSAW",
    name: "Warsaw Central",
    country: "PL",
    city: "Warszawa",
    postalCode: "00-001",
    address: "Marszałkowska 1",
  },
  {
    id: "KRAKOW",
    name: "Kraków Central",
    country: "PL",
    city: "Kraków",
    postalCode: "30-001",
    address: "Floriańska 1",
  },
  {
    id: "WROCLAW",
    name: "Wrocław Central",
    country: "PL",
    city: "Wrocław",
    postalCode: "50-001",
    address: "Rynek 1",
  },
  {
    id: "GDANSK",
    name: "Gdańsk Central",
    country: "PL",
    city: "Gdańsk",
    postalCode: "80-001",
    address: "Długi Targ 1",
  },
] as const;

export type ShipmentLocation = (typeof shipmentLocations)[number];

export const shipmentLocationIds = shipmentLocations.map(
  (location) => location.id,
) as unknown as [ShipmentLocation["id"], ...ShipmentLocation["id"][]];

/**
 * A shipment stores the resolved address rather than the branch code, so the
 * edit form maps it back through the city, which is unique in the catalogue.
 */
export function getLocationIdByCity(city: string): string {
  return shipmentLocations.find((location) => location.city === city)?.id ?? "";
}
