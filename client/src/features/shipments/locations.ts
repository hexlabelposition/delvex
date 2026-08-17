import { z } from "zod";

export const shipmentLocations = [
  { id: "WARSAW", label: "Delvex Point Warszawa", city: "Warszawa" },
  { id: "KRAKOW", label: "Delvex Point Kraków", city: "Kraków" },
  { id: "WROCLAW", label: "Delvex Point Wrocław", city: "Wrocław" },
  { id: "GDANSK", label: "Delvex Point Gdańsk", city: "Gdańsk" },
] as const;

export const shipmentLocationIdSchema = z.enum([
  "WARSAW",
  "KRAKOW",
  "WROCLAW",
  "GDANSK",
]);

export const locationSelectOptions = shipmentLocations.map((location) => ({
  value: location.id,
  label: `${location.label} (${location.city}, Poland)`,
}));
