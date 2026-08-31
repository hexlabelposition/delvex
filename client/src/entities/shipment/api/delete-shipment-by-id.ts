import "server-only";

import { createServerClient, getAccessToken } from "@shared/api/server";
import { IdSchema } from "@shared/model";

export async function deleteShipmentById(shipmentId: string): Promise<void> {
  const id = IdSchema.parse(shipmentId);
  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw new Error("Access token is required to delete a shipment.");
  }

  const api = createServerClient({
    accessToken,
  });

  // The endpoint answers 204 with no body, so there is nothing to parse.
  await api.delete<null>({
    path: `/shipments/${id}`,
    parse: () => null,
  });
}
