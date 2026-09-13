import "server-only";

import { z } from "zod/v4";
import { createServerClient, getAccessToken } from "@shared/api/server";

const CheckoutSessionSchema = z.object({
  checkoutUrl: z.url(),
});

export async function createPaymentCheckout(
  shipmentId: string,
): Promise<string> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw new Error("Access token is required to start checkout.");
  }

  const api = createServerClient({ accessToken });
  const response = await api.post({
    path: `/shipments/${shipmentId}/payment/checkout`,
    parse: (data) => CheckoutSessionSchema.parse(data),
  });

  return response.data.checkoutUrl;
}
