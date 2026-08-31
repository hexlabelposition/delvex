"use server";

import {
  getRefreshToken,
  clearSessionCookies,
  revokeSession,
} from "@shared/api/server";
import { redirect } from "next/navigation";

export async function logoutAction() {
  const refreshToken = await getRefreshToken();

  try {
    if (refreshToken !== null) {
      await revokeSession(refreshToken);
    }
  } catch {
    // A failed revoke must not strand the user in a signed-in shell; the
    // session dies with the cookies either way.
  } finally {
    await clearSessionCookies();
  }

  redirect("/login");
}
